# Set up your father's website editor

The dashboard is at **`/admin`** on your website. It edits the homepage copy and numbers, profile, career timeline, countries, publications, seven principles, professional memberships, academic honors, contact details, and three main photos. Countries automatically update the homepage count and flags. The page design, technical diagrams, conference history, and other specialist sections remain managed in code.

Changes follow **Edit → Save draft → Preview → Publish**. Saving a draft does not change the live website. Publish includes saving the latest changes. No Git commit or Vercel redeployment is required for subsequent content updates.

## 1. Create the database and photo storage

In your existing Supabase project, open **SQL Editor → New query**.

Copy the entire contents of **`supabase/migrations/202609220001_website_editor.sql`** into the query and click **Run**. Run this migration once. It creates:

- `site_editors`: accounts allowed to edit this website.
- `site_drafts`: private draft content.
- `site_published`: content visible to website visitors.
- Two functions for saving and publishing, with revision checks to prevent overwrites.
- The `site-images` public image bucket, with uploads restricted to editors.
- Row Level Security policies and role permissions.

If the query reports that a table already exists, check whether you already ran it. Do not delete existing tables to retry. This migration uses a transaction, so a failed run rolls back its changes.

There is no manual content-seeding query. The editor initially uses the website's existing content. The first Save draft creates the draft row, and the first Publish creates the public row.

## 2. Create your father's login

In **Authentication → Users**, choose **Add user → Create new user**.

Enter his email and a strong password (at least 12 characters). Enable **Auto Confirm User** for the account you create. Share the password with him privately. Do not put this password in `.env`, SQL, or source code.

In **Authentication → Sign In / Providers**, keep Email sign-in enabled and turn off public user sign-ups. This editor has no public registration page.

Open **`supabase/add-editor.sql`**, replace `REPLACE_WITH_FATHERS_EMAIL` with his actual email, and run the whole file in the SQL Editor. Its final query should list his email. Repeat with your email if you also need editor access. Creating an Auth user alone does not grant editing access.

## 3. Add your local environment settings

In Supabase, use the project's **Connect** panel to find its Project URL. Find the **Publishable key** under **Settings → API Keys**. It starts with `sb_publishable_`.

In this project's root (next to `package.json`), create **`.env.local`** with:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_ACTUAL_KEY
```

You may use `.env` instead; `.env.local` is recommended for local settings. Both are ignored by Git. `.env.example` contains the same template.

Use the **publishable** key, never `sb_secret_...`, a `service_role` key, a database password, or a JWT signing secret. `VITE_` variables are included in the browser bundle; database policies enforce access. The application deliberately accepts the new publishable key format.

Restart the local server after changing environment variables:

```powershell
npm run dev
```

Open the URL printed in the terminal followed by `/admin`.

## 4. Configure password-reset URLs

In **Authentication → URL Configuration**:

- Set **Site URL** to your production website's exact origin, such as `https://your-site.vercel.app`.
- Add **Redirect URLs** for `https://your-site.vercel.app/admin` and `http://localhost:5173/admin`.
- Add `http://127.0.0.1:5173/admin` if you use that address locally.
- If you use a custom domain, add its `/admin` URL too. Match the host and port used in your browser.

The sign-in screen includes **Forgot your password?**. For reliable reset-email delivery to your father, configure custom SMTP in Supabase Authentication's email settings. Supabase's default email service restricts recipients and is intended for testing; password sign-in works without sending email when you create an auto-confirmed user.

## 5. Connect Vercel

In the existing Vercel project's **Settings → Environment Variables**, add exactly the same two variables from step 3, with your real values. Enable **Production** and **Preview** as appropriate.

Deploy this code and redeploy after adding the environment variables. Vite reads them at build time. This is a one-time setup; later dashboard content changes do not require rebuilding.

The earlier Vercel commit-author access block is independent of the dashboard. Vercel must permit a new deployment before `/admin` will appear on the live site.

Keep the project's existing working Vercel build settings. If a production host prerenders or caches the home page indefinitely, disable that caching so each fresh page request can read the published content.

The build uses Nitro's automatic Vercel detection and emits Vercel Build Output on Vercel. Use `npm run build`; do not force a static-only output directory. If you need to select the adapter explicitly, set `NITRO_PRESET=vercel` in Vercel's environment variables.

## 6. First-use check

1. Visit `/admin` and sign in with your father's credentials.
2. Open **Contact details**, change a field, and **Save draft**.
3. Open the public website in a separate tab. It should still show the previous content.
4. Use **Preview** in the editor to check the saved change.
5. Click **Publish → Yes, publish changes**.
6. Refresh the public page. The change should now appear.
7. Upload a photo and verify it in Preview before publishing.
8. Sign out. `/admin` should show the sign-in screen again.

The session is stored for the current browser tab; closing it may require signing in again. Unsaved edits trigger a browser warning when leaving the page. Public photo URLs are intended for website images, not confidential documents.

## Troubleshooting

- **“Your editor is nearly ready”**: environment variables are missing/incorrect, or the server was not restarted/redeployed. Use an `sb_publishable_` key.
- **“This account does not have permission”**: run `add-editor.sql` with the sign-in account's exact email.
- **Database not ready / cannot load content**: confirm the migration completed in the same Supabase project used by your environment variables and that the project's Data API is enabled.
- **Reset email missing**: check spam, SMTP configuration, allowed redirect URLs, and that the email matches the created account.
- **Photo upload failed**: check the migration's storage policy, editor access, and that the image is JPG, PNG, or WebP under 5 MB.
- **“Someone saved a newer version”**: another session has saved changes. Copy any unsaved text somewhere safe, reload, then reapply it to the latest draft.

The public page falls back to the original bundled content if the content database is unavailable or invalid. The existing enquiry form's submission behavior is unchanged; this dashboard does not add an email inbox or enquiry delivery service.

## Local verification for developers

`npm run typecheck` checks TypeScript. `npm run test:admin` runs the real database migration in an isolated PostgreSQL WASM runtime, followed by browser workflow tests with a local mock Supabase API. These tests never connect to your Supabase project. The browser test uses installed Microsoft Edge on Windows; on other systems install Playwright Chromium or set `PLAYWRIGHT_CHANNEL` to an available browser. Node.js 24 or later is required for the tests' TypeScript imports.

Hosted Supabase login, SMTP delivery, and your production deployment still require the configuration and first-use check above.

## Reference

- [Supabase React setup](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [API keys and browser safety](https://supabase.com/docs/guides/getting-started/api-keys)
- [Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Password authentication](https://supabase.com/docs/guides/auth/passwords)
