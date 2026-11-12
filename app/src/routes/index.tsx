import { createFileRoute } from "@tanstack/react-router";

import { LINKS } from "../lib/client";

export const Route = createFileRoute("/")({
  component: Home,
});

const ASSETS = "/assets/badge";

// Home: a real photo of the PERSONA badge, cut out and hung in front of a
// denim pocket. The words printed on the card are the navigation.
//
// Measurements on badge.webp (1200 x 2867), as fractions of the image:
//   holder: centre y 0.670, height 0.653 of the image
//   strap:  centre x 0.491, width 0.224 of the image width
//   card:   x 0.099-0.907, y 0.419-0.978
function Home() {
  return (
    <main className="ps-denim">
      <div className="ps-denim-bg" aria-hidden="true" />
      {/* distressed print on the sides of the jeans */}
      <img className="ps-print ps-print-l" src={`${ASSETS}/print-left.webp`} alt="" aria-hidden="true" />
      <img className="ps-print ps-print-r" src={`${ASSETS}/print-right.webp`} alt="" aria-hidden="true" />
      <div className="ps-denim-vig" aria-hidden="true" />

      <div className="ps-badge">
        <div className="ps-badge-bob">
        <div className="ps-badge-sway">
          <div className="ps-badge-sway2">
            <span className="ps-badge-strap" aria-hidden="true" />
            {/* charms hang from the chain ends, behind the badge, and swing on their own */}
            <img src={`${ASSETS}/charm-cross.webp`} alt="" aria-hidden="true" className="ps-badge-img ps-charm ps-charm-l" width={1200} height={2867} decoding="async" />
            <img src={`${ASSETS}/charm-sardinia.webp`} alt="" aria-hidden="true" className="ps-badge-img ps-charm ps-charm-r" width={1200} height={2867} decoding="async" />
            {/* the PVC sleeve: whatever hangs behind it is seen dimmed and softened */}
            <span className="ps-sleeve" aria-hidden="true" />
            <img
              src={`${ASSETS}/badge.webp`}
              alt="PERSONA studio badge: strategy, identity and art direction"
              className="ps-badge-img"
              width={1200}
              height={2867}
              decoding="async"
              fetchPriority="high"
            />
            <span className="ps-badge-sheen" aria-hidden="true" />
            <a href={LINKS.behance} target="_blank" rel="noreferrer" className="ps-hot" style={{ left: "14.6%", top: "77.5%", width: "27%", height: "3%" }}>
              <span className="sr-only">Works</span>
            </a>
            <a href={LINKS.portal} className="ps-hot" style={{ left: "14.6%", top: "81.6%", width: "24%", height: "3%" }}>
              <span className="sr-only">Log In</span>
            </a>
            <a
              href="/contact"
              className="ps-hot"
              style={{ left: "14.6%", top: "85.7%", width: "33.5%", height: "3%" }}
            >
              <span className="sr-only">Contact</span>
            </a>
          </div>
        </div>
        </div>
      </div>

      <h1 className="sr-only">PERSONA, Branding Partner for Founder-led Business</h1>

      <style>{`
        .ps-denim { position: relative; height: 100svh; min-height: 480px; overflow: hidden; background: #070707; }
        .ps-denim-bg { position: absolute; inset: 0; background: #070707 url(${ASSETS}/denim.webp) center top / cover no-repeat; }
        /* side prints: pinned to the screen edges, full height, as in the mockup */
        .ps-print { position: absolute; top: 0; height: 100%; width: auto; opacity: 1; pointer-events: none; user-select: none; }
        .ps-print-l { left: 0; }
        .ps-print-r { right: 0; }
        @media (max-aspect-ratio: 4/5) { .ps-print { display: none; } }
        .ps-denim-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%); }

        /* the holder height drives the size; its centre sits just below the
           middle of the screen so strap, ring and charms stay in view */
        .ps-badge {
          /* desktop: holder centred on the screen */
          --hh: min(58svh, 125vw);
          --cy: 50svh;
          --ih: calc(var(--hh) * 1.531);
          --iw: calc(var(--ih) * 0.4186);
          position: absolute;
          top: calc(var(--cy) - var(--ih) * 0.6696);
          left: calc(50% - var(--iw) * 0.491);
          width: var(--iw);
          height: var(--ih);
        }
        @media (max-aspect-ratio: 4/5) { .ps-badge { --hh: min(64svh, 125vw); --cy: calc(var(--hh) * 0.93 + 2svh); } }
        /* slow, soft rise and fall, out of step with the sway */
        .ps-badge-bob { position: absolute; inset: 0; will-change: transform; animation: ps-bob 5.6s ease-in-out infinite alternate; }
        @keyframes ps-bob { from { transform: translateY(0); } to { transform: translateY(calc(var(--ih) * -0.008)); } }
        .ps-badge-sway, .ps-badge-sway2 { position: absolute; inset: 0; transform-origin: 49.1% -140%; will-change: transform; }
        .ps-badge-sway { animation: ps-sway 7.4s ease-in-out infinite alternate; }
        .ps-badge-sway2 { animation: ps-sway2 4.3s ease-in-out infinite alternate; }
        @keyframes ps-sway { from { transform: rotate(-0.32deg); } to { transform: rotate(0.32deg); } }
        @keyframes ps-sway2 { from { transform: rotate(0.1deg); } to { transform: rotate(-0.1deg); } }
        @media (prefers-reduced-motion: reduce) { .ps-badge-bob, .ps-badge-sway, .ps-badge-sway2 { animation: none; } }

        /* pendulums: pivot = where each chain meets its charm */
        .ps-charm { will-change: transform; animation: ps-pend 3.1s ease-in-out infinite alternate; }
        .ps-charm-l { transform-origin: 20.8% 23.7%; animation-duration: 2.9s; animation-delay: -0.6s; }
        .ps-charm-r { transform-origin: 76.9% 24.9%; animation-name: ps-pend-r; animation-duration: 3.4s; animation-delay: -1.9s; }
        @keyframes ps-pend { from { transform: rotate(-3.2deg); } to { transform: rotate(3.2deg); } }
        @keyframes ps-pend-r { from { transform: rotate(2.2deg); } to { transform: rotate(-2.2deg); } }
        @media (prefers-reduced-motion: reduce) { .ps-charm { animation: none; } }
        .ps-sleeve {
          position: absolute; inset: 0; pointer-events: none;
          -webkit-backdrop-filter: blur(1.5px) brightness(0.62); backdrop-filter: blur(1.5px) brightness(0.62);
          -webkit-mask-image: url(${ASSETS}/plastic-mask.png); mask-image: url(${ASSETS}/plastic-mask.png);
          -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
        }
        .ps-badge-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          filter: drop-shadow(10px 18px 14px rgba(0,0,0,0.55)) drop-shadow(2px 4px 3px rgba(0,0,0,0.5));
          user-select: none; -webkit-user-drag: none; pointer-events: none;
        }
        /* strap continues above the photo when the screen is taller than it */
        .ps-badge-strap {
          position: absolute; bottom: 99%; height: 100svh;
          left: 37.9%; width: 22.4%;
          background: repeating-linear-gradient(0deg, #121212 0 2px, #0b0b0b 2px 4px);
          box-shadow: 10px 0 14px rgba(0,0,0,0.5);
        }
        /* soft reflection on the PVC sleeve over the card */
        .ps-badge-sheen {
          position: absolute; left: 9.9%; top: 41.9%; width: 80.8%; height: 55.9%;
          border-radius: 2.5%; pointer-events: none; mix-blend-mode: screen;
          background:
            linear-gradient(112deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.10) 34%, rgba(255,255,255,0.03) 44%, rgba(255,255,255,0) 52%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 30%);
        }
        .ps-hot { position: absolute; display: block; cursor: pointer; outline: none; }
        /* hover: a thin stroke in the same off-white as the printed words */
        .ps-hot::after {
          content: ""; position: absolute; inset: -6% -2.5%;
          border: 1.5px solid #fefdfc; opacity: 0; transform: scale(0.97);
          transition: opacity 220ms ease, transform 220ms ease;
        }
        .ps-hot:hover::after, .ps-hot:focus-visible::after { opacity: 1; transform: scale(1); }
      `}</style>
    </main>
  );
}
