import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { Button, Page } from "../components/site";
import { LINKS, api } from "../lib/client";
import { CONTACT_FIELDS, QUESTIONS, SIGNAL_LABELS, type Answers, type SignalKey } from "../lib/quiz";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Brand Audit, PERSONA" },
      { name: "description", content: "Eighteen questions, four minutes. A score from 1 to 10 on how badly your identity is holding your company back." },
    ],
  }),
  component: Audit,
});

type Verdict = { score: number; headline: string; body: string; flags: SignalKey[] };
type Contact = { name: string; email: string; company: string; website: string };

function Audit() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState<Contact>({ name: "", email: "", company: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ verdict: Verdict; report: string; filename: string } | null>(null);

  const totalSteps = QUESTIONS.length + 1;
  const isContact = step === QUESTIONS.length;
  const question = QUESTIONS[step];
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const canAdvance = useMemo(() => {
    if (isContact) {
      return contact.name.trim().length > 0 && /.+@.+\..+/.test(contact.email) && contact.company.trim().length > 0;
    }
    if (!question) return false;
    const v = answers[question.id];
    if (question.kind === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  }, [answers, contact, isContact, question]);

  const setAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleMulti = useCallback((id: string, value: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      if (value === "nothing") return { ...prev, [id]: current.includes(value) ? [] : ["nothing"] };
      const cleaned = current.filter((v) => v !== "nothing");
      return { ...prev, [id]: cleaned.includes(value) ? cleaned.filter((v) => v !== value) : [...cleaned, value] };
    });
  }, []);

  const submit = useCallback(async () => {
    setSending(true);
    setError(null);
    try {
      const r = await api.audit(
        { name: contact.name.trim(), email: contact.email.trim(), company: contact.company.trim(), website: contact.website.trim() },
        answers,
      );
      setResult({ verdict: r.verdict as Verdict, report: r.report, filename: r.filename });
      window.scrollTo({ top: 0 });
    } catch {
      setError("Something went wrong on our side. Please try again.");
    } finally {
      setSending(false);
    }
  }, [answers, contact]);

  const download = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <Page>
      <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-6 pb-24 md:px-10">
        {!started && !result ? (
          <section className="grid gap-10 pt-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-end md:pt-28">
            <h1 className="ps-rise text-[clamp(40px,5.2vw,76px)] leading-[1.04]">
              Does Your Brand Still Deserve <span className="text-[#F11213]">Your Business?</span>
            </h1>
            <div className="ps-rise ps-rise-2 flex flex-col gap-7">
              <p className="max-w-[46ch] text-[15px] leading-relaxed text-[#080404]/70">
                Eighteen questions, four minutes. At the end you get a score from 1 to 10 on how badly your identity is
                holding your company back, and the exact signals behind it.
              </p>
              <div>
                <Button onClick={() => setStarted(true)}>Start the Audit</Button>
              </div>
              <span className="ps-sans text-[11px] uppercase tracking-[0.22em] text-[#080404]/50">
                No account, no sales email until you ask for one
              </span>
            </div>
          </section>
        ) : null}

        {started && !result ? (
          <section className="pt-8 md:pt-12">
            <div className="flex items-center justify-between gap-6 border-b border-[#080404]/15 pb-4">
              <span className="ps-sans text-[11px] uppercase tracking-[0.24em] text-[#F11213]">
                {isContact ? "Your result" : question.section}
              </span>
              <span className="ps-sans text-[12px] tabular-nums text-[#080404]/60">
                {String(step + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
              </span>
            </div>
            <div className="h-[2px] w-full bg-[#080404]/10">
              <div className="h-[2px] bg-[#F11213] transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div key={step} className="ps-rise mx-auto mt-14 flex w-full max-w-[880px] flex-col gap-10 md:mt-20">
              {isContact ? (
                <>
                  <h2 className="text-[clamp(30px,3.6vw,52px)] leading-[1.06]">Where do we send the verdict?</h2>
                  <div className="grid gap-7 sm:grid-cols-2">
                    {CONTACT_FIELDS.map((f) => (
                      <label key={f.id} className="flex flex-col gap-1">
                        <span className="ps-sans text-[12px] text-[#080404]/55">{f.label}</span>
                        <input
                          type={f.type}
                          value={contact[f.id as keyof Contact]}
                          onChange={(e) => setContact((c) => ({ ...c, [f.id]: e.target.value }))}
                          className="ps-field"
                        />
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-[clamp(30px,3.6vw,52px)] leading-[1.06]">{question.prompt}</h2>
                  {question.help ? <p className="ps-sans -mt-4 text-[14px] text-[#080404]/55">{question.help}</p> : null}

                  {question.kind === "choice" && question.choices ? (
                    <div className="flex flex-col divide-y divide-[#080404]/12 border-y border-[#080404]/12">
                      {question.choices.map((c) => {
                        const active = answers[question.id] === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setAnswer(question.id, c.value)}
                            className={`group flex items-center justify-between gap-4 py-4 text-left text-[17px] transition-colors duration-200 ${
                              active ? "text-[#F11213]" : "hover:text-[#080404]/60"
                            }`}
                          >
                            <span>{c.label}</span>
                            <span
                              className={`h-[14px] w-[14px] shrink-0 border transition-colors duration-200 ${
                                active ? "border-[#F11213] bg-[#F11213]" : "border-[#080404]/35 group-hover:border-[#080404]/70"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {question.kind === "multi" && question.choices ? (
                    <div className="flex flex-wrap gap-3">
                      {question.choices.map((c) => {
                        const list = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
                        const active = list.includes(c.value);
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => toggleMulti(question.id, c.value)}
                            className={` border px-5 py-3 text-[15px] transition-colors duration-200 ${
                              active ? "border-[#F11213] bg-[#F11213] text-[#fefdfc]" : "border-[#080404]/30 hover:border-[#080404]"
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {question.kind === "short" ? (
                    <input
                      type="text"
                      value={(answers[question.id] as string) ?? ""}
                      placeholder={question.placeholder}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      className="ps-field text-[19px]"
                    />
                  ) : null}

                  {question.kind === "long" ? (
                    <textarea
                      rows={6}
                      value={(answers[question.id] as string) ?? ""}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      className="ps-area"
                    />
                  ) : null}
                </>
              )}

              {error ? <p className="ps-sans text-[13px] text-[#F11213]">{error}</p> : null}

              <div className="flex items-center gap-6">
                <Button
                  disabled={!canAdvance || sending}
                  onClick={() => {
                    if (isContact) void submit();
                    else {
                      setStep((s) => Math.min(totalSteps - 1, s + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  {isContact ? (sending ? "Scoring" : "See my score") : "Continue"}
                </Button>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="ps-sans text-[14px] text-[#080404]/50 transition-colors duration-200 hover:text-[#080404]"
                  >
                    Back
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {result ? <Result verdict={result.verdict} onDownload={download} /> : null}
      </main>
    </Page>
  );
}

function Result({ verdict, onDownload }: { verdict: Verdict; onDownload: () => void }) {
  const urgent = verdict.score >= 4;
  return (
    <section className="grid gap-12 pt-12 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-20 md:pt-20">
      <div className="ps-rise">
        <span className="ps-sans text-[11px] uppercase tracking-[0.24em] text-[#080404]/55">Rebranding need</span>
        <div className="mt-2 flex items-end gap-3">
          <span className="ps-serif text-[clamp(90px,14vw,180px)] leading-[0.85] text-[#F11213]">{verdict.score}</span>
          <span className="ps-serif pb-3 text-[clamp(28px,3vw,44px)] text-[#080404]/35">/10</span>
        </div>
      </div>

      <div className="ps-rise ps-rise-2 flex flex-col gap-7">
        <h2 className="text-[clamp(30px,3.6vw,52px)] leading-[1.06]">{verdict.headline}</h2>
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-[#080404]/70">{verdict.body}</p>

        {verdict.flags.length ? (
          <div className="flex flex-wrap gap-2">
            {verdict.flags.map((f) => (
              <span key={f} className="ps-sans border border-[#080404]/25 px-3.5 py-2 text-[13px] text-[#080404]/70">
                {SIGNAL_LABELS[f]}
              </span>
            ))}
          </div>
        ) : null}

        {urgent ? (
          <div className="flex flex-col gap-4 bg-[#080404] p-8 text-[#fefdfc]">
            <h3 className="ps-serif text-[clamp(26px,2.6vw,36px)] leading-tight">Book a free 30-minute call</h3>
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-[#fefdfc]/70">
              We go through your answers together and you leave with a clear read on what to fix first, whether you work with us or not.
            </p>
            <div>
              <Button href={LINKS.call} external variant="red">
                Book a call
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button href={LINKS.call} external variant="ghost">
              Talk to us anyway
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={onDownload}
          className="ps-sans self-start text-[13px] text-[#080404]/50 underline underline-offset-4 transition-colors duration-200 hover:text-[#080404]"
        >
          Download my answers
        </button>
      </div>
    </section>
  );
}
