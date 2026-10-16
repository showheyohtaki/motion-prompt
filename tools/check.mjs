#!/usr/bin/env node
// Motion Prompt check: draws every element in a real browser at several times and lists what looks wrong.
//
//   node tools/check.mjs                  all packs
//   node tools/check.mjs --pack camera    one pack
//   node tools/check.mjs --strict         warnings also fail (exit 1)
//   node tools/check.mjs --root <dir>     another tree (same layout as the repo)
//
// FAIL (exit 1)  exception while drawing · nothing drawn · every sampled frame is one flat colour ·
//                cell count differs from meta.json · pack or font does not load
// warn           nothing drawn at some sampled time · loop seam (the frame just before `cycle` differs from
//                u = 0 far more than neighbouring frames do) · same u drawn twice gives different pixels
//                (hidden state / randomness) · drawing changes when the context is scaled although the build
//                marked the pack "scalable"
//
// (info)         some sampled frames show only a flat background — normal before an entrance, listed for reference
//
// Playwright is not a dependency of this repo. It is loaded from MP_PLAYWRIGHT, or resolved as 'playwright'.
// Set MP_PYTHON when the Python executable is not named python3 (for example on Windows).
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--root') || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const ONLY = opt('--pack');
const STRICT = flag('--strict');
const PW = process.env.MP_PLAYWRIGHT || 'playwright';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)(PW)); } catch (e) {
  console.error(`Playwright was not found at ${PW}\nSet MP_PLAYWRIGHT=/path/to/node_modules/playwright and run again.`);
  process.exit(2);
}

const freePort = () => new Promise((res, rej) => {
  const s = net.createServer();
  s.on('error', rej);
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
});
async function waitFor(url, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { const r = await fetch(url); if (r.ok) return; } catch (e) { /* not up yet */ }
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`server did not answer at ${url}`);
}

// Runs inside the page. Returns one record per element.
async function probe({ pack, expect, scalable }) {
  const p = window.MotionPrompt.packs[pack];
  if (!p) return { fatal: `MotionPrompt.packs['${pack}'] is not registered` };
  const out = { width: p.width, height: p.height, cycle: p.cycle, cells: p.cells.length, fontError: null, rows: [] };
  try { await window.MotionPrompt.loadFonts(p, new URL(`packs/${pack}/`, location.origin + '/')); await document.fonts.ready; }
  catch (e) { out.fontError = String(e && e.message || e); }
  const W = p.width, H = p.height, CYC = p.cycle, EPS = 1 / 60;
  const mk = s => { const c = document.createElement('canvas'); c.width = W * s; c.height = H * s; return c; };
  const c1 = mk(1), k1 = c1.getContext('2d', { willReadFrequently: true });
  const c2 = mk(2), k2 = c2.getContext('2d');
  const down = mk(1), kd = down.getContext('2d', { willReadFrequently: true });
  const draw = (k, cell, u, s) => {
    k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = 1; k.filter = 'none'; k.globalCompositeOperation = 'source-over';
    k.clearRect(0, 0, W * s, H * s); k.save(); if (s !== 1) k.scale(s, s);
    try { cell(k, W, H, u); } finally { k.restore(); }
  };
  const grab = (cell, u) => { draw(k1, cell, u, 1); return k1.getImageData(0, 0, W, H).data; };
  const stats = d => { // over white; returns coverage, mean luminance, spread
    let n = 0, sum = 0, sq = 0, covered = 0;
    for (let i = 0; i < d.length; i += 16) {
      const a = d[i + 3] / 255; if (a > 0.02) covered++;
      const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) * a + 255 * (1 - a);
      n++; sum += l; sq += l * l;
    }
    const mean = sum / n;
    return { cover: covered / n, mean, sd: Math.sqrt(Math.max(0, sq / n - mean * mean)) };
  };
  const diff = (a, b) => { let s = 0, n = 0; for (let i = 0; i < a.length; i += 4) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]); n += 4; } return s / n; };
  const times = [0, 0.13, 0.25, 0.37, 0.5, 0.63, 0.75, 0.87].map(f => f * CYC);
  for (let i = 0; i < Math.max(p.cells.length, expect); i++) {
    const row = { i, fail: [], warn: [], info: [], seam: 0, step: 0 };
    out.rows.push(row);
    const cell = p.cells[i];
    if (typeof cell !== 'function') { row.fail.push('no cell function'); continue; }
    try {
      let flat = 0, empty = 0, step = 0; const flats = [];
      for (const u of times) {
        const a = grab(cell, u).slice();
        const s = stats(a);
        if (s.cover < 0.002) empty++;
        else if (s.sd < 1.2) { flat++; flats.push(`${u.toFixed(2)}s ${s.mean > 250 ? 'white' : s.mean < 5 ? 'black' : 'flat'}`); }
        step = Math.max(step, diff(a, grab(cell, Math.min(u + EPS, CYC - EPS / 2))));
      }
      if (empty === times.length) row.fail.push('nothing is drawn at any sampled time');
      else if (flat + empty === times.length) row.fail.push(`every sampled frame is one flat colour (${flats[0] || 'empty'})`);
      else {
        if (empty) row.warn.push(`nothing drawn at ${empty}/${times.length} sampled times`);
        if (flat) row.info.push(`background only at ${flats.map(f => f.split(' ')[0]).join(', ')}`);
      }
      const first = grab(cell, 0).slice(), last = grab(cell, CYC - EPS).slice();
      const seam = diff(first, last);
      row.seam = +seam.toFixed(2); row.step = +step.toFixed(2);
      if (seam > 6 && seam > step * 3) row.warn.push(`loop seam: last frame vs first differs by ${seam.toFixed(1)} (largest normal step ${step.toFixed(1)})`);
      const u0 = CYC * 0.31, x = grab(cell, u0).slice(); grab(cell, CYC * 0.72); grab(cell, CYC * 0.05);
      const again = diff(x, grab(cell, u0));
      if (again > 0.02) row.warn.push(`not a pure function of u: the same time drawn twice differs by ${again.toFixed(2)}`);
      if (scalable) {
        draw(k2, cell, u0, 2);
        kd.clearRect(0, 0, W, H); kd.imageSmoothingQuality = 'high'; kd.drawImage(c2, 0, 0, W, H);
        const sc = diff(x, kd.getImageData(0, 0, W, H).data);
        if (sc > 5) row.warn.push(`draws differently on a scaled context (${sc.toFixed(1)}); the site would show it wrong in the detail view`);
      }
    } catch (e) {
      row.fail.push(`exception: ${e && e.message || e}`);
    }
  }
  return out;
}

const catalogFile = path.join(ROOT, 'api/v1/catalog.json');
if (!fs.existsSync(catalogFile)) { console.error('api/v1/catalog.json not found. Run: node tools/build.mjs'); process.exit(2); }
const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
const packs = catalog.packs.filter(p => !ONLY || p.pack === ONLY);
if (!packs.length) { console.error(`no pack "${ONLY}" in the catalog`); process.exit(2); }

const port = await freePort();
const server = spawn(process.env.MP_PYTHON || 'python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
let browser, fails = 0, warns = 0, total = 0;
try {
  const base = `http://127.0.0.1:${port}`;
  await waitFor(`${base}/assets/runtime.js`, 8000);
  browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  for (const p of packs) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) pageErrors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400 && !/favicon\.ico$/.test(r.url())) pageErrors.push(`${r.status()} ${r.url()}`); });
    await page.goto(`${base}/assets/runtime.js`); // any same-origin document will do
    await page.addScriptTag({ url: `${base}/assets/runtime.js` });
    await page.addScriptTag({ url: `${base}/packs/${p.pack}/pack.js` }).catch(e => pageErrors.push(`pack.js: ${e.message}`));
    const r = await page.evaluate(probe, { pack: p.pack, expect: p.count, scalable: !!p.scalable });
    await page.close();
    console.log(`\n${p.pack}  #${p.first}-${p.last}  ${r.fatal ? '' : `${r.width}x${r.height}, cycle ${r.cycle}s, ${r.cells} cells`}`);
    if (r.fatal) { console.log(`  FAIL  ${r.fatal}${pageErrors.length ? ` (${pageErrors.join(' | ')})` : ''}`); fails++; continue; }
    if (r.cells !== p.count) { console.log(`  FAIL  ${r.cells} cells but the catalog lists ${p.count}`); fails++; }
    if (r.fontError) { console.log(`  FAIL  font did not load: ${r.fontError}`); fails++; }
    for (const e of pageErrors) { console.log(`  FAIL  page error: ${e}`); fails++; }
    const els = catalog.elements.filter(e => e.pack === p.pack);
    for (const row of r.rows) {
      total++;
      const el = els[row.i];
      const label = el ? `#${el.id} ${el.no} ${el.slug}` : `(cell ${row.i + 1}, not in meta)`;
      const status = row.fail.length ? 'FAIL' : row.warn.length ? 'warn' : 'ok  ';
      if (row.fail.length) fails++; else if (row.warn.length) warns++;
      const notes = [...row.fail, ...row.warn, ...row.info.map(x => `(${x})`)].join(' · ');
      console.log(`  ${status}  ${label.padEnd(40)} seam ${String(row.seam).padStart(6)}  step ${String(row.step).padStart(6)}${notes ? '  ' + notes : ''}`);
    }
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
console.log(`\n${total} elements checked: ${fails} failed, ${warns} with warnings.`);
process.exit(fails || (STRICT && warns) ? 1 : 0);
