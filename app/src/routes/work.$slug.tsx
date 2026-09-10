import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BackLink, Button, Page } from "../components/site";
import { ASPECTS, LINKS, api, normalizeLayout, type Project, type PublicImage } from "../lib/client";

export const Route = createFileRoute("/work/$slug")({
  component: ProjectPage,
});

// Frames 4 to 7, 1440 x 810: outer margin 22 (1.53%), left column 22..946
// (64.2%), gutter 18 (1.25%), text column 964..1418. Hero 924 x 470, then two
// squares of 453 with an 18 px gap. Header row: brand mark 16 px, title 13 px
// bold, subtitle 10 px grey right-aligned, 1 px rule. Sections: label 11 px
// bold, body 10.5 px grey, 1.5 line height. Book a Call 87 x 26, bottom right.
function ProjectPage() {
  const { slug } = Route.useParams();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    setProject(undefined);
    api
      .project(slug)
      .then((r) => setProject(r.project))
      .catch(() => setProject(null));
  }, [slug]);

  useEffect(() => {
    if (project) document.title = `${project.title}, PERSONA`;
  }, [project]);

  if (project === null) {
    return (
      <Page>
        <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 py-24 md:px-10">
          <h1 className="text-[clamp(36px,5vw,64px)]">Project not found</h1>
          <div className="mt-8">
            <Button href="/work">Back to Our Work</Button>
          </div>
        </main>
      </Page>
    );
  }

  const images = project?.images ?? [];
  const rows: PublicImage[][] = [];
  {
    let cur: PublicImage[] = [];
    for (const it of images) {
      const layout = normalizeLayout(it.layout);
      const full = ASPECTS[layout].ratio > 1;
      if (full) {
        if (cur.length) { rows.push(cur); cur = []; }
        rows.push([it]);
      } else {
        cur.push(it);
        if (cur.length === 2) { rows.push(cur); cur = []; }
      }
    }
    if (cur.length) rows.push(cur);
  }
  const sections = project
    ? ([
        ["The Challenge", project.challenge],
        ["The Approach", project.approach],
        ["The Solution", project.solution],
        ["The Result", project.result],
      ] as const).filter(([, t]) => t && t.trim().length > 0)
    : [];

  return (
    <Page hideFooter hideNav>
      <main className="ps-proj relative z-10 w-full flex-1 px-6 pb-10 pt-6 lg:px-[1.53%] lg:pb-[1.53%] lg:pt-[1.53%]">
        <div className="mb-6 flex items-center lg:mb-[1.25vw]">
          <BackLink href="/work" />
        </div>
        <div className="grid gap-y-8 lg:grid-cols-[64.2%_1fr] lg:gap-x-[1.25%]">
          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:gap-[1.25vw]">
            {project === undefined ? (
              <>
                <Slot ratio="924 / 470" title="Loading" loading />
                <div className="grid grid-cols-2 gap-4 lg:gap-[1.25vw]">
                  <Slot ratio="1 / 1" title="Loading" loading />
                  <Slot ratio="1 / 1" title="Loading" loading />
                </div>
              </>
            ) : rows.length === 0 ? (
              <div className="flex h-[60vh] items-center justify-center bg-[#838080]">
                <span className="ps-sans text-[12px] uppercase tracking-[0.2em] text-[#fefdfc]/80">Images coming soon</span>
              </div>
            ) : (
              rows.map((row, i) =>
                row.length === 1 ? (
                  <Slot key={row[0].id} img={row[0]} ratio={normalizeLayout(row[0].layout).replace("-", " / ")} title={project?.title} />
                ) : (
                  <div key={`row-${i}`} className="grid grid-cols-2 gap-4 lg:gap-[1.25vw]">
                    {row.map((it) => (
                      <Slot key={it.id} img={it} ratio={normalizeLayout(it.layout).replace("-", " / ")} title={project?.title} />
                    ))}
                  </div>
                ),
              )
            )}
          </div>

          <aside className="relative order-1 lg:order-2 lg:sticky lg:top-[1.53vw] lg:h-[calc(100dvh-3.06vw)] lg:self-start">
            {project ? (
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-6 border-b border-[#080404] pb-3 lg:pb-[0.55vw]">
                  <div className="flex items-center gap-2 lg:gap-[0.5vw]">
                    {project.logo ? (
                      <img src={project.logo.url} alt="" className="ps-proj-mark" />
                    ) : (
                      <span className="ps-proj-mark bg-[#080404]" />
                    )}
                    <h1 className="ps-sans ps-proj-title font-bold">{project.title}</h1>
                  </div>
                  <p className="ps-proj-sub text-right text-[#080404]/60">{project.subtitle}</p>
                </div>

                <div className="mt-5 flex flex-col gap-4 lg:mt-[1.1vw] lg:gap-[0.9vw] lg:overflow-y-auto">
                  {sections.map(([label, text]) => (
                    <section key={label} className="flex flex-col gap-1.5 lg:gap-[0.35vw]">
                      <h3 className="ps-sans ps-proj-label font-bold">{label}</h3>
                      <p className="ps-proj-body text-[#080404]/60">{text}</p>
                    </section>
                  ))}
                </div>

                <div className="mt-8 flex justify-end lg:mt-auto">
                  <a href={LINKS.call} target="_blank" rel="noreferrer" className="ps-btn ps-btn-proj">
                    Book a Call
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                <div className="h-4 w-32 bg-[#080404]/8" />
                <div className="h-3 w-full bg-[#080404]/6" />
              </div>
            )}
          </aside>
        </div>
      </main>
    </Page>
  );
}

function Slot({
  img,
  ratio,
  title,
  loading,
}: {
  img?: PublicImage;
  ratio: string;
  title?: string;
  loading?: boolean;
}) {
  const fit = img?.mode === "contain" ? "object-contain" : "object-cover";
  return (
    <figure className="w-full overflow-hidden bg-[#838080]" style={{ aspectRatio: ratio }}>
      {img && !loading ? (
        img.kind === "video" ? (
          <video
            src={img.url}
            className={`block h-full w-full ${fit}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            controls={false}
          />
        ) : (
          <img src={img.url} alt={title ?? ""} className={`block h-full w-full ${fit}`} loading="eager" />
        )
      ) : null}
    </figure>
  );
}
