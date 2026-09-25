import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultContent } from "./default-content";
import { contentSchema, validateContent, type SiteContent } from "./content-schema";

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cmsConfigured =
  !!url &&
  (/^https:\/\//.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url)) &&
  !!key &&
  key.startsWith("sb_publishable_");
let client: SupabaseClient | undefined;
export function getCms() {
  if (!cmsConfigured) throw new Error("The website editor has not been connected yet.");
  if (!client)
    client = createClient(url!, key!, {
      auth: {
        storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
        persistSession: typeof window !== "undefined",
        detectSessionInUrl: true,
      },
    });
  return client;
}

// No admin session or draft query is used when rendering the public website.
export async function getPublishedContent(): Promise<SiteContent> {
  if (!cmsConfigured) return defaultContent;
  try {
    const response = await fetch(`${url}/rest/v1/site_published?id=eq.main&select=content`, {
      headers: { apikey: key! },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) return defaultContent;
    const rows = await response.json();
    const parsed = contentSchema.safeParse(rows[0]?.content);
    return parsed.success ? parsed.data : defaultContent;
  } catch {
    return defaultContent;
  }
}

export async function requireEditor() {
  const cms = getCms();
  const {
    data: { user },
    error,
  } = await cms.auth.getUser();
  if (error || !user) throw new Error("Please sign in to continue.");
  const { data, error: accessError } = await cms
    .from("site_editors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (accessError)
    throw new Error(
      "The editor database is not ready. Ask your website administrator to check the setup.",
    );
  if (!data) throw new Error("This account does not have permission to edit the website.");
  return user;
}

export async function loadWorkspace() {
  await requireEditor();
  const cms = getCms();
  const [draft, live] = await Promise.all([
    cms.from("site_drafts").select("content, revision, updated_at").eq("id", "main").maybeSingle(),
    cms.from("site_published").select("content, published_at").eq("id", "main").maybeSingle(),
  ]);
  if (draft.error || live.error)
    throw new Error("We could not load your content. Please try again.");
  return {
    content: validateContent(draft.data?.content ?? live.data?.content ?? defaultContent),
    revision: Number(draft.data?.revision ?? 0),
    savedAt: draft.data?.updated_at ?? null,
    publishedAt: live.data?.published_at ?? null,
    liveContent: validateContent(live.data?.content ?? defaultContent),
  };
}

function mutationError(error: { message: string }) {
  if (error.message.includes("changed elsewhere"))
    return new Error(
      "Someone saved a newer version. Copy your unsaved text, then reload before editing again.",
    );
  return new Error(
    "Your changes were not saved. Check your connection and sign-in, then try again.",
  );
}
export async function saveDraft(content: SiteContent, revision: number) {
  const { data, error } = await getCms().rpc("save_site_draft", {
    new_content: validateContent(content),
    expected_revision: revision,
  });
  if (error) throw mutationError(error);
  return data as { revision: number; updated_at: string };
}
export async function publishDraft(revision: number) {
  const { data, error } = await getCms().rpc("publish_site_draft", { expected_revision: revision });
  if (error) throw mutationError(error);
  return data as { published_at: string };
}
export async function uploadImage(file: File) {
  const allowed: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!allowed[file.type]) throw new Error("Please choose a JPG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Please choose an image smaller than 5 MB.");
  const name = `${crypto.randomUUID()}.${allowed[file.type]}`;
  const { error } = await getCms()
    .storage.from("site-images")
    .upload(name, file, { contentType: file.type, upsert: false });
  if (error)
    throw new Error("The photo could not be uploaded. Check your connection and try again.");
  return getCms().storage.from("site-images").getPublicUrl(name).data.publicUrl;
}
