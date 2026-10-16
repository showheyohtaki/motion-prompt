// Motion Prompt #097-120 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#097
//
// Kit for pack "photo" (Photo looks, lighting & styles / 写真の表現・光と画風): the constants and helpers its elements share.
// Elements #097-120 · 539x208 px · cycle 5 s. Element code: https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/<id>.txt (or /ja/).
//
// Run one element standalone in a browser:
//   1. paste this file into a <script>,
//   2. paste the element code below it (it assigns CELLS[n - 1], n = the element number inside the pack),
//   3. then add:
//        const c = document.createElement('canvas'); c.width = 539; c.height = 208; document.body.append(c);
//        const k = c.getContext('2d'), cell = CELLS.find(Boolean), t0 = performance.now();
//        (function loop() {
//          const u = ((performance.now() - t0) / 1000) % 5;   // seconds, 0 <= u < 5
//          k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 539, 208);
//          k.save(); cell(k, 539, 208, u); k.restore();
//          requestAnimationFrame(loop);
//        })();
// Every cell is a pure function of u, so the same call renders video frames: u = frame / fps.

// @kit
// 写真の表現・光と画風 24（カード 539x208、1周 5秒）。各コマは時間 u の純関数。
// 絵は平らな図形だけで描く。場面は3つを全コマで使い回す: ①光＝地平線の前の胸像 ②レンズ＝街角 ③仕上げ＝胸像と風景。
// 人物は顔・髪のない丸い頭のピクト。光はアンバー1色の面、影は一段濃い平らな面で表す。
// 色が主役の効果（モノクロ・デュオトーンなど）は、同じ場面の色の割り当て（パレット）を差し替えて見せる。
// 多くの見本は「効果なし → あり → なし」を env(u) で切り替える（0.4〜1.4秒で入り、4.0秒まで保ち、4.8秒までに戻る）。
const CW = 539, CH = 208, CYC = 5;
const TAU = Math.PI * 2;
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
// 効果の量: 0（なし）→ 1（あり）→ 0。イージングは3次のイーズインアウト
const IN0 = 0.4, IN1 = 1.4, OUT0 = 4.0, OUT1 = 4.8;
const env = u => eIO(P(u, IN0, IN1)) * (1 - eIO(P(u, OUT0, OUT1)));
// 固定シードの乱数（mulberry32）
function rng(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// 1回だけ作って使い回す物（中身は固定なので毎回同じ）
const MEMO = {};
const once = (name, fn) => MEMO[name] || (MEMO[name] = fn());

// ---------- 色 ----------
const HEX = {};
const hx = s => HEX[s] || (HEX[s] = [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)));
const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => t <= 0 ? a : t >= 1 ? b : toHex(hx(a).map((v, i) => lerp(v, hx(b)[i], t)));
const lum = s => { const c = hx(s); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
// パレット同士を t で混ぜる（効果の入り・戻りはこれで色を移す）
const pal = (a, b, t) => { if (t <= 0) return a; if (t >= 1) return b; const o = {}; for (const key in a) o[key] = mixc(a[key], b[key], t); return o; };
const mapPal = (a, f) => { const o = {}; for (const key in a) o[key] = f(a[key]); return o; };

// 基本の場面の色: 明るいニュートラル（camera パックと同じ灰色の段）＋人物の青みグレー＋光のアンバー
const BASE = {
  sky: '#FAF9F7', sky2: '#FAF9F7', far: '#EAEDF1', mid: '#DEE3EA', ground: '#F1F0EE', ground2: '#E2E1DE', mark: '#FAF9F7', cast: '#E2E1DE',
  bld: '#F1F0EE', edge: '#CFCECB', win: '#E2E1DE', winOff: '#E2E1DE', tree: '#E2E1DE', trunk: '#CFCECB', post: '#A9A8A5', bulb: '#CFCECB',
  person: '#4D5A75', shade: '#33405A', lit: '#FFC75A', car: '#8D97AA', glass: '#EEF1F5', tire: '#3E4452',
  sun: '#F5A524', glow: '#FFE3A3'
};
// 周りの明かりを落とした場面（ライティングの見本で、光の当たる所だけを見せる）
const DIM = {
  sky: '#E7E5E1', sky2: '#E7E5E1', far: '#DADCDF', mid: '#CFD2D7', ground: '#DDDBD7', ground2: '#D0CECA', mark: '#E7E5E1', cast: '#D0CECA',
  bld: '#DDDBD7', edge: '#C0BEBA', win: '#D0CECA', winOff: '#D0CECA', tree: '#D0CECA', trunk: '#C0BEBA', post: '#9D9B97', bulb: '#C0BEBA',
  person: '#4D5A75', shade: '#2C3750', lit: '#FFC75A', car: '#7E889B', glass: '#DDE1E7', tire: '#353B48',
  sun: '#F5A524', glow: '#FFE3A3'
};
// 夜（ブルーアワー・長時間露光）。窓と街灯はアンバーに灯る
const NIGHT = {
  sky: '#2C3B5E', sky2: '#4A6191', far: '#34466D', mid: '#2C3C60', ground: '#283452', ground2: '#222C47', mark: '#3A4A70', cast: '#1F2840',
  bld: '#34446B', edge: '#283657', win: '#FFC75A', winOff: '#2A3859', tree: '#2F3F64', trunk: '#253252', post: '#1E2843', bulb: '#FFC75A',
  person: '#1C2439', shade: '#141B2D', lit: '#FFC75A', car: '#222C47', glass: '#3A4A70', tire: '#141B2D',
  sun: '#F5A524', glow: '#FFE3A3'
};
// 暗い場面（リムライト・ローキー）
const DARK = {
  sky: '#2B2D33', sky2: '#2B2D33', far: '#313339', mid: '#36383E', ground: '#24252A', ground2: '#202125', mark: '#2B2D33', cast: '#1D1E22',
  bld: '#2F3137', edge: '#27292E', win: '#34363C', winOff: '#34363C', tree: '#323439', trunk: '#2A2C31', post: '#3B3D43', bulb: '#3B3D43',
  person: '#1F2128', shade: '#18191E', lit: '#FFC75A', car: '#303238', glass: '#3B3D43', tire: '#18191E',
  sun: '#F5A524', glow: '#FFE3A3'
};

// ---------- 図形 ----------
// 図形を描く道具。M（点の写像）を渡すと、輪郭を細かく刻んでから写す（魚眼用）。M がなければそのまま描く
function arcPts(x, y, r, n = 40) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return o; }
function rrPts(x, y, w, h, r) {
  const R = (Array.isArray(r) ? r : [r, r, r, r]).map(v => Math.min(v, w / 2, h / 2)), o = [];
  const corner = (cx, cy, rad, a0) => { if (rad <= 0) { o.push([cx, cy]); return; } for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; o.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } };
  corner(x + w - R[1], y + R[1], R[1], -Math.PI / 2);
  corner(x + w - R[2], y + h - R[2], R[2], 0);
  corner(x + R[3], y + h - R[3], R[3], Math.PI / 2);
  corner(x + R[0], y + R[0], R[0], Math.PI);
  return o;
}
function pen(k, M) {
  const cut = (pts, closed) => {
    const o = [], n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n], m = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6));
      for (let j = 0; j < m; j++) o.push([lerp(a[0], b[0], j / m), lerp(a[1], b[1], j / m)]);
    }
    if (!closed) o.push(pts[n - 1]);
    return o.map(q => M(q[0], q[1]));
  };
  const path = (pts, closed) => { const q = M ? cut(pts, closed) : pts; k.beginPath(); q.forEach((p, i) => i ? k.lineTo(p[0], p[1]) : k.moveTo(p[0], p[1])); if (closed) k.closePath(); };
  const D = {
    k,
    poly(pts, col) { path(pts, true); k.fillStyle = col; k.fill(); },
    rect(x, y, w, h, col) { if (!M) { k.fillStyle = col; k.fillRect(x, y, w, h); } else D.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col); },
    rr(x, y, w, h, r, col) { if (!M) { k.fillStyle = col; k.beginPath(); k.roundRect(x, y, w, h, r); k.fill(); } else D.poly(rrPts(x, y, w, h, r), col); },
    circ(x, y, r, col) { if (!M) { k.fillStyle = col; k.beginPath(); k.arc(x, y, r, 0, TAU); k.fill(); } else D.poly(arcPts(x, y, r), col); },
    line(pts, lw, col, dash) { path(pts, false); k.strokeStyle = col; k.lineWidth = lw; k.lineCap = 'round'; k.lineJoin = 'round'; if (dash) k.setLineDash(dash); k.stroke(); if (dash) k.setLineDash([]); },
    frame(x, y, w, h, lw, col) { path([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); k.strokeStyle = col; k.lineWidth = lw; k.stroke(); }
  };
  return D;
}

// 小物（3つの場面で共通）: 建物・木・街灯・太陽・車
function building(D, x, base, w, h, p, seed = 0) {
  D.rect(x, base - h, w, h, p.bld); D.frame(x, base - h, w, h, 1.4, p.edge);
  let n = seed;
  for (let y = base - h + 8; y < base - 12; y += 13) for (let xx = x + 7; xx < x + w - 9; xx += 11) { n++; D.rect(xx, y, 5, 7, (n * 7 + seed) % 3 === 0 ? p.win : p.winOff); }
}
function tree(D, x, base, r, p) { D.rect(x - r * 0.15, base - r * 1.4, r * 0.3, r * 1.4, p.trunk); D.circ(x, base - r * 1.6, r, p.tree); }
function lamp(D, x, base, h, p) { D.rect(x - 1.6, base - h, 3.2, h, p.post); D.rect(x - 1.6, base - h, 10, 3, p.post); D.circ(x + 9, base - h + 5, 4, p.bulb); }
// 太陽: 平らな2段の光の輪＋円
function sun(D, x, y, r, p, a = 1) {
  const k = D.k; k.save();
  k.globalAlpha = 0.35 * a; D.circ(x, y, r * 2.6, p.glow);
  k.globalAlpha = 0.6 * a; D.circ(x, y, r * 1.7, p.glow);
  k.globalAlpha = a; D.circ(x, y, r, p.sun);
  k.restore();
}
function car(D, x, p, o = {}) {   // x = 車の中心、道の奥の車線を走る
  D.rr(x - 22, 128, 42, 13, [6, 6, 0, 0], p.car);
  D.rr(x - 18, 131, 16, 8, 2, p.glass); D.rr(x + 1, 131, 15, 8, 2, p.glass);
  D.rr(x - 35, 140, 70, 15, 5, p.car);
  D.rr(x + 30, 143, 5, 4, 1.5, o.head || p.glass); D.rr(x - 35, 143, 4, 4, 1.5, o.tail || p.edge);
  D.circ(x - 21, 156, 6, p.tire); D.circ(x + 21, 156, 6, p.tire);
  D.circ(x - 21, 156, 2.2, p.glass); D.circ(x + 21, 156, 2.2, p.glass);
}

// 人のピクト（全身）。camera パックと同じ組み方（頭・胴・腕・脚の角丸）。x = 足元の中心、feet = 足元の y、s = 身長(px)
function figure(D, x, feet, s, col) {
  const m = s / 1.79, X = v => x + v * m, Y = v => feet - v * m;
  D.rr(X(-0.155), Y(0.88), 0.15 * m, 0.88 * m, 0.07 * m, col); D.rr(X(0.005), Y(0.88), 0.15 * m, 0.88 * m, 0.07 * m, col);
  D.rr(X(-0.31), Y(1.40), 0.12 * m, 0.6 * m, 0.06 * m, col); D.rr(X(0.19), Y(1.40), 0.12 * m, 0.6 * m, 0.06 * m, col);
  D.rr(X(-0.23), Y(1.46), 0.46 * m, 0.64 * m, 0.12 * m, col);
  D.circ(x, Y(1.63), 0.16 * m, col);
}
// 胸から上のピクト（同じ組み方を頭の半径 R で切り出す）。cx,cy = 頭の中心
function bustPath(k, cx, cy, R) {
  k.beginPath(); k.arc(cx, cy, R, 0, TAU);
  k.roundRect(cx - 1.4375 * R, cy + 1.0625 * R, 2.875 * R, CH, 0.75 * R);
  k.roundRect(cx - 1.9375 * R, cy + 1.4375 * R, 0.75 * R, CH, 0.375 * R);
  k.roundRect(cx + 1.1875 * R, cy + 1.4375 * R, 0.75 * R, CH, 0.375 * R);
}
// 胸像を色 col で塗り、paint(k) で光と影の面を胸像の形の中だけに塗る
function bust(k, cx, cy, R, col, paint) {
  k.save(); bustPath(k, cx, cy, R); k.fillStyle = col; k.fill();
  if (paint) { k.clip(); paint(k); }
  k.restore();
}
// 頭の影の面: 光が横から角度 az（0 = 正面、90° = 真横）で当たるとき、明暗の境は x = cx ± cos(az)·√(R²−dy²)。side = +1 で右側が影
function headShade(k, cx, cy, R, az, side, col) {
  const c = Math.cos(az), n = 28; k.beginPath();
  for (let i = 0; i <= n; i++) { const y = cy - R + 2 * R * i / n; k.lineTo(cx + side * c * Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)), y); }
  k.lineTo(cx + side * (R + 4), cy + R); k.lineTo(cx + side * (R + 4), cy - R); k.closePath(); k.fillStyle = col; k.fill();
}

// ---------- 3つの場面 ----------
// ① 光: 地平線（y150）の前の胸像。左に建物2棟、右に街灯と木
const PX = 270, PY = 78, PR = 29, HZ = 150;
function stagePortrait(k, p, o = {}) {
  const D = pen(k);
  D.rect(0, 0, CW, CH, p.sky); D.rect(0, 92, CW, HZ - 92, p.sky2);
  if (o.sun) sun(D, o.sun[0], o.sun[1], o.sun[2], p, o.sun[3]);
  D.poly([[0, HZ], [0, 134], [70, 124], [150, 136], [230, 126], [330, 134], [420, 122], [539, 132], [539, HZ]], p.far);
  building(D, 34, HZ, 38, 50, p, 1); building(D, 76, HZ, 30, 32, p, 2);
  D.rect(0, HZ, CW, CH - HZ, p.ground);
  if (o.cast) { const L = o.cast; D.poly([[402, HZ], [405, HZ], [405 + L, HZ + 9], [402 + L, HZ + 9]], p.cast); D.poly([[452, HZ], [460, HZ], [460 + L * 0.9, HZ + 16], [452 + L * 0.9, HZ + 16]], p.cast); }
  lamp(D, 404, HZ, 58, p); tree(D, 456, HZ, 17, p);
  if (o.after) o.after(D);
}
// ② レンズ: 街角。奥に建物の列・木・街灯、手前に道と歩道、人物は左手前
const BLD = [[-8, 52, 66], [48, 40, 90], [92, 54, 58], [150, 44, 78], [208, 32, 52], [296, 52, 84], [352, 48, 60], [404, 42, 98], [470, 40, 70], [514, 40, 88]];
const TREES = [[136, 17], [262, 17], [384, 15]], LAMPS = [114, 292, 494], ROAD = 132, WALK = 162;
const FIG = [176, 200, 124];   // 人物: 足元の x・y、身長
function stageStreet(k, p, o = {}) {
  const D = pen(k, o.M);
  D.rect(-40, -40, CW + 80, CH + 80, p.sky);
  if (o.sun) sun(D, o.sun[0], o.sun[1], o.sun[2], p, o.sun[3]);
  BLD.forEach(([x, w, h], i) => building(D, x, ROAD, w, h, p, i));
  TREES.forEach(([x, r]) => tree(D, x, ROAD, r, p));
  LAMPS.forEach(x => lamp(D, x, ROAD, 58, p));
  D.rect(-40, ROAD, CW + 80, WALK - ROAD, p.ground2);
  D.line([[-40, 147], [CW + 40, 147]], 2, p.mark, [14, 12]);
  if (o.car !== undefined && o.car !== false) car(D, o.car, p, o.carLights || {});
  D.rect(-40, WALK, CW + 80, CH - WALK + 40, p.ground); D.line([[-40, WALK], [CW + 40, WALK]], 1.4, p.edge);
  if (o.person !== false) figure(D, FIG[0], FIG[1], FIG[2], p.person);
  D.circ(18, 206, 17, p.tree); D.circ(42, 210, 11, p.tree); D.circ(516, 204, 19, p.tree); D.circ(494, 211, 11, p.tree);
  if (o.after) o.after(D);
}
// ③ 仕上げ: 左に胸像、右に丘と家と木と太陽。日は右から当たり、胸像の右の縁が光る
const QX = 140, QY = 82, QR = 28;
function stageLand(k, p, o = {}) {
  const D = pen(k);
  D.rect(0, 0, CW, CH, p.sky); D.rect(0, 100, CW, 60, p.sky2);
  if (o.sunOn !== false) sun(D, 432, 54, 15, p);
  if (o.land !== false) {
    D.poly([[150, 162], [150, 130], [210, 116], [262, 124], [318, 100], [372, 114], [430, 104], [490, 120], [539, 110], [539, 162]], p.far);
    building(D, 346, 134, 30, 24, p, 3);
    D.poly([[150, 162], [150, 146], [226, 136], [300, 144], [368, 130], [440, 140], [500, 132], [539, 136], [539, 162]], p.mid);
    D.rect(0, 160, CW, CH - 160, p.ground);
    tree(D, 486, 162, 19, p); tree(D, 452, 162, 12, p);
  } else D.rect(0, 160, CW, CH - 160, p.ground);
  if (o.person !== false) bust(k, QX, QY, QR, p.person, kk => { headShade(kk, QX, QY, QR, 0.86, 1, p.lit); kk.fillStyle = p.lit; kk.fillRect(QX + 1.55 * QR, QY + QR, QR, CH); });
  if (o.after) o.after(D);
}

// ---------- 表示 ----------
// 右上の数値（camera パックと同じ控えめな札）
function hud(k, s) {
  k.save(); k.globalAlpha = 1;
  const m = 13, f = `600 15px ${MONO}`; k.font = f; const ww = k.measureText(s).width;
  k.fillStyle = 'rgba(255,255,255,.82)'; k.beginPath(); k.roundRect(CW - m - 14 - ww - 10, m + 6, ww + 20, 23, 6); k.fill();
  k.fillStyle = '#6E6E73'; k.textAlign = 'right'; k.textBaseline = 'middle'; k.fillText(s, CW - m - 14, m + 18);
  k.restore();
}
// 右下の、真上から見た配置図: 頭（下がカメラ側）と光の位置。lights = [[角度, 明るさ0..1]]、角度は 0 = カメラ側、+90° = 画面の左
function plan(k, lights) {
  const w = 66, h = 66, x = CW - 13 - w, y = CH - 13 - h, cx = x + w / 2, cy = y + h / 2 - 3;
  k.save();
  k.fillStyle = 'rgba(255,255,255,.9)'; k.beginPath(); k.roundRect(x, y, w, h, 8); k.fill();
  k.strokeStyle = '#E3E1DC'; k.lineWidth = 1.2; k.stroke();
  k.fillStyle = '#CFCECB'; k.beginPath(); k.roundRect(cx - 6, y + h - 10, 12, 6, 2); k.fill();
  k.fillStyle = '#A9A8A5'; k.beginPath(); k.arc(cx, cy, 8, 0, TAU); k.fill();
  k.beginPath(); k.moveTo(cx - 3.5, cy + 7); k.lineTo(cx + 3.5, cy + 7); k.lineTo(cx, cy + 12); k.fill();
  for (const [az, a] of lights) {
    const lx = cx - Math.sin(az) * 22, ly = cy + Math.cos(az) * 22;
    k.globalAlpha = a;
    k.strokeStyle = '#F5A524'; k.lineWidth = 1.4; k.setLineDash([2.5, 2.5]); k.beginPath(); k.moveTo(lx, ly); k.lineTo(lerp(lx, cx, 0.55), lerp(ly, cy, 0.55)); k.stroke(); k.setLineDash([]);
    k.fillStyle = '#F5A524'; k.beginPath(); k.arc(lx, ly, 4.5, 0, TAU); k.fill();
  }
  k.restore();
}
// 作業用のオフスクリーン（名前ごとに1枚・使う前に空にする）
const LAYERS = {};
function layer(name) {
  const c = LAYERS[name] || (LAYERS[name] = (() => { const e = document.createElement('canvas'); e.width = CW; e.height = CH; return e; })());
  const kk = c.getContext('2d'); kk.globalAlpha = 1; kk.filter = 'none'; kk.globalCompositeOperation = 'source-over'; kk.clearRect(0, 0, CW, CH);
  return [c, kk];
}
const cell = fn => (k, w, h, u) => { k.save(); fn(k, u); k.restore(); };

// 胴の光と影（胴は円柱とみなし、左右に分けて塗る）。W = 胴の外側までの半幅
const torsoW = R => 1.9375 * R;
function torso(k, cx, cy, R, x0, x1, col) { k.fillStyle = col; k.fillRect(x0, cy + R, x1 - x0, CH); }
// 時刻の表示（分 → hh:mm）
const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
// 右下の小さなヒストグラム（明るさの分布）。c = 山の中心 0..1、s = 山の幅
function histo(k, c, s) {
  const w = 96, h = 46, x = CW - 13 - w, y = CH - 13 - h, n = 20;
  k.save();
  k.fillStyle = 'rgba(255,255,255,.9)'; k.beginPath(); k.roundRect(x, y, w, h, 8); k.fill();
  k.strokeStyle = '#E3E1DC'; k.lineWidth = 1.2; k.stroke();
  k.fillStyle = '#A9A8A5';
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, v = Math.exp(-((t - c) ** 2) / (2 * s * s)) * 0.92 + 0.06; const bh = v * (h - 16); k.fillRect(x + 8 + i * (w - 16) / n, y + h - 8 - bh, (w - 16) / n - 1.2, bh); }
  k.restore();
}

const CELLS = [];
