-- PERSONA studio site: editable portfolio + brand audit leads.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  card_description TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT '',
  cover_image_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  size INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS images_project ON images (project_id, sort_order);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT,
  score INTEGER NOT NULL,
  flags TEXT NOT NULL,
  answers TEXT NOT NULL,
  report TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submissions_created_at ON submissions (created_at DESC);

INSERT OR IGNORE INTO projects (id, slug, title, card_description, subtitle, challenge, approach, solution, result, sort_order) VALUES
('p-halvar', 'halvar', 'Halvar',
 'Predictive maintenance software that spots machine failures before they happen.',
 'Predictive maintenance software that sees failures coming.',
 'Industrial software is split between enterprise systems built for corporations ten times the size of the average plant, and generic tools the maintenance lead never opens. Both look like software. Neither looks like something you''d trust with a production line.',
 'We designed for the room, not the industry. The reference wasn''t other software brands, it was the objects those people already trust: engraved control panels and machine plates, built to be read in bad light and to outlive whoever installed them.',
 'A complete system: logotype, mark drawn from the rune Dagaz, palette, typography, UI components for dense data and alerts, landing page, business cards and event materials.',
 'An identity that behaves like the product it represents: precise, quiet, and built to look like it will still be there tomorrow.',
 1),
('p-unitopia', 'unitopia', 'Unitopia',
 'An Italian tech media channel making technology and the future understandable for everyone.',
 'An Italian deep tech media channel.',
 'Tech content in Italy swings between two extremes: sensational hype that promises the future next Tuesday, and technical explainers that assume you already understand the subject. Neither builds trust, and neither looks like it deserves it.',
 'We built a brand around clarity instead of noise. Dark, high-tech and disciplined, with colour used as light rather than decoration, so the channel feels premium and credible without becoming cold or exclusive.',
 'A complete system: logotype, mark, palette, typography, gradients, thumbnail and video templates, plus guidelines covering everything from safe margins to image treatment.',
 'Unitopia now looks like the reference point it wants to be: a channel where anyone can understand technology and the future, and actually trust what they''re being told.',
 2),
('p-betterself', 'betterself', 'Betterself',
 'A wellness app that brings every part of your wellbeing into one place, and makes it feel welcoming instead of overwhelming.',
 'A wellness app that gives you all the tools you need to improve.',
 'The wellness market was flooded with apps that all looked and sounded the same: soft pastels, no personality, 3% retention by day 30.',
 'We built a brand that breaks the silence: bold colors, a direct voice, and a strategy that puts people before features.',
 'A complete system: logo, wordmark, mascot, palette, typography. A brand instantly recognizable and impossible to forget.',
 'BETTERSELF enters a saturated market with an identity that makes it stand out, get noticed, and actually be remembered.',
 3),
('p-aion', 'aion', 'Aion',
 'A software built for founders drowning in scattered information as their company scales.',
 'All-in-one platform built for founders and early-stage startups.',
 'Startups run on scattered tools that don''t talk to each other. Finance in one, operations in another, people somewhere else. Founders waste time hunting for information and make decisions with an incomplete picture.',
 'We built a brand around clarity and control: a monochrome palette, precise typography, and the iconic missing-piece logo.',
 'A complete identity system — logo, wordmark, palette, and a three-font hierarchy — engineered to feel premium, precise, and unmistakably built for founders.',
 'AION enters a crowded market as the specialized, premium choice for founders — the software that removes the guesswork and puts the full picture in their hands.',
 4);
