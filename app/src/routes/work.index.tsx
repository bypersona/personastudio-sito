import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Button, Page } from "../components/site";
import { LINKS, api, type Project } from "../lib/client";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Our Work, PERSONA" },
      { name: "description", content: "A selection of brand identities and design systems we’ve created for our clients." },
    ],
  }),
  component: Work,
});

function Work() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const chipRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    api.projects().then((r) => setProjects(r.projects)).catch(() => setProjects([]));
  }, []);

  // One chip for the whole page: it follows the pointer while it is over a
  // project image and disappears the moment it leaves.
  useEffect(() => {
    const chip = chipRef.current;
    if (!chip) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      chip.style.left = `${x}px`;
      chip.style.top = `${y}px`;
      raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      const over = (e.target as HTMLElement | null)?.closest?.(".ps-card-media");
      if (over) {
        x = e.clientX;
        y = e.clientY;
        chip.classList.add("is-on");
        if (!raf) raf = window.requestAnimationFrame(paint);
      } else {
        chip.classList.remove("is-on");
      }
    };
    const off = () => chip.classList.remove("is-on");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", off);
    document.addEventListener("mouseleave", off);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", off);
      document.removeEventListener("mouseleave", off);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Page>
      <span ref={chipRef} className="ps-cursor-chip" aria-hidden="true">
        View project
      </span>

      <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 pb-24 pt-10 md:px-10 md:pt-16">
        <section className="flex flex-col items-center text-center">
          <h1 className="ps-rise text-[clamp(42px,5.4vw,78px)] leading-[1.05]">Our Work</h1>
          <p className="ps-rise ps-rise-2 mt-5 max-w-[46ch] text-[clamp(15px,1.15vw,17px)] leading-relaxed text-[#080404]/70">
            A selection of brand identities and design systems we’ve created for our clients.
          </p>
          <div className="ps-rise ps-rise-3 mt-8">
            <Button href={LINKS.call} external>
              Book a Call
            </Button>
          </div>
        </section>

        <section className="mt-12 grid gap-x-8 gap-y-9 md:mt-20 md:gap-y-14 md:grid-cols-2">
          {projects === null
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="ps-card-media" />
                  <div className="h-5 w-40 bg-[#080404]/8" />
                  <div className="h-4 w-full bg-[#080404]/6" />
                </div>
              ))
            : projects.map((p, i) => (
                <a
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className={`ps-card ps-rise group flex flex-col gap-4 outline-none ${i % 2 ? "ps-rise-2" : ""}`}
                >
                  <div className="ps-card-media">
                    {p.cover ? <img src={p.cover.url} alt={p.title} loading={i < 2 ? "eager" : "lazy"} /> : null}
                  </div>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[17px] leading-tight">{p.title}</span>
                      <p className="max-w-[54ch] text-[13px] leading-relaxed text-[#080404]/60">{p.card_description}</p>
                    </div>
                    <svg className="ps-arrow mt-1 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </div>
                </a>
              ))}
        </section>
      </main>
    </Page>
  );
}
