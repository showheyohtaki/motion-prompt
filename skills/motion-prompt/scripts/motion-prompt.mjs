#!/usr/bin/env node
/* Motion Prompt skill CLI · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
// Node 18+, no dependencies. Reads the static Motion Prompt API (api/v1) and prints what an agent needs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const VERSION = '0.1.0';
const SITE = 'https://showheyohtaki.github.io/motion-prompt/';
const REMOTES = [
  'https://showheyohtaki.github.io/motion-prompt/api/v1',
  'https://raw.githubusercontent.com/showheyohtaki/motion-prompt/main/api/v1',
];
const MAX_GET = 8;
const EXIT = { OK: 0, NOT_FOUND: 1, USAGE: 2, NETWORK: 3, TIMEOUT: 4 };
const PICK_TIMEOUT = 900; // seconds
const PICK_MAX = 60;
const NOTE_MAX = 1000;
const SELF = fileURLToPath(import.meta.url);
const ENV = process.env;

class CliError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ---------- arguments ----------

const VALUE_FLAGS = new Set(['lang', 'pack', 'limit', 'out', 'timeout']);
const BOOL_FLAGS = new Set(['refresh', 'help', 'version', 'no-open', 'local']);

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    if (BOOL_FLAGS.has(name)) { flags[name] = true; continue; }
    if (!VALUE_FLAGS.has(name)) throw new CliError(EXIT.USAGE, `Unknown option --${name}. Run with --help.`);
    const value = eq === -1 ? argv[++i] : a.slice(eq + 1);
    if (value === undefined || value === '') throw new CliError(EXIT.USAGE, `Option --${name} needs a value.`);
    flags[name] = value;
  }
  return { flags, command: rest[0], args: rest.slice(1) };
}

const HELP = `motion-prompt ${VERSION} — Motion Prompt catalog for coding agents
${SITE}

Usage: node motion-prompt.mjs <command> [options]

  pick                  open the gallery so the user can pick; prints what they picked   [--pack <pack>]
                        [--timeout <seconds, default ${PICK_TIMEOUT}>] [--no-open] [--local]
  search <words...>     best matches (English, Japanese or Chinese words)   [--pack <pack>] [--limit N]
  list                  packs, categories and counts
  list --pack <pack>    every element in one pack
  get <id> [<id>...]    code + spec for up to ${MAX_GET} elements (accepts 12, 012, #012 or a demo URL)
  prompt <id> [...]     the copy-paste prompt for an element
  kit <pack>            shared constants and helpers the pack's elements need
  info                  data source, counts, version, cache folder

Options:
  --lang ja|en|zh-Hans          language of names and text (default en; kana search switches to ja, Han-only search to zh-Hans; zh-CN is an alias)
  --out <dir>           write files into <dir> instead of printing (get, prompt, kit)
  --refresh             ignore the disk cache
  --no-open             pick: print the gallery URL instead of opening a browser
  --local               pick: serve the gallery from this clone of the repository instead of the public site
Environment:
  MOTION_PROMPT_BASE    comma-separated data sources (folder path or URL) used instead of the defaults
  MOTION_PROMPT_CACHE   cache folder (default ~/.cache/motion-prompt, then the temp folder)
  MOTION_PROMPT_TTL     seconds before the cached catalog is fetched again (default 21600)
Exit codes: 0 ok · 1 not found · 2 usage · 3 no data source reachable · 4 pick timed out`;

const HELP_ZH = `motion-prompt ${VERSION} — 与 AI 沟通创意的术语库
${SITE}

用法：node motion-prompt.mjs <命令> [选项]

  pick                  打开素材库并等待用户选择，再返回所选内容
  search <关键词...>    搜索英文、日文或中文术语
  list                  列出分类；--pack <分类> 列出该分类的示例
  get <编号...>         获取规格与代码，每次最多 ${MAX_GET} 项
  prompt <编号...>      获取可复制的提示词
  kit <分类>            获取该分类所需的共享辅助代码
  info                  查看数据来源、数量、版本和缓存位置

选项：
  --lang zh-Hans        使用简体中文（也接受 zh-CN），另支持 ja、en
  --pack <分类>        按 motion、camera、ui、lp、photo 筛选
  --limit N            搜索返回数量
  --out <目录>         将 get、prompt、kit 的结果写入目录
  --refresh            忽略磁盘缓存
  --local              pick 从本地完整仓库提供素材库
  --no-open            pick 仅打印链接，不自动打开浏览器
  --timeout <秒>       pick 等待时间，默认 ${PICK_TIMEOUT} 秒

默认输出英文；含假名的搜索词自动使用日语，仅含汉字的搜索词使用简体中文。
日文纯汉字查询可显式指定 --lang ja。
环境变量：MOTION_PROMPT_BASE 数据目录或网址，MOTION_PROMPT_CACHE 缓存目录，MOTION_PROMPT_TTL 缓存秒数。
退出码：0 成功，1 未找到，2 用法错误，3 无可用数据源，4 选择超时。`;

// ---------- data sources ----------

const isUrl = (s) => /^https?:\/\//i.test(s);

function localRepoBase() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..', 'api', 'v1');
  return fs.existsSync(path.join(dir, 'catalog.json')) ? dir : null;
}

function resolveSources() {
  const env = (ENV.MOTION_PROMPT_BASE || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (env.length) return { origin: 'MOTION_PROMPT_BASE', bases: env.map((s) => (isUrl(s) ? s.replace(/\/+$/, '') : path.resolve(s))) };
  const local = localRepoBase();
  if (local) return { origin: 'local clone', bases: [local] };
  return { origin: 'default', bases: REMOTES };
}

function cacheRoots() {
  const roots = [];
  if (ENV.MOTION_PROMPT_CACHE) roots.push(path.resolve(ENV.MOTION_PROMPT_CACHE));
  else {
    try { roots.push(path.join(os.homedir(), '.cache', 'motion-prompt')); } catch { /* no home folder */ }
    roots.push(path.join(os.tmpdir(), 'motion-prompt-cache'));
  }
  return roots;
}

class Store {
  constructor({ refresh }) {
    const { origin, bases } = resolveSources();
    this.origin = origin;
    this.bases = bases;
    this.refresh = !!refresh;
    this.remote = bases.some(isUrl);
    this.key = crypto.createHash('sha1').update(bases.join('|')).digest('hex').slice(0, 10);
    this.ttl = Math.max(0, Number(ENV.MOTION_PROMPT_TTL ?? 21600)) * 1000;
    this.cacheRoot = null;
    this.usedBase = null;
    this.fromCache = false;
    this.failures = [];
    this.catalog = null;
  }

  cacheDir() { return this.cacheRoot || path.join(cacheRoots()[0], this.key); }

  cacheRead(rel) {
    if (!this.remote) return null;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        const stat = fs.statSync(file);
        this.cacheRoot = path.join(root, this.key);
        return { text: fs.readFileSync(file, 'utf8'), age: Date.now() - stat.mtimeMs };
      } catch { /* try the next cache folder */ }
    }
    return null;
  }

  cacheWrite(rel, text) {
    if (!this.remote) return;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
        this.cacheRoot = path.join(root, this.key);
        return;
      } catch { /* read-only place: try the next one, or run without a cache */ }
    }
  }

  // Returns { text } on success, { missing: true } when every source answered "no such file",
  // or { down: true } when no source could be reached at all.
  async readSources(rel) {
    let missing = 0;
    for (const base of this.bases) {
      try {
        if (isUrl(base)) {
          const res = await fetch(`${base}/${rel}`, {
            headers: { 'User-Agent': `motion-prompt-skill/${VERSION}` },
            signal: AbortSignal.timeout(12000),
          });
          if (res.status === 404) { missing++; this.failures.push(`${base}/${rel} → HTTP 404`); continue; }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.usedBase = this.usedBase || base;
          return { text: await res.text(), base };
        }
        const file = path.join(base, rel);
        if (!fs.existsSync(file)) { missing++; continue; }
        this.usedBase = this.usedBase || base;
        return { text: fs.readFileSync(file, 'utf8'), base };
      } catch (err) {
        const cause = err && err.cause && (err.cause.code || err.cause.message);
        this.failures.push(`${base}/${rel} → ${cause || err.name || 'error'}${err.message ? ` (${err.message})` : ''}`);
      }
    }
    return missing === this.bases.length ? { missing: true } : { down: true };
  }

  async loadCatalog() {
    if (this.catalog) return this.catalog;
    const cached = this.refresh ? null : this.cacheRead('catalog.json');
    let text = null;
    if (cached && cached.age < this.ttl) { text = cached.text; this.fromCache = true; }
    if (text === null) {
      const got = await this.readSources('catalog.json');
      if (got.text !== undefined) { text = got.text; this.cacheWrite('catalog.json', text); }
      else {
        const stale = cached || this.cacheRead('catalog.json');
        if (stale) {
          text = stale.text; this.fromCache = true;
          process.stderr.write('motion-prompt: data source unreachable, using the cached catalog.\n');
        } else throw this.unreachable('catalog.json', false); // no catalog anywhere = no usable source
      }
    }
    let data;
    try { data = JSON.parse(text); } catch { throw new CliError(EXIT.NETWORK, `catalog.json from ${this.usedBase || 'cache'} is not valid JSON.`); }
    if (!data || !Array.isArray(data.elements)) throw new CliError(EXIT.NETWORK, 'catalog.json has no "elements" list.');
    this.catalog = data;
    return data;
  }

  async file(rel) {
    const cat = await this.loadCatalog();
    const versioned = path.join('v', String(cat.version ?? '0').replace(/[^\w.-]/g, '_'), rel);
    if (!this.refresh) {
      const hit = this.cacheRead(versioned);
      if (hit) return hit.text;
    }
    const got = await this.readSources(rel);
    if (got.text !== undefined) { this.cacheWrite(versioned, got.text); return got.text; }
    const stale = this.cacheRead(versioned);
    if (stale) return stale.text;
    throw this.unreachable(rel, got.missing);
  }

  unreachable(rel, missing) {
    if (missing) return new CliError(EXIT.NOT_FOUND, `Not found in the Motion Prompt data: ${rel}\nSources checked:\n${this.bases.map((b) => `  ${b}`).join('\n')}`);
    const lines = [
      `motion-prompt: could not reach the Motion Prompt data (${rel}) and nothing is cached.`,
      'Tried:',
      ...this.failures.map((f) => `  ${f}`),
      this.failures.length && this.failures.every((f) => f.endsWith('HTTP 404'))
        ? 'The sources answered, but none of them has this file. The data may not be published at these addresses yet.\nSet MOTION_PROMPT_BASE to a local copy of api/v1 if you have one.'
        : this.remote
        ? 'This command needs HTTPS access to showheyohtaki.github.io or raw.githubusercontent.com.\nAllow network access for this command and run it again, or set MOTION_PROMPT_BASE to a local copy of api/v1.'
        : 'Check that MOTION_PROMPT_BASE points at a folder that contains catalog.json.',
    ];
    return new CliError(EXIT.NETWORK, lines.join('\n'));
  }
}

// ---------- catalog helpers ----------

const HAS_JA = /[぀-ヿｦ-ﾟ]/;
const HAS_HAN = /[㐀-鿿]/;
const normalizeLang = v => /^zh(?:-hans(?:-[a-z]+)?|-cn|-sg)?$/i.test(v || '') ? 'zh-Hans' : /^(ja|en)$/i.test(v || '') ? v.toLowerCase() : null;
const tx = (v, lang) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : String(v[lang] ?? v.en ?? v.ja ?? ''));
const both = (v) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : Object.values(v).map(x => tx(x, 'en')).join(' '));
const packKey = (p) => String(p.pack ?? p.id ?? p.slug ?? p.name ?? '');
const pad = (n) => String(n).padStart(3, '0');
const demoUrl = (id) => `${SITE}#${id}`;

function packsOf(cat) {
  const listed = Array.isArray(cat.packs) ? cat.packs.map((p) => (typeof p === 'string' ? { pack: p } : p)) : [];
  const seen = new Set(listed.map(packKey));
  for (const e of cat.elements) if (!seen.has(e.pack)) { seen.add(e.pack); listed.push({ pack: e.pack }); }
  return listed;
}

function categoryLabel(cat, e, lang) {
  const p = packsOf(cat).find((x) => packKey(x) === e.pack);
  const c = p && Array.isArray(p.categories) ? p.categories.find((x) => x.slug === e.category) : null;
  if (!c) return { label: e.category || '', haystack: e.category || '' };
  return { label: tx(c, lang) || c.slug, haystack: `${c.slug} ${both(c)}` };
}

function requirePack(cat, name) {
  const wanted = String(name).toLowerCase();
  const found = packsOf(cat).find((p) => packKey(p).toLowerCase() === wanted);
  if (!found) throw new CliError(EXIT.NOT_FOUND, `No pack named "${name}". Packs: ${packsOf(cat).map(packKey).join(', ')}`);
  return packKey(found);
}

function parseId(token) {
  const m = /(?:^|#|\/)(\d{1,4})\/?$/.exec(String(token).trim());
  return m ? pad(Number(m[1])) : null;
}

function resolveIds(cat, tokens, max) {
  if (!tokens.length) throw new CliError(EXIT.USAGE, 'Give at least one element id, e.g. 12, #045 or a demo URL.');
  const ids = [];
  const bad = [];
  for (const t of tokens) {
    const id = parseId(t);
    if (!id || !cat.elements.some((e) => e.id === id)) bad.push(t);
    else if (!ids.includes(id)) ids.push(id);
  }
  if (bad.length) {
    const all = cat.elements.map((e) => e.id);
    throw new CliError(EXIT.NOT_FOUND, `No such element: ${bad.join(', ')}. The catalog has ${all.length} elements (#${all[0]}–#${all[all.length - 1]}). Use "search" or "list" to find ids; do not guess them.`);
  }
  if (ids.length > max) throw new CliError(EXIT.USAGE, `Too many ids (${ids.length}). Fetch at most ${max} per call, and only the ones you will use.`);
  return ids;
}

function line(cat, e, lang) {
  return `#${e.id}  ${tx(e.name, lang)}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]  ${tx(e.summary, lang)}`;
}

// ---------- search ----------

function score(cat, e, tokens) {
  const name = both(e.name).toLowerCase();
  const names = Object.values(e.name || {}).map((s) => s.toLowerCase());
  const tags = (e.tags || []).map((t) => String(t).toLowerCase());
  const slug = String(e.slug || '').toLowerCase();
  const catHay = `${categoryLabel(cat, e, 'en').haystack} ${e.pack} ${both((packsOf(cat).find((p) => packKey(p) === e.pack) || {}).title)}`.toLowerCase();
  const summary = both(e.summary).toLowerCase();
  const deep = `${both(e.use)} ${both(e.spec)}`.toLowerCase();
  let total = 0;
  let matched = 0;
  for (const raw of tokens) {
    const forms = [raw];
    if (/^[a-z]{4,}s$/.test(raw)) forms.push(raw.slice(0, -1));
    let best = 0;
    for (const t of forms) {
      let s = 0;
      if (parseId(t) === e.id && /^#?\d+$/.test(t)) s += 20;
      if (names.includes(t)) s += 12; else if (name.includes(t)) s += 8;
      if (slug === t || slug.split('-').includes(t)) s += 6; else if (slug.includes(t)) s += 3;
      if (tags.includes(t)) s += 6; else if (tags.some((g) => g.includes(t))) s += 3;
      if (catHay.includes(t)) s += 3;
      if (summary.includes(t)) s += 2;
      if (deep.includes(t)) s += 1;
      best = Math.max(best, s);
    }
    if (best > 0) matched++;
    total += best;
  }
  return { matched, total };
}

// ---------- output ----------

function emit(files, outDir) {
  if (!outDir) { process.stdout.write(files.map((f) => f.text.replace(/\s*$/, '\n')).join('\n')); return; }
  const dir = path.resolve(outDir);
  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f.name), f.text);
  } catch (err) { throw new CliError(EXIT.USAGE, `Cannot write to ${dir}: ${err.message}`); }
  for (const f of files) console.log(path.join(dir, f.name));
}

// ---------- commands ----------

async function cmdSearch(store, args, flags, lang) {
  if (!args.length) throw new CliError(EXIT.USAGE, 'search needs at least one word, e.g. "search typewriter" or "search 文字 登場".');
  const cat = await store.loadCatalog();
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;
  const limit = Math.max(1, Math.min(50, Number(flags.limit) || 8));
  const tokens = args.join(' ').toLowerCase().split(/[\s,、　]+/).filter(Boolean);
  const hits = cat.elements
    .filter((e) => !pack || e.pack === pack)
    .map((e) => ({ e, ...score(cat, e, tokens) }))
    .filter((h) => h.matched > 0)
    .sort((a, b) => b.matched - a.matched || b.total - a.total || a.e.id.localeCompare(b.e.id));
  if (!hits.length) {
    console.log(lang === 'zh-Hans'
      ? `未找到“${args.join(' ')}”${pack ? `（分类 ${pack}）` : ''}。请换个关键词，或使用 list --pack <pack> --lang zh-Hans 浏览。`
      : `No match for "${args.join(' ')}"${pack ? ` in pack ${pack}` : ''}. Try other words (English tags match best), or browse with "list --pack <pack>".`);
    return;
  }
  for (const h of hits.slice(0, limit)) console.log(line(cat, h.e, lang));
  if (hits.length > limit) console.log(lang === 'zh-Hans' ? `… 另有 ${hits.length - limit} 项。使用 --pack 筛选或提高 --limit。` : `… ${hits.length - limit} more. Narrow with --pack or raise --limit.`);
  console.log(lang === 'zh-Hans' ? `\n下一步：get <id> --lang zh-Hans 获取代码与规格。示例：${SITE}#<id>` : `\nNext: get <id> for the code and spec. Demo: ${SITE}#<id>`);
}

async function cmdList(store, flags, lang) {
  const cat = await store.loadCatalog();
  if (flags.pack) {
    const pack = requirePack(cat, flags.pack);
    const items = cat.elements.filter((e) => e.pack === pack);
    let current = null;
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      if (label !== current) { console.log(`${current === null ? '' : '\n'}## ${label}`); current = label; }
      console.log(`#${e.id}  ${tx(e.name, lang)}  ${tx(e.summary, lang)}`);
    }
    return;
  }
  for (const p of packsOf(cat)) {
    const key = packKey(p);
    const items = cat.elements.filter((e) => e.pack === key);
    if (!items.length) continue;
    console.log(`${key}  (${items.length})  #${items[0].id}–#${items[items.length - 1].id}  ${tx(p.title, lang)}`);
    const counts = new Map();
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    for (const [label, n] of counts) console.log(`  - ${label} (${n})`);
  }
  console.log(lang === 'zh-Hans' ? `\n共 ${cat.elements.length} 个示例。查看单个分类：list --pack <pack> --lang zh-Hans` : `\n${cat.elements.length} elements. Browse one pack with: list --pack <pack>`);
}

async function cmdGet(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) {
    const e = cat.elements.find((x) => x.id === id);
    files.push({ name: `${id}-${e.slug || 'element'}.txt`, text: await store.file(`${lang}/e/${id}.txt`) });
  }
  emit(files, flags.out);
  const kits = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  const note = lang === 'zh-Hans' ? `所需辅助代码：${kits.join(', ')}，使用前对每类运行一次 "kit <pack> --lang zh-Hans"。` : `Needs kit: ${kits.join(', ')} — run "kit <pack>" once per pack before using this code.`;
  if (flags.out) console.log(note); else process.stdout.write(`\n// ${note}\n`);
}

async function cmdPrompt(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) files.push({ name: `${id}-prompt.txt`, text: await store.file(`${lang}/p/${id}.txt`) });
  emit(files, flags.out);
}

async function cmdKit(store, args, flags, lang) {
  if (args.length !== 1) throw new CliError(EXIT.USAGE, 'kit needs exactly one pack name, e.g. "kit motion".');
  const cat = await store.loadCatalog();
  const pack = requirePack(cat, args[0]);
  emit([{ name: `kit-${pack}.js`, text: await store.file(`${lang === 'zh-Hans' ? 'zh-Hans/' : ''}kit/${pack}.js`) }], flags.out);
}

async function cmdInfo(store, lang) {
  const zh = lang === 'zh-Hans';
  console.log(`motion-prompt skill ${VERSION}`);
  console.log(`Gallery:        ${SITE}`);
  console.log(`${zh ? '数据来源' : 'Sources'} (${store.origin}):`);
  for (const b of store.bases) console.log(`  ${b}`);
  let cat = null;
  let error = null;
  try { cat = await store.loadCatalog(); } catch (err) { error = err; }
  console.log(`${zh ? '缓存目录' : 'Cache folder'}:   ${store.remote ? store.cacheDir() : zh ? '（本地文件不使用缓存）' : '(not used for local files)'}`);
  if (!cat) { console.log('Catalog:        unavailable'); throw error; }
  console.log(`${zh ? '当前使用' : 'In use'}:         ${store.fromCache ? zh ? '磁盘缓存' : `disk cache${store.usedBase ? '' : ' (no request made)'}` : store.usedBase}`);
  console.log(zh ? `目录：版本 ${cat.version ?? '?'} · ${cat.elements.length} 个示例` : `Catalog:        version ${cat.version ?? '?'} · ${cat.elements.length} elements`);
  for (const p of packsOf(cat)) {
    const n = cat.elements.filter((e) => e.pack === packKey(p)).length;
    if (n) console.log(`  ${packKey(p)}: ${n}`);
  }
  console.log(`Node:           ${process.version}`);
}

// ---------- pick: the user chooses in the gallery, the choice comes back here ----------
// A small HTTP server on 127.0.0.1 waits for one GET /?t=<token>&ids=012,045&note=…&lang=ja. The gallery sends it
// as a top-level navigation ("Send to AI"), because an https page may not fetch() from 127.0.0.1.

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.tsv': 'text/tab-separated-values; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

function repoRoot() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..');
  return fs.existsSync(path.join(dir, 'index.html')) && fs.existsSync(path.join(dir, 'assets', 'site.js')) ? dir : null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(lang, title, body) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><link rel="icon" href="data:,"><title>${esc(title)} | Motion Prompt</title>
<style>body{margin:0;font:16px/1.7 system-ui,"Hiragino Sans","Yu Gothic",sans-serif;background:Canvas;color:CanvasText}
main{max-width:34em;margin:12vh auto;padding:0 16px}h1{font-size:24px;line-height:1.4;margin:0 0 8px}p{margin:0 0 12px}
ol{padding-left:1.4em;margin:16px 0}li{margin:2px 0}code{font-family:ui-monospace,Menlo,monospace;opacity:.7;margin-right:.5em}</style>
</head><body><main><h1>${esc(title)}</h1>${body}</main></body></html>`;
}

function send(res, status, html, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(html);
}

function serveStatic(root, pathname, req, res) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return send(res, 400, 'Bad request'); }
  if (rel.includes('\0') || /(^|\/)\./.test(rel)) return send(res, 404, 'Not found');
  let file = path.join(root, rel);
  if (file !== root && !file.startsWith(root + path.sep)) return send(res, 404, 'Not found');
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { /* answered below */ }
  // Resolve symbolic links and check again, so a link inside the clone cannot expose files outside it.
  try {
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(file);
    if (realFile !== realRoot && !realFile.startsWith(realRoot + path.sep)) return send(res, 404, 'Not found');
    file = realFile;
  } catch { return send(res, 404, 'Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}

function openBrowser(url) {
  let cmd;
  let args;
  const opts = { detached: true, stdio: 'ignore' };
  if (process.platform === 'darwin') { cmd = 'open'; args = [url]; }
  else if (process.platform === 'win32') { cmd = 'cmd'; args = ['/c', 'start', '""', `"${url}"`]; opts.windowsVerbatimArguments = true; }
  else { cmd = 'xdg-open'; args = [url]; }
  return new Promise((resolve) => {
    let child;
    try { child = spawn(cmd, args, opts); } catch { resolve(false); return; }
    child.once('error', () => resolve(false));
    child.once('spawn', () => { child.unref(); resolve(true); });
  });
}

const PICK_TEXT = {
  'zh-Hans': {
    done: '已发送给 AI', close: '可以关闭此页。请返回 AI，告诉它如何使用这些示例。',
    ignored: '以下编号不在目录中，未发送：', bad: '无法读取选择',
    badBody: '请返回素材库，再次点击“发送给 AI”。AI 仍在等待。',
    none: '所选编号均不在目录中', other: '此接收地址属于另一个请求',
    otherBody: '请使用 AI 打开的素材库中的“发送给 AI”。'
  },
  ja: {
    done: 'AIに渡しました', close: 'この画面は閉じて大丈夫です。AIの画面に戻って、どう使うかを伝えてください。',
    ignored: 'カタログに無い番号は渡していません: ', bad: '選択を読み取れませんでした',
    badBody: 'ギャラリーに戻って、もう一度「AIに渡す」を押してください。AIはまだ待っています。',
    none: '選んだ番号がカタログにありませんでした', other: 'この受け口は別の依頼の物です',
    otherBody: 'AIが開いたギャラリーの「AIに渡す」から送ってください。',
  },
  en: {
    done: 'Sent to your AI', close: 'You can close this page. Go back to your AI and tell it how to use the picks.',
    ignored: 'Not in the catalog, so not sent: ', bad: 'The selection could not be read',
    badBody: 'Go back to the gallery and press "Send to AI" again. Your AI is still waiting.',
    none: 'None of the picked numbers is in the catalog', other: 'This address belongs to another request',
    otherBody: 'Send your picks with "Send to AI" in the gallery that your AI opened.',
  },
};

function waitForPick(server, { port, token, root, cat, flags, timeoutSec }) {
  const origin = `http://127.0.0.1:${port}`;
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      server.close();
      if (server.closeAllConnections) server.closeAllConnections();
      fn();
    };
    const timer = setTimeout(() => finish(() => reject(new CliError(EXIT.TIMEOUT,
      `motion-prompt: no selection arrived within ${timeoutSec} s, so nothing was picked.\nAsk the user whether they still want to pick, then run pick again.`))), timeoutSec * 1000);

    server.on('request', (req, res) => {
      const host = String(req.headers.host || '').toLowerCase();
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 403, 'Forbidden'); // DNS rebinding
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
      let url;
      try { url = new URL(req.url, origin); } catch { return send(res, 400, 'Bad request'); }
      const q = url.searchParams;
      if (url.pathname === '/' && q.has('t')) {
        const lang = flags.lang || normalizeLang(q.get('lang')) || 'en';
        const T = PICK_TEXT[lang];
        const given = Buffer.from(String(q.get('t')));
        const want = Buffer.from(token);
        if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
          return send(res, 403, page(lang, T.other, `<p>${esc(T.otherBody)}</p>`));
        }
        if (req.method !== 'GET') return send(res, 405, 'Method not allowed', { Allow: 'GET' });
        const raw = String(q.get('ids') || '');
        if (!/^\d{3}(,\d{3})*$/.test(raw)) {
          process.stderr.write(`motion-prompt: refused a selection with malformed ids (${JSON.stringify(raw.slice(0, 80))}); still waiting.\n`);
          return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        }
        const ids = [...new Set(raw.split(','))];
        if (ids.length > PICK_MAX) return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        const known = ids.filter((id) => cat.elements.some((e) => e.id === id));
        const unknown = ids.filter((id) => !known.includes(id));
        if (!known.length) {
          process.stderr.write(`motion-prompt: refused a selection with no known ids (${unknown.join(', ')}); still waiting.\n`);
          return send(res, 400, page(lang, T.none, `<p>${esc(T.badBody)}</p>`));
        }
        const note = String(q.get('note') || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);
        const items = known.map((id) => {
          const e = cat.elements.find((x) => x.id === id);
          return `<li><code>#${id}</code>${esc(tx(e.name, lang))}</li>`;
        }).join('');
        const html = page(lang, T.done, `<p>${esc(T.close)}</p><ol>${items}</ol>${unknown.length ? `<p>${esc(T.ignored + unknown.map((u) => `#${u}`).join(', '))}</p>` : ''}`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'close' });
        res.end(html, () => finish(() => resolve({ ids: known, unknown, note, lang })));
        return;
      }
      if (root) return serveStatic(root, url.pathname, req, res);
      return send(res, 404, 'Not found');
    });
  });
}

function printPick(cat, { ids, unknown, note, lang }) {
  const zh = lang === 'zh-Hans', other = lang === 'ja' || zh ? 'en' : 'ja';
  const out = [zh ? `用户在 Motion Prompt 中按顺序选择了 ${ids.length} 个示例。` : `The user picked ${ids.length} element${ids.length === 1 ? '' : 's'} in the Motion Prompt gallery, in this order.`];
  out.push(zh ? `用户备注：${note || '（无）'}` : note ? `Note from the user: ${note}` : 'Note from the user: (none)', '');
  ids.forEach((id, i) => {
    const e = cat.elements.find(x => x.id === id), name = tx(e.name, lang), alt = tx(e.name, other);
    out.push(`${i + 1}. #${e.id}  ${name}${alt && alt !== name ? ` / ${alt}` : ''}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]`);
    if (e.meaning) out.push(`   ${zh ? '含义' : 'Meaning'}: ${tx(e.meaning, lang)}`);
    if (e.ask) out.push(`   ${zh ? '请求示例' : 'How to ask'}: ${tx(e.ask, lang)}`);
    const spec = e.spec ? (Array.isArray(e.spec) ? e.spec : e.spec[lang] || e.spec.en || []) : [];
    if (spec.length) { out.push(zh ? '   规格：' : '   Spec:'); for (const line of spec) out.push(`   - ${line}`); }
    out.push(`   ${zh ? '动态示例' : 'Demo'}: ${demoUrl(e.id)}`, '');
  });
  if (unknown.length) out.push(`${zh ? '忽略目录中不存在的编号' : 'Ignored (not in the catalog)'}: ${unknown.map(u => `#${u}`).join(', ')}`, '');
  const packs = [...new Set(ids.map(id => cat.elements.find(x => x.id === id).pack))];
  out.push(zh
    ? `下一步：严格使用这些示例，不增不减。运行 "get ${ids.join(' ')} --lang ${lang}" 获取代码，每次最多 ${MAX_GET} 项；对以下分类各运行一次 "kit <pack> --lang ${lang}"：${packs.join(', ')}。`
    : `Next: use exactly these elements, no more and no fewer. Run "get ${ids.join(' ')}" for the code (at most ${MAX_GET} ids per call) and "kit <pack>" once for each of: ${packs.join(', ')}.`);
  process.stdout.write(`${out.join('\n')}\n`);
}

async function cmdPick(store, args, flags) {
  if (args.length) throw new CliError(EXIT.USAGE, 'pick takes no ids or words. Options: --pack <pack> --lang ja|en|zh-Hans --timeout <seconds> --no-open --local');
  const timeoutSec = flags.timeout === undefined ? PICK_TIMEOUT : Number(flags.timeout);
  if (!Number.isFinite(timeoutSec) || timeoutSec < 1 || timeoutSec > 86400) throw new CliError(EXIT.USAGE, '--timeout must be a number of seconds between 1 and 86400.');
  const root = flags.local ? repoRoot() : null;
  if (flags.local && !root) throw new CliError(EXIT.USAGE, '--local needs a full clone of the repository (index.html and assets/ three folders above this script). Run pick without --local to use the public gallery.');
  const cat = await store.loadCatalog(); // fail before opening anything if there is no data
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;

  const token = crypto.randomBytes(16).toString('hex');
  const server = http.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const q = new URLSearchParams({ cb: `${origin}/?t=${token}` });
  if (pack) q.set('pack', pack);
  if (flags.lang) q.set('lang', flags.lang);
  const galleryUrl = `${root ? `${origin}/` : SITE}?${q}`;
  const waiting = waitForPick(server, { port, token, root, cat, flags, timeoutSec });

  console.log(`Gallery: ${galleryUrl}`);
  if (flags['no-open']) console.log('Not opened (--no-open). Open this URL in a browser, or give it to the user to open.');
  else if (await openBrowser(galleryUrl)) console.log('Opened in the default browser. If no browser window appeared, open the URL above yourself.');
  else console.log('Could not open a browser from here. Open the URL above in a browser, or give it to the user to open.');
  console.log(flags.lang === 'zh-Hans' ? `等待用户选择并点击“发送给 AI”，最长 ${timeoutSec} s…\n` : `Waiting for the user to pick and press "Send to AI" (up to ${timeoutSec} s)…\n`);

  printPick(cat, await waiting);
}

// ---------- main ----------

async function main() {
  const { flags, command, args } = parseArgs(process.argv.slice(2));
  if (flags.version) { console.log(VERSION); return; }

  if (flags.lang) {
    const normalized = normalizeLang(flags.lang);
    if (!normalized) throw new CliError(EXIT.USAGE, '--lang must be ja, en or zh-Hans (zh-CN is also accepted).');
    flags.lang = normalized;
  }
  if (flags.help || !command || command === 'help') { console.log(flags.lang === 'zh-Hans' ? HELP_ZH : HELP); return; }
  const lang = flags.lang || (command === 'search' ? HAS_JA.test(args.join(' ')) ? 'ja' : HAS_HAN.test(args.join(' ')) ? 'zh-Hans' : 'en' : 'en');
  const store = new Store({ refresh: flags.refresh });
  switch (command) {
    case 'search': return cmdSearch(store, args, flags, lang);
    case 'list': return cmdList(store, flags, lang);
    case 'get': return cmdGet(store, args, flags, lang);
    case 'prompt': return cmdPrompt(store, args, flags, lang);
    case 'kit': return cmdKit(store, args, flags, lang);
    case 'info': return cmdInfo(store, lang);
    case 'pick': return cmdPick(store, args, flags);
    default: throw new CliError(EXIT.USAGE, `Unknown command "${command}". Run with --help.`);
  }
}

main().catch((err) => {
  if (err instanceof CliError) { process.stderr.write(`${err.message}\n`); process.exitCode = err.code; return; }
  process.stderr.write(`motion-prompt: unexpected error: ${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
