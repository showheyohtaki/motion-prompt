#!/usr/bin/env node
// Run after tools/build.mjs. Uses Playwright through MP_PLAYWRIGHT, like check.mjs.
// Checks the public language flows and standalone Chinese code without changing the clipboard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/\r\n/g, '\n');
const catalog = JSON.parse(read('api/v1/catalog.json'));
const zh = 'zh-Hans', languages = ['ja', 'en', zh];
const cli = path.join(ROOT, 'skills/motion-prompt/scripts/motion-prompt.mjs');
const run = args => execFileSync(process.execPath, [cli, ...args], { cwd: ROOT, encoding: 'utf8' });
const sandbox = { window: {} };
vm.runInNewContext(read('assets/catalog.js'), sandbox);
for (const pack of catalog.packs) {
  const raw = JSON.parse(read(`packs/${pack.pack}/meta.json`));
  assert.ok(raw.title[zh]);
  for (const cat of raw.categories) assert.ok(cat[zh]);
  for (const e of raw.elements) {
    for (const field of ['name', 'meaning', 'ask', 'summary', 'use']) assert.ok(e[field][zh], `${pack.pack}/${e.no}/${field}`);
    assert.equal(e.spec[zh].length, e.spec.en.length);
    assert.ok(e.spec[zh].every(line => line.trim()));
  }
}
for (const e of catalog.elements) for (const lang of languages) {
  const pack = catalog.packs.find(p => p.pack === e.pack);
  assert.equal(read(`api/v1/${lang}/p/${e.id}.txt`).trim(), sandbox.window.MP_PROMPT(e, pack.title[lang], lang));
  assert.ok(read(`api/v1/${lang}/e/${e.id}.txt`).startsWith(`// Motion Prompt #${e.id} · MIT License`));
}
assert.match(run(['search', '推镜头']), /^#027\s+推镜头/);
assert.match(run(['search', 'ポップ', '--lang', 'ja']), /ポップイン/);
assert.match(run(['prompt', '025', '--lang', 'zh-CN']), /水平摇镜头/);
assert.equal(run(['prompt', '025', '--lang', zh]), run(['prompt', '025', '--lang', 'zh-CN']));
assert.match(run(['kit', 'ui', '--lang', zh]), /MP_LANGUAGE : 'zh-Hans'/);
assert.match(run(['--help', '--lang', zh]), /用法/);
console.log(`PASS: complete Chinese source fields, ${catalog.elements.length * 3} prompt/API pairs and CLI language selection.`);

const { chromium } = createRequire(import.meta.url)(process.env.MP_PLAYWRIGHT || 'playwright');
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(ROOT, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.txt': 'text/plain' }[path.extname(file)] || 'application/octet-stream';
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404).end(); return; } res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }); res.end(data); });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser, pickProcess;
try {
  browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  const context = await browser.newContext({ locale: 'zh-CN', reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copied = text; } } });
  });
  // Check the site's own introductions and embed locale without requesting third-party posts.
  await context.route('https://platform.twitter.com/widgets.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.twttr={ready:f=>f(window.twttr),widgets:{createTweet:async(id,box,options)=>{window.__embedLocale=options.lang;let p=document.createElement('p');p.textContent='Embed test fixture';box.append(p);return p;}}};` }));
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base);
  await page.waitForSelector('.tile');
  assert.equal(await page.locator('html').getAttribute('lang'), zh);
  assert.equal(await page.locator('.tile').count(), catalog.count);
  await page.locator('#q').fill('推镜头');
  assert.ok(await page.locator('.tile[data-id="027"]').isVisible());
  await page.locator('.tile[data-id="027"]').click();
  await page.waitForSelector('#d-code', { state: 'attached' });
  assert.match(await page.locator('#d-prompt').textContent(), /推镜头/);
  await page.getByRole('button', { name: '复制提示词', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__copied), read('api/v1/zh-Hans/p/027.txt').trim());
  await page.locator('#d-close').click();
  await page.locator('[data-lang="en"]').click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await page.locator('.tile[data-id="027"]').click();
  assert.match(await page.locator('#d-prompt').textContent(), /Dolly in/);
  await page.locator('#d-close').click();
  await page.locator('[data-lang="ja"]').click();
  await page.locator('.tile[data-id="027"]').click();
  assert.match(await page.locator('#d-prompt').textContent(), /ドリーイン/);
  await page.locator('#d-close').click();
  await page.locator('[data-lang="zh-Hans"]').click();
  await page.locator('#q').fill('');
  await page.locator('[data-pick="001"]').click();
  await page.locator('[data-pick="025"]').click();
  await page.locator('#tray-main').click();
  assert.match(await page.evaluate(() => window.__copied), /规格与代码.*zh-Hans/);
  await page.locator('#tray-share').click();
  const shared = await page.evaluate(() => window.__copied);
  assert.match(shared, /lang=zh-Hans/);
  await page.goto(shared.replace('https://showheyohtaki.github.io/motion-prompt/', base + '/'));
  assert.equal(await page.locator('[data-pick][aria-pressed="true"]').count(), 2);
  await page.goto(`${base}/found.html?lang=zh-CN`);
  await page.waitForSelector('.ex-intro');
  assert.equal(await page.locator('html').getAttribute('lang'), zh);
  await page.waitForFunction(() => window.__embedLocale === 'zh-cn');
  assert.match(await page.locator('.ex-intro').first().textContent(), /滚动/);
  await page.locator('[data-lang="en"]').click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/?lang=zh-Hans`);
    await page.waitForSelector('.tile');
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(e).position !== 'absolute';
    }).slice(0, 8).map(e => e.tagName + '.' + e.className));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}: ${overflow}`);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ['/', '/found.html']) {
    await page.goto(`${base}${route}?lang=zh-Hans`);
    const selector = page.locator('.lang-select');
    assert.ok(await selector.isVisible());
    assert.equal(await page.locator('.logo').evaluate(e => getComputedStyle(e).fontSize), '17px');
    for (const lang of ['en', 'ja', zh]) {
      await selector.selectOption(lang);
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await selector.inputValue(), lang);
      assert.equal(await page.locator(`[data-lang="${lang}"]`).getAttribute('aria-pressed'), 'true');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.reload();
    assert.equal(await selector.inputValue(), zh);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/?lang=zh-Hans`);
  await page.waitForSelector('.tile');
  const out = process.env.MP_REVIEW_DIR;
  if (out) {
    fs.mkdirSync(out, { recursive: true });
    await page.screenshot({ path: path.join(out, 'gallery-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(out, 'gallery-mobile.png') });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: language switching, Chinese search, prompt copy, selection sharing, examples, mobile widths.');

  for (const [locale, expected] of [['en-US', 'en'], ['ja-JP', 'ja'], ['zh-SG', zh], ['zh-TW', 'en']]) {
    const fresh = await browser.newContext({ locale, reducedMotion: 'reduce', viewport: { width: 360, height: 800 } });
    const p = await fresh.newPage(); p.setDefaultTimeout(10000);
    await p.goto(base); await p.waitForSelector('.tile');
    assert.equal(await p.locator('html').getAttribute('lang'), expected);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `header overflow for ${locale}`);
    await p.goto(`${base}/?lang=zh-CN`);
    assert.equal(await p.locator('html').getAttribute('lang'), zh);
    await fresh.close();
  }
  const privateContext = await browser.newContext({ locale: 'en-US' });
  await privateContext.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }); });
  const privatePage = await privateContext.newPage();
  await privatePage.goto(`${base}/?lang=zh-Hans`); await privatePage.waitForSelector('.tile');
  assert.equal(await privatePage.locator('html').getAttribute('lang'), zh);
  await privateContext.close();
  console.log('PASS: browser-language defaults, URL aliases, narrow ja/en headers and disabled storage.');

  // Every Chinese spec + kit must draw standalone, without the gallery runtime.
  await page.goto(`${base}/assets/runtime.js`);
  const standalone = catalog.elements.map(e => ({ ...e, code: read(`api/v1/zh-Hans/e/${e.id}.txt`), kit: read(`api/v1/zh-Hans/kit/${e.pack}.js`) }));
  const rendered = await page.evaluate(rows => {
    for (const e of rows) {
      const cell = new Function(e.kit + '\n' + e.code + '\nreturn CELLS.find(Boolean);')();
      const canvas = document.createElement('canvas'); canvas.width = e.width; canvas.height = e.height;
      const k = canvas.getContext('2d'); cell(k, e.width, e.height, e.cycle * 0.4);
      if (!k.getImageData(0, 0, e.width, e.height).data.some(x => x)) throw new Error('Blank standalone #' + e.id);
    }
    return rows.length;
  }, standalone);
  assert.equal(rendered, catalog.count);
  console.log(`PASS: ${rendered} standalone Chinese reference implementations.`);

  pickProcess = spawn(process.execPath, [cli, 'pick', '--local', '--no-open', '--lang', zh, '--timeout', '30'], { cwd: ROOT });
  let stdout = '', stderr = '';
  pickProcess.stdout.on('data', chunk => { stdout += chunk; });
  pickProcess.stderr.on('data', chunk => { stderr += chunk; });
  const exit = new Promise(resolve => pickProcess.on('exit', resolve));
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('pick server did not start: ' + stderr)), 5000);
    pickProcess.stdout.on('data', () => { const m = /Gallery: (http[^\s]+)/.exec(stdout); if (m) { clearTimeout(timer); resolve(m[1]); } });
  });
  const callback = new URL(url).searchParams.get('cb');
  const wrong = new URL(callback); wrong.searchParams.set('t', 'wrong'); wrong.searchParams.set('ids', '001');
  assert.equal((await fetch(wrong)).status, 403);
  await page.goto(url);
  await page.locator('[data-pick="001"]').click();
  await page.locator('#tray-main').click();
  await page.waitForFunction(() => document.title.includes('已发送给 AI'));
  assert.equal(await exit, 0, stderr);
  assert.match(stdout, /用户在 Motion Prompt/);
  assert.match(stdout, /弹性入场/);
  assert.match(stdout, /kit <pack> --lang zh-Hans/);
  console.log('PASS: authenticated local AI handoff, Chinese receipt and terminal output.');
} finally {
  if (pickProcess && pickProcess.exitCode === null) pickProcess.kill();
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
