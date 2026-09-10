// @ts-nocheck
// Local development extras for the `cloudflare:workers` shim: a JSON-file data
// store and a filesystem storage, so the admin panel, uploads, ordering and
// edits work fully on a plain machine. Only ever aliased in dev; production
// builds keep the real Cloudflare bindings external.
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DATA_DIR = join(ROOT, ".local-data");
const FILES_DIR = join(DATA_DIR, "files");
const DB_FILE = join(DATA_DIR, "db.json");
mkdirSync(FILES_DIR, { recursive: true });

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

function seedProjects() {
  const mk = (id, slug, title, card, sub, challenge, approach, solution, result, order) => ({
    id, slug, title, card_description: card, subtitle: sub, challenge, approach, solution, result,
    cover_image_id: `seed-${slug}-${slug}`, logo_image_id: `seed-${slug}-${slug}-small1`,
    sort_order: order, published: 1, created_at: now(), updated_at: now(),
  });
  return [
    mk("p-halvar", "halvar", "Halvar",
      "Predictive maintenance software that spots machine failures before they happen.",
      "Predictive maintenance software that sees failures coming.",
      "Industrial software is split between enterprise systems built for corporations ten times the size of the average plant, and generic tools the maintenance lead never opens. Both look like software. Neither looks like something you'd trust with a production line.",
      "We designed for the room, not the industry. The reference wasn't other software brands, it was the objects those people already trust: engraved control panels and machine plates, built to be read in bad light and to outlive whoever installed them.",
      "A complete system: logotype, mark drawn from the rune Dagaz, palette, typography, UI components for dense data and alerts, landing page, business cards and event materials.",
      "An identity that behaves like the product it represents: precise, quiet, and built to look like it will still be there tomorrow.",
      1),
    mk("p-unitopia", "unitopia", "Unitopia",
      "An Italian tech media channel making technology and the future understandable for everyone.",
      "An Italian deep tech media channel.",
      "Tech content in Italy swings between two extremes: sensational hype that promises the future next Tuesday, and technical explainers that assume you already understand the subject. Neither builds trust, and neither looks like it deserves it.",
      "We built a brand around clarity instead of noise. Dark, high-tech and disciplined, with colour used as light rather than decoration, so the channel feels premium and credible without becoming cold or exclusive.",
      "A complete system: logotype, mark, palette, typography, gradients, thumbnail and video templates, plus guidelines covering everything from safe margins to image treatment.",
      "Unitopia now looks like the reference point it wants to be: a channel where anyone can understand technology and the future, and actually trust what they're being told.",
      2),
    mk("p-betterself", "betterself", "Betterself",
      "A wellness app that brings every part of your wellbeing into one place, and makes it feel welcoming instead of overwhelming.",
      "A wellness app that gives you all the tools you need to improve.",
      "The wellness market was flooded with apps that all looked and sounded the same: soft pastels, no personality, 3% retention by day 30.",
      "We built a brand that breaks the silence: bold colors, a direct voice, and a strategy that puts people before features.",
      "A complete system: logo, wordmark, mascot, palette, typography. A brand instantly recognizable and impossible to forget.",
      "BETTERSELF enters a saturated market with an identity that makes it stand out, get noticed, and actually be remembered.",
      3),
    mk("p-aion", "aion", "Aion",
      "A software built for founders drowning in scattered information as their company scales.",
      "All-in-one platform built for founders and early-stage startups.",
      "Startups run on scattered tools that don't talk to each other. Finance in one, operations in another, people somewhere else. Founders waste time hunting for information and make decisions with an incomplete picture.",
      "We built a brand around clarity and control: a monochrome palette, precise typography, and the iconic missing-piece logo.",
      "A complete identity system — logo, wordmark, palette, and a three-font hierarchy — engineered to feel premium, precise, and unmistakably built for founders.",
      "AION enters a crowded market as the specialized, premium choice for founders — the software that removes the guesswork and puts the full picture in their hands.",
      4),
  ];
}

function seedImages() {
  const rows = [];
  const sizes = {
    "halvar.jpg": [2000, 1125], "halvar-small1.jpg": [1000, 1000], "halvar-small2.jpg": [1000, 1000],
    "unitopia.jpg": [2000, 1125], "unitopia-small1.jpg": [1000, 1000], "unitopia-small2.jpg": [1000, 1000],
    "betterself.jpg": [2000, 1143], "betterself-small1.jpg": [1000, 1000], "betterself-small2.jpg": [1000, 1000],
    "aion.jpg": [2000, 1125], "aion-small1.jpg": [1000, 1000], "aion-small2.jpg": [1000, 1000],
  };
  let order = 0;
  for (const [slug, files] of Object.entries({
    halvar: ["halvar.jpg", "halvar-small1.jpg", "halvar-small2.jpg"],
    unitopia: ["unitopia.jpg", "unitopia-small1.jpg", "unitopia-small2.jpg"],
    betterself: ["betterself.jpg", "betterself-small1.jpg", "betterself-small2.jpg"],
    aion: ["aion.jpg", "aion-small1.jpg", "aion-small2.jpg"],
  })) {
    files.forEach((name, i) => {
      const base = name.replace(/\.[a-z]+$/, "");
      const file = join(ROOT, "public", "assets", "seed", name);
      order += 1;
      rows.push({
        id: `seed-${slug}-${base}`,
        project_id: `p-${slug}`,
        r2_key: `seed://${name}`,
        filename: name,
        content_type: "image/jpeg",
        width: sizes[name][0],
        height: sizes[name][1],
        size: existsSync(file) ? readFileSync(file).byteLength : 0,
        sort_order: i,
        layout: i === 0 ? "16-9" : "1-1",
        mode: "cover",
        created_at: now(),
      });
    });
  }
  return rows;
}

function freshData() {
  return {
    projects: seedProjects(),
    images: seedImages(),
    sessions: [],
    submissions: [],
  };
}

let DATA;
function load() {
  if (DATA) return DATA;
  if (existsSync(DB_FILE)) {
    try {
      DATA = JSON.parse(readFileSync(DB_FILE, "utf8"));
      return DATA;
    } catch {
      // corrupt file: start over
    }
  }
  DATA = freshData();
  save();
  return DATA;
}
function save() {
  writeFileSync(DB_FILE, JSON.stringify(DATA ?? freshData()));
}

// target-setting helpers ("updated_at = datetime('now')" and NULL literals)
function evalSetValue(raw) {
  const v = raw.trim();
  if (v === "datetime('now')") return now();
  if (v === "NULL" || v === "null") return null;
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  const n = Number(v);
  return Number.isNaN(n) ? raw : n;
}

function whereConditions(whereSql, params) {
  // whereSql like `a = ? AND b = ?` or `done = 1` or `content_type = 'image/jpeg'`
  const parts = whereSql.split(/ AND /i).filter(Boolean);
  const out = [];
  let p = 0;
  for (const part of parts) {
    const m = part.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (!m) throw new Error(`Unsupported WHERE: ${part}`);
    const col = m[1];
    const rhs = m[2].trim();
    let val;
    if (rhs === "?") val = params[p++];
    else if (rhs === "NULL") val = null;
    else if (rhs.startsWith("'")) val = rhs.slice(1, -1);
    else val = Number(rhs);
    out.push([col, val]);
  }
  return { conds: out, used: p };
}

function orderByClause(sql) {
  const m = sql.match(/\sORDER BY\s+(.+?)(\sLIMIT\s+\d+)?$/i);
  if (!m) return { order: null, remainder: sql };
  const order = m[1]
    .split(",")
    .map((c) => {
      const mm = c.trim().match(/^(\S+?)(\s+(ASC|DESC))?$/i);
      return { col: mm[1], dir: mm[3] ? mm[3].toUpperCase() : "ASC" };
    });
  return { order, remainder: sql.slice(0, m.index) };
}

class LocalStatement {
  constructor(sql) {
    this.sql = sql;
    this.params = [];
  }
  bind(...params) {
    this.params = params;
    return this;
  }
  async run() {
    const s = this.sql.trim();
    const data = load();
    const mInsert = s.match(/^INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    const mUpdate = s.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/is);
    const mDelete = s.match(/^DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/is);
    let p = 0;
    if (mInsert) {
      const table = mInsert[1];
      const cols = mInsert[2].split(",").map((c) => c.trim());
      const placeholders = mInsert[3].split(",");
      const row = {};
      cols.forEach((col, i) => {
        const ph = placeholders[i].trim();
        if (ph === "?") row[col] = this.params[p++];
        else if (ph === "NULL") row[col] = null;
        else row[col] = evalSetValue(ph);
      });
      row.created_at = row.created_at ?? now();
      if (!data[table]) data[table] = [];
      data[table].push(row);
      save();
      return { success: true };
    }
    if (mUpdate) {
      const table = mUpdate[1];
      const setSql = mUpdate[2];
      const whereSql = mUpdate[3] ? mUpdate[3].trim() : "";
      const setParts = setSql.split(/\s*,\s*/);
      const patch = {};
      let pp = 0;
      for (const part of setParts) {
        const sm = part.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
        if (!sm) throw new Error(`Unsupported SET: ${part}`);
        patch[sm[1]] = sm[2].trim() === "?" ? this.params[pp++] : evalSetValue(sm[2]);
      }
      const { conds, used } = whereConditions(whereSql, this.params.slice(pp));
      const rows = data[table] ?? [];
      for (const row of rows) {
        if (conds.every(([c, v]) => row[c] === v)) Object.assign(row, patch);
      }
      save();
      return { success: true };
    }
    if (mDelete) {
      const table = mDelete[1];
      const whereSql = mDelete[2] ? mDelete[2].trim() : "1 = 1";
      const { conds } = whereConditions(whereSql, this.params);
      data[table] = (data[table] ?? []).filter((row) => !conds.every(([c, v]) => row[c] === v));
      save();
      return { success: true };
    }
    throw new Error(`Unsupported SQL for run(): ${this.sql}`);
  }
  async first() {
    const all = await this.allImpl();
    return all[0] ?? null;
  }
  async all() {
    return { results: await this.allImpl() };
  }
  async allImpl() {
    const s = this.sql.trim();
    const data = load();
    const mMax = s.match(/SELECT\s+COALESCE\(MAX\((\w+)\),\s*0\)\s+AS\s+(\w+)/i);
    if (mMax) {
      const { conds, used } = whereConditions(s.match(/\bWHERE\s+(.+)$/i)?.[1]?.trim() ?? "", this.params);
      const table = s.match(/\bFROM\s+(\w+)/i)[1];
      const rows = data[table] ?? [];
      const filtered = rows.filter((r) => conds.every(([c, v]) => r[c] === v));
      const max = filtered.reduce((a, r) => Math.max(a, Number(r[mMax[1]]) || 0), 0);
      return [{ [mMax[2]]: max }];
    }
    const mSelect = s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(\s+ORDER BY\s+.+)?(\s+LIMIT\s+(\d+))?$/is);
    if (mSelect) {
      const table = mSelect[2];
      const whereSql = mSelect[3] ? mSelect[3].trim().replace(/ ORDER BY .*$/i, "") : "";
      let rows = [...(data[table] ?? [])];
      if (whereSql) {
        const { conds } = whereConditions(whereSql, this.params);
        rows = rows.filter((r) => conds.every(([c, v]) => r[c] === v));
      }
      const order = orderByClause(s).order;
      const limit = mSelect[6] ? Number(mSelect[6]) : undefined;
      if (order) {
        rows.sort((a, b) => {
          for (const o of order) {
            const av = a[o.col];
            const bv = b[o.col];
            if (av === bv) continue;
            const cmp = av > bv ? 1 : -1;
            return o.dir === "DESC" ? -cmp : cmp;
          }
          return 0;
        });
      }
      if (limit) rows = rows.slice(0, limit);
      const cols = mSelect[1].trim();
      if (cols === "*") return rows;
      return rows.map((r) => {
        const out = {};
        for (const c of cols.split(",")) out[c.trim()] = r[c.trim()];
        return out;
      });
    }
    throw new Error(`Unsupported SQL for read: ${this.sql}`);
  }
}

const DB = { prepare(sql) { return new LocalStatement(sql); } };

// R2-compatible facade over the filesystem. seed:// keys are served from
// public/assets/seed (the demo images), everything else from .local-data/files.
const SEED_DIR = join(ROOT, "public", "assets", "seed");
function resolveKey(key) {
  if (typeof key === "string" && key.startsWith("seed://")) {
    return join(SEED_DIR, key.slice("seed://".length));
  }
  return join(FILES_DIR, key);
}

const STORAGE = {
  async put(key, value, opts) {
    const p = resolveKey(key);
    mkdirSync(dirname(p), { recursive: true });
    if (typeof value === "string") writeFileSync(p, value);
    else writeFileSync(p, new Uint8Array(value));
    return { key };
  },
  async get(key, opts) {
    const p = resolveKey(key);
    if (!existsSync(p)) return null;
    const bytes = readFileSync(p);
    const blob = new Blob([bytes]);
    const size = blob.size;
    if (opts?.range) {
      const start = opts.range.offset;
      const end = opts.range.length ? opts.range.offset + opts.range.length - 1 : size - 1;
      return { body: blob.slice(start, end + 1), size };
    }
    return { body: blob, size, httpMetadata: opts?.httpMetadata };
  },
  async delete(key) {
    try {
      unlinkSync(resolveKey(key));
    } catch {
      // already gone
    }
  },
};

export const env = {
  HF_ENV: "local",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  DB,
  STORAGE,
};