#!/usr/bin/env node
// Motion Prompt build: packs/*/{meta.json,pack.js}  ->  api/v1/**  +  assets/catalog.js  +  packs/**/README*.md
// Node 18+, no dependencies. Doubles as the validator: any problem is listed and the exit code is 1.
//
//   node tools/build.mjs                 build the repo
//   node tools/build.mjs --check         validate only, write nothing
//   node tools/build.mjs --root <dir>    use <dir>/packs and write into <dir> (used for scratch builds)
//   node tools/build.mjs --partial       allow missing packs in the order sequence (IDs then differ; dev only)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SITE = 'https://showheyohtaki.github.io/motion-prompt/';
const REPO = 'https://github.com/showheyohtaki/motion-prompt';
const LICENCE = 'MIT License (c) 2026 Shohei Ohtaki';
const VERSION = 1;
const LANGS = ['ja', 'en', 'zh-Hans'];   // languages of the gallery, the API folders and the copyable prompt
const BASE_LANG = 'en';       // every text field needs this one; any other language code is optional

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--root') || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const CHECK_ONLY = flag('--check');
const PARTIAL = flag('--partial');

const errors = [];
const warns = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);
const pad3 = n => String(n).padStart(3, '0');
const isStr = v => typeof v === 'string' && v.trim() !== '';

// ---------------------------------------------------------------- prompt template
// This function is also written into assets/catalog.js (as source text), so the site's
// "copy prompt" button and api/v1/<lang>/p/<id>.txt can never drift apart. Keep it self-contained.
function mpPrompt(el, packTitle, lang) {
  var base = 'https://showheyohtaki.github.io/motion-prompt/';
  var en = lang === 'en';
  var spec = el.spec[lang].map(function (s) { return '- ' + s; }).join('\n');
  var ref = base + 'api/v1/' + lang + '/e/' + el.id + '.txt';
  var kit = base + 'api/v1/' + (lang === 'zh-Hans' ? 'zh-Hans/' : '') + 'kit/' + el.pack + '.js';
  var same = el.name.en === el.name.ja;
  var mean = el.meaning && (el.meaning[lang] || el.meaning.en);
  if (lang === 'zh-Hans') {
    return [
      '请使用“' + el.name[lang] + (el.name[lang] === el.name.en ? '' : '（' + el.name.en + '）') + '”，它属于“' + packTitle + '”。',
      'Motion Prompt #' + el.id, ''
    ].concat(mean ? ['含义：' + mean] : [], [
      '示例效果：' + el.summary[lang], '规格：', spec, '适用场景：' + el.use[lang], '',
      '参考实现（Canvas 2D，画面仅由时间决定）：' + ref, '共享辅助代码：' + kit,
      '保留参考实现的形状、时间和缓动数值，仅根据当前项目替换文字、颜色与素材。'
    ]).join('\n');
  }
  if (en) {
    return [
      'Please use "' + el.name.en + '"' + (same ? '' : ' (' + el.name.ja + ')') + ', one of the names in "' + packTitle + '".',
      'Motion Prompt #' + el.id,
      ''
    ].concat(mean ? ['What it is: ' + mean] : [], [
      'What the sample shows: ' + el.summary.en,
      'Spec:',
      spec,
      'When to use it: ' + el.use.en,
      '',
      'Reference implementation (Canvas 2D, a function whose picture depends only on the time): ' + ref,
      'Shared helper code: ' + kit,
      'Keep the shapes, timing and easing values of the reference implementation as they are, and change only the text, colours and assets to fit what I am making.'
    ]).join('\n');
  }
  return [
    '「' + el.name.ja + (same ? '' : '（' + el.name.en + '）') + '」を使ってください。「' + packTitle + '」の名前の1つです。',
    'Motion Prompt #' + el.id,
    ''
  ].concat(mean ? ['どういうものか: ' + mean] : [], [
    '見本で起きること: ' + el.summary.ja,
    '仕様:',
    spec,
    '使いどころ: ' + el.use.ja,
    '',
    '参考実装（Canvas 2D・時刻だけで絵が決まる関数）: ' + ref,
    '共通の補助コード: ' + kit,
    '参考実装の形・タイミング・イージングの数値はそのまま使い、中の文字・色・素材だけ、いま作っている物に合わせてください。'
  ]).join('\n');
}

// ---------------------------------------------------------------- pack.js: cut on markers
const MARK = /^ {2}\/\/ @(kit|shared|end|element (\d{2}))$/;
const LOOSE = /^\s*\/\/\s*@(kit|shared|end|element)\b/;

function dedent(lines) {
  const out = lines.map(l => (l.startsWith('  ') ? l.slice(2) : l.trimStart() === '' ? '' : l));
  while (out.length && out[out.length - 1].trim() === '') out.pop();
  while (out.length && out[0].trim() === '') out.shift();
  return out.join('\n');
}

function cutPack(src, where) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let cur = null;
  let ended = false;
  lines.forEach((line, i) => {
    const m = MARK.exec(line);
    if (!m) {
      if (LOOSE.test(line)) err(where, `line ${i + 1}: marker is not exactly "  // @kit | @element NN | @shared | @end" -> ${JSON.stringify(line)}`);
      if (cur) cur.lines.push(line);
      return;
    }
    if (ended) err(where, `line ${i + 1}: marker after @end`);
    cur = null;
    if (m[1] === 'end') { ended = true; return; }
    cur = { type: m[2] ? 'element' : m[1], no: m[2] || null, line: i + 1, lines: [line] };
    blocks.push(cur);
  });
  if (!ended) err(where, 'no "  // @end" marker');
  const kits = blocks.filter(b => b.type === 'kit');
  if (kits.length !== 1) err(where, `expected exactly one @kit block, found ${kits.length}`);
  else if (blocks[0].type !== 'kit') err(where, '@kit must be the first block');
  const elements = blocks.filter(b => b.type === 'element');
  elements.forEach((b, i) => {
    const want = String(i + 1).padStart(2, '0');
    if (b.no !== want) err(where, `line ${b.line}: found "@element ${b.no}" where "@element ${want}" was expected (numbers must run 01..N in order)`);
    if (!b.lines.slice(1).some(l => l.trim() !== '')) err(where, `@element ${b.no} is empty`);
  });
  const kitText = blocks.filter(b => b.type !== 'element').map(b => dedent(b.lines)).join('\n\n');
  return { elements: elements.map(b => ({ no: b.no, code: dedent(b.lines) })), kitText };
}

// ---------------------------------------------------------------- pack.js: read width/height/cycle/fonts
// pack.js is browser code. Run its factory against inert stand-ins for the DOM, only to read the
// returned { width, height, cycle, cells, fonts }. Nothing is drawn here (tools/check.mjs does that).
function inert() {
  const target = function () {};
  const p = new Proxy(target, {
    get(_, key) {
      if (key === Symbol.toPrimitive) return () => 0;
      if (key === 'then') return undefined;
      if (key === 'length') return 0;
      return p;
    },
    set() { return true; },
    apply() { return p; },
    construct() { return p; },
  });
  return p;
}

function evalPack(src, file, where) {
  let got = null;
  const any = inert();
  const sandbox = {
    MotionPrompt: { packs: {}, pack(id, factory) { const r = factory(); got = { id, r }; return r; }, loadFonts: async () => {} },
    document: { createElement: () => any, fonts: any, baseURI: SITE, documentElement: any, body: any },
    Image: any, Path2D: any, OffscreenCanvas: any, FontFace: any, DOMMatrix: any, ImageData: any,
    performance: { now: () => 0 }, devicePixelRatio: 1, location: { search: '', href: SITE, hash: '' },
    console: { log() {}, warn() {}, error() {}, info() {} },
    requestAnimationFrame: () => 0, setTimeout: () => 0, clearTimeout() {},
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  try {
    vm.runInNewContext(src, sandbox, { filename: file, timeout: 8000 });
  } catch (e) {
    err(where, `pack.js could not be evaluated outside a browser (${e && e.message}). Top-level kit code must not depend on real canvas results.`);
    return null;
  }
  if (!got) { err(where, 'pack.js never called MotionPrompt.pack(id, factory)'); return null; }
  return got;
}

// ---------------------------------------------------------------- meta.json validation
// A text field is an object keyed by language code: { en: "...", ja: "...", es: "..." }.
// `en` is required. Other languages are optional, but a key that is present must not be empty.
function bi(obj, where, key) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { err(where, `${key} is missing (needs at least { ${BASE_LANG}: "..." })`); return; }
  if (!isStr(obj[BASE_LANG])) err(where, `${key}.${BASE_LANG} is missing or empty`);
  for (const l of Object.keys(obj)) if (!isStr(obj[l])) err(where, `${key}.${l} is empty`);
}
const LANG_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
// Languages a pack is written in = the keys of its title. Read before fillLangs() adds fallbacks.
function packLangs(meta) {
  const t = meta && meta.title && typeof meta.title === 'object' ? meta.title : {};
  const ls = Object.keys(t).filter(l => isStr(t[l]));
  return [BASE_LANG, ...ls.filter(l => l !== BASE_LANG).sort()];
}
// The gallery and the API read every language in LANGS. Where a pack has no text in one of them,
// the English text stands in, so a pack written in (say) en + es still shows up everywhere.
function fillLangs(meta) {
  const fill = o => { if (o && typeof o === 'object' && !Array.isArray(o)) for (const l of LANGS) if (o[l] == null && o[BASE_LANG] != null) o[l] = o[BASE_LANG]; };
  fill(meta.title);
  for (const c of meta.categories || []) fill(c);
  for (const e of meta.elements || []) if (e && typeof e === 'object') for (const k of ['name', 'meaning', 'ask', 'summary', 'spec', 'use']) fill(e[k]);
}

function validateMeta(meta, where) {
  if (!isStr(meta.pack)) err(where, 'pack is missing');
  if (!Number.isInteger(meta.order) || meta.order < 1) err(where, 'order must be a positive integer');
  bi(meta.title, where, 'title');
  for (const l of packLangs(meta)) if (!LANG_CODE.test(l)) err(where, `title has a key "${l}" that is not a language code (use codes such as en, ja, es, zh-Hans)`);
  if (!Array.isArray(meta.categories) || !meta.categories.length) err(where, 'categories is missing or empty');
  const slugs = new Set();
  for (const c of meta.categories || []) {
    if (!isStr(c.slug)) err(where, 'a category has no slug');
    else if (slugs.has(c.slug)) err(where, `category slug "${c.slug}" is used twice`);
    slugs.add(c.slug);
    if (!isStr(c[BASE_LANG])) err(where, `category "${c.slug}": ${BASE_LANG} is missing or empty`);
  }
  if (!Array.isArray(meta.elements) || !meta.elements.length) { err(where, 'elements is missing or empty'); return; }
  const seen = new Set();
  meta.elements.forEach((e, i) => {
    const want = String(i + 1).padStart(2, '0');
    const w = `${where} element ${e && e.no ? e.no : `[${i}]`}`;
    if (!e || typeof e !== 'object') { err(w, 'not an object'); return; }
    if (e.no !== want) err(w, `no should be "${want}" (elements must be listed 01..N in order)`);
    if (!isStr(e.slug)) err(w, 'slug is missing');
    else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) err(w, `slug "${e.slug}" must be lowercase kebab-case`);
      if (seen.has(e.slug)) err(w, `slug "${e.slug}" is used twice in this pack`);
      seen.add(e.slug);
    }
    if (!isStr(e.category)) err(w, 'category is missing');
    else if (!slugs.has(e.category)) err(w, `category "${e.category}" is not in categories`);
    bi(e.name, w, 'name');
    bi(e.meaning, w, 'meaning');
    if (e.ask == null) warn(w, 'ask is missing (one example sentence that asks an AI for this by name)');
    else bi(e.ask, w, 'ask');
    bi(e.summary, w, 'summary');
    bi(e.use, w, 'use');
    if (!e.spec || typeof e.spec !== 'object' || Array.isArray(e.spec)) err(w, `spec is missing (needs at least { ${BASE_LANG}: [] })`);
    else {
      if (!Array.isArray(e.spec[BASE_LANG])) err(w, `spec.${BASE_LANG} is missing`);
      for (const l of Object.keys(e.spec)) {
        const s = e.spec[l];
        if (!Array.isArray(s) || !s.length) err(w, `spec.${l} is missing or empty`);
        else {
          if (s.some(x => !isStr(x))) err(w, `spec.${l} has an empty line`);
          if (s.length < 3 || s.length > 6) warn(w, `spec.${l} has ${s.length} lines (contract: 3-6)`);
          if (Array.isArray(e.spec[BASE_LANG]) && s.length !== e.spec[BASE_LANG].length) warn(w, `spec.${l} has ${s.length} lines but spec.${BASE_LANG} has ${e.spec[BASE_LANG].length}`);
        }
      }
    }
    if (!Array.isArray(e.tags) || !e.tags.length) err(w, 'tags is missing or empty');
    else {
      if (e.tags.some(t => !isStr(t))) err(w, 'tags has an empty entry');
      else if (e.tags.some(t => t !== t.toLowerCase() || /[\t\n,]/.test(t))) err(w, 'tags must be lowercase, without commas or tabs');
      if (e.tags.length < 4 || e.tags.length > 8) warn(w, `${e.tags.length} tags (contract: 4-8)`);
    }
  });
}

// ---------------------------------------------------------------- read packs
const packsDir = path.join(ROOT, 'packs');
const dirs = fs.existsSync(packsDir)
  ? fs.readdirSync(packsDir, { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('.')).map(d => d.name).sort()
  : [];
const packs = [];
for (const dir of dirs) {
  const where = `packs/${dir}`;
  const metaFile = path.join(packsDir, dir, 'meta.json');
  const packFile = path.join(packsDir, dir, 'pack.js');
  const hasMeta = fs.existsSync(metaFile), hasPack = fs.existsSync(packFile);
  if (!hasMeta && !hasPack) continue; // an empty folder: someone has only just started
  if (!hasMeta || !hasPack) {
    const msg = `${hasMeta ? 'pack.js' : 'meta.json'} is missing`;
    if (PARTIAL) warn(where, msg + ' — pack skipped (--partial)'); else err(where, msg);
    continue;
  }
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch (e) { err(`${where}/meta.json`, `invalid JSON (${e.message})`); continue; }
  const before = errors.length;
  validateMeta(meta, `${where}/meta.json`);
  const langs = packLangs(meta);
  const raw = JSON.parse(JSON.stringify(meta)); // as written; the pack READMEs are made from this
  if (errors.length === before) fillLangs(meta);
  if (meta.pack !== dir) err(`${where}/meta.json`, `pack is "${meta.pack}" but the folder is "${dir}"`);
  const src = fs.readFileSync(packFile, 'utf8');
  const cut = cutPack(src, `${where}/pack.js`);
  const got = evalPack(src, packFile, `${where}/pack.js`);
  if (!src.split('\n')[0].includes('MIT License')) warn(`${where}/pack.js`, 'first line is not the licence header from the contract');
  const nMeta = Array.isArray(meta.elements) ? meta.elements.length : 0;
  if (cut.elements.length !== nMeta) err(where, `pack.js has ${cut.elements.length} @element blocks but meta.json lists ${nMeta} elements`);
  let info = null;
  if (got) {
    const r = got.r || {};
    if (got.id !== dir) err(`${where}/pack.js`, `MotionPrompt.pack('${got.id}', …) does not match the folder name`);
    for (const k of ['width', 'height', 'cycle']) if (!(typeof r[k] === 'number' && r[k] > 0)) err(`${where}/pack.js`, `factory result has no positive number "${k}"`);
    if (!Array.isArray(r.cells)) err(`${where}/pack.js`, 'factory result has no cells array');
    else {
      if (r.cells.length !== nMeta) err(where, `cells has ${r.cells.length} entries but meta.json lists ${nMeta} elements`);
      for (let i = 0; i < r.cells.length; i++) if (typeof r.cells[i] !== 'function') err(`${where}/pack.js`, `cells[${i}] is not a function`);
    }
    const fonts = Array.isArray(r.fonts) ? r.fonts.map(f => ({ family: String(f.family), url: String(f.url) })) : [];
    for (const f of fonts) if (!fs.existsSync(path.join(packsDir, dir, f.url))) err(`${where}/pack.js`, `font file "${f.url}" is declared but not in the pack folder`);
    info = { width: r.width, height: r.height, cycle: r.cycle, fonts };
  }
  if (errors.length === before && info) packs.push({ dir, meta, raw, cut, info, src, langs });
}

packs.sort((a, b) => a.meta.order - b.meta.order);
for (let i = 1; i < packs.length; i++) if (packs[i].meta.order === packs[i - 1].meta.order)
  err('packs', `"${packs[i].dir}" and "${packs[i - 1].dir}" share order ${packs[i].meta.order}`);
if (!dirs.length || (!packs.length && !errors.length)) err('packs', `no packs found in ${packsDir}`);
packs.forEach((p, i) => {
  if (p.meta.order !== i + 1) {
    const msg = `order ${i + 1} is missing before "${p.dir}" (order ${p.meta.order}); global IDs would shift`;
    if (PARTIAL) warn('packs', msg + ' — allowed by --partial'); else err('packs', msg);
  }
});

// ---------------------------------------------------------------- assemble
// Scaling the 2D context is only safe when the code never addresses device pixels directly.
const PIXEL_BOUND = /\b(setTransform|resetTransform|getTransform|getImageData|putImageData|createImageData)\b|\.canvas\b/;

// The version changes whenever any pack source changes, so the skill CLI's cache never serves stale elements.
const contentHash = crypto.createHash('sha256');
for (const d of fs.readdirSync(path.join(ROOT, 'packs')).sort()) {
  for (const f of ['pack.js', 'meta.json']) {
    const fp = path.join(ROOT, 'packs', d, f);
    if (fs.existsSync(fp)) contentHash.update(d + '/' + f + '\0').update(fs.readFileSync(fp));
  }
}
const catalog = { version: `${VERSION}.${contentHash.digest('hex').slice(0, 10)}`, site: SITE, repo: REPO, count: 0, packs: [], elements: [] };
const codeById = {};
let n = 0;
for (const p of packs) {
  const { meta, info, cut } = p;
  const first = n + 1;
  meta.elements.forEach((e, i) => {
    n += 1;
    const id = pad3(n);
    catalog.elements.push({
      id, pack: meta.pack, no: e.no, slug: e.slug, category: e.category,
      width: info.width, height: info.height, cycle: info.cycle,
      name: e.name, meaning: e.meaning, ...(e.ask ? { ask: e.ask } : {}), summary: e.summary, spec: e.spec, use: e.use, tags: e.tags,
    });
    codeById[id] = cut.elements[i].code;
  });
  catalog.packs.push({
    pack: meta.pack, order: meta.order, title: meta.title, langs: p.langs, categories: meta.categories,
    count: meta.elements.length, first: pad3(first), last: pad3(n),
    width: info.width, height: info.height, cycle: info.cycle, fonts: info.fonts,
    scalable: !PIXEL_BOUND.test(p.src),
  });
}
catalog.count = n;
const packOf = Object.fromEntries(catalog.packs.map(p => [p.pack, p]));
const kitOf = Object.fromEntries(packs.map(p => [p.dir, p.cut.kitText]));

// ---------------------------------------------------------------- text renderers
const T = {
  'zh-Hans': { what: '示例效果', spec: '效果规格', use: '适用场景', size: '尺寸', cycle: '周期', needs: 'Needs', demo: '动态示例', pack: '分类', cat: '子类', tags: '标签',
    sig: 'cells[i](k, w, h, u)：k 为 CanvasRenderingContext2D，调用前已清空并包裹 save/restore；w、h 为尺寸，u 为周期内秒数。画面仅由 u 决定。',
    code: '以下是示例代码，CELLS、常量和辅助函数位于 kit 中。' },
  ja: { what: '何が起きるか', spec: '動きの仕様', use: '使いどころ', size: 'サイズ', cycle: '1周', needs: 'Needs', demo: '動く見本', pack: 'パック', cat: 'カテゴリ', tags: 'タグ',
    sig: 'cells[i](k, w, h, u) … k = CanvasRenderingContext2D（呼ぶ側でクリアと save/restore 済み）、w・h = サイズ、u = 秒（0 以上 1周 未満）。u だけで絵が決まる。',
    code: 'ここから要素のコード。CELLS や定数・補助関数は kit にある。' },
  en: { what: 'What happens', spec: 'Motion spec', use: 'When to use it', size: 'Size', cycle: 'Cycle', needs: 'Needs', demo: 'Live demo', pack: 'Pack', cat: 'Category', tags: 'Tags',
    sig: 'cells[i](k, w, h, u): k = CanvasRenderingContext2D (already cleared and wrapped in save/restore by the caller), w,h = size, u = seconds in [0, cycle). The picture depends only on u.',
    code: 'Element code starts here. CELLS, constants and helpers live in the kit.' },
};

function elementTxt(el, lang) {
  const t = T[lang], p = packOf[el.pack];
  const cat = p.categories.find(c => c.slug === el.category);
  const name = lang === 'zh-Hans' ? `${el.name[lang]} / ${el.name.en}` : lang === 'ja' ? `${el.name.ja} / ${el.name.en}` : `${el.name.en} / ${el.name.ja}`;
  const head = [
    `Motion Prompt #${el.id} · ${LICENCE} · ${SITE}#${el.id}`,
    '',
    name,
    `${t.pack}: ${el.pack} (${p.title[lang]}) · element ${el.no} · ${t.cat}: ${cat ? cat[lang] : el.category}`,
    `${t.what}: ${el.summary[lang]}`,
    `${t.spec}:`,
    ...el.spec[lang].map(s => `  - ${s}`),
    `${t.use}: ${el.use[lang]}`,
    `${t.tags}: ${el.tags.join(', ')}`,
    `${t.size}: ${el.width}x${el.height} px · ${t.cycle}: ${el.cycle} s`,
    `${t.needs}: kit ${el.pack} -> ${SITE}api/v1/${lang === 'zh-Hans' ? 'zh-Hans/' : ''}kit/${el.pack}.js`,
    `${t.demo}: ${SITE}#${el.id}`,
    '',
    t.sig,
    t.code,
  ].map(l => (l ? `// ${l}` : '//'));
  return head.join('\n') + '\n\n' + codeById[el.id] + '\n';
}

function kitJs(p, lang = 'en') {
  const range = p.first === p.last ? `#${p.first}` : `#${p.first}-${p.last}`;
  const W = p.width, H = p.height, C = p.cycle;
  const head = [
    `Motion Prompt ${range} · ${LICENCE} · ${SITE}#${p.first}`,
    '',
    `Kit for pack "${p.pack}" (${p.title.en} / ${p.title.ja}): the constants and helpers its elements share.`,
    `Elements ${range} · ${W}x${H} px · cycle ${C} s. Element code: ${SITE}api/v1/en/e/<id>.txt (or /ja/).`,
    ...(p.fonts.length ? [`Fonts used: ${p.fonts.map(f => `${f.family} (${SITE}packs/${p.pack}/${f.url})`).join(', ')}. Load them before drawing.`] : []),
    '',
    'Run one element standalone in a browser:',
    '  1. paste this file into a <script>,',
    '  2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),',
    '  3. then add:',
    `       const c = document.createElement('canvas'); c.width = ${W}; c.height = ${H}; document.body.append(c);`,
    `       const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();`,
    '       (function loop() {',
    `         const u = ((performance.now() - t0) / 1000) % ${C};   // seconds, 0 <= u < ${C}`,
    `         k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, ${W}, ${H});`,
    `         k.save(); cell(k, ${W}, ${H}, u); k.restore();`,
    '         requestAnimationFrame(loop);',
    '       })();',
    'Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.',
  ].map(l => (l ? `// ${l}` : '//'));
  return head.join('\n') + '\n\n' + (lang === 'zh-Hans' ? kitOf[p.pack].replace("MP_LANGUAGE : 'ja'", "MP_LANGUAGE : 'zh-Hans'") : kitOf[p.pack]) + '\n';
}

const tsvCell = s => String(s).replace(/[\t\r\n]+/g, ' ').trim();
function catalogTsv(lang) {
  const head = `# Motion Prompt catalog (${lang}) · ${catalog.count} elements · ${SITE} · columns: id\tpack\tcategory\ttitle\ttags\tsummary`;
  const rows = catalog.elements.map(el => {
    const cat = packOf[el.pack].categories.find(c => c.slug === el.category);
    const title = lang === 'zh-Hans' ? `${el.name[lang]} (${el.name.en})` : lang === 'ja' ? `${el.name.ja} (${el.name.en})` : `${el.name.en} (${el.name.ja})`;
    return [el.id, el.pack, cat ? cat[lang] : el.category, title, el.tags.join(','), el.summary[lang]].map(tsvCell).join('\t');
  });
  return [head, ...rows].join('\n') + '\n';
}

// ---------------------------------------------------------------- packs/<pack>/README*.md (the name lists, readable on GitHub)
// One file per language the pack is written in: README.md (en), README.<lang>.md (the others).
// Headings fall back to English for a language that has no block here; add a block to translate them.
const DOC = {
  'zh-Hans': { gen: '由 tools/build.mjs 根据 meta.json 生成。请编辑 meta.json，不要直接修改本文件。', names: '个术语', pack: '分类', langs: '语言',
    intro: '找到名称后直接告诉 AI。补充时长、幅度和运动对象，可以更接近你想要的效果。',
    no: '编号', name: '名称', en: '英文名', meaning: '含义', ask: '向 AI 提出需求的示例',
    more: '点击编号可打开动态示例。单个术语的时间、缓动数值与参考代码位于：', all: '全部分类', preview: '示例' },
  en: { gen: 'Generated by tools/build.mjs from meta.json. Edit meta.json, not this file.', names: 'names', pack: 'pack', langs: 'Languages',
    intro: 'Find the name, then say it to your AI. Add how long, how strong and what moves, and the result gets closer to what you had in mind.',
    no: '#', name: 'Name', en: 'English', meaning: 'What it is', ask: 'How to ask an AI',
    more: 'Each number opens the moving sample in the gallery. Timings, easing values and reference code for one name:', all: 'All packs', preview: 'preview' },
  ja: { gen: 'tools/build.mjs が meta.json から作ったファイルです。直すときは meta.json を編集してください。', names: '個の名前', pack: 'パック', langs: '言語',
    intro: '名前を見つけたら、そのままAIに伝えてください。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。',
    no: '番号', name: '名前', en: '英語名', meaning: 'ひとこと', ask: 'AIへの頼み方の例',
    more: '番号を押すと、ギャラリーの動く見本が開きます。1つの名前の秒数・イージングの数値・参考コード:', all: 'パックの一覧', preview: '見本' },
};
const LANG_NAME = { en: 'English', ja: '日本語', zh: '中文', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', ko: '한국어', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano', id: 'Bahasa Indonesia', vi: 'Tiếng Việt', th: 'ไทย', hi: 'हिन्दी', ar: 'العربية', ru: 'Русский', tr: 'Türkçe' };
const readmeName = lang => (lang === BASE_LANG ? 'README.md' : `README.${lang}.md`);
const tx = (o, lang) => (o && isStr(o[lang]) ? o[lang] : o && isStr(o[BASE_LANG]) ? o[BASE_LANG] : '');
const mdCell = s => String(s).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();

function packReadme(src, p, lang) {
  // src = the pack as written (before fallbacks were filled), p = its catalog entry
  const d = DOC[lang] || DOC.en, meta = src.raw;
  const apiLang = LANGS.includes(lang) ? lang : BASE_LANG;
  const others = src.langs.filter(l => l !== lang).map(l => `[${LANG_NAME[l] || l}](${readmeName(l)})`);
  const out = [
    `<!-- ${d.gen} -->`,
    '',
    `# ${tx(meta.title, lang)}`,
    '',
    `${p.count} ${d.names} · #${p.first}–${p.last} · ${d.pack} \`${p.pack}\`` + (others.length ? ` · ${d.langs}: ${others.join(' / ')}` : ''),
    '',
    d.intro,
    '',
  ];
  if (fs.existsSync(path.join(ROOT, 'assets', `preview-${p.pack}.gif`))) out.push(`![${tx(meta.title, lang)} — ${d.preview}](../../assets/preview-${p.pack}.gif)`, '');
  const withEn = lang !== BASE_LANG;
  for (const c of meta.categories) {
    const els = catalog.elements.filter(e => e.pack === p.pack && e.category === c.slug);
    if (!els.length) continue;
    out.push(`## ${tx(c, lang)}`, '');
    out.push(`| ${[d.no, d.name, ...(withEn ? [d.en] : []), d.meaning, d.ask].join(' | ')} |`);
    out.push(`|${Array(withEn ? 5 : 4).fill('---').join('|')}|`);
    for (const el of els) {
      const raw = meta.elements.find(e => e.slug === el.slug);
      out.push(`| ${[`[#${el.id}](${SITE}#${el.id})`, `**${mdCell(tx(raw.name, lang))}**`, ...(withEn ? [mdCell(raw.name[BASE_LANG])] : []), mdCell(tx(raw.meaning, lang)), mdCell(tx(raw.ask, lang))].join(' | ')} |`);
    }
    out.push('');
  }
  out.push(`${d.more} \`api/v1/${apiLang}/e/<id>.txt\` ([#${p.first}](../../api/v1/${apiLang}/e/${p.first}.txt)).`, '');
  out.push(`[${d.all}](../README.md)`, '');
  return out.join('\n');
}

function packsIndex() {
  const out = [
    `<!-- ${DOC.en.gen} -->`,
    '',
    '# Packs',
    '',
    'A pack is one field\'s set of names. Each list below is readable here on GitHub; the gallery shows the same names moving.',
    '',
    '| Numbers | Pack | Names | Lists |',
    '|---|---|---|---|',
  ];
  for (const src of packs) {
    const p = packOf[src.dir];
    const lists = src.langs.map(l => `[${LANG_NAME[l] || l}](${p.pack}/${readmeName(l)})`).join(' · ');
    out.push(`| ${p.first}–${p.last} | \`${p.pack}\` — ${mdCell(src.raw.title[BASE_LANG])} | ${p.count} | ${lists} |`);
  }
  out.push('', 'To add a pack for your field, or a language to an existing pack, see [CONTRIBUTING.md](../CONTRIBUTING.md).', '');
  return out.join('\n');
}

// ---------------------------------------------------------------- report + write
const report = () => {
  for (const w of warns) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`ERROR ${e}`);
};
if (errors.length) {
  report();
  console.error(`\nbuild failed: ${errors.length} error(s), ${warns.length} warning(s). Nothing was written.`);
  process.exit(1);
}

const files = new Map();
files.set('api/v1/catalog.json', JSON.stringify(catalog, null, 1) + '\n');
for (const lang of LANGS) {
  files.set(`api/v1/${lang}/catalog.tsv`, catalogTsv(lang));
  for (const el of catalog.elements) {
    files.set(`api/v1/${lang}/e/${el.id}.txt`, elementTxt(el, lang));
    files.set(`api/v1/${lang}/p/${el.id}.txt`, mpPrompt(el, packOf[el.pack].title[lang], lang) + '\n');
  }
}
for (const p of catalog.packs) {
  files.set(`api/v1/kit/${p.pack}.js`, kitJs(p));
  files.set(`api/v1/zh-Hans/kit/${p.pack}.js`, kitJs(p, 'zh-Hans'));
}
for (const src of packs) for (const lang of src.langs) files.set(`packs/${src.dir}/${readmeName(lang)}`, packReadme(src, packOf[src.dir], lang));
files.set('packs/README.md', packsIndex());
files.set('assets/catalog.js',
  `/* Generated by tools/build.mjs — do not edit. Source of truth: packs/<pack>/{meta.json,pack.js} */\n` +
  `window.MP_CATALOG = ${JSON.stringify(catalog)};\n` +
  `window.MP_PROMPT = ${mpPrompt.toString()};\n`);

report();
if (!CHECK_ONLY) {
  fs.rmSync(path.join(ROOT, 'api', 'v1'), { recursive: true, force: true }); // generated only; drop stale IDs
  for (const [rel, text] of files) {
    const f = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
}
const summary = catalog.packs.map(p => `${p.pack} ${p.first}-${p.last}`).join(', ');
console.log(`${CHECK_ONLY ? 'checked' : 'built'} ${catalog.count} elements in ${catalog.packs.length} pack(s): ${summary}`);
console.log(`${CHECK_ONLY ? 'would write' : 'wrote'} ${files.size} files under ${ROOT}${warns.length ? ` · ${warns.length} warning(s)` : ''}`);
