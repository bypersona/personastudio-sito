// Server-only data access for the studio site: projects, images, admin
// sessions and audit leads.
import { bindings } from "./bindings.server";

export const SESSION_COOKIE = "persona_studio";
const SESSION_DAYS = 30;

function db() {
  const { DB } = bindings();
  if (!DB) throw new Error("Database not available");
  return DB;
}

export function storage() {
  const { STORAGE } = bindings();
  if (!STORAGE) throw new Error("Storage not available");
  return STORAGE;
}

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  card_description: string;
  subtitle: string;
  challenge: string;
  approach: string;
  solution: string;
  result: string;
  cover_image_id: string | null;
  logo_image_id: string | null;
  sort_order: number;
  published: number;
};

export type ImageRow = {
  id: string;
  project_id: string;
  r2_key: string;
  filename: string;
  content_type: string;
  width: number;
  height: number;
  size: number;
  sort_order: number;
  layout: "wide" | "square" | "portrait";
  mode: "cover" | "contain";
};

export type PublicImage = { id: string; url: string; width: number; height: number; filename: string; kind: "image" | "video"; layout: "wide" | "square" | "portrait"; mode: "cover" | "contain" };

export type PublicProject = Omit<ProjectRow, "published" | "cover_image_id" | "logo_image_id"> & {
  published: boolean;
  cover: PublicImage | null;
  logo: PublicImage | null;
  images: PublicImage[];
};

function toPublic(img: ImageRow): PublicImage {
  return {
    id: img.id,
    url: `/api/image/${img.id}`,
    width: img.width,
    height: img.height,
    filename: img.filename,
    kind: img.content_type.startsWith("video/") ? "video" : "image",
    layout: img.layout ?? "square",
    mode: img.mode ?? "cover",
  };
}


// Local preview seed: returned only when D1 is absent (plain `bun run dev`).
const LOCAL_SEED: PublicProject[] = [
  {
    id: "p-halvar", slug: "halvar", title: "Halvar",
    card_description: "Predictive maintenance software that spots machine failures before they happen.",
    subtitle: "Predictive maintenance software that sees failures coming.",
    challenge: "Industrial software is split between enterprise systems built for corporations ten times the size of the average plant, and generic tools the maintenance lead never opens. Both look like software. Neither looks like something you'd trust with a production line.",
    approach: "We designed for the room, not the industry. The reference wasn't other software brands, it was the objects those people already trust: engraved control panels and machine plates, built to be read in bad light and to outlive whoever installed them.",
    solution: "A complete system: logotype, mark drawn from the rune Dagaz, palette, typography, UI components for dense data and alerts, landing page, business cards and event materials.",
    result: "An identity that behaves like the product it represents: precise, quiet, and built to look like it will still be there tomorrow.",
    sort_order: 1,
    published: true, cover: { id: "seed-halvar", url: "/assets/seed/halvar.jpg", width: 2000, height: 1125, filename: "halvar.jpg", kind: "image", layout: "wide", mode: "cover" },
    logo: { id: "seed-halvar-logo", url: "/assets/seed/halvar-small1.jpg", width: 1000, height: 1000, filename: "halvar-small1.jpg", kind: "image", layout: "square", mode: "cover" },
    images: [
      { id: "seed-halvar-a", url: "/assets/seed/halvar-small1.jpg", width: 1000, height: 1000, filename: "halvar-small1.jpg", kind: "image", layout: "square", mode: "cover" },
      { id: "seed-halvar-b", url: "/assets/seed/halvar-small2.jpg", width: 1000, height: 1000, filename: "halvar-small2.jpg", kind: "image", layout: "square", mode: "cover" },
    ],
  },
  {
    id: "p-unitopia", slug: "unitopia", title: "Unitopia",
    card_description: "An Italian tech media channel making technology and the future understandable for everyone.",
    subtitle: "An Italian deep tech media channel.",
    challenge: "Tech content in Italy swings between two extremes: sensational hype that promises the future next Tuesday, and technical explainers that assume you already understand the subject. Neither builds trust, and neither looks like it deserves it.",
    approach: "We built a brand around clarity instead of noise. Dark, high-tech and disciplined, with colour used as light rather than decoration, so the channel feels premium and credible without becoming cold or exclusive.",
    solution: "A complete system: logotype, mark, palette, typography, gradients, thumbnail and video templates, plus guidelines covering everything from safe margins to image treatment.",
    result: "Unitopia now looks like the reference point it wants to be: a channel where anyone can understand technology and the future, and actually trust what they're being told.",
    sort_order: 2,
    published: true, cover: { id: "seed-unitopia", url: "/assets/seed/unitopia.jpg", width: 2000, height: 1125, filename: "unitopia.jpg", kind: "image", layout: "wide", mode: "cover" },
    logo: { id: "seed-unitopia-logo", url: "/assets/seed/unitopia-small1.jpg", width: 1000, height: 1000, filename: "unitopia-small1.jpg", kind: "image", layout: "square", mode: "cover" },
    images: [
      { id: "seed-unitopia-a", url: "/assets/seed/unitopia-small1.jpg", width: 1000, height: 1000, filename: "unitopia-small1.jpg", kind: "image", layout: "square", mode: "cover" },
      { id: "seed-unitopia-b", url: "/assets/seed/unitopia-small2.jpg", width: 1000, height: 1000, filename: "unitopia-small2.jpg", kind: "image", layout: "square", mode: "cover" },
    ],
  },
  {
    id: "p-betterself", slug: "betterself", title: "Betterself",
    card_description: "A wellness app that brings every part of your wellbeing into one place, and makes it feel welcoming instead of overwhelming.",
    subtitle: "A wellness app that gives you all the tools you need to improve.",
    challenge: "The wellness market was flooded with apps that all looked and sounded the same: soft pastels, no personality, 3% retention by day 30.",
    approach: "We built a brand that breaks the silence: bold colors, a direct voice, and a strategy that puts people before features.",
    solution: "A complete system: logo, wordmark, mascot, palette, typography. A brand instantly recognizable and impossible to forget.",
    result: "BETTERSELF enters a saturated market with an identity that makes it stand out, get noticed, and actually be remembered.",
    sort_order: 3,
    published: true, cover: { id: "seed-betterself", url: "/assets/seed/betterself.jpg", width: 2000, height: 1143, filename: "betterself.jpg", kind: "image", layout: "wide", mode: "cover" },
    logo: { id: "seed-betterself-logo", url: "/assets/seed/betterself-small1.jpg", width: 1000, height: 1000, filename: "betterself-small1.jpg", kind: "image", layout: "square", mode: "cover" },
    images: [
      { id: "seed-betterself-a", url: "/assets/seed/betterself-small1.jpg", width: 1000, height: 1000, filename: "betterself-small1.jpg", kind: "image", layout: "square", mode: "cover" },
      { id: "seed-betterself-b", url: "/assets/seed/betterself-small2.jpg", width: 1000, height: 1000, filename: "betterself-small2.jpg", kind: "image", layout: "square", mode: "cover" },
    ],
  },
  {
    id: "p-aion", slug: "aion", title: "Aion",
    card_description: "A software built for founders drowning in scattered information as their company scales.",
    subtitle: "All-in-one platform built for founders and early-stage startups.",
    challenge: "Startups run on scattered tools that don't talk to each other. Finance in one, operations in another, people somewhere else. Founders waste time hunting for information and make decisions with an incomplete picture.",
    approach: "We built a brand around clarity and control: a monochrome palette, precise typography, and the iconic missing-piece logo.",
    solution: "A complete identity system — logo, wordmark, palette, and a three-font hierarchy — engineered to feel premium, precise, and unmistakably built for founders.",
    result: "AION enters a crowded market as the specialized, premium choice for founders — the software that removes the guesswork and puts the full picture in their hands.",
    sort_order: 4,
    published: true, cover: { id: "seed-aion", url: "/assets/seed/aion.jpg", width: 2000, height: 1125, filename: "aion.jpg", kind: "image", layout: "wide", mode: "cover" },
    logo: { id: "seed-aion-logo", url: "/assets/seed/aion-small1.jpg", width: 1000, height: 1000, filename: "aion-small1.jpg", kind: "image", layout: "square", mode: "cover" },
    images: [
      { id: "seed-aion-a", url: "/assets/seed/aion-small1.jpg", width: 1000, height: 1000, filename: "aion-small1.jpg", kind: "image", layout: "square", mode: "cover" },
      { id: "seed-aion-b", url: "/assets/seed/aion-small2.jpg", width: 1000, height: 1000, filename: "aion-small2.jpg", kind: "image", layout: "square", mode: "cover" },
    ],
  },
];

export async function listProjects(includeUnpublished = false): Promise<PublicProject[]> {
  let rows: ProjectRow[] = [];
  try {
    rows = (await db()
      .prepare(
        `SELECT * FROM projects ${includeUnpublished ? "" : "WHERE published = 1"} ORDER BY sort_order ASC, created_at ASC`,
      )
      .all<ProjectRow>()).results ?? [];
  } catch {
    // Local preview without a database: show the seed projects.
    return LOCAL_SEED.filter((p) => includeUnpublished || p.published).map((p) => ({
      ...p,
      images: p.cover ? [p.cover, ...p.images] : p.images,
    }));
  }
  let images: ImageRow[] = [];
  try {
    images = (await db()
      .prepare("SELECT * FROM images ORDER BY sort_order ASC, created_at ASC")
      .all<ImageRow>()).results ?? [];
  } catch { images = []; }
  return rows.map((p) => {
    const mine = images.filter((i) => i.project_id === p.id);
    const logo = mine.find((i) => i.id === p.logo_image_id) ?? null;
    const gallery = mine.filter((i) => i.id !== p.logo_image_id);
    const cover =
      gallery.find((i) => i.id === p.cover_image_id && !i.content_type.startsWith("video/")) ??
      gallery.find((i) => !i.content_type.startsWith("video/")) ??
      null;
    return {
      ...p,
      published: p.published === 1,
      cover: cover ? toPublic(cover) : null,
      logo: logo ? toPublic(logo) : null,
      images: gallery.map(toPublic),
    };
  });
}

export async function getProjectBySlug(slug: string, includeUnpublished = false) {
  const all = await listProjects(includeUnpublished);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProjectRow(id: string) {
  return db().prepare("SELECT * FROM projects WHERE id = ?").bind(id).first<ProjectRow>();
}

export async function upsertProject(p: Partial<ProjectRow> & { id?: string }) {
  const existing = p.id ? await getProjectRow(p.id) : null;
  if (existing) {
    await db()
      .prepare(
        `UPDATE projects SET slug=?, title=?, card_description=?, subtitle=?, challenge=?, approach=?, solution=?, result=?, cover_image_id=?, logo_image_id=?, sort_order=?, published=?, updated_at=datetime('now') WHERE id=?`,
      )
      .bind(
        p.slug ?? existing.slug,
        p.title ?? existing.title,
        p.card_description ?? existing.card_description,
        p.subtitle ?? existing.subtitle,
        p.challenge ?? existing.challenge,
        p.approach ?? existing.approach,
        p.solution ?? existing.solution,
        p.result ?? existing.result,
        p.cover_image_id === undefined ? existing.cover_image_id : p.cover_image_id,
        p.logo_image_id === undefined ? existing.logo_image_id : p.logo_image_id,
        p.sort_order ?? existing.sort_order,
        p.published ?? existing.published,
        existing.id,
      )
      .run();
    return existing.id;
  }
  const id = p.id ?? crypto.randomUUID();
  const max = await db()
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM projects")
    .first<{ m: number }>();
  await db()
    .prepare(
      `INSERT INTO projects (id, slug, title, card_description, subtitle, challenge, approach, solution, result, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      p.slug ?? id,
      p.title ?? "Untitled",
      p.card_description ?? "",
      p.subtitle ?? "",
      p.challenge ?? "",
      p.approach ?? "",
      p.solution ?? "",
      p.result ?? "",
      (max?.m ?? 0) + 1,
      p.published ?? 0,
    )
    .run();
  return id;
}

export async function deleteProject(id: string) {
  const imgs = await db().prepare("SELECT * FROM images WHERE project_id = ?").bind(id).all<ImageRow>();
  for (const img of imgs.results ?? []) await storage().delete(img.r2_key);
  await db().prepare("DELETE FROM images WHERE project_id = ?").bind(id).run();
  await db().prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
}

export async function getImage(id: string) {
  return db().prepare("SELECT * FROM images WHERE id = ?").bind(id).first<ImageRow>();
}

export async function insertImage(row: Omit<ImageRow, "sort_order" | "layout" | "mode">) {
  const max = await db()
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM images WHERE project_id = ?")
    .bind(row.project_id)
    .first<{ m: number }>();
  await db()
    .prepare(
      `INSERT INTO images (id, project_id, r2_key, filename, content_type, width, height, size, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.project_id,
      row.r2_key,
      row.filename,
      row.content_type,
      row.width,
      row.height,
      row.size,
      (max?.m ?? 0) + 1,
    )
    .run();
  // The first image of a project is the wide hero by default.
  if ((max?.m ?? 0) === 0) {
    await db().prepare("UPDATE images SET layout = 'wide' WHERE id = ?").bind(row.id).run();
  }
}

export async function deleteImage(id: string) {
  const img = await getImage(id);
  if (!img) return;
  await storage().delete(img.r2_key);
  await db().prepare("DELETE FROM images WHERE id = ?").bind(id).run();
  await db()
    .prepare("UPDATE projects SET cover_image_id = NULL WHERE cover_image_id = ?")
    .bind(id)
    .run();
  await db()
    .prepare("UPDATE projects SET logo_image_id = NULL WHERE logo_image_id = ?")
    .bind(id)
    .run();
}

export async function updateImageLayout(
  id: string,
  patch: { layout?: string; mode?: "cover" | "contain" },
) {
  const img = await getImage(id);
  if (!img) return;
  await db()
    .prepare("UPDATE images SET layout = ?, mode = ? WHERE id = ?")
    .bind(patch.layout ?? img.layout ?? "square", patch.mode ?? img.mode ?? "cover", id)
    .run();
}

export async function reorderImages(projectId: string, ids: string[]) {
  let i = 1;
  for (const id of ids) {
    await db()
      .prepare("UPDATE images SET sort_order = ? WHERE id = ? AND project_id = ?")
      .bind(i, id, projectId)
      .run();
    i += 1;
  }
}

export async function reorderProjects(ids: string[]) {
  let i = 1;
  for (const id of ids) {
    await db().prepare("UPDATE projects SET sort_order = ? WHERE id = ?").bind(i, id).run();
    i += 1;
  }
}

// ---- admin session ----
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookie(token: string | null): string {
  if (!token) return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}

// In-memory sessions so the admin panel also works in local preview.
function memSessions(): Set<string> {
  return ((globalThis as Record<string, unknown>).__persona_sessions as Set<string> | undefined) ??
    ((globalThis as Record<string, unknown>).__persona_sessions = new Set<string>());
}

export async function createSession() {
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  try {
    await db().prepare("INSERT INTO sessions (token, expires_at) VALUES (?, ?)").bind(token, expires).run();
  } catch {
    memSessions().add(token);
  }
  return token;
}

export async function isAdmin(request: Request): Promise<boolean> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return false;
  try {
    const row = await db()
      .prepare("SELECT expires_at FROM sessions WHERE token = ?")
      .bind(token)
      .first<{ expires_at: string }>();
    if (!row) return false;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await db().prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
      return false;
    }
    return true;
  } catch {
    return memSessions().has(token);
  }
}

export async function destroySession(request: Request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return;
  try {
    await db().prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  } catch {
    memSessions().delete(token);
  }
}

// ---- audit leads ----
export async function insertSubmission(row: {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  website: string;
  score: number;
  flags: string;
  answers: string;
  report: string;
}) {
  await db()
    .prepare(
      `INSERT INTO submissions (id, created_at, name, email, company, website, score, flags, answers, report)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.created_at,
      row.name,
      row.email,
      row.company,
      row.website,
      row.score,
      row.flags,
      row.answers,
      row.report,
    )
    .run();
}

export async function listSubmissions() {
  try {
    const res = await db()
    .prepare(
      "SELECT id, created_at, name, email, company, website, score, flags, report FROM submissions ORDER BY created_at DESC LIMIT 500",
    )
    .all<{
      id: string;
      created_at: string;
      name: string;
      email: string;
      company: string;
      website: string | null;
      score: number;
      flags: string;
      report: string;
    }>();
    return res.results ?? [];
  } catch {
    return [];
  }
}
