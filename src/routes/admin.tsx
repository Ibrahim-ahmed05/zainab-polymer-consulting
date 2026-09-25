import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  Eye,
  FileText,
  Globe2,
  Home,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  BriefcaseBusiness,
  Upload,
  LoaderCircle,
} from "lucide-react";
import {
  cmsConfigured,
  getCms,
  loadWorkspace,
  publishDraft,
  saveDraft,
  uploadImage,
} from "@/lib/cms";
import { validateContent, type SiteContent } from "@/lib/content-schema";
import adminCss from "../admin.css?url";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Website editor | Zainab Polymer" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: adminCss }],
  }),
  component: Admin,
});

const sections = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Your website, at a glance.",
  },
  {
    id: "home",
    label: "Home page",
    icon: Home,
    description: "Make a clear first impression with your headline and introduction.",
  },
  {
    id: "profile",
    label: "About you",
    icon: UserRound,
    description: "Tell visitors about your experience and background.",
  },
  {
    id: "timeline",
    label: "Career timeline",
    icon: BriefcaseBusiness,
    description: "Keep your qualifications and career milestones up to date.",
  },
  {
    id: "countries",
    label: "Countries of practice",
    icon: Globe2,
    description: "Manage the countries shown on your website and globe.",
  },
  {
    id: "publications",
    label: "Publications",
    icon: FileText,
    description: "Add research papers, articles, and proceedings.",
  },
  {
    id: "principles",
    label: "Our principles",
    icon: ShieldCheck,
    description: "Explain the values behind your consulting practice.",
  },
  {
    id: "credentials",
    label: "Credentials & honors",
    icon: Award,
    description: "Update professional memberships, scholarships, and academic distinctions.",
  },
  {
    id: "contact",
    label: "Contact details",
    icon: Mail,
    description: "Help prospective clients get in touch with you.",
  },
  {
    id: "photos",
    label: "Website photos",
    icon: ImagePlus,
    description: "Update your main website images. JPG, PNG, or WebP, up to 5 MB.",
  },
] as const;
type Section = (typeof sections)[number]["id"];
const countryCodes =
  "ae ar at au bd be bg bh br ca ch cl cn co cy cz de dk dz eg es fi fr gb gr hk hu id ie il in iq ir is it jo jp ke kr kw lk lu ma mm mx my ng nl no np nz om pe ph pk pl pt qa ro rs ru sa se sg th tn tr tw ua us uy uz vn za".split(
    " ",
  );
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = countryCodes
  .map((code) => ({
    code,
    name:
      ({ ae: "UAE", gb: "UK", us: "USA" } as Record<string, string>)[code] ??
      regionNames.of(code.toUpperCase()) ??
      code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";
const formattedDate = (date: string | null) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not yet";

function Brand() {
  return (
    <div className="editor-brand">
      <img src="/zainab-polymer-mark.webp" alt="" />
      <div>
        <strong>ZAINAB</strong>
        <span>WEBSITE EDITOR</span>
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  hint,
  required = true,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`}>{hint}</p>}
      {multiline ? (
        <textarea
          id={id}
          rows={5}
          value={value}
          required={required}
          maxLength={4000}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          maxLength={type === "number" ? undefined : 200}
          min={type === "number" ? 0 : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`editor-modal ${wide ? "editor-modal-wide" : ""}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          className="editor-icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}

function Admin() {
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(cmsConfigured);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    if (!cmsConfigured) return;
    const {
      data: { subscription },
    } = getCms().auth.onAuthStateChange((event, session) => {
      setUser(session?.user.id ?? null);
      setChecking(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!cmsConfigured)
    return (
      <div className="editor-auth">
        <div className="editor-auth-card">
          <Brand />
          <span className="editor-eyebrow">ONE-TIME SETUP</span>
          <h1>Your editor is nearly ready.</h1>
          <p>
            Connect your website to its content storage to enable private sign-in, drafts, and
            publishing.
          </p>
          <div className="editor-note">
            Your website administrator needs to complete the steps in{" "}
            <strong>ADMIN_SETUP.md</strong> and add the two Supabase settings to Vercel.
          </div>
          <a className="editor-button editor-primary" href="/">
            Back to website <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    );
  if (checking)
    return (
      <div className="editor-loading" role="status">
        <LoaderCircle className="editor-spin" /> Opening your editor…
      </div>
    );
  if (!user || recovery)
    return <Login recovery={recovery} onRecovered={() => setRecovery(false)} />;
  return <Workspace key={user} />;
}

function Login({ recovery, onRecovered }: { recovery: boolean; onRecovered: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  return (
    <main className="editor-auth">
      <div className="editor-auth-card">
        <Brand />
        <span className="editor-eyebrow">YOUR WEBSITE, SIMPLY MANAGED</span>
        <h1>
          {recovery ? "Choose a new password." : reset ? "Reset your password." : "Welcome back."}
        </h1>
        <p>
          {recovery
            ? "Use at least 12 characters for your new password."
            : reset
              ? "We’ll email you a link to choose a new password."
              : "Sign in to update your website. You can preview every change before it goes live."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setNotice("");
            try {
              if (recovery) {
                const { error } = await getCms().auth.updateUser({ password });
                if (error) throw error;
                onRecovered();
              } else if (reset) {
                const { error } = await getCms().auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/admin`,
                });
                if (error) throw error;
                setNotice(
                  "If this email has an account, a password reset link is on its way. Please check your inbox.",
                );
              } else {
                const { error } = await getCms().auth.signInWithPassword({ email, password });
                if (error)
                  throw new Error(
                    "We couldn’t sign you in. Check your email and password, then try again.",
                  );
              }
            } catch (err) {
              setError(errorText(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy}>
            {!recovery && (
              <label className="editor-field">
                Email address
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {(!reset || recovery) && (
              <label className="editor-field">
                Password
                <input
                  type="password"
                  autoComplete={recovery ? "new-password" : "current-password"}
                  minLength={recovery ? 12 : undefined}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {error && (
              <p className="editor-error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="editor-success" role="status">
                {notice}
              </p>
            )}
            <button className="editor-button editor-primary editor-full" type="submit">
              {busy
                ? "Please wait…"
                : recovery
                  ? "Save new password"
                  : reset
                    ? "Send reset link"
                    : "Sign in"}
              <ChevronRight size={18} />
            </button>
            {!recovery && (
              <button
                className="editor-text-button"
                type="button"
                onClick={() => {
                  setReset(!reset);
                  setError("");
                  setNotice("");
                }}
              >
                {reset ? "Back to sign in" : "Forgot your password?"}
              </button>
            )}
          </fieldset>
        </form>
        <a className="editor-back" href="/">
          ← Back to website
        </a>
        <div className="editor-private">
          <ShieldCheck size={15} /> Private access for website editors
        </div>
      </div>
    </main>
  );
}

function Workspace() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState("");
  const [live, setLive] = useState("");
  const [revision, setRevision] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [newCountry, setNewCountry] = useState("pk");
  const iframe = useRef<HTMLIFrameElement>(null);
  const json = JSON.stringify(content);
  const dirty = !!content && json !== saved;
  const unpublished = !!content && json !== live;
  const selected = sections.find((s) => s.id === section)!;

  useEffect(() => {
    let active = true;
    loadWorkspace()
      .then((data) => {
        if (!active) return;
        setContent(data.content);
        setSaved(JSON.stringify(data.content));
        setLive(JSON.stringify(data.liveContent));
        setRevision(data.revision);
        setSavedAt(data.savedAt);
        setPublishedAt(data.publishedAt);
      })
      .catch((err) => {
        if (active) setError(errorText(err));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!preview) return;
    const send = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === iframe.current?.contentWindow &&
        event.data?.type === "site-preview-ready"
      )
        iframe.current?.contentWindow?.postMessage(
          { type: "site-preview", content },
          window.location.origin,
        );
    };
    window.addEventListener("message", send);
    return () => window.removeEventListener("message", send);
  }, [preview, content]);

  function updateGroup<K extends "home" | "profile" | "contact">(
    group: K,
    key: keyof SiteContent[K],
    value: string | number,
  ) {
    setContent(
      (current) => current && { ...current, [group]: { ...current[group], [key]: value } },
    );
    setNotice("");
  }
  function changeRow(
    group: "timeline" | "publications" | "principles",
    index: number,
    key: string,
    value: string,
  ) {
    setContent(
      (current) =>
        current && {
          ...current,
          [group]: current[group].map((row, i) => (i === index ? { ...row, [key]: value } : row)),
        },
    );
    setNotice("");
  }
  function removeRow(group: "timeline" | "publications" | "countries", index: number) {
    if (
      !content ||
      content[group].length <= 1 ||
      !window.confirm(
        "Remove this item from the draft? Your live website will stay unchanged until you publish.",
      )
    )
      return;
    setContent(
      (current) => current && { ...current, [group]: current[group].filter((_, i) => i !== index) },
    );
    setNotice("");
  }
  function moveRow(group: "timeline" | "publications", index: number, direction: number) {
    if (!content) return;
    const rows = [...content[group]];
    [rows[index], rows[index + direction]] = [rows[index + direction], rows[index]];
    setContent({ ...content, [group]: rows });
    setNotice("");
  }
  function updateCredentials(key: "heading" | "membershipsTitle" | "academicTitle", value: string) {
    setContent(
      (current) => current && { ...current, credentials: { ...current.credentials, [key]: value } },
    );
    setNotice("");
  }
  function changeCredential(
    group: "memberships" | "academic",
    index: number,
    key: "t" | "org" | "note",
    value: string,
  ) {
    setContent(
      (current) =>
        current && {
          ...current,
          credentials: {
            ...current.credentials,
            [group]: current.credentials[group].map((row, i) =>
              i === index ? { ...row, [key]: value } : row,
            ),
          },
        },
    );
    setNotice("");
  }
  function removeCredential(group: "memberships" | "academic", index: number) {
    if (
      !content ||
      content.credentials[group].length <= 1 ||
      !window.confirm(
        "Remove this credential from the draft? It will remain live until you publish.",
      )
    )
      return;
    setContent({
      ...content,
      credentials: {
        ...content.credentials,
        [group]: content.credentials[group].filter((_, i) => i !== index),
      },
    });
    setNotice("");
  }
  function moveCredential(group: "memberships" | "academic", index: number, direction: number) {
    if (!content) return;
    const rows = [...content.credentials[group]];
    [rows[index], rows[index + direction]] = [rows[index + direction], rows[index]];
    setContent({ ...content, credentials: { ...content.credentials, [group]: rows } });
    setNotice("");
  }
  function addCredential(group: "memberships" | "academic") {
    if (!content || content.credentials[group].length >= 30) return;
    setContent({
      ...content,
      credentials: {
        ...content.credentials,
        [group]: [
          ...content.credentials[group],
          { t: "New credential", org: "Organisation", note: "Details" },
        ],
      },
    });
    setNotice("");
  }
  async function save(andPublish = false) {
    if (!content) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const clean = validateContent(content);
      let nextRevision = revision;
      if (dirty || revision === 0) {
        const result = await saveDraft(clean, revision);
        nextRevision = result.revision;
        setRevision(nextRevision);
        setSavedAt(result.updated_at);
        setSaved(JSON.stringify(clean));
        setContent(clean);
      }
      if (andPublish) {
        const result = await publishDraft(nextRevision);
        setPublishedAt(result.published_at);
        setLive(JSON.stringify(clean));
        setNotice("Published! Your updated website is now live.");
        setConfirmPublish(false);
      } else setNotice("Draft saved. Your live website has not changed.");
    } catch (err) {
      setError(errorText(err));
      setConfirmPublish(false);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (dirty && !window.confirm("You have unsaved changes. Sign out without saving them?")) return;
    const { error } = await getCms().auth.signOut({ scope: "local" });
    if (error) setError("Could not sign out. Please try again.");
  }
  function openPreview() {
    try {
      validateContent(content);
      setError("");
      setPreview(true);
    } catch (err) {
      setError(errorText(err));
    }
  }
  function rowTools(group: "timeline" | "publications", index: number) {
    return (
      <div className="editor-row-tools">
        <button
          type="button"
          aria-label={`Move item ${index + 1} up`}
          disabled={index === 0}
          onClick={() => moveRow(group, index, -1)}
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          aria-label={`Move item ${index + 1} down`}
          disabled={index === content![group].length - 1}
          onClick={() => moveRow(group, index, 1)}
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          className="editor-remove"
          disabled={content![group].length <= 1}
          onClick={() => removeRow(group, index)}
        >
          <Trash2 size={15} /> Remove
        </button>
      </div>
    );
  }
  function credentialEditor(
    group: "memberships" | "academic",
    titleKey: "membershipsTitle" | "academicTitle",
    label: string,
  ) {
    const rows = content!.credentials[group];
    return (
      <div className="editor-card">
        <h2>{label}</h2>
        <Field
          label="Category title"
          value={content!.credentials[titleKey]}
          onChange={(value) => updateCredentials(titleKey, value)}
        />
        {rows.map((row, index) => (
          <details className="editor-item editor-credential-item" key={`${group}-${index}`}>
            <summary>
              <span className="editor-item-number">{String(index + 1).padStart(2, "0")}</span>
              <span>
                {row.t || "New credential"}
                <small>{row.org}</small>
              </span>
              <ChevronRight size={18} />
            </summary>
            <div className="editor-item-body">
              <Field
                label="Credential or award"
                value={row.t}
                onChange={(value) => changeCredential(group, index, "t", value)}
              />
              <Field
                label="Organisation or institution"
                value={row.org}
                onChange={(value) => changeCredential(group, index, "org", value)}
              />
              <Field
                label="Supporting note"
                value={row.note}
                onChange={(value) => changeCredential(group, index, "note", value)}
              />
              <div className="editor-row-tools">
                <button
                  type="button"
                  aria-label={`Move credential ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => moveCredential(group, index, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Move credential ${index + 1} down`}
                  disabled={index === rows.length - 1}
                  onClick={() => moveCredential(group, index, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className="editor-remove"
                  disabled={rows.length <= 1}
                  onClick={() => removeCredential(group, index)}
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            </div>
          </details>
        ))}
        <button
          className="editor-button editor-add"
          type="button"
          disabled={rows.length >= 30}
          onClick={() => addCredential(group)}
        >
          <Plus size={18} /> Add {group === "memberships" ? "membership" : "academic honor"}
        </button>
      </div>
    );
  }
  if (!content)
    return (
      <div className="editor-auth">
        <div className="editor-auth-card">
          <Brand />
          {error ? (
            <>
              <h1>We couldn’t open your editor.</h1>
              <p className="editor-error" role="alert">
                {error}
              </p>
              <button className="editor-button" onClick={() => window.location.reload()}>
                Try again
              </button>
              <button className="editor-text-button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <p role="status">Loading your website content…</p>
          )}
        </div>
      </div>
    );

  return (
    <div className="editor-shell">
      <aside className="editor-sidebar">
        <Brand />
        <div className="editor-sidebar-caption">MANAGE YOUR WEBSITE</div>
        <nav aria-label="Website editor sections">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setNotice("");
              }}
              aria-current={section === item.id ? "page" : undefined}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {section === item.id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="editor-sidebar-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ArrowUpRight size={18} /> View live website
          </a>
          <button onClick={logout} disabled={busy}>
            <LogOut size={18} /> Sign out
          </button>
          <p>
            <ShieldCheck size={14} /> Access for approved editors only.
          </p>
        </div>
      </aside>
      <div className="editor-main">
        <header className="editor-toolbar">
          <div className="editor-save-state">
            <span className={dirty ? "editor-dot editor-dot-amber" : "editor-dot"} />
            <span>
              {dirty
                ? "Unsaved changes"
                : unpublished
                  ? "Draft saved · not published"
                  : publishedAt
                    ? "All changes published"
                    : "Original website content"}
            </span>
          </div>
          <div className="editor-actions">
            <button className="editor-button" onClick={openPreview} disabled={busy}>
              <Eye size={17} /> Preview
            </button>
            <button
              className="editor-button"
              onClick={() => save()}
              disabled={busy || (!dirty && revision > 0)}
            >
              <Save size={17} /> Save draft
            </button>
            <button
              className="editor-button editor-primary"
              onClick={() => {
                try {
                  validateContent(content);
                  setError("");
                  setConfirmPublish(true);
                } catch (err) {
                  setError(errorText(err));
                }
              }}
              disabled={busy || (!unpublished && publishedAt !== null)}
            >
              {busy ? <LoaderCircle className="editor-spin" size={17} /> : <Upload size={17} />}{" "}
              Publish
            </button>
          </div>
        </header>
        <main className="editor-content" id="editor-content">
          <div className="editor-page-heading">
            <span className="editor-eyebrow">ZAINAB POLYMER CONSULTING</span>
            <h1>{section === "overview" ? "Welcome to your website editor." : selected.label}</h1>
            <p>
              {section === "overview"
                ? "Keep your website up to date, one simple change at a time."
                : selected.description}
            </p>
          </div>
          {error && (
            <div className="editor-error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="editor-success" role="status">
              <Check size={18} />
              {notice}
            </div>
          )}
          <fieldset className="editor-workspace" disabled={busy}>
            {section === "overview" && (
              <>
                <div className="editor-welcome">
                  <div>
                    <span className="editor-eyebrow">YOU’RE IN CONTROL</span>
                    <h2>
                      A small update.
                      <br />A lasting impression.
                    </h2>
                    <p>
                      Choose a section, make your changes, then preview your website. Publish when
                      you’re happy with how it looks.
                    </p>
                    <button className="editor-button" onClick={() => setSection("contact")}>
                      Update contact details <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div className="editor-steps">
                    <div>
                      <b>01</b>
                      <span>
                        Edit your content<small>Simple fields, no code.</small>
                      </span>
                    </div>
                    <div>
                      <b>02</b>
                      <span>
                        Check the preview<small>See exactly what will change.</small>
                      </span>
                    </div>
                    <div>
                      <b>03</b>
                      <span>
                        Publish your update<small>Make it live for everyone.</small>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="editor-summary">
                  <div>
                    <span>Countries of practice</span>
                    <strong>{content.countries.length}</strong>
                  </div>
                  <div>
                    <span>Publications listed</span>
                    <strong>{content.publications.length}</strong>
                  </div>
                  <div>
                    <span>Last published</span>
                    <strong className="editor-date">{formattedDate(publishedAt)}</strong>
                  </div>
                </div>
                <h2 className="editor-subheading">What would you like to update?</h2>
                <div className="editor-section-grid">
                  {sections
                    .filter((item) => item.id !== "overview")
                    .map((item) => (
                      <button
                        className="editor-section-card"
                        key={item.id}
                        onClick={() => setSection(item.id)}
                      >
                        <item.icon size={23} />
                        <h3>{item.label}</h3>
                        <p>{item.description}</p>
                        <span>
                          Edit section <ArrowUpRight size={15} />
                        </span>
                      </button>
                    ))}
                </div>
              </>
            )}
            {section === "home" && (
              <>
                <div className="editor-card">
                  <h2>Homepage introduction</h2>
                  <Field
                    label="Main headline"
                    value={content.home.title}
                    onChange={(v) => updateGroup("home", "title", v)}
                  />
                  <Field
                    label="Highlighted headline ending"
                    hint="This appears in blue below the main headline."
                    value={content.home.accent}
                    onChange={(v) => updateGroup("home", "accent", v)}
                  />
                  <Field
                    label="Introduction"
                    multiline
                    value={content.home.description}
                    onChange={(v) => updateGroup("home", "description", v)}
                  />
                </div>
                <div className="editor-card">
                  <h2>Your experience in numbers</h2>
                  <div className="editor-fields-grid">
                    <Field
                      label="Years of experience"
                      type="number"
                      value={content.home.years}
                      onChange={(v) => updateGroup("home", "years", Number(v))}
                    />
                    <Field
                      label="International conferences"
                      type="number"
                      value={content.home.conferences}
                      onChange={(v) => updateGroup("home", "conferences", Number(v))}
                    />
                    <Field
                      label="Publications & proceedings"
                      type="number"
                      value={content.home.publications}
                      onChange={(v) => updateGroup("home", "publications", Number(v))}
                    />
                  </div>
                  <p className="editor-note">
                    Countries of practice is automatically calculated from your country list:{" "}
                    <strong>{content.countries.length}</strong>.
                  </p>
                </div>
              </>
            )}
            {section === "profile" && (
              <div className="editor-card">
                <h2>Your professional profile</h2>
                <div className="editor-fields-grid">
                  <Field
                    label="Your name"
                    value={content.profile.name}
                    onChange={(v) => updateGroup("profile", "name", v)}
                  />
                  <Field
                    label="Professional title"
                    value={content.profile.role}
                    onChange={(v) => updateGroup("profile", "role", v)}
                  />
                </div>
                <Field
                  label="Introduction"
                  multiline
                  value={content.profile.introduction}
                  onChange={(v) => updateGroup("profile", "introduction", v)}
                />
                <Field
                  label="Education and background"
                  multiline
                  value={content.profile.background}
                  onChange={(v) => updateGroup("profile", "background", v)}
                />
                <Field
                  label="Languages"
                  value={content.profile.languages}
                  onChange={(v) => updateGroup("profile", "languages", v)}
                />
                <div className="editor-fields-grid">
                  <Field
                    label="Region of practice"
                    value={content.profile.region}
                    onChange={(v) => updateGroup("profile", "region", v)}
                  />
                  <Field
                    label="Type of practice"
                    value={content.profile.practice}
                    onChange={(v) => updateGroup("profile", "practice", v)}
                  />
                </div>
              </div>
            )}
            {section === "timeline" && (
              <>
                <p className="editor-note">
                  Use the arrows to arrange milestones in the order you want visitors to see them.
                </p>
                {content.timeline.map((row, index) => (
                  <details className="editor-card editor-item" key={index} open={undefined}>
                    <summary>
                      <span className="editor-item-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        {row.h || "New milestone"}
                        <small>{row.y || "Add dates"}</small>
                      </span>
                      <ChevronRight size={18} />
                    </summary>
                    <div className="editor-item-body">
                      <Field
                        label="Dates"
                        hint="For example: 1993–2014 or Today"
                        value={row.y}
                        onChange={(v) => changeRow("timeline", index, "y", v)}
                      />
                      <Field
                        label="Role or qualification"
                        value={row.h}
                        onChange={(v) => changeRow("timeline", index, "h", v)}
                      />
                      <Field
                        label="Organisation and details"
                        multiline
                        value={row.s}
                        onChange={(v) => changeRow("timeline", index, "s", v)}
                      />
                      {rowTools("timeline", index)}
                    </div>
                  </details>
                ))}
                <button
                  className="editor-button editor-add"
                  disabled={content.timeline.length >= 40}
                  onClick={() =>
                    setContent({
                      ...content,
                      timeline: [...content.timeline, { y: "", h: "New milestone", s: "" }],
                    })
                  }
                >
                  <Plus size={18} /> Add a milestone
                </button>
              </>
            )}
            {section === "publications" && (
              <>
                {content.publications.map((row, index) => (
                  <details className="editor-card editor-item" key={index}>
                    <summary>
                      <span className="editor-item-number">{row.y || "New"}</span>
                      <span>
                        {row.title || "New publication"}
                        <small>{row.authors}</small>
                      </span>
                      <ChevronRight size={18} />
                    </summary>
                    <div className="editor-item-body">
                      <Field
                        label="Year"
                        value={row.y}
                        onChange={(v) => changeRow("publications", index, "y", v)}
                      />
                      <Field
                        label="Publication title"
                        multiline
                        value={row.title}
                        onChange={(v) => changeRow("publications", index, "title", v)}
                      />
                      <Field
                        label="Journal, event, or publisher"
                        multiline
                        value={row.where}
                        onChange={(v) => changeRow("publications", index, "where", v)}
                      />
                      <Field
                        label="Authors"
                        value={row.authors}
                        onChange={(v) => changeRow("publications", index, "authors", v)}
                      />
                      {rowTools("publications", index)}
                    </div>
                  </details>
                ))}
                <button
                  className="editor-button editor-add"
                  disabled={content.publications.length >= 100}
                  onClick={() =>
                    setContent({
                      ...content,
                      publications: [
                        ...content.publications,
                        {
                          y: String(new Date().getFullYear()),
                          title: "New publication",
                          where: "",
                          authors: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={18} /> Add a publication
                </button>
              </>
            )}
            {section === "countries" && (
              <div className="editor-card">
                <h2>{content.countries.length} countries of practice</h2>
                <p className="editor-muted">
                  Flags and the homepage country count update automatically.
                </p>
                <div className="editor-country-add">
                  <div className="editor-country-choice">
                    <label htmlFor="country-choice">Add a country</label>
                    <select
                      id="country-choice"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                    >
                      {countryOptions.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                          disabled={content.countries.some((c) => c.code === country.code)}
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="editor-button editor-primary"
                    disabled={
                      content.countries.length >= 60 ||
                      content.countries.some((c) => c.code === newCountry)
                    }
                    onClick={() => {
                      const country = countryOptions.find((c) => c.code === newCountry)!;
                      const i = content.countries.length;
                      setContent({
                        ...content,
                        countries: [
                          ...content.countries,
                          {
                            ...country,
                            x: 22 + (i % 5) * 13,
                            y: 22 + (Math.floor(i / 5) % 4) * 12,
                          },
                        ],
                      });
                    }}
                  >
                    <Plus size={17} /> Add country
                  </button>
                </div>
                <div className="editor-country-list">
                  {content.countries.map((country, index) => (
                    <div key={country.code}>
                      <img src={`https://flagcdn.com/w80/${country.code}.png`} alt="" />
                      <strong>{country.name}</strong>
                      <button
                        className="editor-icon-button editor-remove"
                        disabled={content.countries.length <= 1}
                        aria-label={`Remove ${country.name}`}
                        onClick={() => removeRow("countries", index)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {section === "principles" && (
              <>
                {content.principles.map((row, index) => (
                  <div className="editor-card" key={index}>
                    <h2>
                      {index === 0
                        ? "01 · Your foundation"
                        : `${String(index + 1).padStart(2, "0")} · Supporting principle`}
                    </h2>
                    <Field
                      label="Title"
                      value={row.t}
                      onChange={(v) => changeRow("principles", index, "t", v)}
                    />
                    <Field
                      label="Description"
                      multiline
                      value={row.d}
                      onChange={(v) => changeRow("principles", index, "d", v)}
                    />
                  </div>
                ))}
              </>
            )}
            {section === "credentials" && (
              <>
                <div className="editor-card">
                  <h2>Credentials section heading</h2>
                  <Field
                    label="Section heading"
                    value={content.credentials.heading}
                    onChange={(value) => updateCredentials("heading", value)}
                  />
                </div>
                {credentialEditor("memberships", "membershipsTitle", "Professional memberships")}
                {credentialEditor("academic", "academicTitle", "Academic honors")}
              </>
            )}
            {section === "contact" && (
              <div className="editor-card">
                <h2>Business contact information</h2>
                <Field
                  label="Company name"
                  value={content.contact.company}
                  onChange={(v) => updateGroup("contact", "company", v)}
                />
                <div className="editor-fields-grid">
                  <Field
                    label="Email address"
                    type="email"
                    value={content.contact.email}
                    onChange={(v) => updateGroup("contact", "email", v)}
                  />
                  <Field
                    label="Phone number"
                    hint="Or write ‘Available upon request’."
                    value={content.contact.phone}
                    onChange={(v) => updateGroup("contact", "phone", v)}
                  />
                </div>
                <Field
                  label="Location"
                  hint="The map will automatically show this location."
                  value={content.contact.location}
                  onChange={(v) => updateGroup("contact", "location", v)}
                />
                <Field
                  label="LinkedIn profile URL"
                  type="url"
                  required={false}
                  value={content.contact.linkedIn}
                  onChange={(v) => updateGroup("contact", "linkedIn", v)}
                />
                <Field
                  label="Business hours"
                  value={content.contact.hours}
                  onChange={(v) => updateGroup("contact", "hours", v)}
                />
                <Field
                  label="Footer introduction"
                  multiline
                  value={content.contact.footer}
                  onChange={(v) => updateGroup("contact", "footer", v)}
                />
              </div>
            )}
            {section === "photos" && (
              <div className="editor-photo-grid">
                {(
                  [
                    {
                      group: "home",
                      key: "image",
                      label: "Homepage cover",
                      hint: "A wide landscape image works best.",
                    },
                    {
                      group: "profile",
                      key: "image",
                      label: "Main profile photo",
                      hint: "A portrait photo works best.",
                    },
                    {
                      group: "profile",
                      key: "secondImage",
                      label: "Second profile photo",
                      hint: "A landscape photo works best.",
                    },
                  ] as const
                ).map((photo) => (
                  <div className="editor-card editor-photo" key={photo.label}>
                    <img
                      src={photo.group === "home" ? content.home.image : content.profile[photo.key]}
                      alt={photo.label}
                    />
                    <h2>{photo.label}</h2>
                    <p>{photo.hint}</p>
                    <label className="editor-button">
                      <ImagePlus size={17} /> Choose a new photo
                      <input
                        className="editor-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          e.target.value = "";
                          setBusy(true);
                          setError("");
                          try {
                            const url = await uploadImage(file);
                            if (photo.group === "home") updateGroup("home", "image", url);
                            else updateGroup("profile", photo.key, url);
                            setNotice(
                              "Photo uploaded. Save your draft, then preview before publishing.",
                            );
                          } catch (err) {
                            setError(errorText(err));
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </fieldset>
          <footer className="editor-bottom-note">
            <Save size={15} /> Last draft saved: {formattedDate(savedAt)}. Changes go live only when
            you publish.
          </footer>
        </main>
      </div>
      {preview && (
        <Modal title="Website preview · not published" wide close={() => setPreview(false)}>
          <div className="editor-preview-note">
            This is your draft. Close the preview to continue editing or publish your changes.
          </div>
          <iframe
            ref={iframe}
            title="Preview your website changes"
            src="/?preview=1"
            className="editor-preview-frame"
          />
        </Modal>
      )}
      {confirmPublish && (
        <Modal title="Ready to publish?" close={() => !busy && setConfirmPublish(false)}>
          <div className="editor-confirm">
            <p>
              Your changes will replace the current website content and become visible to everyone.
            </p>
            <p>You can continue editing and publish again at any time.</p>
            <div className="editor-actions">
              <button
                className="editor-button"
                disabled={busy}
                onClick={() => setConfirmPublish(false)}
              >
                Keep editing
              </button>
              <button
                className="editor-button editor-primary"
                disabled={busy}
                onClick={() => save(true)}
              >
                {busy ? "Publishing…" : "Yes, publish changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
