// Motion Prompt #193-216 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#193
//
// Kit for pack "artstyle" (Art styles for image generation / 画像生成で使う画風の名前): the constants and helpers its elements share.
// Elements #193-216 · 539x208 px · cycle 4.7 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
// Images used: 27 files under https://showheyohtaki.github.io/motion-prompt/packs/artstyle/img/. The kit loads them itself (from the folder of pack.js, or from that URL when pasted on its own); `ready` resolves when they have arrived, and until then every cell draws a plain background.
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 539; c.height = 208; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 4.7;   // seconds, 0 <= u < 4.7
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 539, 208);
//          k.save(); cell(k, 539, 208, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// 画像生成で使う画風の名前 24（カード 539x208、1周 4.7秒）。各コマは時間 u の純関数。
// 全カードで同じ下絵（丘の上の家・木・太陽の線画）を参照画像として渡し、画像生成AIでそれぞれの画風に描き分けた。
// カードは「下絵 → 斜めのワイプでその画風 → ゆっくり寄る → 下絵へ戻る」。絵は描画せず、生成した画像を表示する。
// 画像はパックのフォルダの img/*.webp（1078x416＝カードの2倍、作者が生成して MIT で公開）。
// 読み込みは非同期なので、ready（Promise）が解決するまでは無地の背景だけを描く。解決後は u だけで絵が決まる。
const CW = 539, CH = 208, CYC = 4.7;
const SITE_IMG = 'https://showheyohtaki.github.io/motion-prompt/packs/artstyle/';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// 画像の置き場所: このファイルと同じフォルダ。単体で貼って使うときは公開サイトから読む。
const IMG_BASE = (() => {
  try {
    const s = typeof document !== 'undefined' && document.currentScript && document.currentScript.src;
    if (typeof s === 'string' && s && typeof URL !== 'undefined') return new URL('./', s).href;
  } catch (e) { /* fall through */ }
  return SITE_IMG;
})();
// 下絵は1枚。08（ステンドグラス）と23（シンセウェイヴ）だけ切り出し位置が違うので、同じ位置の下絵を別に持つ
const OWN_BASE = ['08', '23'];
const IMG_FILES = ['img/base.webp', ...OWN_BASE.map(n => `img/base-${n}.webp`),
  ...Array.from({ length: 24 }, (_, i) => `img/style-${String(i + 1).padStart(2, '0')}.webp`)];
const IMG = {};
const ready = Promise.all(IMG_FILES.map(f => new Promise((res, rej) => {
  const im = new Image();
  im.crossOrigin = 'anonymous';
  im.onload = () => { IMG[f] = im; res(); };
  im.onerror = () => rej(new Error('image did not load: ' + f));
  im.src = IMG_BASE + f;
})));
const ok = im => !!(im && im.complete && im.naturalWidth);

// 下絵のあいだ左上に出す札: 鉛筆の形（言語によらない目印）
function pencilTag(k, a) {
  k.save(); k.globalAlpha = a;
  k.beginPath(); k.roundRect(10, 10, 40, 28, 8); k.fillStyle = 'rgba(30,30,33,.72)'; k.fill();
  k.translate(30, 24); k.rotate(-Math.PI / 4);
  k.fillStyle = '#FFFFFF';
  k.fillRect(-7, -2.6, 11, 5.2);                                   // 軸
  k.beginPath(); k.moveTo(4.6, -2.6); k.lineTo(9.6, 0); k.lineTo(4.6, 2.6); k.closePath(); k.fill();   // 先
  k.fillRect(-10, -2.6, 2.2, 5.2);                                 // 消しゴム
  k.restore();
}

// 1枚のカード。no = '01'..'24'
// 0〜0.5秒 下絵 / 0.5〜1.35秒 斜めのワイプで画風へ / 0.5〜4.0秒 1→1.045倍にゆっくり寄る / 4.0〜4.5秒 下絵へフェードで戻る / 〜4.7秒 下絵
function gafu(k, w, h, u, no) {
  const st = IMG[`img/style-${no}.webp`];
  const base = IMG[OWN_BASE.includes(no) ? `img/base-${no}.webp` : 'img/base.webp'];
  k.fillStyle = '#FFFFFF'; k.fillRect(0, 0, w, h);
  if (!ok(st) || !ok(base)) { k.fillStyle = '#F1F0EE'; k.fillRect(0, 0, w, h); return; }   // 読み込み前
  const wp = eIO(P(u, 0.5, 1.35));
  const back = eIO(P(u, 4.0, 4.5));
  const zoom = 1 + 0.045 * eIO(P(u, 0.5, 4.0)) * (1 - back);
  const draw = (im, a) => { k.save(); k.globalAlpha = a; k.translate(w / 2, h / 2); k.scale(zoom, zoom); k.drawImage(im, -w / 2, -h / 2, w, h); k.restore(); };
  draw(base, 0.5);                                                  // 下絵は薄く（ラインアートと見分けるため）
  if (wp > 0 && back < 1) {
    const tilt = 60, x = lerp(-tilt - 8, w + 8, wp);                // 斜めの境目の上端の x
    k.save(); k.beginPath(); k.moveTo(-10, -10); k.lineTo(x + tilt, -10); k.lineTo(x, h + 10); k.lineTo(-10, h + 10); k.closePath(); k.clip();
    draw(st, 1 - back); k.restore();
    if (wp < 1) { k.save(); k.strokeStyle = 'rgba(255,255,255,.95)'; k.lineWidth = 4; k.beginPath(); k.moveTo(x + tilt, -10); k.lineTo(x, h + 10); k.stroke(); k.restore(); }
  }
  const a1 = clamp(1 - P(u, 0.45, 0.7) + P(u, 4.15, 4.45));
  if (a1 > 0.01) pencilTag(k, a1);
}
const CELLS = [];
