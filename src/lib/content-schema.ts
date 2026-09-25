import { z } from "zod";

const text = z.string().trim().min(1, "Please fill in this field.").max(4000);
const short = text.max(200);
const credentialItemSchema = z.object({ t: short, org: short, note: short });
export const defaultCredentials = {
  heading: "Professional Affiliations & High-Value Academic Honors.",
  membershipsTitle: "Professional Memberships",
  academicTitle: "Academic Distinctions & Scholarships",
  memberships: [
    {
      t: "Life Member",
      org: "Pakistan Engineering Council",
      note: "Chartered professional standing",
    },
    {
      t: "Member",
      org: "Saudi Council of Engineers",
      note: "Registered engineering practitioner — KSA",
    },
  ],
  academic: [
    {
      t: "Research Assistantship",
      org: "M.S., King Fahd University of Petroleum and Minerals",
      note: "Awarded on academic merit",
    },
    {
      t: "University Scholarship",
      org: "B.E., N.E.D. University of Engineering & Technology",
      note: "Undergraduate merit award",
    },
    {
      t: "Government of Pakistan Scholarship",
      org: "Higher Secondary",
      note: "National merit scholarship",
    },
    {
      t: "Merit Scholarship",
      org: "Comilla Zila School",
      note: "Early-career academic distinction",
    },
  ],
};
const image = z
  .string()
  .max(2000)
  .refine(
    (value) =>
      /^\/(?!\/)/.test(value) ||
      /^https:\/\//.test(value) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(value),
    "Choose an image or use a secure image URL.",
  );
export const contentSchema = z.object({
  version: z.literal(1),
  home: z.object({
    title: short,
    accent: short,
    description: text,
    years: z.number().int().min(0).max(150),
    conferences: z.number().int().min(0).max(10000),
    publications: z.number().int().min(0).max(10000),
    image,
  }),
  profile: z.object({
    name: short,
    role: short,
    introduction: text,
    background: text,
    languages: short,
    region: short,
    practice: short,
    image,
    secondImage: image,
  }),
  contact: z.object({
    company: short,
    email: z.string().email("Enter a valid email address."),
    phone: short,
    location: short,
    linkedIn: z
      .string()
      .max(1000)
      .refine(
        (v) => !v || /^https:\/\/(www\.)?linkedin\.com\//.test(v),
        "Use a LinkedIn profile URL, or leave blank.",
      ),
    hours: short,
    footer: text,
  }),
  timeline: z
    .array(z.object({ y: short, h: short, s: text }))
    .min(1)
    .max(40),
  countries: z
    .array(
      z.object({
        name: short,
        code: z.string().regex(/^[a-z]{2}$/, "Choose a country."),
        x: z.number().min(10).max(90),
        y: z.number().min(10).max(75),
      }),
    )
    .min(1)
    .max(60)
    .refine(
      (items) => new Set(items.map((item) => item.code)).size === items.length,
      "Each country should appear only once.",
    ),
  publications: z
    .array(z.object({ y: short, title: text, where: text, authors: text }))
    .min(1)
    .max(100),
  principles: z.array(z.object({ t: short, d: text })).length(7),
  credentials: z
    .object({
      heading: short,
      membershipsTitle: short,
      academicTitle: short,
      memberships: z.array(credentialItemSchema).min(1).max(30),
      academic: z.array(credentialItemSchema).min(1).max(30),
    })
    .default(defaultCredentials),
});
export type SiteContent = z.infer<typeof contentSchema>;

export function validateContent(content: unknown): SiteContent {
  const result = contentSchema.safeParse(content);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`${issue.path.join(" → ")}: ${issue.message}`);
  }
  return result.data;
}
