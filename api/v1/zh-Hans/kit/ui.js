// Motion Prompt #049-072 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#049
//
// Kit for pack "ui" (UI component names / UIパーツの名前): the constants and helpers its elements share.
// Elements #049-072 · 542x191 px · cycle 4.5 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 542; c.height = 191; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 4.5;   // seconds, 0 <= u < 4.5
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 542, 191);
//          k.save(); cell(k, 542, 191, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// Text is the only locale-dependent part of the drawing. Standalone kits
// may set MP_LANGUAGE before this code; all geometry and timing stay fixed.
const MP_LANG = typeof MP_LANGUAGE === 'string' ? MP_LANGUAGE : 'zh-Hans';
const MP_LABELS = {"開く": "打开", "メニュー": "菜单", "詳細を見る": "查看详情", "選択してください": "请选择", "名古屋": "名古屋", "東京": "东京", "大阪": "大阪", "福岡": "福冈", "小さな説明が出る": "这里显示简短说明", "詳細": "详情", "保存": "保存", "保存しました": "已保存", "概要": "概览", "料金": "价格", "レビュー": "评价", "日": "日", "週": "周", "月": "月", "すべて": "全部", "新着": "最新", "人気": "热门", "無料": "免费", "価格": "价格", "ホーム": "首页", "講座": "课程", "Web制作": "网页设计", "製品": "产品", "サポート": "支持", "入力": "信息", "確認": "确认", "支払い": "支付", "完了": "完成", "次へ": "下一步", "送信": "发送", "まだ何もありません": "暂无内容", "追加する": "添加"};
function mpText(value) {
  const s = String(value);
  if (MP_LANG !== 'zh-Hans') return s;
  if (Object.prototype.hasOwnProperty.call(MP_LABELS, s)) return MP_LABELS[s];
  return s;
}
// UIパーツの名前 24（カード 542x191 = 元動画のカード窓 542x222 から窓の上枠 31px を除いた中身）。
// 各コマは時間 u の純関数。1周期 CYC=4.5秒。カーソル（指）の動きがきっかけで部品が動く。
const CW = 542, CH = 191, CYC = 4.5;

// パックの色（地・文字・差し色）
const C = {
  bg: '#f5f3f1', card: '#ffffff', border: '#dcdbdb', dot: '#dddddd', url: '#eeeeeb', sep: '#ecebe9',
  line: '#e6e4e3', line2: '#d6d4d2', block: '#f0efed', ink: '#111111', en: '#7b7975', hint: '#868482',
  blue: '#1f5ae8', lb: '#eef3fe', mb: '#cad9f9', sb: '#a3bef7', scroll: '#c9c7c5', dark: '#26282c'
};
const JP = '"Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif';
const NUMF = 'system-ui,-apple-system,"Helvetica Neue",sans-serif';

// 描画の補助関数は元のまま X（2D コンテキスト）に描く。ui() が毎回 X を渡された k に向け、白地を敷いてから描く
let X = null;
const ui = draw => (k, w, h, u) => { X = k; k.fillStyle = C.card; k.fillRect(0, 0, w, h); draw(w, h, u); };

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const lerp = (a, b, k) => a + (b - a) * k;
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); X.beginPath(); X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath(); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); X.fillStyle = c; X.fill(); }
function strokeRR(x, y, w, h, r, c, lw = 1.5) { rr(x, y, w, h, r); X.strokeStyle = c; X.lineWidth = lw; X.stroke(); }
function bar(x, y, w, c = C.line, h = 9) { fillRR(x, y, w, h, h / 2, c); }
function text(s, x, y, size, color, weight = 500, align = 'left', font = JP) { X.font = `${weight} ${size}px ${font}`; X.fillStyle = color; X.textAlign = align; X.textBaseline = 'middle'; X.fillText(mpText(s), x, y); }
function tw(s, size, weight = 500, font = JP) { X.font = `${weight} ${size}px ${font}`; return X.measureText(mpText(s)).width; }
function circle(x, y, r, c) { X.beginPath(); X.arc(x, y, r, 0, Math.PI * 2); X.fillStyle = c; X.fill(); }
function ring(x, y, r, c, lw = 2) { X.beginPath(); X.arc(x, y, r, 0, Math.PI * 2); X.strokeStyle = c; X.lineWidth = lw; X.stroke(); }
function shadowed(fn, blur = 18, oy = 6, a = .14) { X.save(); X.shadowColor = `rgba(20,24,40,${a})`; X.shadowBlur = blur; X.shadowOffsetY = oy; fn(); X.restore(); }
function chevron(x, y, s, rot, c, lw = 2.2) { X.save(); X.translate(x, y); X.rotate(rot); X.beginPath(); X.moveTo(-s, -s / 2); X.lineTo(0, s / 2); X.lineTo(s, -s / 2); X.strokeStyle = c; X.lineWidth = lw; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); X.restore(); }
function check(x, y, s, c, lw = 2.6) { X.beginPath(); X.moveTo(x - s, y); X.lineTo(x - s * .3, y + s * .7); X.lineTo(x + s, y - s * .7); X.strokeStyle = c; X.lineWidth = lw; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); }
function mountains(x, y, w, h, tint = 0) {
  X.save(); rr(x, y, w, h, 8); X.clip();
  X.fillStyle = tint ? '#e3ebfd' : C.lb; X.fillRect(x, y, w, h);
  X.fillStyle = C.mb; X.beginPath(); X.moveTo(x, y + h); X.lineTo(x + w * .28, y + h * .42); X.lineTo(x + w * .5, y + h * .72); X.lineTo(x + w * .72, y + h * .35); X.lineTo(x + w, y + h * .8); X.lineTo(x + w, y + h); X.fill();
  X.fillStyle = C.sb; X.beginPath(); X.moveTo(x + w * .3, y + h); X.lineTo(x + w * .55, y + h * .62); X.lineTo(x + w * .8, y + h); X.fill();
  circle(x + w * .82, y + h * .26, Math.min(w, h) * .09, C.mb);
  X.restore();
}
// カーソル（矢印）。keys=[[t,x,y],...]、clicks=[t,...]
function track(keys, t) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (t <= b[0]) { const k = eio((t - a[0]) / (b[0] - a[0] || 1)); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; } }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
}
function ripple(x, y, clicks, t) {
  for (const c of clicks) { const k = (t - c) / .45; if (k >= 0 && k <= 1) { ring(x, y, 7 + 22 * eo(k), `rgba(31,90,232,${.75 * (1 - k)})`, 3); } }
}
function pointer(keys, clicks, t) {
  const [x, y] = track(keys, t);
  ripple(x, y, clicks, t);
  const pressed = clicks.some(c => t >= c - .07 && t < c + .1);
  X.save(); X.translate(x, y); const s = pressed ? 1.0 : 1.18; X.scale(s, s);
  X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 22); X.lineTo(5.5, 17); X.lineTo(9.5, 26); X.lineTo(13, 24.5); X.lineTo(9, 15.8); X.lineTo(16, 15.8); X.closePath();
  X.lineJoin = 'round'; X.strokeStyle = '#fff'; X.lineWidth = 3; X.stroke(); X.fillStyle = '#111'; X.fill();
  X.restore();
}
function finger(keys, downs, t, visible) {
  if (!visible) return; const [x, y] = track(keys, t);
  ripple(x, y, downs, t);
  circle(x, y, 17, 'rgba(17,17,17,.24)'); ring(x, y, 17, 'rgba(255,255,255,.95)', 2.5);
}
// よく使う背景のワイヤーフレーム
function pageLines(x, y, w) { bar(x, y, w * .45, C.line2, 11); bar(x, y + 24, w, C.line); bar(x, y + 42, w * .78, C.line); }
const CELLS = [];
