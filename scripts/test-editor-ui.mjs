// Real browser + real app, with an isolated fake Supabase HTTP service.
// No real accounts, databases, email, or deployments are used.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { defaultContent } from "../src/lib/default-content.ts";
import { validateContent } from "../src/lib/content-schema.ts";

validateContent(defaultContent);
const { credentials: omittedCredentials, ...legacyContent } = defaultContent;
assert.deepEqual(validateContent(legacyContent).credentials, omittedCredentials);
assert.throws(() =>
  validateContent({
    ...defaultContent,
    home: { ...defaultContent.home, image: "javascript:alert(1)" },
  }),
);
assert.throws(() =>
  validateContent({
    ...defaultContent,
    countries: [defaultContent.countries[0], defaultContent.countries[0]],
  }),
);
let draft = null;
let live = null;
let revision = 0;
let allowed = true;
let failSave = false;
let failPublish = false;
let failLogin = false;
let browser, app, page;
const now = () => new Date().toISOString();
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "editor@example.com",
  email_confirmed_at: now(),
  created_at: now(),
  app_metadata: { provider: "email" },
  user_metadata: {},
};
const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated", aud: "authenticated" })).toString("base64url")}.test-signature`;
const session = {
  access_token: token,
  refresh_token: "fake-refresh-for-tests",
  expires_in: 3600,
  token_type: "bearer",
  user,
};
const api = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  const url = new URL(req.url, "http://localhost");
  const send = (value, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(value));
  };
  const body = async () => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  };
  try {
    if (url.pathname === "/auth/v1/token")
      return send(
        failLogin
          ? { error: "invalid_grant", error_description: "Invalid login credentials" }
          : session,
        failLogin ? 400 : 200,
      );
    if (url.pathname === "/auth/v1/user") return send(user);
    if (url.pathname === "/auth/v1/logout" || url.pathname === "/auth/v1/recover") return send({});
    if (url.pathname === "/rest/v1/site_editors")
      return send(allowed ? [{ user_id: user.id }] : []);
    if (url.pathname === "/rest/v1/site_drafts")
      return send(draft && allowed ? [{ content: draft, revision, updated_at: now() }] : []);
    if (url.pathname === "/rest/v1/site_published")
      return send(live ? [{ content: live, published_at: now() }] : []);
    if (url.pathname === "/rest/v1/rpc/save_site_draft") {
      const data = await body();
      if (!allowed) return send({ message: "Editor access required" }, 403);
      if (failSave) return send({ message: "Temporary failure" }, 500);
      if (data.expected_revision !== revision)
        return send({ message: "Content changed elsewhere" }, 409);
      draft = validateContent(data.new_content);
      revision++;
      return send({ revision, updated_at: now() });
    }
    if (url.pathname === "/rest/v1/rpc/publish_site_draft") {
      const data = await body();
      if (failPublish) return send({ message: "Temporary failure" }, 500);
      if (!allowed || data.expected_revision !== revision)
        return send({ message: "Content changed elsewhere" }, 409);
      live = structuredClone(draft);
      return send({ published_at: now() });
    }
    if (url.pathname.startsWith("/storage/v1/object/public/")) {
      res.writeHead(200, { "Content-Type": "image/webp" });
      res.end(await fs.readFile("public/founder.webp"));
      return;
    }
    if (url.pathname.startsWith("/storage/v1/object/site-images/")) {
      for await (const chunk of req) {
      }
      return send({ Key: url.pathname, Id: "fake-photo" });
    }
    send({ message: `Unknown mock endpoint ${url.pathname}` }, 404);
  } catch (err) {
    send({ message: String(err) }, 500);
  }
});
await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
const apiUrl = `http://127.0.0.1:${api.address().port}`;
const portProbe = createServer();
await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
const appPort = portProbe.address().port;
await new Promise((resolve) => portProbe.close(resolve));
const base = `http://127.0.0.1:${appPort}`;
let serverOutput = "";
try {
  app = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(appPort),
      "--strictPort",
    ],
    {
      env: {
        ...process.env,
        VITE_SUPABASE_URL: apiUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_editor_test",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  app.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  app.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });
  const deadline = Date.now() + 60000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/admin`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  assert.ok(ready, `Dev server did not start: ${serverOutput}`);
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : process.platform === "win32"
        ? { channel: "msedge" }
        : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
  });
  await context.route("**/*", (route) => {
    const url = route.request().url();
    return url.startsWith(base) || url.startsWith(apiUrl) ? route.continue() : route.abort();
  });
  page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(`${base}/admin`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible({
    timeout: 45000,
  });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("test-password-only");
  failLogin = true;
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t sign you in");
  failLogin = false;
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to your website editor." }),
  ).toBeVisible();
  await fs.mkdir("qa", { recursive: true });
  await page.screenshot({ path: "qa/admin-desktop.png", fullPage: true });
  console.log("PASS: private sign-in, invalid credentials, dashboard overview.");

  const nav = page.getByRole("navigation", { name: "Website editor sections" });
  await nav.getByRole("button", { name: "Home page", exact: true }).click();
  await page.getByLabel("Main headline", { exact: true }).fill("Independent polymer expertise");
  await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
  failSave = true;
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("not saved");
  assert.equal(draft, null);
  failSave = false;
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  assert.equal(draft.home.title, "Independent polymer expertise");
  assert.equal(live, null);
  await page.reload({ waitUntil: "domcontentloaded" });
  await nav.getByRole("button", { name: "Home page", exact: true }).click();
  await expect(page.getByLabel("Main headline", { exact: true })).toHaveValue(
    "Independent polymer expertise",
  );

  const visitor = await context.newPage();
  await visitor.goto(base, { waitUntil: "domcontentloaded" });
  await expect(visitor.locator("h1")).toContainText(defaultContent.home.title);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.frameLocator(".editor-preview-frame").locator("h1")).toContainText(
    "Independent polymer expertise",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  console.log(
    "PASS: failed saves preserve draft, saved drafts survive reload, live page stays unchanged, real page preview.",
  );

  failPublish = true;
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Yes, publish changes", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  assert.equal(live, null);
  failPublish = false;
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Yes, publish changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Published!");
  await visitor.reload({ waitUntil: "domcontentloaded" });
  await expect(visitor.locator("h1")).toContainText("Independent polymer expertise");
  console.log(
    "PASS: failed publication stays private; confirmed publication appears in a fresh server-rendered page.",
  );

  await nav.getByRole("button", { name: "Countries of practice", exact: true }).click();
  await page.getByLabel("Add a country", { exact: true }).selectOption("pk");
  await page.getByRole("button", { name: "Add country", exact: true }).click();
  await expect(page.getByRole("heading", { name: "17 countries of practice" })).toBeVisible();
  await nav.getByRole("button", { name: "Career timeline", exact: true }).click();
  await page.locator(".editor-item summary").first().click();
  await page.getByLabel("Dates", { exact: true }).first().fill("1980–1985");
  await nav.getByRole("button", { name: "Credentials & honors", exact: true }).click();
  await page.locator(".editor-credential-item summary").first().click();
  await page.getByLabel("Credential or award", { exact: true }).first().fill("Senior Life Member");
  await nav.getByRole("button", { name: "Contact details", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill("invalid-email");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("valid email");
  await page.getByLabel("Email address", { exact: true }).fill("updated@example.com");
  await page.getByLabel("Location", { exact: true }).fill("Bahria Town, Karachi, Pakistan");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  assert.equal(draft.timeline[0].y, "1980–1985");
  assert.equal(draft.countries.length, 17);
  assert.equal(draft.credentials.memberships[0].t, "Senior Life Member");
  console.log("PASS: country additions, timeline edits, field validation, contact saving.");

  await nav.getByRole("button", { name: "Website photos", exact: true }).click();
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({ name: "test.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
  await expect(page.getByRole("alert")).toContainText("JPG, PNG, or WebP");
  await page.locator('input[type="file"]').first().setInputFiles("public/founder.webp");
  await expect(page.getByRole("status")).toContainText("Photo uploaded");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  assert.ok(draft.home.image.startsWith(`${apiUrl}/storage/v1/object/public/site-images/`));

  await nav.getByRole("button", { name: "Home page", exact: true }).click();
  await page.getByLabel("Main headline", { exact: true }).fill("Conflict test");
  revision++;
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("newer version");
  await expect(page.getByLabel("Main headline", { exact: true })).toHaveValue("Conflict test");
  await page.reload({ waitUntil: "domcontentloaded" });
  console.log(
    "PASS: upload type restrictions, photo uploads, conflicting saves preserve unsaved input.",
  );

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const label of [
      "Overview",
      "Contact details",
      "Countries of practice",
      "Credentials & honors",
      "Website photos",
    ]) {
      await nav.getByRole("button", { name: label, exact: true }).click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${label} overflow at ${width}`,
      );
    }
    await nav.getByRole("button", { name: "Overview", exact: true }).click();
    if (width === 390) await page.screenshot({ path: "qa/admin-mobile.png", fullPage: true });
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await page.getByRole("button", { name: "Forgot your password?" }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("password reset link");
  await page.getByRole("button", { name: "Back to sign in" }).click();
  allowed = false;
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("test-password-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("does not have permission");
  await expect(page.locator(".editor-toolbar")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  allowed = true;
  // An email link opens a fresh document, not a same-document hash navigation.
  await page.goto("about:blank");
  await page.goto(
    `${base}/admin#access_token=${token}&refresh_token=fake-refresh-for-tests&expires_in=3600&token_type=bearer&type=recovery`,
    { waitUntil: "domcontentloaded" },
  );
  await expect(page.getByRole("heading", { name: "Choose a new password." })).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("new-test-password-only");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to your website editor." }),
  ).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: responsive layouts, sign-out, non-editor denied, password recovery, no browser runtime errors.",
  );
} catch (error) {
  if (page) {
    console.error(await page.locator("body").innerText());
    await page.screenshot({ path: "qa/admin-test-failure.png", fullPage: true });
  }
  console.error(serverOutput.slice(-3500));
  throw error;
} finally {
  await browser?.close();
  app?.kill();
  api.closeAllConnections();
  await new Promise((resolve) => api.close(resolve));
}
