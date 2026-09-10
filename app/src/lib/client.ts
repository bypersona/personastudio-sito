export type PublicImage = { id: string; url: string; width: number; height: number; filename: string; kind: "image" | "video"; layout: string; mode: "cover" | "contain" };

// Every format the admin can assign. Aspect > 1 renders full width, <= 1 half.
export const ASPECTS: Record<string, { ratio: number; label: string }> = {
  "21-9": { ratio: 21 / 9, label: "Ultra-wide 21:9" },
  "16-9": { ratio: 16 / 9, label: "Wide 16:9" },
  "3-2": { ratio: 3 / 2, label: "Classic 3:2" },
  "4-3": { ratio: 4 / 3, label: "Landscape 4:3" },
  "1-1": { ratio: 1, label: "Square 1:1" },
  "4-5": { ratio: 4 / 5, label: "Portrait 4:5" },
  "3-4": { ratio: 3 / 4, label: "Portrait 3:4" },
  "2-3": { ratio: 2 / 3, label: "Portrait 2:3" },
  "9-16": { ratio: 9 / 16, label: "Vertical 9:16" },
};
export const LAYOUT_FALLBACK = { "wide": "16-9", "square": "1-1", "portrait": "4-5" } as Record<string, string>;
export function normalizeLayout(layout: string | undefined): string {
  if (!layout) return "1-1";
  if (ASPECTS[layout]) return layout;
  return LAYOUT_FALLBACK[layout] ?? "1-1";
}

export type Project = {
  id: string;
  slug: string;
  title: string;
  card_description: string;
  subtitle: string;
  challenge: string;
  approach: string;
  solution: string;
  result: string;
  sort_order: number;
  published: boolean;
  cover: PublicImage | null;
  logo: PublicImage | null;
  images: PublicImage[];
};

export const LINKS = {
  call: "https://cal.com/personastudio/30min",
  portal: "https://persona-client-portal.higgsfield.app",
  linkedin: "https://www.linkedin.com/company/bypersonastudio",
  instagram: "https://www.instagram.com/bypersonaa/",
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    credentials: "same-origin",
    headers: init?.body instanceof FormData ? undefined : { "content-type": "application/json" },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  projects: () => call<{ ok: true; projects: Project[] }>("projects"),
  project: (slug: string) => call<{ ok: true; project: Project }>(`project/${slug}`),
  audit: (contact: Record<string, string>, answers: Record<string, string | string[]>) =>
    call<{
      ok: true;
      verdict: { score: number; headline: string; body: string; flags: string[] };
      report: string;
      filename: string;
    }>("audit", { method: "POST", body: JSON.stringify({ contact, answers }) }),
  me: () => call<{ ok: true; admin: boolean }>("me"),
  login: (password: string) => call<{ ok: true }>("login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => call<{ ok: true }>("logout", { method: "POST" }),
  adminProjects: () => call<{ ok: true; projects: Project[] }>("admin/projects"),
  saveProject: (body: Record<string, unknown>) =>
    call<{ ok: true; id: string; projects: Project[] }>("admin/project", { method: "POST", body: JSON.stringify(body) }),
  deleteProject: (id: string) =>
    call<{ ok: true; projects: Project[] }>("admin/project", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderProjects: (ids: string[]) =>
    call<{ ok: true; projects: Project[] }>("admin/reorder-projects", { method: "POST", body: JSON.stringify({ ids }) }),
  reorderImages: (project: string, ids: string[]) =>
    call<{ ok: true; projects: Project[] }>("admin/reorder-images", { method: "POST", body: JSON.stringify({ project, ids }) }),
  upload: (project: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("project", project);
    return call<{ ok: true; id: string; projects: Project[] }>("admin/upload", { method: "POST", body: form });
  },
  deleteImage: (id: string) => call<{ ok: true; projects: Project[] }>(`admin/image/${id}`, { method: "DELETE" }),
  updateImage: (id: string, patch: { layout?: string; mode?: string }) =>
    call<{ ok: true; projects: Project[] }>("admin/image", { method: "POST", body: JSON.stringify({ id, ...patch }) }),
  leads: () =>
    call<{
      ok: true;
      rows: { id: string; created_at: string; name: string; email: string; company: string; website: string | null; score: number; flags: string; report: string }[];
    }>("admin/leads"),
};
