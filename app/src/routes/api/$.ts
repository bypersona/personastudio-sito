import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";
import { buildReport, reportFilename, scoreAnswers, type Answers, type Contact } from "../../lib/quiz";
import {
  createSession,
  deleteImage,
  deleteProject,
  destroySession,
  getImage,
  getProjectBySlug,
  insertImage,
  insertSubmission,
  isAdmin,
  listProjects,
  listSubmissions,
  reorderImages,
  reorderProjects,
  updateImageLayout,
  sessionCookie,
  storage,
  upsertProject,
} from "../../lib/studio.server";

const json = (data: unknown, init: ResponseInit = {}) => Response.json(data, init);
const fail = (message: string, status = 400) => json({ ok: false, error: message }, { status });
const MAX_IMAGE = 40 * 1024 * 1024;
const MAX_VIDEO = 30 * 1024 * 1024;

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
const str = (v: unknown, max = 20000) => (typeof v === "string" ? v.slice(0, max) : "");

// Reads PNG / JPEG / WebP / GIF dimensions from the header bytes (no decoder).
function imageSize(bytes: Uint8Array): { width: number; height: number } {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return { width: dv.getUint32(16), height: dv.getUint32(20) };
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57) {
    if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
      return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
    }
    if (bytes[15] === 0x58) {
      const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { width: w, height: h };
    }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length) {
      if (bytes[i] !== 0xff) { i += 1; continue; }
      const marker = bytes[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
      }
      i += 2 + dv.getUint16(i + 2);
    }
  }
  return { width: 0, height: 0 };
}

async function handle(request: Request, splat: string): Promise<Response> {
  const path = splat.replace(/^\/+|\/+$/g, "");
  const method = request.method.toUpperCase();

  // ---------- public ----------
  if (path === "projects" && method === "GET") {
    return json({ ok: true, projects: await listProjects(false) }, { headers: { "cache-control": "public, max-age=60" } });
  }

  if (path.startsWith("project/") && method === "GET") {
    const project = await getProjectBySlug(path.slice(8), await isAdmin(request));
    if (!project) return fail("Not found", 404);
    return json({ ok: true, project });
  }

  if (path.startsWith("image/") && method === "GET") {
    const img = await getImage(path.slice(6));
    if (!img) return fail("Not found", 404);
    const range = request.headers.get("range");
    if (range && img.content_type.startsWith("video/")) {
      const m = range.match(/bytes=(\d*)-(\d*)/);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = m && m[2] ? Number(m[2]) : img.size - 1;
      const obj = await storage().get(img.r2_key, { range: { offset: start, length: end - start + 1 } });
      if (!obj) return fail("Not found", 404);
      return new Response(obj.body as ReadableStream, {
        status: 206,
        headers: {
          "content-type": img.content_type,
          "content-range": `bytes ${start}-${end}/${img.size}`,
          "content-length": String(end - start + 1),
          "accept-ranges": "bytes",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }
    const obj = await storage().get(img.r2_key);
    if (!obj) return fail("Not found", 404);
    return new Response(obj.body as ReadableStream, {
      headers: {
        "content-type": img.content_type,
        "content-length": String(img.size),
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (path === "audit" && method === "POST") {
    const body = await readBody(request);
    const c = (body.contact ?? {}) as Record<string, unknown>;
    const contact: Contact = {
      name: str(c.name, 120).trim(),
      email: str(c.email, 160).trim(),
      company: str(c.company, 160).trim(),
      website: str(c.website, 200).trim(),
    };
    if (!contact.name || !/.+@.+\..+/.test(contact.email) || !contact.company) return fail("Missing contact details");
    const answers = (body.answers && typeof body.answers === "object" ? body.answers : {}) as Answers;
    const verdict = scoreAnswers(answers);
    const createdAt = new Date().toISOString().replace("T", " ").slice(0, 19);
    const report = buildReport(contact, answers, verdict, createdAt);
    await insertSubmission({
      id: crypto.randomUUID(),
      created_at: createdAt,
      name: contact.name,
      email: contact.email,
      company: contact.company,
      website: contact.website ?? "",
      score: verdict.score,
      flags: verdict.flags.join(","),
      answers: JSON.stringify(answers),
      report,
    });
    return json({ ok: true, verdict, report, filename: reportFilename(contact, createdAt) });
  }

  // ---------- admin auth ----------
  if (path === "login" && method === "POST") {
    const body = await readBody(request);
    const expected = bindings().ADMIN_PASSWORD;
    if (!expected || str(body.password, 200) !== expected) return fail("Wrong password", 401);
    const token = await createSession();
    return json({ ok: true }, { headers: { "set-cookie": sessionCookie(token) } });
  }
  if (path === "logout" && method === "POST") {
    await destroySession(request);
    return json({ ok: true }, { headers: { "set-cookie": sessionCookie(null) } });
  }
  if (path === "me" && method === "GET") {
    return json({ ok: true, admin: await isAdmin(request) });
  }

  if (!(await isAdmin(request))) return fail("Not signed in", 401);

  // ---------- admin ----------
  if (path === "admin/projects" && method === "GET") {
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/project" && method === "POST") {
    const body = await readBody(request);
    const slug = str(body.slug, 80).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    const id = await upsertProject({
      id: str(body.id, 80) || undefined,
      slug: slug || undefined,
      title: typeof body.title === "string" ? str(body.title, 160) : undefined,
      card_description: typeof body.card_description === "string" ? str(body.card_description) : undefined,
      subtitle: typeof body.subtitle === "string" ? str(body.subtitle) : undefined,
      challenge: typeof body.challenge === "string" ? str(body.challenge) : undefined,
      approach: typeof body.approach === "string" ? str(body.approach) : undefined,
      solution: typeof body.solution === "string" ? str(body.solution) : undefined,
      result: typeof body.result === "string" ? str(body.result) : undefined,
      cover_image_id: body.cover_image_id === null ? null : typeof body.cover_image_id === "string" ? body.cover_image_id : undefined,
      logo_image_id: body.logo_image_id === null ? null : typeof body.logo_image_id === "string" ? body.logo_image_id : undefined,
      published: typeof body.published === "boolean" ? (body.published ? 1 : 0) : undefined,
    });
    return json({ ok: true, id, projects: await listProjects(true) });
  }

  if (path === "admin/project" && method === "DELETE") {
    const body = await readBody(request);
    await deleteProject(str(body.id, 80));
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/reorder-projects" && method === "POST") {
    const body = await readBody(request);
    if (Array.isArray(body.ids)) await reorderProjects(body.ids.filter((x): x is string => typeof x === "string"));
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/reorder-images" && method === "POST") {
    const body = await readBody(request);
    if (Array.isArray(body.ids)) await reorderImages(str(body.project, 80), body.ids.filter((x): x is string => typeof x === "string"));
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/upload" && method === "POST") {
    const form = await request.formData();
    const file = form.get("file");
    const projectId = str(form.get("project"), 80);
    if (!(file instanceof File)) return fail("Missing file");
    const isVideo = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
    if (!isVideo && !file.type.startsWith("image/")) return fail("Images or MP4 videos only");
    if (isVideo && file.size > MAX_VIDEO) return fail("Max 30 MB per video");
    if (!isVideo && file.size > MAX_IMAGE) return fail("Max 40 MB per image");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { width, height } = isVideo ? { width: 0, height: 0 } : imageSize(bytes);
    const id = crypto.randomUUID();
    const safe = file.name.replace(/[^\w.\-() ]+/g, "_").slice(0, 140) || "image";
    const key = `projects/${projectId}/${id}-${safe}`;
    const contentType = isVideo ? "video/mp4" : file.type;
    await storage().put(key, bytes, { httpMetadata: { contentType } });
    await insertImage({ id, project_id: projectId, r2_key: key, filename: safe, content_type: contentType, width, height, size: file.size });
    return json({ ok: true, id, projects: await listProjects(true) });
  }

  if (path.startsWith("admin/image/") && method === "DELETE") {
    await deleteImage(path.slice(12));
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/image" && method === "POST") {
    const body = await readBody(request);
    const layout = typeof body.layout === "string" ? body.layout.slice(0, 10) : undefined;
    const mode = body.mode === "cover" || body.mode === "contain" ? body.mode : undefined;
    if (!layout && !mode) return fail("Nothing to change");
    await updateImageLayout(str(body.id, 80), { layout, mode } as { layout?: string; mode?: "cover" | "contain" });
    return json({ ok: true, projects: await listProjects(true) });
  }

  if (path === "admin/leads" && method === "GET") {
    return json({ ok: true, rows: await listSubmissions() });
  }

  return fail("Not found", 404);
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => handle(request, params._splat ?? ""),
      POST: ({ request, params }) => handle(request, params._splat ?? ""),
      DELETE: ({ request, params }) => handle(request, params._splat ?? ""),
    },
  },
});
