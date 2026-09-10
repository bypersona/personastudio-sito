// Brand audit questionnaire: questions, weighted scoring and the plain-text
// report. Pure data + pure functions, shared by the client form and the server
// handler (no DOM, no browser globals).

export type Choice = { value: string; label: string; points: number };

export type Question = {
  id: string;
  section: string;
  prompt: string;
  help?: string;
  kind: "choice" | "multi" | "short" | "long";
  choices?: Choice[];
  weight?: number;
  signal?: SignalKey;
  required?: boolean;
  placeholder?: string;
};

export type SignalKey = "consistency" | "perception" | "shift" | "system";

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  consistency: "Inconsistent materials",
  perception: "Price perception gap",
  shift: "The business moved on",
  system: "No production system",
};

export const CONTACT_FIELDS = [
  { id: "name", label: "Your name", type: "text", required: true },
  { id: "email", label: "Work email", type: "email", required: true },
  { id: "company", label: "Company", type: "text", required: true },
  { id: "website", label: "Website (optional)", type: "text", required: false },
] as const;

export const QUESTIONS: Question[] = [
  {
    id: "sell",
    section: "Qualification",
    prompt: "What does your company sell, in one sentence?",
    kind: "short",
    required: true,
    placeholder: "We sell ...",
  },
  {
    id: "age",
    section: "Qualification",
    prompt: "How long has your brand identity been in place?",
    kind: "choice",
    weight: 1,
    choices: [
      { value: "lt1", label: "Less than 1 year", points: 0 },
      { value: "1-3", label: "1 to 3 years", points: 1 },
      { value: "3-5", label: "3 to 5 years", points: 2 },
      { value: "gt5", label: "More than 5 years", points: 3 },
      { value: "never", label: "We never had one", points: 4 },
    ],
  },
  {
    id: "maker",
    section: "Qualification",
    prompt: "Who created it?",
    kind: "choice",
    weight: 1,
    choices: [
      { value: "studio", label: "A studio or agency", points: 0 },
      { value: "freelancer", label: "A freelancer", points: 1 },
      { value: "team", label: "Someone on the team", points: 2 },
      { value: "template", label: "A template or AI tool", points: 3 },
      { value: "evolved", label: "It evolved on its own", points: 4 },
    ],
  },
  {
    id: "revenue",
    section: "Qualification",
    prompt: "Annual revenue range.",
    kind: "choice",
    weight: 0,
    choices: [
      { value: "u250", label: "Under 250k", points: 0 },
      { value: "250-1m", label: "250k to 1M", points: 0 },
      { value: "1-5m", label: "1M to 5M", points: 0 },
      { value: "5m", label: "5M and above", points: 0 },
    ],
  },
  {
    id: "price",
    section: "Symptoms",
    prompt: "When a stranger sees your brand, what do you think they assume about your price level?",
    kind: "choice",
    weight: 3,
    signal: "perception",
    choices: [
      { value: "cheaper", label: "Cheaper than we are", points: 4 },
      { value: "right", label: "About right", points: 0 },
      { value: "premium", label: "More premium than we are", points: 1 },
      { value: "unknown", label: "I have no idea", points: 3 },
    ],
  },
  {
    id: "losing",
    section: "Symptoms",
    prompt: "How often do you lose deals to competitors you consider objectively worse?",
    kind: "choice",
    weight: 2,
    signal: "perception",
    choices: [
      { value: "never", label: "Never", points: 0 },
      { value: "sometimes", label: "Sometimes", points: 1 },
      { value: "often", label: "Often", points: 3 },
      { value: "constantly", label: "Constantly", points: 4 },
    ],
  },
  {
    id: "alignment",
    section: "Symptoms",
    prompt: "Can three people on your team describe what your brand stands for in the same way?",
    kind: "choice",
    weight: 2,
    signal: "consistency",
    choices: [
      { value: "yes", label: "Yes", points: 0 },
      { value: "roughly", label: "Roughly", points: 2 },
      { value: "no", label: "No", points: 4 },
      { value: "untested", label: "We have never tried", points: 3 },
    ],
  },
  {
    id: "who_designs",
    section: "Operations",
    prompt: "Who creates your visual assets today?",
    kind: "choice",
    weight: 2,
    signal: "system",
    choices: [
      { value: "internal", label: "An internal designer", points: 0 },
      { value: "freelancer", label: "A freelancer", points: 1 },
      { value: "marketing", label: "The marketing team", points: 2 },
      { value: "whoever", label: "Whoever is free", points: 3 },
      { value: "nobody", label: "Nobody, we improvise", points: 4 },
    ],
  },
  {
    id: "speed",
    section: "Operations",
    prompt: "How long does it take to produce a new set of on brand assets for a campaign?",
    kind: "choice",
    weight: 3,
    signal: "system",
    choices: [
      { value: "hours", label: "Hours", points: 0 },
      { value: "days", label: "Days", points: 1 },
      { value: "weeks", label: "Weeks", points: 3 },
      { value: "avoid", label: "We avoid doing it", points: 4 },
    ],
  },
  {
    id: "coherence",
    section: "Operations",
    prompt: "Do your materials look like they come from the same company?",
    kind: "choice",
    weight: 3,
    signal: "consistency",
    choices: [
      { value: "always", label: "Always", points: 0 },
      { value: "mostly", label: "Mostly", points: 1 },
      { value: "rarely", label: "Rarely", points: 3 },
      { value: "no", label: "Absolutely not", points: 4 },
    ],
  },
  {
    id: "guidelines",
    section: "Operations",
    prompt: "Do you have documented brand guidelines?",
    kind: "choice",
    weight: 2,
    signal: "system",
    choices: [
      { value: "used", label: "Yes, and we use them", points: 0 },
      { value: "ignored", label: "Yes, but nobody opens them", points: 2 },
      { value: "none", label: "No", points: 4 },
    ],
  },
  {
    id: "shift",
    section: "Strategy",
    prompt: "Has your business changed significantly since your identity was created?",
    help: "Select everything that applies.",
    kind: "multi",
    weight: 3,
    signal: "shift",
    choices: [
      { value: "products", label: "New products", points: 2 },
      { value: "market", label: "New market", points: 2 },
      { value: "audience", label: "New audience", points: 2 },
      { value: "pricing", label: "New price positioning", points: 2 },
      { value: "nothing", label: "Nothing major", points: 0 },
    ],
  },
  {
    id: "trigger",
    section: "Strategy",
    prompt: "What triggered you to take this test today?",
    kind: "long",
    required: true,
  },
  {
    id: "feeling",
    section: "In your words",
    prompt:
      "What do you want people to feel when they encounter your brand, and what do they actually feel today?",
    kind: "long",
    required: true,
  },
  {
    id: "cost",
    section: "In your words",
    prompt: "If nothing changes in the next twelve months, what does it cost you?",
    kind: "long",
    required: true,
  },
  {
    id: "success",
    section: "In your words",
    prompt:
      "Three years from now, looking back, what has to have happened for you to consider this a success?",
    kind: "long",
    required: true,
  },
  {
    id: "decision",
    section: "In your words",
    prompt: "Who decides on an investment like this, and what would make them say yes?",
    kind: "long",
    required: true,
  },
  {
    id: "objection",
    section: "Closing",
    prompt: "What is the biggest reason you have not done anything about this yet?",
    kind: "long",
    required: true,
  },
];

export type Answers = Record<string, string | string[]>;

export type Verdict = {
  score: number;
  headline: string;
  body: string;
  flags: SignalKey[];
};

function pointsFor(q: Question, answer: string | string[] | undefined): number {
  if (!q.choices || !answer) return 0;
  if (q.kind === "multi") {
    const picked = Array.isArray(answer) ? answer : [answer];
    const sum = picked.reduce((acc, value) => {
      const choice = q.choices?.find((c) => c.value === value);
      return acc + (choice?.points ?? 0);
    }, 0);
    return Math.min(4, sum);
  }
  const choice = q.choices.find((c) => c.value === answer);
  return choice?.points ?? 0;
}

export function scoreAnswers(answers: Answers): Verdict {
  let total = 0;
  let max = 0;
  const signalTotals: Record<string, { got: number; max: number }> = {};

  QUESTIONS.forEach((q) => {
    const weight = q.weight ?? 0;
    if (weight <= 0 || !q.choices) return;
    const got = pointsFor(q, answers[q.id]) * weight;
    const cap = 4 * weight;
    total += got;
    max += cap;
    if (q.signal) {
      const entry = signalTotals[q.signal] ?? { got: 0, max: 0 };
      entry.got += got;
      entry.max += cap;
      signalTotals[q.signal] = entry;
    }
  });

  const ratio = max > 0 ? total / max : 0;
  const score = Math.max(1, Math.min(10, Math.round(1 + ratio * 9)));

  const flags = (Object.keys(signalTotals) as SignalKey[]).filter((key) => {
    const entry = signalTotals[key];
    return entry.max > 0 && entry.got / entry.max >= 0.5;
  });

  let headline = "Your identity is still doing its job";
  let body =
    "Nothing in your answers points to a structural problem. Keep the system tight, document what works and revisit this when the business changes shape. A rebrand right now would cost you money and buy you very little.";

  if (score >= 4 && score <= 6) {
    headline = "The cracks are visible from outside";
    body =
      "Your identity still stands, but it is no longer working as a system. The gap shows up in production speed and in how consistent your materials look. This is the cheapest moment to fix it, because the foundations are there and the work is mostly structural.";
  }

  if (score >= 7 && score <= 8) {
    headline = "Your brand is costing you deals";
    body =
      "The signals you selected are the ones that move revenue: how expensive you look, how consistent you are and how fast you can produce. That is not a logo problem, it is a system problem. Companies in this range usually discover their identity is describing a business they no longer run.";
  }

  if (score >= 9) {
    headline = "You are working against your own brand";
    body =
      "Almost every signal is firing at once. Your materials contradict each other, the market prices you below your value and there is no system to produce anything consistently. A new logo would change nothing here. What you need is a strategy, an identity built on it and the guidelines that keep it alive.";
  }

  return { score, headline, body, flags };
}

function labelFor(q: Question, answer: string | string[] | undefined): string {
  if (!answer) return "(no answer)";
  if (!q.choices) return String(answer);
  const values = Array.isArray(answer) ? answer : [answer];
  return values
    .map((v) => q.choices?.find((c) => c.value === v)?.label ?? v)
    .join(", ");
}

export type Contact = {
  name: string;
  email: string;
  company: string;
  website?: string;
};

export function buildReport(
  contact: Contact,
  answers: Answers,
  verdict: Verdict,
  createdAt: string,
): string {
  const lines: string[] = [];
  const rule = "".padEnd(72, "=");

  lines.push("PERSONA BRAND AUDIT");
  lines.push(rule);
  lines.push(`Date: ${createdAt}`);
  lines.push(`Name: ${contact.name}`);
  lines.push(`Email: ${contact.email}`);
  lines.push(`Company: ${contact.company}`);
  lines.push(`Website: ${contact.website && contact.website.length ? contact.website : "not given"}`);
  lines.push("");
  lines.push(`REBRANDING NEED: ${verdict.score}/10`);
  lines.push(verdict.headline);
  lines.push("");
  lines.push(
    `Signals firing: ${
      verdict.flags.length
        ? verdict.flags.map((f) => SIGNAL_LABELS[f]).join(" | ")
        : "none"
    }`,
  );
  lines.push("");

  let section = "";
  QUESTIONS.forEach((q) => {
    if (q.section !== section) {
      section = q.section;
      lines.push("");
      lines.push(section.toUpperCase());
      lines.push("".padEnd(72, "-"));
    }
    lines.push(q.prompt);
    lines.push(`  ${labelFor(q, answers[q.id])}`);
    lines.push("");
  });

  lines.push(rule);
  lines.push("Generated by the PERSONA brand audit. personastudio.co");
  return lines.join("\n");
}

export function reportFilename(contact: Contact, createdAt: string): string {
  const safe = (contact.company || contact.name || "lead")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const day = createdAt.slice(0, 10);
  return `persona-audit-${safe}-${day}.txt`;
}
