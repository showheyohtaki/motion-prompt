// Motion Prompt #241-264 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#241
//
// Kit for pack "lp3" (Landing page & web effects, part 3 / LP・Webサイトの演出 第3弾): the constants and helpers its elements share.
// Elements #241-264 · 539x208 px · cycle 9.4 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 539; c.height = 208; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 9.4;   // seconds, 0 <= u < 9.4
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 539, 208);
//          k.save(); cell(k, 539, 208, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// LP・Webサイトの演出の名前 第3弾 24（各カード 539x208・1つの動きは4.7秒、パックの周期は9.4秒。各コマは時間 u の純関数）
// カードの中にブラウザの窓を1つ描き、その中の簡略化したページで演出を見せる。きっかけ（スクロールバー・カーソル）も一緒に描く。
// 色はカメラワークのパック（camera・camera2）と同じ: 薄いグレーの地に白い窓、青1色（#2F6BEB と、それを薄めた4段）と文字の黒・グレーだけ。
const CW = 539, CH = 208;
const CYC = 4.7;                                   // 1つの動きは4.7秒
const LOOP = CYC * 2;                              // パックの周期は9.4秒。各カードは4.7秒の動きを2回くり返す
const TAU = Math.PI * 2, W1 = TAU / CYC;           // 4.7秒で1周する角速度（ゆらぎは必ずこの整数倍で回す）
const C = {
  desk: '#F1F0EE', win: '#FFFFFF', bar: '#F4F3F0', rule: '#E3E1DC',
  ink: '#1E1E21', mark: '#3A3A3E', sub: '#8E8E93', faint: '#E2E1DE', soft: '#F4F3F0', g3: '#CFCECB', g4: '#A9A8A5',
  blue: '#2F6BEB', blueM: '#9DB8F6', blueL: '#C9D8FB', blueXL: '#E4ECFE', blueBg: '#F1F5FF'
};
const PAL = [C.blue, C.blueM, C.blueL, C.blue, C.blueM];
const JP = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif';
const EN = '"Avenir Next", "Helvetica Neue", system-ui, sans-serif';
const MONO = '"SF Mono", "Menlo", "Consolas", monospace';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // easeInOut（3乗）
const eOut = x => 1 - Math.pow(1 - x, 3);                                      // easeOut（3乗）
const eIn = x => x * x * x;                                                    // easeIn（3乗）
const eBack = x => { const s = 1.70158; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };   // backOut
const mod = (a, n) => ((a % n) + n) % n;
// 浮動小数の誤差で周期の終わり（4.6999…）と始まり（0）が別のコマ扱いになるのを防ぎ、u を 0〜4.7秒に折り返す
const snapU = u => mod(Math.round(u * 1e6) / 1e6, CYC);
function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
function txt(k, s, x, y, font, col, align = 'left', base = 'alphabetic', ls = '0px') {
  k.font = font; k.fillStyle = col; k.textAlign = align; k.textBaseline = base; k.letterSpacing = ls; k.fillText(s, x, y); k.letterSpacing = '0px';
}
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function rgba(c, a) { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }
// キーフレーム [[秒, 値], …] を easeInOut（3乗）でつなぐ。u は周期で折り返す
function steps(keys, u, ease = eIO) {
  u = mod(u, CYC);
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i]; return lerp(a, b, ease((u - t0) / (t1 - t0))); }
  return keys[keys.length - 1][1];
}
// カーソルの通り道 [[秒, x, y], …]（easeInOut 3乗でつなぐ）
function path(keys, u) {
  u = mod(u, CYC);
  if (u <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const a = keys[i - 1], b = keys[i], f = eIO((u - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], f), lerp(a[2], b[2], f)]; }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
}
// ブラウザの窓。中のページは V（511x170）の座標で描く。g = 0/1/2 で机の色が変わる
const WIN = { x: 14, y: 8, w: 511, h: 192, r: 10, bar: 22 };
const VW = WIN.w, VH = WIN.h - WIN.bar;
function frame(k, g = 0, url = 'example.com') {
  k.fillStyle = C.desk; k.fillRect(0, 0, CW, CH);
  k.save(); k.shadowColor = 'rgba(30,30,33,.14)'; k.shadowBlur = 16; k.shadowOffsetY = 4;
  k.fillStyle = C.win; rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.fill(); k.restore();
  k.save(); rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.clip();
  k.fillStyle = C.bar; k.fillRect(WIN.x, WIN.y, WIN.w, WIN.bar); k.fillStyle = C.rule; k.fillRect(WIN.x, WIN.y + WIN.bar - 1, WIN.w, 1); k.restore();
  [0, 1, 2].forEach(i => { k.fillStyle = C.g3; k.beginPath(); k.arc(WIN.x + 14 + i * 11, WIN.y + 11, 3.4, 0, 7); k.fill(); });
  k.fillStyle = C.faint; rr(k, WIN.x + WIN.w / 2 - 100, WIN.y + 4.5, 200, 13, 6.5); k.fill();
  txt(k, url, WIN.x + WIN.w / 2, WIN.y + 11.5, `500 9px ${EN}`, C.sub, 'center', 'middle');
}
function view(k, fn, bg = '#fff') {
  k.save(); rr(k, WIN.x, WIN.y + WIN.bar, VW, VH, [0, 0, WIN.r, WIN.r]); k.clip(); k.translate(WIN.x, WIN.y + WIN.bar);
  k.fillStyle = bg; k.fillRect(0, 0, VW, VH); fn(); k.restore();
}
// スクロールバー（つまみだけ。pos 0〜1、ratio＝見えている割合）
function sbar(k, pos, ratio = 0.42, col = 'rgba(30,30,33,.35)') { const th = (VH - 8) * ratio; k.fillStyle = col; rr(k, VW - 8, 4 + (VH - 8 - th) * clamp(pos), 4.5, th, 2.25); k.fill(); }
// 文字の代わりの棒（n 行。最後の行は短い）
function bars(k, x, y, w, n, col = C.faint, hh = 5, gap = 10, last = 0.62) {
  k.fillStyle = col; for (let i = 0; i < n; i++) { rr(k, x, y + i * gap, i === n - 1 && n > 1 ? w * last : w, hh, hh / 2); k.fill(); }
}
// マウスのカーソル（矢印）。press で少し縮む。grab = 1 で手のひら（ドラッグ中）の代わりに丸い印
function cursor(k, x, y, press = 0, col = C.ink) {
  const s = 1.15 * (1 - 0.12 * press);
  k.save(); k.translate(x, y); k.scale(s, s); k.beginPath();
  [[0, 0], [0, 16.5], [4.2, 12.6], [7, 19], [9.8, 17.8], [7.1, 11.6], [12.6, 11.6]].forEach(([a, b], i) => i ? k.lineTo(a, b) : k.moveTo(a, b));
  k.closePath(); k.lineJoin = 'round'; k.lineWidth = 1.6; k.strokeStyle = '#fff'; k.fillStyle = col; k.fill(); k.stroke(); k.restore();
}
// ドラッグ中の印（つかんだ手の代わりに、押した輪のついた丸）
function grabber(k, x, y, on) {
  k.save(); k.fillStyle = rgba(C.ink, 0.85); k.strokeStyle = '#fff'; k.lineWidth = 2;
  k.beginPath(); k.arc(x, y, on ? 7 : 8.5, 0, 7); k.fill(); k.stroke();
  if (on) { k.strokeStyle = rgba(C.ink, 0.3); k.lineWidth = 2; k.beginPath(); k.arc(x, y, 13, 0, 7); k.stroke(); }
  k.restore();
}
// 画面外のキャンバス（id ごとに1枚）。呼び出し側の拡大率に合わせた解像度で作り、w×h の座標で描けるようにする
const LAY = {};
function layer(k, id, w, h, res) {
  const m = k.getTransform(), s = res || Math.min(4, Math.max(1, Math.hypot(m.a, m.b)));
  let c = LAY[id]; if (!c) c = LAY[id] = document.createElement('canvas');
  const W = Math.max(1, Math.ceil(w * s)), H = Math.max(1, Math.ceil(h * s));
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const g = c.getContext('2d'); g.clearRect(0, 0, W, H); g.save(); g.scale(W / w, H / h);
  return [c, g, W / w];
}
// 低い解像度のマス目（nx×ny）を f(i, j) の色で塗り、なめらかに引き伸ばして (x, y, w, h) に描く。シェーダーの代わり
function field(k, id, x, y, w, h, nx, ny, f) {
  const [c, g] = layer(k, id, nx, ny, 1);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { g.fillStyle = f(i, j); g.fillRect(i, j, 1, 1); }
  g.restore(); k.save(); k.imageSmoothingEnabled = true; k.imageSmoothingQuality = 'high'; k.drawImage(c, x, y, w, h); k.restore();
}
// 決まった種の乱数（描くたびに同じ値）
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// 絵の代わりのアート（色の地に 丸・三角・帯）。v で色と形が変わる。ジャケット・写真・カードの絵柄に使う
const ARTS = [
  [C.blue, C.blueL, '#FFFFFF'], [C.blueL, C.blue, '#FFFFFF'], [C.blueXL, C.blueM, C.blue],
  [C.blueM, '#FFFFFF', C.blue], [C.blueXL, C.blue, C.blueM], [C.blue, C.blueM, C.blueXL]
];
function art(k, x, y, w, h, v = 0, r = 6) {
  const [a, b, c] = ARTS[mod(v, ARTS.length)], m = Math.min(w, h);
  k.save(); rr(k, x, y, w, h, r); k.clip();
  k.fillStyle = a; k.fillRect(x, y, w, h);
  const t = mod(v, 3);
  if (t === 0) { k.fillStyle = b; k.beginPath(); k.arc(x + w * 0.62, y + h * 0.42, m * 0.3, 0, 7); k.fill(); k.fillStyle = c; k.fillRect(x, y + h * 0.7, w, h * 0.3); }
  else if (t === 1) { k.fillStyle = b; k.beginPath(); k.moveTo(x, y + h); k.lineTo(x + w * 0.45, y + h * 0.25); k.lineTo(x + w * 0.9, y + h); k.fill(); k.fillStyle = c; k.beginPath(); k.arc(x + w * 0.78, y + h * 0.28, m * 0.14, 0, 7); k.fill(); }
  else { k.fillStyle = b; for (let i = 0; i < 3; i++) k.fillRect(x, y + h * (0.18 + i * 0.26), w, h * 0.1); k.fillStyle = c; k.beginPath(); k.arc(x + w * 0.3, y + h * 0.5, m * 0.22, 0, 7); k.fill(); }
  k.restore();
}
const CELLS = [];
