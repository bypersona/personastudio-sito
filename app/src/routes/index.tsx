import { createFileRoute } from "@tanstack/react-router";

import { Button, Page } from "../components/site";
import { LINKS } from "../lib/client";

export const Route = createFileRoute("/")({
  component: Home,
});

// Proportions taken from Frame 1 (3840 px wide): title cap height 135 px,
// subtitle 22 px, buttons 104 px tall, label 28 px. Scaled to a 1440 px view.
function Home() {
  return (
    <Page>
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-10">
        <h1 className="ps-rise text-[clamp(34px,4.55vw,68px)] leading-[1.08] md:whitespace-nowrap">
          Branding Partner for Founder-led Business
        </h1>
        <p className="ps-rise ps-rise-2 mt-6 text-[clamp(14px,1.05vw,16px)] leading-relaxed md:whitespace-nowrap text-[#080404]/70">
          We make your brand as exceptional as the business you’ve built.
        </p>
        <div className="ps-home-actions ps-rise ps-rise-3 mt-10 flex w-full max-w-[420px] flex-nowrap items-center justify-center gap-2 md:w-auto md:max-w-none md:gap-3">
          <Button href={LINKS.call} external>
            Book a Call
          </Button>
          <Button href="/work">See Our Work</Button>
          <Button href="/audit">Take a Test</Button>
        </div>
        <span className="ps-rise ps-rise-4 mt-14 text-[11px] uppercase tracking-[0.3em] text-[#080404]/65">
          Branding Studio
        </span>
      </main>
    </Page>
  );
}
