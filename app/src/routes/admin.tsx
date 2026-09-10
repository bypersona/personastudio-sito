import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Page } from "../components/site";
import { ASPECTS, api, type Project } from "../lib/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio panel, PERSONA" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Lead = Awaited<ReturnType<typeof api.leads>>["rows"][number];

function Admin() {
  const [auth, setAuth] = useState<"loading" | "login" | "ok">("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"work" | "leads">("work");
  const [leads, setLeads] = useState<Lead[] | null>(null);

  const load = useCallback(async () => {
    const r = await api.adminProjects();
    setProjects(r.projects);
  }, []);

  useEffect(() => {
    api
      .me()
      .then(async (m) => {
        if (m.admin) {
          setAuth("ok");
          await load();
        } else setAuth("login");
      })
      .catch(() => setAuth("login"));
  }, [load]);

  useEffect(() => {
    if (tab === "leads" && leads === null) api.leads().then((r) => setLeads(r.rows)).catch(() => setLeads([]));
  }, [tab, leads]);

  if (auth === "loading") {
    return (
      <Page>
        <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 py-24 md:px-10">
          <span className="ps-sans text-[12px] uppercase tracking-[0.2em] text-[#080404]/50">Loading</span>
        </main>
      </Page>
    );
  }

  if (auth === "login") {
    return (
      <Page>
        <LoginForm
          onDone={async () => {
            setAuth("ok");
            await load();
          }}
        />
      </Page>
    );
  }

  const project = selected ? projects.find((p) => p.id === selected) ?? null : null;

  return (
    <Page>
      <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 pb-24 pt-8 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[#080404]/15 pb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-[clamp(32px,4vw,52px)] leading-none">Studio panel</h1>
            <nav className="ps-sans flex gap-4 text-[13px]">
              <button type="button" onClick={() => { setTab("work"); setSelected(null); }} className={tab === "work" ? "text-[#F11213]" : "text-[#080404]/55 hover:text-[#080404]"}>
                Work
              </button>
              <button type="button" onClick={() => setTab("leads")} className={tab === "leads" ? "text-[#F11213]" : "text-[#080404]/55 hover:text-[#080404]"}>
                Audit leads{leads ? ` (${leads.length})` : ""}
              </button>
            </nav>
          </div>
          <button
            type="button"
            onClick={async () => {
              await api.logout();
              setAuth("login");
            }}
            className="ps-sans text-[13px] text-[#080404]/55 hover:text-[#F11213]"
          >
            Log out
          </button>
        </div>

        {tab === "leads" ? <Leads rows={leads ?? []} /> : null}

        {tab === "work" && !project ? (
          <ProjectList
            projects={projects}
            onOpen={setSelected}
            onChange={setProjects}
          />
        ) : null}

        {tab === "work" && project ? (
          <ProjectEditor
            key={project.id}
            project={project}
            onBack={() => setSelected(null)}
            onChange={setProjects}
          />
        ) : null}
      </main>
    </Page>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 py-24 md:px-10">
      <form
        className="flex max-w-[380px] flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.login(password);
            onDone();
          } catch {
            setError("Wrong password.");
          }
        }}
      >
        <h1 className="text-[clamp(36px,5vw,64px)] leading-none">Studio panel</h1>
        <label className="flex flex-col gap-1">
          <span className="ps-sans text-[12px] text-[#080404]/55">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="ps-field" autoComplete="current-password" />
        </label>
        {error ? <p className="ps-sans text-[13px] text-[#F11213]">{error}</p> : null}
        <div>
          <Button type="submit" disabled={!password}>
            Enter
          </Button>
        </div>
      </form>
    </main>
  );
}

function ProjectList({
  projects,
  onOpen,
  onChange,
}: {
  projects: Project[];
  onOpen: (id: string) => void;
  onChange: (p: Project[]) => void;
}) {
  const move = async (index: number, dir: -1 | 1) => {
    const ids = projects.map((p) => p.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const r = await api.reorderProjects(ids);
    onChange(r.projects);
  };

  return (
    <section className="pt-8">
      <div className="flex items-center justify-between gap-6">
        <p className="ps-sans max-w-[60ch] text-[14px] text-[#080404]/60">
          The order here is the order on the Our Work page. Unpublished projects are hidden from visitors.
        </p>
        <Button
          size="sm"
          onClick={async () => {
            const r = await api.saveProject({ title: "New project", slug: `project-${Date.now().toString(36)}`, published: false });
            onChange(r.projects);
            onOpen(r.id);
          }}
        >
          New project
        </Button>
      </div>
      <ul className="mt-8 flex flex-col border-t border-[#080404]/12">
        {projects.map((p, i) => (
          <li key={p.id} className="flex items-center gap-5 border-b border-[#080404]/12 py-4">
            <div className="h-14 w-20 shrink-0 overflow-hidden bg-[#080404]/6">
              {p.cover ? <img src={p.cover.url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <button type="button" onClick={() => onOpen(p.id)} className="flex min-w-0 flex-1 flex-col text-left">
              <span className="text-[18px]">{p.title}</span>
              <span className="ps-sans truncate text-[12px] text-[#080404]/50">
                /work/{p.slug} · {p.images.length} image{p.images.length === 1 ? "" : "s"} · {p.published ? "Published" : "Draft"}
              </span>
            </button>
            <div className="ps-sans flex items-center gap-3 text-[12px] text-[#080404]/55">
              <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} className="hover:text-[#080404] disabled:opacity-25">Up</button>
              <button type="button" onClick={() => void move(i, 1)} disabled={i === projects.length - 1} className="hover:text-[#080404] disabled:opacity-25">Down</button>
              <button type="button" onClick={() => onOpen(p.id)} className="underline underline-offset-4 hover:text-[#F11213]">Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FIELDS: { key: keyof Project; label: string; kind: "input" | "area"; help?: string }[] = [
  { key: "title", label: "Title", kind: "input" },
  { key: "slug", label: "URL slug", kind: "input", help: "Letters, numbers and hyphens. Appears as /work/slug." },
  { key: "card_description", label: "Card description (Our Work)", kind: "area" },
  { key: "subtitle", label: "Subtitle (project page)", kind: "input" },
  { key: "challenge", label: "The Challenge", kind: "area" },
  { key: "approach", label: "The Approach", kind: "area" },
  { key: "solution", label: "The Solution", kind: "area" },
  { key: "result", label: "The Result", kind: "area" },
];

function ProjectEditor({
  project,
  onBack,
  onChange,
}: {
  project: Project;
  onBack: () => void;
  onChange: (p: Project[]) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, String(project[f.key] ?? "")])),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(0);

  const save = async (extra: Record<string, unknown> = {}) => {
    setSaving(true);
    setError(null);
    try {
      const r = await api.saveProject({ id: project.id, ...form, ...extra });
      onChange(r.projects);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(files.length);
    try {
      let latest: Project[] | null = null;
      for (const f of Array.from(files)) {
        const r = await api.upload(project.id, f);
        latest = r.projects;
        setUploading((n) => n - 1);
      }
      if (latest) onChange(latest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(0);
      if (fileRef.current) fileRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const moveImage = async (index: number, dir: -1 | 1) => {
    const ids = project.images.map((i) => i.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const r = await api.reorderImages(project.id, ids);
    onChange(r.projects);
  };

  return (
    <section className="pt-8">
      <button type="button" onClick={onBack} className="ps-sans text-[13px] text-[#080404]/55 hover:text-[#080404]">
        All projects
      </button>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[clamp(28px,3.5vw,44px)] leading-none">{project.title}</h2>
            <label className="ps-sans flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={project.published}
                onChange={(e) => void save({ published: e.target.checked })}
              />
              Published
            </label>
          </div>

          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="ps-sans text-[12px] text-[#080404]/55">{f.label}</span>
              {f.kind === "input" ? (
                <input
                  value={form[f.key] ?? ""}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, [f.key]: e.target.value }));
                    setDirty(true);
                  }}
                  className="ps-field text-[16px]"
                />
              ) : (
                <textarea
                  rows={f.key === "card_description" ? 3 : 5}
                  value={form[f.key] ?? ""}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, [f.key]: e.target.value }));
                    setDirty(true);
                  }}
                  className="ps-area text-[15px]"
                />
              )}
              {f.help ? <span className="ps-sans text-[11px] text-[#080404]/45">{f.help}</span> : null}
            </label>
          ))}

          {error ? <p className="ps-sans text-[13px] text-[#F11213]">{error}</p> : null}

          <div className="flex items-center gap-5">
            <Button disabled={!dirty || saving} onClick={() => void save()}>
              {saving ? "Saving" : dirty ? "Save changes" : "Saved"}
            </Button>
            <a href={`/work/${project.slug}`} target="_blank" rel="noreferrer" className="ps-sans text-[13px] text-[#080404]/55 underline underline-offset-4 hover:text-[#080404]">
              Open page
            </a>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Delete ${project.title} and all its images?`)) return;
                const r = await api.deleteProject(project.id);
                onChange(r.projects);
                onBack();
              }}
              className="ps-sans ml-auto text-[13px] text-[#080404]/45 hover:text-[#F11213]"
            >
              Delete project
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[22px] leading-none">Images</h3>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void upload(e.target.files)}
            />
            <div className="flex items-center gap-2">
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,.mp4"
                multiple
                className="hidden"
                onChange={(e) => void upload(e.target.files)}
              />
              <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
                {uploading > 0 ? `Uploading ${uploading}` : "Add images"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => videoRef.current?.click()} disabled={uploading > 0}>
                Add video
              </Button>
            </div>
          </div>
          <p className="ps-sans text-[13px] text-[#080404]/55">
            For every photo and video you decide how it appears: Large 16:9 covers the full width, Square 1:1 and Portrait 4:5 take half the width and sit side by side. "Cover" fills the box and may crop the edges, "Fit" shows the whole file. The first image of a project is the cover of the Our Work grid ("Set cover"); "Use as mark" makes it the small symbol next to the project title. Videos: MP4 up to 30 MB, loop, muted, no controls, same layout options. Any format, up to 40 MB each.
          </p>

          {project.images.length === 0 ? (
            <div className="ps-card-media flex items-center justify-center" style={{ aspectRatio: "4 / 3" }}>
              <span className="ps-sans text-[12px] uppercase tracking-[0.2em] text-[#080404]/40">No images yet</span>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {project.logo ? (
                <li className="flex flex-col gap-2 sm:col-span-2">
                  <div className="ps-sans flex items-center gap-3 border border-[#080404]/15 p-3 text-[12px] text-[#080404]/70">
                    <img src={project.logo.url} alt="" className="h-8 w-8 object-contain" />
                    <span>Brand mark shown next to the title: {project.logo.filename}</span>
                    <button type="button" onClick={() => void save({ logo_image_id: null })} className="ml-auto hover:text-[#F11213]">
                      Move back to gallery
                    </button>
                  </div>
                </li>
              ) : null}
              {project.images.map((img, i) => {
                const isCover = project.cover?.id === img.id;
                return (
                  <li key={img.id} className="flex flex-col gap-2">
                    <div className={`relative overflow-hidden border ${isCover ? "border-[#F11213]" : "border-[#080404]/10"} bg-[#080404]/5`}>
                      {img.kind === "video" ? (
                        <video src={img.url} className="block aspect-[4/3] w-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={img.url} alt="" className="block aspect-[4/3] w-full object-cover" />
                      )}
                      {isCover ? (
                        <span className="ps-sans absolute left-2 top-2 bg-[#F11213] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#fefdfc]">
                          Cover
                        </span>
                      ) : null}
                    </div>
                    <div className="ps-sans flex flex-wrap items-center gap-3 text-[12px] text-[#080404]/55">
                      <span className="truncate">{img.filename}</span>
                      <select
                        value={img.layout}
                        onChange={(e) => {
                          void api.updateImage(img.id, { layout: e.target.value }).then((r) => onChange(r.projects));
                        }}
                        className="border border-[#080404]/25 bg-transparent px-2 py-1"
                      >
                        {Object.entries(ASPECTS).map(([key, a]) => (
                          <option key={key} value={key}>
                            {a.label} · {a.ratio > 1 ? "full width" : "half width"}
                          </option>
                        ))}
                      </select>
                      <select
                        value={img.mode}
                        onChange={(e) => {
                          void api.updateImage(img.id, { mode: e.target.value }).then((r) => onChange(r.projects));
                        }}
                        className="border border-[#080404]/25 bg-transparent px-2 py-1"
                      >
                        <option value="cover">Cover: fill, may crop</option>
                        <option value="contain">Fit: whole file</option>
                      </select>
                      <span className="ml-auto flex items-center gap-3">
                        <button type="button" onClick={() => void moveImage(i, -1)} disabled={i === 0} className="hover:text-[#080404] disabled:opacity-25">Up</button>
                        <button type="button" onClick={() => void moveImage(i, 1)} disabled={i === project.images.length - 1} className="hover:text-[#080404] disabled:opacity-25">Down</button>
                        {!isCover && img.kind === "image" ? (
                          <button type="button" onClick={() => void save({ cover_image_id: img.id })} className="hover:text-[#080404]">Set cover</button>
                        ) : null}
                        {img.kind === "image" ? (
                          <button type="button" onClick={() => void save({ logo_image_id: img.id })} className="hover:text-[#080404]">Use as mark</button>
                        ) : (
                          <span className="text-[#080404]/40">Video</span>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const r = await api.deleteImage(img.id);
                            onChange(r.projects);
                          }}
                          className="hover:text-[#F11213]"
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Leads({ rows }: { rows: Lead[] }) {
  const download = (row: Lead) => {
    const blob = new Blob([row.report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `persona-audit-${row.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${row.created_at.slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="pt-8">
      {rows.length === 0 ? (
        <p className="ps-sans text-[14px] text-[#080404]/60">No submissions yet.</p>
      ) : (
        <ul className="flex flex-col border-t border-[#080404]/12">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#080404]/12 py-4">
              <span className="ps-serif w-10 text-[26px] text-[#F11213]">{r.score}</span>
              <span className="min-w-[160px] text-[16px]">{r.company}</span>
              <span className="ps-sans text-[14px] text-[#080404]/65">{r.name}</span>
              <a href={`mailto:${r.email}`} className="ps-sans text-[14px] text-[#080404]/65 underline underline-offset-4 hover:text-[#F11213]">{r.email}</a>
              <span className="ps-sans text-[12px] text-[#080404]/45">{r.created_at}</span>
              <button type="button" onClick={() => download(r)} className="ps-sans ml-auto text-[12px] uppercase tracking-[0.14em] text-[#080404]/55 underline underline-offset-4 hover:text-[#F11213]">
                Download txt
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
