// Motion Prompt #073-096 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#073
//
// Kit for pack "lp" (Landing page & web effects / LP・Webサイトの演出): the constants and helpers its elements share.
// Elements #073-096 · 539x208 px · cycle 4.8 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 539; c.height = 208; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 4.8;   // seconds, 0 <= u < 4.8
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 539, 208);
//          k.save(); cell(k, 539, 208, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// Text is the only locale-dependent part of the drawing. Standalone kits
// may set MP_LANGUAGE before this code; all geometry and timing stay fixed.
const MP_LANG = typeof MP_LANGUAGE === 'string' ? MP_LANGUAGE : 'zh-Hans';
const MP_LABELS = {"料金": "价格", "特長": "特点", "無料で試す": "免费试用", "山へ、行こう。": "去山里走走。", "予約する": "立即预订", "人気のコース": "热门课程", "暮らしを、軽く。": "让生活更轻松。", "詳しく見る": "了解详情", "選ばれる3つの理由": "选择我们的三个理由", "新しい毎日を、": "开启新的一天", "期間限定キャンペーン実施中": "限时优惠进行中", "3ステップで完成": "三步即可完成", "使ってみる": "试用体验", "知ってもらう": "了解我们", "はじめてのWebデザイン": "网页设计入门", "毎日のごはんが": "每日三餐", "たった10分で": "只需十分钟", "作れる。": "轻松完成。", "はじめてでも": "初次下厨", "失敗しないレシピ": "也能掌握的食谱", "だけ。": "精选推荐。", "忙しい人のための": "献给忙碌的你", "台所の新しい相棒": "厨房里的新伙伴", "山の宿": "山中小屋", "海の宿": "海滨旅舍", "星の宿": "观星小屋", "夏の山小屋": "夏日山间小屋", "海辺のカフェ": "海边咖啡馆", "作品を見る": "查看作品", "お問い合わせ": "联系我们", "お申し込み": "报名申请", "送信する": "提交", "サービス": "服务", "実績": "案例", "会社概要": "关于我们", "はじめての方へ": "初次使用指南", "申し込む": "立即报名", "ちょっと待って！": "请稍等！", "今なら初回 10%OFF": "首次体验限时九折", "クーポンを受け取る": "领取优惠券", "ようこそ。": "欢迎。", "始める": "开始", "ギャラリー": "图片库", "← 一覧へ": "← 返回列表", "ちょうどいい道具を。": "找到称手的工具。", "はじめる": "开始", "アプリで、": "用应用，", "もっと身軽に。": "让生活更轻松。", "ダウンロード": "下载", "BEFORE": "处理前", "AFTER": "处理后", "WORKS": "作品", "Hello, Future.": "你好，未来。", "CREATIVE STUDIO": "创意工作室", "Project 02": "项目 02"};
function mpText(value) {
  const s = String(value);
  if (MP_LANG !== 'zh-Hans') return s;
  if (Object.prototype.hasOwnProperty.call(MP_LABELS, s)) return MP_LABELS[s];
  return s;
}
// LP・Webサイトの演出の名前 24（各カード 539x208・4.8秒周期。各コマは時間 u の純関数）
// カードの中にブラウザの窓を1つ描き、その中の簡略化したページで演出を見せる。
// きっかけ（スクロールバー・カーソル・クリック）も一緒に描く。色は 地・文字・差し色（朱）＋写真用の青。
const CW = 539, CH = 208;
const CYC = 4.8;                                   // 各カードは4.8秒周期（ループの継ぎ目なし）
const C = {
  desk: '#E7EAF0', win: '#FFFFFF', bar: '#F3F5F8', rule: '#E2E6ED', ink: '#1C2333', sub: '#7D879B',
  faint: '#DCE1EA', soft: '#F3F5F9', skel: '#E4E8EF', acc: '#FF5A2C', accL: '#FFE5DB', blue: '#3B64E8', blueL: '#E1E8FF'
};
const JP = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif';
const EN = '"Avenir Next", "Helvetica Neue", system-ui, sans-serif';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // easeInOut（3乗）
const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;      // easeInOut（2乗）
const eOut = x => 1 - Math.pow(1 - x, 3);                                      // easeOut（3乗）
const eIn = x => x * x * x;
const mod = (a, n) => ((a % n) + n) % n;
// GSAP の elastic.out(1, 0.3) と同じ式
const eEl = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x - 0.075) * 2 * Math.PI / 0.3) + 1;
function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
function txt(k, s, x, y, font, col, align = 'left', base = 'alphabetic', ls = '0px') {
  k.font = font; k.fillStyle = col; k.textAlign = align; k.textBaseline = base; k.letterSpacing = ls; k.fillText(mpText(s), x, y); k.letterSpacing = '0px';
}
// キーフレーム [[秒, 値], …] を easeInOut（3乗）でつなぐ。u は周期で折り返す
function steps(keys, u) {
  u = mod(u, CYC);
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i]; return lerp(a, b, eIO((u - t0) / (t1 - t0))); }
  return keys[keys.length - 1][1];
}
// カーソルの通り道 [[秒, x, y], …]（easeInOut 3乗でつなぐ）
function path(keys, u) {
  u = mod(u, CYC);
  if (u <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const a = keys[i - 1], b = keys[i], f = eIO((u - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], f), lerp(a[2], b[2], f)]; }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
}
// on(t) が最後に切り替わった時刻から dur 秒の遷移（CSS の transition と同じ考え方）。過去へさかのぼって調べる
function trans(on, u, dur, ease = eOut) {
  const s = on(u);
  for (let i = 0, t = u; i < 600; i++, t -= 1 / 120) if (on(t - 1 / 120) !== s) { const q = ease(P(u, t, t + dur)); return s ? q : 1 - q; }
  return s ? 1 : 0;
}
// ブラウザの窓。中のページは V（511x168）の座標で描く
const WIN = { x: 14, y: 8, w: 511, h: 192, r: 10, bar: 24 };
const VW = WIN.w, VH = WIN.h - WIN.bar;
function frame(k, url = 'example.com') {
  k.fillStyle = C.desk; k.fillRect(0, 0, CW, CH);
  k.save(); k.shadowColor = 'rgba(28,35,51,.16)'; k.shadowBlur = 16; k.shadowOffsetY = 4;
  k.fillStyle = C.win; rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.fill(); k.restore();
  k.save(); rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.clip();
  k.fillStyle = C.bar; k.fillRect(WIN.x, WIN.y, WIN.w, WIN.bar); k.fillStyle = C.rule; k.fillRect(WIN.x, WIN.y + WIN.bar - 1, WIN.w, 1); k.restore();
  for (let i = 0; i < 3; i++) { k.fillStyle = '#CDD3DD'; k.beginPath(); k.arc(WIN.x + 15 + i * 12, WIN.y + 12, 3.6, 0, 7); k.fill(); }
  k.fillStyle = '#E6E9EF'; rr(k, WIN.x + WIN.w / 2 - 110, WIN.y + 5, 220, 14, 7); k.fill();
  txt(k, url, WIN.x + WIN.w / 2, WIN.y + 12.5, `500 9.5px ${EN}`, C.sub, 'center', 'middle');
}
function view(k, fn) {
  k.save(); rr(k, WIN.x, WIN.y + WIN.bar, VW, VH, [0, 0, WIN.r, WIN.r]); k.clip(); k.translate(WIN.x, WIN.y + WIN.bar);
  k.fillStyle = '#fff'; k.fillRect(0, 0, VW, VH); fn(); k.restore();
}
// スクロールバー（つまみだけ。pos 0〜1、ratio＝見えている割合）
function sbar(k, pos, ratio = 0.42) { const th = (VH - 8) * ratio; k.fillStyle = 'rgba(28,35,51,.38)'; rr(k, VW - 9, 4 + (VH - 8 - th) * clamp(pos), 5, th, 2.5); k.fill(); }
// 文字の代わりの棒（n 行。最後の行は短い）
function bars(k, x, y, w, n, col = C.faint, hh = 6, gap = 11, last = 0.62) {
  k.fillStyle = col; for (let i = 0; i < n; i++) { rr(k, x, y + i * gap, i === n - 1 && n > 1 ? w * last : w, hh, hh / 2); k.fill(); }
}
// 写真の代わりの絵（空・太陽・山）。v で色ちがい、z で中身だけ拡大（枠は固定）
const PICS = [
  { sky: ['#A9C0FF', '#E4EBFF'], sun: '#FF5A2C', sx: .74, sy: .32, m1: '#7D9AF4', m2: '#4B6BDB' },
  { sky: ['#FFC7B2', '#FFEDE5'], sun: '#FFFFFF', sx: .28, sy: .34, m1: '#F4977A', m2: '#DD5F3B' },
  { sky: ['#3A4884', '#7484CC'], sun: '#FFE5DB', sx: .6, sy: .3, m1: '#2B3770', m2: '#1C2349' }
];
const M1 = [[0, .62], [.22, .4], [.42, .56], [.66, .3], [.86, .5], [1, .42]], M2 = [[0, .8], [.28, .6], [.5, .76], [.76, .58], [1, .74]];
function mount(k, w, h, pts, col, flip) { k.fillStyle = col; k.beginPath(); k.moveTo(flip ? w : 0, h + 1); pts.forEach(([a, b]) => k.lineTo((flip ? 1 - a : a) * w, b * h)); k.lineTo(flip ? 0 : w, h + 1); k.closePath(); k.fill(); }
function pic(k, x, y, w, h, v = 0, r = 6, z = 1) {
  const p = PICS[v % PICS.length];
  k.save(); rr(k, x, y, w, h, r); k.clip();
  k.translate(x + w / 2, y + h / 2); k.scale(z, z); k.translate(-w / 2, -h / 2);
  const g = k.createLinearGradient(0, 0, 0, h); g.addColorStop(0, p.sky[0]); g.addColorStop(1, p.sky[1]); k.fillStyle = g; k.fillRect(-1, -1, w + 2, h + 2);
  k.fillStyle = p.sun; k.beginPath(); k.arc(w * p.sx, h * p.sy, Math.min(w, h) * 0.13, 0, 7); k.fill();
  mount(k, w, h, M1, p.m1, v % 2); mount(k, w, h, M2, p.m2, (v + 1) % 2);
  k.restore();
}
function btn(k, x, y, w, h, label, col = C.acc, tcol = '#fff', fs = 12) {
  k.fillStyle = col; rr(k, x, y, w, h, h / 2); k.fill(); txt(k, label, x + w / 2, y + h / 2 + 0.5, `700 ${fs}px ${JP}`, tcol, 'center', 'middle');
}
function logo(k, x, y, col = C.ink) { k.fillStyle = C.acc; rr(k, x, y - 7, 14, 14, 4); k.fill(); txt(k, 'SAMPLE', x + 20, y + 0.5, `800 12px ${EN}`, col, 'left', 'middle', '1px'); }
// ページのヘッダー（高さ34）
const NAVX = [300, 346, 392];
function header(k, y, active = -1) {
  k.fillStyle = '#fff'; k.fillRect(0, y, VW, 34); k.fillStyle = C.rule; k.fillRect(0, y + 33, VW, 1);
  logo(k, 18, y + 17);
  ['特長', '料金', 'FAQ'].forEach((s, i) => txt(k, s, NAVX[i], y + 17.5, `600 12px ${JP}`, active === i ? C.acc : C.ink, 'left', 'middle'));
  btn(k, 428, y + 7, 70, 20, '無料で試す', C.acc, '#fff', 10.5);
}
// マウスのカーソル（矢印）。press で少し縮む
function cursor(k, x, y, press = 0) {
  const s = 1.2 * (1 - 0.12 * press);
  k.save(); k.translate(x, y); k.scale(s, s); k.beginPath();
  [[0, 0], [0, 16.5], [4.2, 12.6], [7, 19], [9.8, 17.8], [7.1, 11.6], [12.6, 11.6]].forEach(([a, b], i) => i ? k.lineTo(a, b) : k.moveTo(a, b));
  k.closePath(); k.lineJoin = 'round'; k.lineWidth = 1.6; k.strokeStyle = '#fff'; k.fillStyle = C.ink; k.fill(); k.stroke(); k.restore();
}
// クリックした所に出る小さな輪（0.35秒）と、押している間の縮み
function click(k, x, y, u, times) {
  let press = 0;
  for (const tc of times) {
    const d = mod(u - tc + 0.1, CYC) - 0.1;
    if (d > -0.1 && d < 0.12) press = Math.max(press, 1 - Math.abs(d - 0.01) / 0.11);
    if (d >= 0 && d < 0.35) { const q = d / 0.35; k.strokeStyle = `rgba(28,35,51,${0.45 * (1 - q)})`; k.lineWidth = 2; k.beginPath(); k.arc(x, y, 5 + 13 * eOut(q), 0, 7); k.stroke(); }
  }
  cursor(k, x, y, clamp(press));
}
// 回る読み込み表示（0.8秒で1回転）
function spinner(k, x, y, r, u, col = C.acc) {
  const a = u / 0.8 * Math.PI * 2;
  k.lineCap = 'round'; k.lineWidth = r * 0.28; k.strokeStyle = C.faint; k.beginPath(); k.arc(x, y, r, 0, 7); k.stroke();
  k.strokeStyle = col; k.beginPath(); k.arc(x, y, r, a, a + Math.PI * 0.6); k.stroke(); k.lineCap = 'butt';
}
// ページ上の top にある要素が、判定線 line より上に入った時刻（画面の下へ出たらリセット）。過去 CYC 秒をさかのぼる
function enteredAt(sy, top, line, u) {
  const dt = 1 / 120, y = t => top - sy(t);
  if (y(u) >= VH) return null;
  for (let t = u; t > u - CYC; t -= dt) {
    const a = y(t), b = y(t - dt);
    if (a >= VH) return null;
    if (a < line && b >= line) return t - dt + dt * (b - line) / (b - a);
  }
  return y(u) < line ? -1e9 : null;
}
const CELLS = [];
