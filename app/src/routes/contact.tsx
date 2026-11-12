import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";

import { LINKS } from "../lib/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact, PERSONA" },
      { name: "description", content: "Tell us about your project, or book a call with PERSONA directly." },
    ],
  }),
  component: Contact,
});

const SUBJECTS = ["Full Identity", "Rebranding", "Strategy", "Art Direction", "Other"];
const SOURCES = ["Instagram", "LinkedIn", "Behance", "Google", "Referral", "Other"];

// Messages are delivered to hello@personastudio.co through FormSubmit
// (no server or API key needed). The very first message sent triggers a
// one-time activation email to that inbox.
const ENDPOINT = `https://formsubmit.co/ajax/${LINKS.email}`;

type State = "idle" | "sending" | "sent" | "error";

function Contact() {
  const [form, setForm] = useState({
    subject: SUBJECTS[0],
    name: "",
    email: "",
    city: "",
    source: SOURCES[0],
    message: "",
  });
  const [state, setState] = useState<State>("idle");
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New enquiry: ${form.subject}, ${form.name}`,
          _replyto: form.email,
          _template: "table",
          _captcha: "false",
          Subject: form.subject,
          Name: form.name,
          Email: form.email,
          "City, Country": form.city,
          "How did you hear about us": form.source,
          Message: form.message,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(data.success) === "false") throw new Error("send failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="pc-root">
      <div className="pc-wrap">
        <a href="/" className="pc-back" aria-label="Back to home">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>Back</span>
        </a>

        <h1 className="pc-title">Contact Us</h1>

        {state === "sent" ? (
          <div className="pc-done">
            <p className="pc-done-title">Message sent.</p>
            <p className="pc-done-body">Thank you, {form.name.split(" ")[0] || "we got it"}. We read every message and reply within two working days.</p>
            <a href={LINKS.call} target="_blank" rel="noreferrer" className="pc-btn pc-btn-ghost">
              Book a call now
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="pc-form">
            <Field label="Subject" required full>
              <Select value={form.subject} onChange={set("subject")} options={SUBJECTS} />
            </Field>
            <Field label="Name" required>
              <input className="pc-input" required value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Kat" autoComplete="name" />
            </Field>
            <Field label="Email" required>
              <input className="pc-input" required type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="e.g. example@mail.com" autoComplete="email" />
            </Field>
            <Field label="City, Country" required>
              <input className="pc-input" required value={form.city} onChange={(e) => set("city")(e.target.value)} placeholder="e.g. Milan, Italy" autoComplete="address-level2" />
            </Field>
            <Field label="How did you hear about us?">
              <Select value={form.source} onChange={set("source")} options={SOURCES} />
            </Field>
            <Field label="Message" required full>
              <textarea
                className="pc-input pc-textarea"
                required
                rows={6}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                placeholder="Tell us a bit about your project, timeline and budget."
              />
            </Field>

            <div className="pc-actions">
              <button type="submit" className="pc-btn" disabled={state === "sending"}>
                {state === "sending" ? "Sending" : "Submit"}
              </button>
              <a href={LINKS.call} target="_blank" rel="noreferrer" className="pc-btn pc-btn-ghost">
                Skip the form, book a call
              </a>
            </div>
            {state === "error" ? (
              <p className="pc-error">
                Something went wrong. Write to us directly at <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.
              </p>
            ) : null}
          </form>
        )}
      </div>

      <style>{`
        .pc-root { min-height: 100svh; background: #040202; color: #FEFDFC; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
        .pc-wrap { width: 100%; max-width: 900px; margin: 0 auto; padding: 72px 24px 96px; }
        @media (min-width: 900px) { .pc-wrap { padding-top: 120px; } }
        .pc-back { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(254,253,252,0.6); text-decoration: none; transition: color 200ms ease; }
        .pc-back:hover { color: #FEFDFC; }
        .pc-title { margin: 28px 0 22px; font-size: clamp(26px, 3vw, 30px); font-weight: 700; letter-spacing: -0.01em; }
        .pc-form { display: grid; grid-template-columns: 1fr; gap: 18px 16px; }
        @media (min-width: 720px) { .pc-form { grid-template-columns: 1fr 1fr; } }
        .pc-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
        .pc-full { grid-column: 1 / -1; }
        .pc-label { font-size: 12px; color: rgba(254,253,252,0.8); }
        .pc-label b { font-weight: 400; color: #FEFDFC; }
        .pc-input {
          width: 100%; border: 0; border-radius: 0; outline: none; appearance: none;
          background: rgba(254,253,252,0.06); color: #FEFDFC;
          font: inherit; font-size: 14px; padding: 15px 12px;
          border-bottom: 1px solid rgba(254,253,252,0.55);
          transition: background 200ms ease, border-color 200ms ease;
        }
        .pc-input::placeholder { color: rgba(254,253,252,0.45); font-style: italic; }
        .pc-input:hover { background: rgba(254,253,252,0.085); }
        .pc-input:focus { background: rgba(254,253,252,0.1); border-color: #FEFDFC; }
        .pc-textarea { min-height: 124px; resize: vertical; border: 1px solid rgba(254,253,252,0.55); }
        .pc-textarea:focus { border-color: #FEFDFC; }
        .pc-select { position: relative; }
        .pc-select select { cursor: pointer; font-style: italic; padding: 21px 40px 21px 12px; border-bottom: 0; background: rgba(254,253,252,0.1); }
        .pc-select select:focus { background: rgba(254,253,252,0.14); }
        .pc-select option { background: #040202; color: #FEFDFC; font-style: normal; }
        .pc-select svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: rgba(254,253,252,0.75); }
        .pc-actions { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 4px; }
        .pc-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; height: 48px;
          border: 1px solid #FEFDFC; border-radius: 0; background: #FEFDFC; color: #040202;
          font: inherit; font-size: 15px; text-decoration: none; cursor: pointer;
          transition: background 200ms ease, color 200ms ease, opacity 200ms ease;
        }
        .pc-btn:hover { background: rgba(254,253,252,0.86); }
        .pc-btn:disabled { opacity: 0.6; cursor: default; }
        .pc-btn-ghost { background: transparent; color: #FEFDFC; border-color: rgba(254,253,252,0.55); }
        .pc-btn-ghost:hover { background: rgba(254,253,252,0.08); border-color: #FEFDFC; }
        .pc-error { grid-column: 1 / -1; font-size: 13px; color: rgba(254,253,252,0.75); }
        .pc-error a { color: #FEFDFC; }
        .pc-done { display: flex; flex-direction: column; gap: 14px; max-width: 520px; }
        .pc-done-title { font-size: 20px; font-weight: 700; }
        .pc-done-body { font-size: 14px; line-height: 1.6; color: rgba(254,253,252,0.72); margin-bottom: 8px; }
      `}</style>
    </main>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <label className={`pc-field ${full ? "pc-full" : ""}`}>
      <span className="pc-label">
        {label}
        {required ? <b> *</b> : null}
      </span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <span className="pc-select">
      <select className="pc-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}
