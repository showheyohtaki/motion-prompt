/* Motion Prompt · pack "motion" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('motion', function (MP_LANGUAGE) {
  // @kit
  // Text is the only locale-dependent part of the drawing. Standalone kits
  // may set MP_LANGUAGE before this code; all geometry and timing stay fixed.
  const MP_LANG = typeof MP_LANGUAGE === 'string' ? MP_LANGUAGE : 'ja';
  const MP_LABELS = {"はじめまして": "你好，很高兴认识你", "ねこの動画つくって": "制作一段猫咪视频吧", "のびる": "拉伸中", "はねる": "弹跳中", "まわる": "旋转中", "ドン!": "砰！", "一定": "匀速", "緩急": "缓动"};
  function mpText(value) {
    const s = String(value);
    if (MP_LANG !== 'zh-Hans') return s;
    if (Object.prototype.hasOwnProperty.call(MP_LABELS, s)) return MP_LABELS[s];
    return s;
  }
  // モーショングラフィックスの演出の名前 24（各カード 539x208・4.7秒周期。各コマは時間 u の純関数）
  // カードの中だけ共通パレット（濃紺の地＋青・コーラル・黄・ミント）。
  const CW = 539, CH = 208;
  const CYC = 4.7;                          // 各カードは4.7秒周期（ループの継ぎ目なし）
  const C = {
    navy: '#0F1A3D', navy2: '#1B2A5E', navy3: '#2A3D80', dim: '#7F90C4',
    blue: '#3B7BFF', coral: '#FF6B5C', yel: '#FFC83D', mint: '#2EDBA8', white: '#FFFFFF', cream: '#FFF1D6'
  };
  const PAL = [C.blue, C.coral, C.yel, C.mint];
  const JP = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif';
  const DISP = '"Avenir Next", "Helvetica Neue", system-ui, sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const eOut5 = x => 1 - Math.pow(1 - x, 5);
  const eIn = x => x * x * x;
  const smooth = x => x * x * (3 - 2 * x);
  const mod = (a, n) => ((a % n) + n) % n;
  const backOut = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
  const backIn = (x, s = 1.70158) => (s + 1) * x * x * x - s * x * x;
  const spring = (t, w = 14, d = 7) => t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(w * t);   // 0→行き過ぎ→1
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function txt(ctx, s, x, y, font, col, align = 'left', base = 'alphabetic', ls = '0px') {
    ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = ls; ctx.fillText(mpText(s), x, y); ctx.letterSpacing = '0px';
  }
  function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
  function bez(x1, y1, x2, y2) {
    const cx_ = 3 * x1, bx = 3 * (x2 - x1) - cx_, ax = 1 - cx_ - bx;
    const cy_ = 3 * y1, by = 3 * (y2 - y1) - cy_, ay = 1 - cy_ - by;
    const sx = t => ((ax * t + bx) * t + cx_) * t, sy = t => ((ay * t + by) * t + cy_) * t;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 40; i++) { if (sx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return sy(t); };
  }
  function star(k, x, y, R, rot = 0, inner = 0.5, n = 5) { k.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? R * inner : R, a = rot - Math.PI / 2 + i * Math.PI / n; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? k.lineTo(px, py) : k.moveTo(px, py); } k.closePath(); }
  function heartPath(k, s) { k.beginPath(); k.moveTo(0, s * 0.92); k.bezierCurveTo(-s * 1.75, -s * 0.12, -s * 0.85, -s * 1.2, 0, -s * 0.42); k.bezierCurveTo(s * 0.85, -s * 1.2, s * 1.75, -s * 0.12, 0, s * 0.92); k.closePath(); }
  const G0 = mkCanvas(CW, CH), GK0 = G0.getContext('2d', { willReadFrequently: true });
  const G1 = mkCanvas(CW, CH), GK1 = G1.getContext('2d', { willReadFrequently: true });
  function stage(k, col = C.navy) { k.fillStyle = col; k.fillRect(0, 0, CW, CH); }
  // ぬるっとつながる形（描く→ぼかす→しきい値）。paint(ctx) で色を塗った結果のキャンバスを返す
  function goo(draw, blur, paint) {
    GK0.setTransform(1, 0, 0, 1, 0, 0); GK0.clearRect(0, 0, CW, CH); GK0.fillStyle = '#fff'; draw(GK0);
    GK1.setTransform(1, 0, 0, 1, 0, 0); GK1.globalCompositeOperation = 'source-over'; GK1.clearRect(0, 0, CW, CH);
    GK1.filter = `blur(${blur}px)`; GK1.drawImage(G0, 0, 0); GK1.filter = 'none';
    const im = GK1.getImageData(0, 0, CW, CH), d = im.data;
    for (let i = 3; i < d.length; i += 4) { const a = d[i]; d[i] = a < 112 ? 0 : a > 144 ? 255 : (a - 112) * 8; }
    GK1.putImageData(im, 0, 0);
    GK1.globalCompositeOperation = 'source-atop'; paint(GK1); GK1.globalCompositeOperation = 'source-over';
    return G1;
  }
  function chars(k, s, font, ls = 0) { s = mpText(s); k.font = font; const ws = [...s].map(ch => k.measureText(ch).width + ls); const tot = ws.reduce((a, b) => a + b, 0) - ls; let x = -tot / 2; return [...s].map((ch, i) => { const o = { ch, x: x + (ws[i] - ls) / 2, w: ws[i] - ls }; x += ws[i]; return o; }); }
  const CELLS = [];

  // @element 01
  // 01 ポップイン（アプリのアイコンがポンと弾んで現れ、通知バッジが遅れてポン）
  CELLS[0] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 2, n = Math.floor(u / T), lu = u - n * T, X = w / 2, Y = h / 2 + 4, S = 116;
    const col = n % 2 ? C.blue : C.coral;
    const out = backIn(P(lu, 1.86, 2.12), 2.2);
    const sc = spring(lu - 0.28, 15, 6.5) * (1 - out);
    const rot = (1 - spring(lu - 0.28, 11, 6)) * -0.35;
    // 床の影
    k.fillStyle = 'rgba(0,0,0,.28)'; k.beginPath(); k.ellipse(X, Y + 78, 62 * clamp(sc), 8 * clamp(sc), 0, 0, 7); k.fill();
    if (sc > 0.002) {
      k.save(); k.translate(X, Y); k.rotate(rot); k.scale(sc, sc);
      k.fillStyle = col; rr(k, -S / 2, -S / 2, S, S, 30); k.fill();
      k.fillStyle = 'rgba(255,255,255,.16)'; rr(k, -S / 2, -S / 2, S, S / 2, [30, 30, 0, 0]); k.fill();
      k.fillStyle = '#fff';
      if (n % 2) { k.save(); k.translate(0, 2); heartPath(k, 30); k.fill(); k.restore(); }
      else { star(k, 0, 2, 36, 0, 0.48); k.lineJoin = 'round'; k.strokeStyle = '#fff'; k.lineWidth = 6; k.stroke(); k.fill(); }
      k.restore();
      // 通知バッジ
      const bs = spring(lu - 0.62, 17, 7) * (1 - out);
      if (bs > 0.002) { k.save(); k.translate(X + 52 * sc, Y - 52 * sc); k.scale(bs, bs); k.fillStyle = C.yel; k.beginPath(); k.arc(0, 0, 25, 0, 7); k.fill(); k.strokeStyle = C.navy; k.lineWidth = 5; k.stroke(); txt(k, '1', 0, 2, `800 30px ${DISP}`, C.navy, 'center', 'middle'); k.restore(); }
    }
  };

  // @element 02
  // 02 スタガー（グラフの棒が、少しずつ時間をずらして順に立ち上がる）
  CELLS[1] = (k, w, h, u) => {
    stage(k);
    const N = 7, BW = 44, G = 20, x0 = (w - (N * BW + (N - 1) * G)) / 2, base = h - 30;
    const HS = [52, 84, 68, 112, 92, 136, 158];
    k.fillStyle = C.navy3; rr(k, x0 - 18, base, N * BW + (N - 1) * G + 36, 5, 2.5); k.fill();
    const lu = mod(u, CYC / 2);
    for (let i = 0; i < N; i++) {
      const t0 = 0.15 + i * 0.12, g = backOut(P(lu, t0, t0 + 0.5), 2.6) * (1 - eIn(P(lu, 1.78 + i * 0.045, 2.04 + i * 0.045)));
      if (g <= 0.001) continue;
      const hh = HS[i] * g, x = x0 + i * (BW + G);
      k.fillStyle = PAL[i % 4]; rr(k, x, base - hh, BW, hh, [12, 12, 3, 3]); k.fill();
      // 棒の上の点（さらに遅れて出る）
      const d = spring(lu - t0 - 0.34, 16, 7) * (1 - eIn(P(lu, 1.7 + i * 0.045, 1.9 + i * 0.045)));
      if (d > 0.01) { k.fillStyle = '#fff'; k.beginPath(); k.arc(x + BW / 2, base - hh - 16, 6.5 * d, 0, 7); k.fill(); }
    }
  };

  // @element 03
  // 03 バースト（「いいね」のハートが点くと同時に、まわりに線と粒が弾ける）
  CELLS[2] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 2, lu = mod(u, T), X = w / 2, Y = h / 2 + 2, t0 = 0.5, tt = lu - t0;
    const ant = eIOs(P(lu, 0.3, t0)), off = P(lu, 1.92, 2.2);
    const sc = tt < 0 ? 1 - 0.3 * ant : 0.7 + 0.3 * spring(tt, 16, 6.5) + 0.0;
    if (tt > 0 && tt < 0.75) {
      const q = eOut5(tt / 0.6 > 1 ? 1 : tt / 0.6), fade = 1 - P(tt, 0.3, 0.72);
      // 輪
      k.strokeStyle = C.yel; k.lineWidth = Math.max(0.1, 16 * (1 - q)); k.beginPath(); k.arc(X, Y, 44 + 46 * q, 0, 7); if (q < 0.98) k.stroke();
      // 放射の線
      k.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2 - Math.PI / 2, r1 = 64 + 66 * q, len = 36 * (1 - P(tt, 0.22, 0.7));
        if (len > 0.5) { k.strokeStyle = i % 2 ? C.mint : C.yel; k.lineWidth = 9; k.beginPath(); k.moveTo(X + Math.cos(a) * (r1 - len), Y + Math.sin(a) * (r1 - len) * 0.82); k.lineTo(X + Math.cos(a) * r1, Y + Math.sin(a) * r1 * 0.82); k.stroke(); }
        const a2 = a + Math.PI / 10, r2 = 58 + 92 * q;
        k.fillStyle = i % 2 ? C.coral : C.blue; k.globalAlpha = fade; k.beginPath(); k.arc(X + Math.cos(a2) * r2 * 1.45, Y + Math.sin(a2) * r2 * 0.78, 8 * (1 - q * 0.4), 0, 7); k.fill(); k.globalAlpha = 1;
      }
    }
    k.save(); k.translate(X, Y - 2); k.scale(sc, sc);
    heartPath(k, 46); k.lineJoin = 'round'; k.lineWidth = 7; k.strokeStyle = C.navy3; k.stroke();
    const fa = tt < 0 ? 0 : 1 - off;
    if (fa > 0) { k.globalAlpha = fa; k.fillStyle = C.coral; k.strokeStyle = C.coral; k.fill(); k.stroke(); k.globalAlpha = 1; }
    k.restore();
  };

  // @element 04
  // 04 ラインドロー（グラフの線が、描かれるように伸びる。消えるときは後ろから追いかける）
  function smoothPath(pts, n = 16) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } } out.push(pts[pts.length - 1]); return out; }
  function pathLen(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function ptAt(pts, cum, f) { const L = cum[cum.length - 1] * clamp(f); let i = 1; while (i < cum.length - 1 && cum[i] < L) i++; const t = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; }
  function trim(k, pts, cum, f0, f1) { if (f1 - f0 <= 0.0005) return; const L = cum[cum.length - 1], a = L * f0, b = L * f1; k.beginPath(); const s = ptAt(pts, cum, f0); k.moveTo(s[0], s[1]); for (let i = 1; i < pts.length - 1; i++) if (cum[i] > a && cum[i] < b) k.lineTo(pts[i][0], pts[i][1]); const e = ptAt(pts, cum, f1); k.lineTo(e[0], e[1]); k.stroke(); }
  const LD = (() => { const a = smoothPath([[84, 158], [150, 126], [212, 146], [284, 86], [346, 108], [410, 60], [468, 34]]); const ax = [[70, 26], [70, 178], [486, 178]]; return { a, ac: pathLen(a), ax, axc: pathLen(ax) }; })();
  CELLS[3] = (k, w, h, u) => {
    stage(k);
    k.lineCap = 'round'; k.lineJoin = 'round';
    const er = eIO(P(u, 3.85, 4.55));
    // 軸
    k.strokeStyle = C.navy3; k.lineWidth = 6; trim(k, LD.ax, LD.axc, er, eIO(P(u, 0.08, 0.7)));
    // 線
    const f1 = eIO(P(u, 0.4, 1.95)), f0 = eIO(P(u, 3.65, 4.45));
    k.strokeStyle = C.mint; k.lineWidth = 11; trim(k, LD.a, LD.ac, f0, f1);
    // 矢じり
    const ah = backOut(P(u, 1.9, 2.2), 2.5) * (1 - P(u, 4.3, 4.45));
    if (ah > 0.01) { const e = ptAt(LD.a, LD.ac, 1); k.save(); k.translate(e[0], e[1]); k.rotate(e[2]); k.beginPath(); k.moveTo(-26 * ah, -20 * ah); k.lineTo(4, 0); k.lineTo(-26 * ah, 20 * ah); k.stroke(); k.restore(); }
    // 描いている先端
    if (f1 > 0 && f1 < 1) { const e = ptAt(LD.a, LD.ac, f1); k.fillStyle = C.yel; k.beginPath(); k.arc(e[0], e[1], 12, 0, 7); k.fill(); k.fillStyle = '#fff'; k.beginPath(); k.arc(e[0], e[1], 5, 0, 7); k.fill(); }
    // 山の点に丸が描かれる
    const cf = eIO(P(u, 2.2, 2.8)), cb = eIO(P(u, 3.5, 4.0));
    if (cf > cb) { k.strokeStyle = C.coral; k.lineWidth = 7; k.beginPath(); k.arc(284, 86, 26, -Math.PI / 2 + cb * Math.PI * 2, -Math.PI / 2 + cf * Math.PI * 2); k.stroke(); }
  };

  // @element 05
  // 05 マスクリビール（見えない枠＝線の向こうから、見出しがせり上がる）
  CELLS[4] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 2, lu = mod(u, T), X = w / 2, LY = 124;
    const lg = eIO(P(lu, 0.1, 0.5)) * (1 - eIO(P(lu, 2.05, 2.3)));
    // 上の段：線の下から上へ
    const up = (1 - eOut5(P(lu, 0.35, 1.0))) * 120 + backIn(P(lu, 1.7, 2.05), 1.2) * -150;
    k.save(); k.beginPath(); k.rect(0, 8, w, LY - 8 - 5); k.clip();
    txt(k, 'Hello!', X, LY - 14 + up, `800 98px ${DISP}`, '#fff', 'center', 'alphabetic', '1px');
    k.restore();
    // 下の段：線の上から下へ
    const dn = (1 - eOut5(P(lu, 0.55, 1.15))) * -60 + eIn(P(lu, 1.75, 2.05)) * 70;
    k.save(); k.beginPath(); k.rect(0, LY + 5, w, 52); k.clip();
    txt(k, 'はじめまして', X, LY + 44 + dn, `700 32px ${JP}`, C.yel, 'center', 'alphabetic', '6px');
    k.restore();
    if (lg > 0.005) { k.fillStyle = C.coral; rr(k, X - 190 * lg, LY - 3, 380 * lg, 6, 3); k.fill(); }
  };

  // @element 06
  // 06 タイプライター（入力欄に1文字ずつ打たれ、打ち終わると送信ボタンが点く）
  CELLS[5] = (k, w, h, u) => {
    stage(k);
    const S = mpText('ねこの動画つくって'), N = [...S].length, t0 = 0.3, dt = 0.24, done = t0 + N * dt;
    const BX = 34, BY = 58, BW = w - 68, BH = 92;
    const sendT = done + 0.55, clr = P(u, sendT + 0.12, sendT + 0.4);
    k.fillStyle = '#fff'; rr(k, BX, BY, BW, BH, 30); k.fill();
    const f = `600 36px ${JP}`; k.font = f;
    let n = clamp(Math.floor((u - t0) / dt) + 1, 0, N); if (u < t0) n = 0;
    let x = BX + 32; const y = BY + BH / 2 + 2;
    k.save(); rr(k, BX, BY, BW - 86, BH, 30); k.clip();
    [...S].slice(0, n).forEach((ch, i) => {
      const age = u - (t0 + i * dt), pop = 1 + 0.35 * Math.exp(-age * 16), cw = k.measureText(ch).width;
      k.save(); k.translate(x + cw / 2, y - clr * 70); k.scale(pop, pop); k.globalAlpha = 1 - clr;
      txt(k, ch, 0, 0, f, C.navy, 'center', 'middle'); k.restore(); k.font = f; x += cw + 1;
    });
    k.restore();
    if (clr > 0.5) x = BX + 32;
    // カーソル（打っている間は点灯。待ちの間は0.94秒周期でゆっくり明滅）
    const typing = u >= t0 - 0.05 && u < done + 0.1, blink = typing ? 1 : (mod(u, 0.94) < 0.5 ? 1 : 0);
    if (blink) { k.fillStyle = C.coral; rr(k, x + 4, y - 23, 5, 44, 2.5); k.fill(); }
    // 送信ボタン
    const on = spring(u - done - 0.12, 15, 6.5) * (1 - P(u, sendT + 0.5, sendT + 0.8)), press = 1 - 0.2 * Math.sin(Math.PI * P(u, sendT - 0.05, sendT + 0.2));
    const bx = BX + BW - 48, by = BY + BH / 2;
    k.fillStyle = '#DDE3F3'; k.beginPath(); k.arc(bx, by, 30, 0, 7); k.fill();
    if (on > 0.01) { k.fillStyle = C.blue; k.beginPath(); k.arc(bx, by, 30 * Math.min(on, 1.25) * press, 0, 7); k.fill(); }
    k.strokeStyle = '#fff'; k.lineWidth = 6; k.lineCap = 'round'; k.lineJoin = 'round'; k.beginPath(); k.moveTo(bx, by + 12); k.lineTo(bx, by - 12); k.moveTo(bx - 11, by - 2); k.lineTo(bx, by - 13); k.lineTo(bx + 11, by - 2); k.stroke();
  };

  // @element 07
  // 07 カウントアップ（数字が勢いよく増えて、最後にピタッと決まる）
  CELLS[6] = (k, w, h, u) => {
    stage(k);
    const TARGET = 2480, a = P(u, 0.1, 0.4) * (1 - P(u, 4.0, 4.4));
    const p = P(u, 0.45, 2.9), v = Math.round(TARGET * (1 - Math.pow(1 - p, 4)));
    const s = v.toLocaleString('en-US'), f = `800 104px ${DISP}`;
    k.font = f; const dw = k.measureText('0').width + 2, cw = k.measureText(',').width;
    const full = TARGET.toLocaleString('en-US'); let tot = 0; for (const ch of full) tot += ch === ',' ? cw : dw;
    const land = u - 2.9, pop = 1 + (land > 0 ? 0.07 * Math.exp(-7 * land) * Math.cos(15 * land) : 0);
    const X = w / 2 + 42, Y = 96;
    k.save(); k.globalAlpha = a; k.translate(X, Y); k.scale(pop, pop);
    let x = tot / 2;   // 右そろえ
    const speed = p < 1 ? Math.pow(1 - p, 3) : 0;
    for (const ch of [...s].reverse()) {
      const cwid = ch === ',' ? cw : dw; x -= cwid;
      txt(k, ch, x + cwid / 2, 0, f, land > 0 ? C.yel : '#fff', 'center', 'middle');
    }
    k.restore();
    // 上向きの矢印チップ
    const ar = spring(u - 0.35, 14, 7) * (1 - P(u, 4.0, 4.3)), bob = speed * 6 * Math.sin(u * 30);
    if (ar > 0.01) { k.save(); k.translate(X - tot / 2 - 58, Y - 2 + bob); k.scale(ar, ar); k.fillStyle = C.mint; k.beginPath(); k.arc(0, 0, 34, 0, 7); k.fill(); k.strokeStyle = C.navy; k.lineWidth = 8; k.lineCap = 'round'; k.lineJoin = 'round'; k.beginPath(); k.moveTo(0, 15); k.lineTo(0, -14); k.moveTo(-13, -1); k.lineTo(0, -15); k.lineTo(13, -1); k.stroke(); k.restore(); }
    // 下のバー
    const bw = 330, bx = w / 2 - bw / 2, by = 168;
    k.globalAlpha = a; k.fillStyle = C.navy3; rr(k, bx, by, bw, 12, 6); k.fill();
    const g = k.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, C.blue); g.addColorStop(1, C.mint);
    k.fillStyle = g; rr(k, bx, by, Math.max(12, bw * (v / TARGET)), 12, 6); k.fill(); k.globalAlpha = 1;
  };

  // @element 08
  // 08 キネティックタイポグラフィ（言葉の意味に合わせて文字が動く：のびる／はねる／まわる／ドン！）
  CELLS[7] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 4, n = Math.min(3, Math.floor(u / T)), lu = u - n * T, X = w / 2, Y = h / 2 + 6;
    const out = P(lu, T - 0.2, T - 0.02), oa = 1 - out, oy = -46 * eIn(out);
    const f = `800 88px ${JP}`;
    k.save(); k.translate(X, Y + oy); k.globalAlpha = oa;
    if (n === 0) {
      const sp = spring(lu - 0.05, 12, 4.2), sx = 0.3 + 0.7 * sp, sy = 1 / Math.sqrt(Math.max(0.75, sx));
      k.globalAlpha = oa * P(lu, 0.03, 0.12); k.scale(sx, sy); txt(k, 'のびる', 0, 0, f, C.blue, 'center', 'middle', '4px');
    } else if (n === 1) {
      chars(k, 'はねる', f, 6).forEach((c, i) => {
        const tt = lu - 0.06 - i * 0.1; if (tt < 0) return;
        const y = -78 * Math.abs(Math.sin(Math.PI * tt / 0.4)) * Math.exp(-2.6 * tt), near = Math.abs(Math.sin(Math.PI * tt / 0.4)) < 0.25 ? 1 : 0;
        const sq = 1 - 0.16 * near * Math.exp(-2.6 * tt), a = P(tt, 0, 0.08);
        k.save(); k.globalAlpha = oa * a; k.translate(c.x, y + 44); k.scale(2 - sq, sq); txt(k, c.ch, 0, -44, f, C.yel, 'center', 'middle'); k.restore();
      });
    } else if (n === 2) {
      chars(k, 'まわる', f, 6).forEach((c, i) => {
        const tt = lu - 0.05 - i * 0.12; if (tt < 0) return;
        const q = backOut(P(tt, 0, 0.62), 1.3), sc = eOut(P(tt, 0, 0.25));
        k.save(); k.translate(c.x, 0); k.rotate((1 - q) * -Math.PI * 2); k.scale(sc, sc); txt(k, c.ch, 0, 0, f, C.mint, 'center', 'middle'); k.restore();
      });
    } else {
      const hit = 0.2, tt = lu - hit, sc = tt < 0 ? lerp(3.4, 1, eIn(P(lu, 0.02, hit))) : 1;
      const dx = tt > 0 ? 10 * Math.exp(-9 * tt) * Math.sin(38 * tt) : 0, sy = tt > 0 ? 1 - 0.2 * Math.exp(-11 * tt) : 1;
      k.globalAlpha = oa * P(lu, 0.02, 0.1);
      if (tt > 0 && tt < 0.4) { const q = eOut(tt / 0.4); k.strokeStyle = C.yel; k.lineWidth = 7 * (1 - q); k.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = 120 + 50 * q, r1 = r0 + 26; k.beginPath(); k.moveTo(Math.cos(a) * r0 * 1.35, Math.sin(a) * r0 * 0.5); k.lineTo(Math.cos(a) * r1 * 1.35, Math.sin(a) * r1 * 0.5); if (q < 0.97) k.stroke(); } }
      k.translate(dx, 44); k.scale(sc * (2 - sy), sc * sy); k.transform(1, 0, -0.14, 1, 0, 0); txt(k, 'ドン!', 0, -44, `800 100px ${JP}`, C.coral, 'center', 'middle');
    }
    k.restore();
  };

  // @element 09
  // 09 イージング（同じ距離・同じ時間。上は一定の速さ、下は緩急あり）
  const EZ = bez(.86, 0, .14, 1);
  const EZT = [0.2, 1.75, 2.55, 4.1];
  const ezPos = u => { if (u < EZT[0]) return 0; if (u < EZT[1]) return P(u, EZT[0], EZT[1]); if (u < EZT[2]) return 1; if (u < EZT[3]) return 1 - P(u, EZT[2], EZT[3]); return 0; };
  const ezE = u => { if (u < EZT[0]) return 0; if (u < EZT[1]) return EZ(P(u, EZT[0], EZT[1])); if (u < EZT[2]) return 1; if (u < EZT[3]) return 1 - EZ(P(u, EZT[2], EZT[3])); return 0; };
  CELLS[8] = (k, w, h, u) => {
    stage(k);
    const x0 = 162, x1 = 478, D = x1 - x0, y1 = 58, y2 = 150, S = 62;
    const lin = ezPos(u), mv = (u >= EZT[0] && u < EZT[1]) ? 1 : (u >= EZT[2] && u < EZT[3]) ? -1 : 0, pp = mv === 1 ? P(u, EZT[0], EZT[1]) : mv === -1 ? P(u, EZT[2], EZT[3]) : 0;
    const ez = mv === 1 ? EZ(pp) : mv === -1 ? 1 - EZ(pp) : lin;
    const vel = mv ? (EZ(Math.min(1, pp + 0.01)) - EZ(Math.max(0, pp - 0.01))) / 0.02 : 0, vn = clamp(vel / 3.6);
    // ラベル
    txt(k, '一定', 24, y1 + 1, `700 34px ${JP}`, C.dim, 'left', 'middle');
    txt(k, '緩急', 24, y2 + 1, `700 34px ${JP}`, C.yel, 'left', 'middle');
    // レール＋0.1秒ごとの位置
    [[y1, x => x, '#34489A'], [y2, EZ, '#34489A']].forEach(([y, f, col]) => {
      k.strokeStyle = C.navy2; k.lineWidth = 6; k.lineCap = 'round'; k.beginPath(); k.moveTo(x0, y); k.lineTo(x1, y); k.stroke();
      k.fillStyle = col; for (let i = 0; i <= 11; i++) { k.beginPath(); k.arc(x0 + f(i / 11) * D, y, 5, 0, 7); k.fill(); }
    });
    // 上：一定（形も色も動かない）
    k.fillStyle = '#6677AD'; rr(k, x0 + lin * D - S / 2, y1 - S / 2, S, S, 16); k.fill();
    // 下：緩急あり（速いところで伸び、尾を引く）
    const X = x0 + ez * D;
    if (vn > 0.05) {
      k.lineCap = 'round';
      [[-20, C.yel, 1], [0, C.coral, 1.25], [20, C.yel, 0.8]].forEach(([dy, col, m]) => { k.strokeStyle = col; k.globalAlpha = 0.9 * vn; k.lineWidth = 10; k.beginPath(); k.moveTo(X - mv * (S / 2), y2 + dy); k.lineTo(X - mv * (S / 2 + 150 * vn * m), y2 + dy); k.stroke(); });
      k.globalAlpha = 1;
    }
    // 残像（少し前の位置を薄く重ねる）
    for (let g = 4; g >= 1; g--) { const gx = x0 + ezE(u - g * 0.035) * D; if (Math.abs(gx - X) > 3) { k.globalAlpha = 0.16 * (5 - g) / 4 + 0.06; k.fillStyle = C.coral; rr(k, gx - S / 2, y2 - S / 2, S, S, 16); k.fill(); } } k.globalAlpha = 1;
    const sx = 1 + 0.5 * vn, sy = 1 - 0.2 * vn;
    k.save(); k.translate(X, y2); k.scale(sx, sy); k.fillStyle = C.coral; rr(k, -S / 2, -S / 2, S, S, 16); k.fill(); k.fillStyle = 'rgba(255,255,255,.9)'; k.beginPath(); k.arc(S / 2 - 18, -S / 2 + 18, 6, 0, 7); k.fill(); k.restore();
  };

  // @element 10
  // 10 オーバーシュート（メーターの針が、目標を行き過ぎてから戻って止まる）
  CELLS[9] = (k, w, h, u) => {
    stage(k);
    const X = w / 2, Y = h - 26, R = 128, TG = 0.7;
    let v;
    if (u < 0.25) v = 0; else if (u < 3.7) { const t = u - 0.25; v = TG * (1 - Math.exp(-4.6 * t) * Math.cos(10.5 * t)); } else { const t = u - 3.7; v = TG * Math.exp(-7.5 * t) * Math.cos(8.5 * t); }
    const ang = x => Math.PI + x * Math.PI;
    k.lineCap = 'round';
    k.strokeStyle = C.navy2; k.lineWidth = 26; k.beginPath(); k.arc(X, Y, R, ang(0), ang(1)); k.stroke();
    if (v > 0.005) { const g = k.createLinearGradient(X - R, 0, X + R, 0); g.addColorStop(0, C.blue); g.addColorStop(1, C.mint); k.strokeStyle = g; k.beginPath(); k.arc(X, Y, R, ang(0), ang(v)); k.stroke(); }
    // 行き過ぎた分（目標より先）はコーラルで見せる
    if (v > TG + 0.004) { k.strokeStyle = C.coral; k.lineCap = 'butt'; k.beginPath(); k.arc(X, Y, R, ang(TG), ang(v)); k.stroke(); k.lineCap = 'round'; }
    // 目標の印
    const ta = ang(TG);
    k.strokeStyle = C.yel; k.lineWidth = 7; k.beginPath(); k.moveTo(X + Math.cos(ta) * (R - 22), Y + Math.sin(ta) * (R - 22)); k.lineTo(X + Math.cos(ta) * (R + 30), Y + Math.sin(ta) * (R + 30)); k.stroke();
    k.fillStyle = C.yel; k.beginPath(); k.arc(X + Math.cos(ta) * (R + 38), Y + Math.sin(ta) * (R + 38), 8, 0, 7); k.fill();
    // 針
    const a = ang(v);
    k.strokeStyle = '#fff'; k.lineWidth = 9; k.beginPath(); k.moveTo(X, Y); k.lineTo(X + Math.cos(a) * (R - 26), Y + Math.sin(a) * (R - 26)); k.stroke();
    k.fillStyle = '#fff'; k.beginPath(); k.arc(X, Y, 17, 0, 7); k.fill(); k.fillStyle = C.coral; k.beginPath(); k.arc(X, Y, 8, 0, 7); k.fill();
  };

  // @element 11
  // 11 スクワッシュ＆ストレッチ（弾むキャラクターが、着地でつぶれ、飛ぶときに伸びる）
  CELLS[10] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 4, q = mod(u, T) / T, c = 0.1, floor = h - 28, R = 37, Hgt = 92;
    const X = w / 2 + 150 * Math.sin(u / CYC * Math.PI * 2);
    let sy, yb, grounded = false;
    if (q < c || q > 1 - c) { const d = (q < c ? q : 1 - q) / c; sy = lerp(0.52, 1.28, d * d); yb = floor; grounded = true; }
    else { const qq = (q - c) / (1 - 2 * c), sp = Math.abs(2 * qq - 1); yb = floor - Hgt * (1 - sp * sp); sy = 1 + 0.28 * Math.pow(sp, 3); }
    const sx = 1 / sy, hg = (floor - yb) / Hgt;
    k.fillStyle = C.navy3; rr(k, 40, floor, w - 80, 5, 2.5); k.fill();
    k.fillStyle = 'rgba(0,0,0,.32)'; k.beginPath(); k.ellipse(X, floor + 9, R * 1.2 * (1 - hg * 0.55) * Math.max(1, sx), 6 * (1 - hg * 0.5), 0, 0, 7); k.fill();
    // 着地の小さなしぶき
    const dq = q < 0.5 ? q : q - 1; if (Math.abs(dq) < 0.16 && dq > -0.02) { const t = (dq + 0.02) / 0.18; k.strokeStyle = C.yel; k.lineWidth = 5 * (1 - t); k.lineCap = 'round';[-1, 1].forEach(s => { k.beginPath(); k.moveTo(X + s * (50 + 28 * t), floor - 6 - 10 * t); k.lineTo(X + s * (62 + 40 * t), floor - 12 - 20 * t); if (t < 0.97) k.stroke(); }); }
    k.save(); k.translate(X, yb); k.scale(sx, sy);
    k.fillStyle = C.coral; k.beginPath(); k.arc(0, -R, R, 0, 7); k.fill();
    k.fillStyle = '#fff'; k.beginPath(); k.ellipse(-12, -R - 4, 7, 9.5, 0, 0, 7); k.ellipse(12, -R - 4, 7, 9.5, 0, 0, 7); k.fill();
    k.fillStyle = C.navy; k.beginPath(); k.arc(-10.5, -R - 3, 3.8, 0, 7); k.arc(13.5, -R - 3, 3.8, 0, 7); k.fill();
    k.restore();
  };

  // @element 12
  // 12 モーフィング（● → ■ → ★ → ♥ と、形と色がなめらかに変わる）
  const MN = 240;
  const SHAPES = (() => {
    const R = 64, mk = fn => { const a = []; for (let i = 0; i < MN; i++) a.push(fn(i / MN)); return a; };
    const circle = mk(t => { const a = t * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * R, Math.sin(a) * R]; });
    const sq = mk(t => { const a = t * Math.PI * 2 - Math.PI / 2; let r = R * 0.88 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))); r = Math.min(r, R * 1.13); return [Math.cos(a) * r, Math.sin(a) * r]; });
    const st = mk(t => { const seg = 1 / 10, j = Math.floor(t / seg), f = (t - j * seg) / seg, ro = R * 1.2, ri = R * 0.56; const a0 = j * Math.PI / 5 - Math.PI / 2, a1 = (j + 1) * Math.PI / 5 - Math.PI / 2, r0 = j % 2 ? ri : ro, r1 = j % 2 ? ro : ri; return [lerp(Math.cos(a0) * r0, Math.cos(a1) * r1, f), lerp(Math.sin(a0) * r0, Math.sin(a1) * r1, f)]; });
    const hp = mk(t => { const a = t * Math.PI * 2, s = R / 15.5; return [16 * Math.pow(Math.sin(a), 3) * s, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s - 4]; });
    return [circle, sq, st, hp];
  })();
  const MCOL = [C.blue, C.coral, C.yel, C.mint];
  CELLS[11] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 4, i = Math.min(3, Math.floor(u / T)), lu = u - i * T;
    const pr = P(lu, T - 0.62, T - 0.04), p = backOut(pr, 1.6), pc = eIOs(pr);
    const A = SHAPES[i], B = SHAPES[(i + 1) % 4], X = w / 2, Y = h / 2 + 3;
    // 次の形の予告（左右の小さな点）
    for (let j = 0; j < 4; j++) { const on = j === i ? 1 - pc : j === (i + 1) % 4 ? pc : 0; k.fillStyle = mix(C.navy3, MCOL[j], on); k.beginPath(); k.arc(X - 39 + j * 26, h - 16, 5 + 2 * on, 0, 7); k.fill(); }
    const pulse = 1 + 0.07 * Math.sin(Math.PI * pr);
    k.save(); k.translate(X, Y - 8); k.scale(pulse, pulse);
    k.fillStyle = mix(MCOL[i], MCOL[(i + 1) % 4], pc); k.beginPath();
    for (let j = 0; j < MN; j++) { const x = lerp(A[j][0], B[j][0], p), y = lerp(A[j][1], B[j][1], p); j ? k.lineTo(x, y) : k.moveTo(x, y); }
    k.closePath(); k.lineJoin = 'round'; k.strokeStyle = k.fillStyle; k.lineWidth = 8; k.stroke(); k.fill(); k.restore();
  };

  // @element 13
  // 13 リキッドモーション（しずくが伸びて、ちぎれて、ぬるっと1つにまとまる）
  const LQ = bez(.7, 0, .2, 1);
  const lqPos = uu => { const u = mod(uu, CYC); let p; if (u < 0.35) p = 0; else if (u < 1.45) p = LQ(P(u, 0.35, 1.45)); else if (u < 2.7) p = 1; else if (u < 3.8) p = 1 - LQ(P(u, 2.7, 3.8)); else p = 0; const mvp = (u >= 0.35 && u < 1.45) ? P(u, 0.35, 1.45) : (u >= 2.7 && u < 3.8) ? P(u, 2.7, 3.8) : 0; return [lerp(120, 420, p), 104 - 34 * Math.sin(Math.PI * mvp)]; };
  CELLS[12] = (k, w, h, u) => {
    stage(k);
    const blobs = [];
    for (let i = 0; i < 8; i++) { const [x, y] = lqPos(u - i * 0.065); blobs.push([x, y + (i ? 6 * Math.sin(u * 2.67 + i) : 0), lerp(44, 15, i / 7)]); }
    // 止まっている間、まわりで小さなしずくが出入りする
    for (let j = 0; j < 3; j++) { const [x, y] = lqPos(u - 0.1), a = j * 2.2 + 0.6, d = 34 + 30 * (0.5 - 0.5 * Math.cos(u / CYC * Math.PI * 4 + j * 2.1)); blobs.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 15 - j * 2]); }
    const L = goo(g => { for (const b of blobs) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 7); g.fill(); } }, 9, g => { const gr = g.createLinearGradient(60, 30, 480, 180); gr.addColorStop(0, C.mint); gr.addColorStop(0.55, C.blue); gr.addColorStop(1, '#7C5CFF'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    k.drawImage(L, 0, 0);
    const [hx, hy] = lqPos(u); k.fillStyle = 'rgba(255,255,255,.75)'; k.beginPath(); k.ellipse(hx - 14, hy - 17, 10, 6, -0.6, 0, 7); k.fill();
  };

  // @element 14
  // 14 モーショントレイル（動いた跡に、残像が尾を引く）
  CELLS[13] = (k, w, h, u) => {
    stage(k);
    const X = w / 2, Y = h / 2 + 2, A = 196, B = 62, th = u / CYC * Math.PI * 2;
    const pt = a => [X + A * Math.sin(a), Y + B * Math.sin(2 * a)];
    const N = 15;
    for (let i = N; i >= 1; i--) {
      const [x, y] = pt(th - i * 0.105), f = i / N;
      k.globalAlpha = 0.9 * (1 - f) + 0.05; k.fillStyle = f < 0.5 ? mix(C.coral, C.yel, f * 2) : mix(C.yel, C.blue, (f - 0.5) * 2);
      k.beginPath(); k.arc(x, y, lerp(22, 6, f), 0, 7); k.fill();
    }
    k.globalAlpha = 1; const [x, y] = pt(th);
    k.fillStyle = C.coral; k.beginPath(); k.arc(x, y, 25, 0, 7); k.fill();
    k.fillStyle = '#fff'; k.beginPath(); k.arc(x, y, 11, 0, 7); k.fill();
  };

  // @element 15
  // 15 パーティクル（粒が次々と噴き出して、飛び散って落ちる）
  const PARTS = (() => { const R = rand(15), a = []; for (let i = 0; i < 84; i++) { const n = R() < 0.5 ? 2 : 3; a.push({ T: CYC / n, ph: R() * CYC, vx: (R() - 0.5) * 2 * 190, vy: -(250 + R() * 150), sz: 5 + R() * 6, col: PAL[i % 4], kind: i % 3, spin: (R() - 0.5) * 9 }); } return a; })();
  CELLS[14] = (k, w, h, u) => {
    stage(k);
    const X = w / 2, Y = h - 20, G = 470;
    for (const p of PARTS) {
      const t = mod(u + p.ph, p.T), life = Math.min(p.T, 1.5); if (t > life) continue;
      const x = X + p.vx * t, y = Y + p.vy * t + 0.5 * G * t * t, a = Math.min(1, t / 0.06) * (1 - smooth(P(t, life * 0.7, life))), sc = lerp(1.15, 0.7, t / life);
      k.globalAlpha = a; k.fillStyle = p.col; k.save(); k.translate(x, y); k.rotate(t * p.spin); k.scale(sc, sc);
      if (p.kind === 0) { k.beginPath(); k.arc(0, 0, p.sz, 0, 7); k.fill(); }
      else if (p.kind === 1) { k.fillRect(-p.sz, -p.sz, p.sz * 2, p.sz * 2); }
      else { k.beginPath(); k.moveTo(0, -p.sz * 1.3); k.lineTo(p.sz * 1.2, p.sz); k.lineTo(-p.sz * 1.2, p.sz); k.closePath(); k.fill(); }
      k.restore();
    }
    k.globalAlpha = 1;
    k.fillStyle = C.navy3; rr(k, X - 70, h - 12, 140, 30, 10); k.fill();
    k.fillStyle = '#fff'; rr(k, X - 30, h - 22, 60, 30, 10); k.fill();
  };

  // @element 16
  // 16 パララックス（手前ほど大きく、奥ほど小さく動いて、奥行きが出る）
  const PLX = (() => {
    const R = rand(16), ridge = (base, amp, step, seed) => { const r = rand(seed), pts = []; for (let x = -220; x <= CW + 220; x += step) pts.push([x, base - amp * (0.35 + 0.65 * r())], [x + step / 2, base + amp * 0.1 * r()]); return pts; };
    const stars = []; for (let i = 0; i < 16; i++) stars.push([R() * (CW + 80) - 40, 12 + R() * 80, 1.5 + R() * 2]);
    const trees = []; for (let i = 0; i < 9; i++) trees.push([-160 + i * 108 + R() * 30, 34 + R() * 24, i % 3]);
    return { far: ridge(150, 78, 120, 3), mid: ridge(172, 74, 92, 8), stars, trees };
  })();
  CELLS[15] = (k, w, h, u) => {
    const pan = 108 * Math.sin(u / CYC * Math.PI * 2);
    const g = k.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0F1A3D'); g.addColorStop(1, '#27408F'); k.fillStyle = g; k.fillRect(0, 0, w, h);
    k.fillStyle = '#fff'; for (const s of PLX.stars) { k.globalAlpha = 0.8; k.beginPath(); k.arc(s[0] - pan * 0.05, s[1], s[2], 0, 7); k.fill(); } k.globalAlpha = 1;
    // 月（いちばん奥・ほぼ動かない）
    k.fillStyle = C.yel; k.beginPath(); k.arc(390 - pan * 0.1, 56, 30, 0, 7); k.fill();
    const poly = (pts, m, col) => { k.fillStyle = col; k.beginPath(); k.moveTo(-260, h + 10); pts.forEach(p => k.lineTo(p[0] - pan * m, p[1])); k.lineTo(w + 260, h + 10); k.closePath(); k.fill(); };
    poly(PLX.far, 0.28, '#31499C');
    poly(PLX.mid, 0.6, C.blue);
    // 手前の丘と木
    k.fillStyle = C.mint; k.beginPath(); k.moveTo(-300, h + 10); for (let x = -300; x <= w + 300; x += 20) k.lineTo(x - pan * 1.25, 176 + 12 * Math.sin(x * 0.012)); k.lineTo(w + 300, h + 10); k.closePath(); k.fill();
    for (const t of PLX.trees) { const x = t[0] - pan * 1.25, by = 180 + 12 * Math.sin(t[0] * 0.012), hh = t[1] * 1.45; k.fillStyle = C.navy; k.fillRect(x - 4, by - 16, 8, 22); k.fillStyle = t[2] === 0 ? C.coral : '#12A57B'; k.beginPath(); k.moveTo(x, by - hh); k.lineTo(x + 20, by - 12); k.lineTo(x - 20, by - 12); k.closePath(); k.fill(); }
    // いちばん手前（ボケた葉影のように大きく速く動く）
    k.fillStyle = '#0A1230';[[-40, 60], [300, 44], [620, 66]].forEach(([x, r]) => { k.beginPath(); k.arc(x - pan * 2.1, h + 18, r, 0, 7); k.fill(); });
  };

  // @shared
  // 画面A＝昼（クリーム・コーラルの太陽）／画面B＝夜（濃紺・黄色の月）。A→B→A で1周期
  const SUN = [112, 104], MOON = [CW - 112, 104];
  function scrA(k, w, h) {
    k.fillStyle = C.cream; k.fillRect(0, 0, w, h);
    k.fillStyle = '#FFD9A8'; k.beginPath(); k.arc(SUN[0], SUN[1], 66, 0, 7); k.fill();
    k.fillStyle = C.coral; k.beginPath(); k.arc(SUN[0], SUN[1], 44, 0, 7); k.fill();
    txt(k, 'DAY', 214, h / 2 + 4, `800 96px ${DISP}`, C.navy, 'left', 'middle', '2px');
    k.fillStyle = '#fff'; rr(k, 400, 34, 96, 26, 13); k.fill(); rr(k, 430, 20, 50, 26, 13); k.fill();
  }
  function scrB(k, w, h) {
    k.fillStyle = '#16255A'; k.fillRect(0, 0, w, h);
    k.fillStyle = '#fff';[[40, 30, 3], [150, 170, 2.5], [250, 24, 2.5], [330, 180, 3], [500, 30, 2.5], [20, 150, 2], [300, 100, 0]].forEach(s => { k.beginPath(); k.arc(s[0], s[1], s[2], 0, 7); k.fill(); });
    k.fillStyle = C.yel; k.beginPath(); k.arc(MOON[0], MOON[1], 46, 0, 7); k.fill();
    k.fillStyle = '#16255A'; k.beginPath(); k.arc(MOON[0] + 22, MOON[1] - 14, 38, 0, 7); k.fill();
    txt(k, 'NIGHT', 40, h / 2 + 4, `800 88px ${DISP}`, '#fff', 'left', 'middle', '1px');
  }
  const SCR = [scrA, scrB];
  const SEG3 = CYC / 2;
  function abCell(trans) { return (k, w, h, u) => { const sgi = Math.min(1, Math.floor(u / SEG3)), uu = u - sgi * SEG3; trans(k, w, h, uu, sgi, 1 - sgi); }; }
  const TA = 0.5, TB = 1.5;

  // @element 17
  // 17 マスクトランジション（丸や星の形の「窓」が広がり、その中に次の画面が見える）
  CELLS[16] = abCell((k, w, h, u, a, b) => {
    const p = eIO(P(u, TA - 0.05, TB + 0.1));
    SCR[a](k, w, h);
    if (p > 0) {
      const c = a === 0 ? SUN : MOON, shape = () => { if (a === 0) { k.beginPath(); k.arc(c[0], c[1], lerp(0, 470, p), 0, 7); } else star(k, c[0], c[1], lerp(0, 1150, p), p * 1.2, 0.5); };
      k.save(); shape(); k.clip(); SCR[b](k, w, h); k.restore();
      if (p < 1) { k.strokeStyle = '#fff'; k.lineWidth = 7; k.lineJoin = 'round'; shape(); k.stroke(); }
    }
  });

  // @element 18
  // 18 シェイプトランジション（色のついた帯が画面を覆い隠し、抜けると次の画面になっている）
  CELLS[17] = abCell((k, w, h, u, a, b) => {
    const p1 = P(u, TA - 0.12, TA + 0.5), p2 = P(u, TA + 0.62, TA + 1.25), N = 4, sk = 80;
    SCR[p1 >= 1 ? b : a](k, w, h);
    const cols = [C.blue, C.coral, C.yel, C.mint];
    for (let i = 0; i < N; i++) {
      const d = i * 0.14, e1 = eIO(clamp((p1 - d) / (1 - 0.42))), e2 = eIO(clamp((p2 - d) / (1 - 0.42)));
      if (e1 <= 0 || e2 >= 1) continue;
      const bh = h / N + 1, y = i * h / N, span = w + sk + 20, dir = a === 0 ? 1 : -1;
      let xa = -sk - 10 + e2 * span, xb = -sk - 10 + e1 * span;
      k.save(); if (dir < 0) { k.translate(w, 0); k.scale(-1, 1); }
      k.fillStyle = cols[i]; k.beginPath(); k.moveTo(xa + sk, y); k.lineTo(xb + sk, y); k.lineTo(xb, y + bh); k.lineTo(xa, y + bh); k.closePath(); k.fill(); k.restore();
    }
  });

  // @element 19
  // 19 リキッドトランジション（ペンキのような液体が上から垂れて流れ込み、次の画面になる）
  const DRIPS = [0, 1].map(s => { const R = rand(190 + s * 7), a = []; for (let i = 0; i < 7; i++) a.push({ x: 36 + i * 78 + (R() - 0.5) * 30, len: 30 + R() * 80, wd: 15 + R() * 12, ph: R() * 6 }); return a; });
  function liquidShape(g, w, h, p, set, u) {
    const base = lerp(-110, h + 130, p), amp = Math.sin(Math.PI * clamp(p * 1.1));
    g.beginPath(); g.moveTo(-20, -40);
    for (let x = -20; x <= w + 20; x += 10) g.lineTo(x, base + amp * (13 * Math.sin(x * 0.021 + u * 3 + set) + 8 * Math.sin(x * 0.05 + u * 4.3)));
    g.lineTo(w + 20, -40); g.closePath(); g.fill();
    for (const d of DRIPS[set]) { const L = d.len * (0.25 + amp * 0.9), y0 = base - 20; g.beginPath(); g.roundRect(d.x - d.wd, y0, d.wd * 2, L + 20, d.wd); g.fill(); g.beginPath(); g.arc(d.x, y0 + L + 18, d.wd * 1.25, 0, 7); g.fill(); }
  }
  CELLS[18] = abCell((k, w, h, u, a, b) => {
    const p1 = eIOs(P(u, TA - 0.15, TB)), p2 = eIOs(P(u, TA + 0.2, TB + 0.3));
    SCR[a](k, w, h);
    if (p1 > 0 && p2 < 1) k.drawImage(goo(g => liquidShape(g, w, h, p1, 0, u), 7, g => { g.fillStyle = a === 0 ? C.blue : C.coral; g.fillRect(0, 0, w, h); }), 0, 0);
    if (p2 >= 1) SCR[b](k, w, h);
    else if (p2 > 0) k.drawImage(goo(g => liquidShape(g, w, h, p2, 1, u + 1), 7, g => SCR[b](g, w, h)), 0, 0);
  });

  // @element 20
  // 20 ズームスルー（文字の「O」の穴へ突っ込んで、その先の画面へ抜ける）
  function ring(k, x, y, col) { k.strokeStyle = col; k.lineWidth = 21; k.beginPath(); k.arc(x, y, 35, 0, 7); k.stroke(); }
  const ZP = [{ x: 228, y: 106, r: 24.5 }, { x: 300, y: 106, r: 24.5 }];
  function scrX(k, w, h) { k.fillStyle = C.yel; k.fillRect(0, 0, w, h); const f = `800 118px ${DISP}`; txt(k, 'Z', 128, 110, f, C.navy, 'center', 'middle'); ring(k, 228, 106, C.navy); ring(k, 324, 106, C.navy); txt(k, 'M', 432, 110, f, C.navy, 'center', 'middle'); }
  function scrY(k, w, h) { k.fillStyle = C.blue; k.fillRect(0, 0, w, h); const f = `800 118px ${DISP}`; txt(k, 'G', 208, 110, f, '#fff', 'center', 'middle'); ring(k, 300, 106, '#fff'); txt(k, '!', 372, 110, f, C.yel, 'center', 'middle'); }
  const SCZ = [scrX, scrY], ZBG = [C.yel, C.blue];
  CELLS[19] = abCell((k, w, h, u, a, b) => {
    const po = ZP[a], Smax = Math.hypot(Math.max(po.x, w - po.x), Math.max(po.y, h - po.y)) / po.r * 1.08;
    const p = eIn(P(u, TA - 0.25, TB - 0.3)) * 0.8 + eOut(P(u, TB - 0.3, TB + 0.15)) * 0.2;
    if (p >= 1) return SCZ[b](k, w, h);
    const s = Math.pow(Smax, p), Z = (kk, sc) => { kk.translate(po.x, po.y); kk.scale(sc, sc); kk.translate(-po.x, -po.y); };
    k.save(); Z(k, s); SCZ[a](k, w, h);
    k.save(); k.beginPath(); k.arc(po.x, po.y, po.r, 0, 7); k.clip(); k.fillStyle = ZBG[b]; k.fillRect(0, 0, w, h); Z(k, 1 / Smax); SCZ[b](k, w, h); k.restore();
    k.restore();
  });

  // @element 21
  // 21 フリップ（カードが軸で回って裏返り、裏の面が出る）
  const FW = 300, FH = 156, FC = mkCanvas(FW, FH), FK = FC.getContext('2d');
  function flipFace(i) {
    FK.setTransform(1, 0, 0, 1, 0, 0); FK.clearRect(0, 0, FW, FH);
    FK.fillStyle = i ? C.yel : C.blue; rr(FK, 0, 0, FW, FH, 22); FK.fill();
    FK.strokeStyle = i ? 'rgba(15,26,61,.18)' : 'rgba(255,255,255,.3)'; FK.lineWidth = 4; rr(FK, 12, 12, FW - 24, FH - 24, 13); FK.stroke();
    txt(FK, i ? 'A' : 'Q', 92, FH / 2 + 4, `800 112px ${DISP}`, i ? C.navy : '#fff', 'center', 'middle');
    FK.fillStyle = i ? C.navy : '#fff'; FK.globalAlpha = i ? 0.85 : 0.9; rr(FK, 164, 50, 100, 14, 7); FK.fill(); FK.globalAlpha = i ? 0.4 : 0.5; rr(FK, 164, 76, 76, 12, 6); FK.fill(); rr(FK, 164, 98, 90, 12, 6); FK.fill(); FK.globalAlpha = 1;
  }
  CELLS[20] = abCell((k, w, h, u, a, b) => {
    stage(k);
    const pr = P(u, TA - 0.05, TB), th = Math.PI * backOut(pr, 1.5), c = Math.cos(th), s = Math.sin(th), front = c >= 0;
    flipFace(front ? a : b);
    const X = w / 2, Y = h / 2 - 2, lift = Math.sin(Math.PI * pr), sc = 1 + 0.08 * lift, ww = FW * Math.abs(c) * sc, per = 0.2 * s * (front ? 1 : -1);
    k.fillStyle = 'rgba(0,0,0,.3)'; k.beginPath(); k.ellipse(X, h - 13, Math.max(8, ww / 2 * 0.9), 6, 0, 0, 7); k.fill();
    const STEP = 2;
    for (let sx = 0; sx < FW; sx += STEP) { const f = sx / FW, dx = X - ww / 2 + f * ww, hh = FH * sc * (1 + per * (f - 0.5) * 2); k.drawImage(FC, sx, 0, STEP, FH, dx, Y - hh / 2 - 6 * lift, ww / FW * STEP + 0.6, hh); }
    if (Math.abs(s) > 0.02) { k.fillStyle = `rgba(8,14,40,${0.34 * Math.abs(s)})`; k.beginPath(); const hl = FH * sc * (1 - per), hr = FH * sc * (1 + per), yy = Y - 6 * lift; k.moveTo(X - ww / 2, yy - hl / 2); k.lineTo(X + ww / 2, yy - hr / 2); k.lineTo(X + ww / 2, yy + hr / 2); k.lineTo(X - ww / 2, yy + hl / 2); k.closePath(); k.fill(); }
  });

  // @element 22
  // 22 ライトスイープ（ロゴの表面を、光の帯が斜めに横切る）
  CELLS[21] = (k, w, h, u) => {
    stage(k);
    const T = CYC / 2, lu = mod(u, T), p = eIOs(P(lu, 0.45, 1.5));
    const BW = 400, BH = 112, X = w / 2 - BW / 2, Y = h / 2 - BH / 2;
    k.fillStyle = 'rgba(0,0,0,.3)'; rr(k, X + 3, Y + 9, BW, BH, 28); k.fill();
    const g = k.createLinearGradient(X, Y, X + BW, Y + BH); g.addColorStop(0, '#2B62E0'); g.addColorStop(1, '#4E8BFF'); k.fillStyle = g; rr(k, X, Y, BW, BH, 28); k.fill();
    k.fillStyle = C.yel; star(k, X + 64, Y + BH / 2, 30, 0, 0.5); k.lineJoin = 'round'; k.strokeStyle = C.yel; k.lineWidth = 5; k.stroke(); k.fill();
    txt(k, 'PREMIUM', X + 112, Y + BH / 2 + 3, `800 50px ${DISP}`, '#fff', 'left', 'middle', '3px');
    if (p > 0 && p < 1) {
      k.save(); rr(k, X, Y, BW, BH, 28); k.clip();
      k.translate(lerp(X - 130, X + BW + 130, p), Y + BH / 2); k.rotate(0.42);
      const gr = k.createLinearGradient(-58, 0, 58, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.72)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      k.fillStyle = gr; k.fillRect(-58, -160, 116, 320); k.fillStyle = 'rgba(255,255,255,.5)'; k.fillRect(78, -160, 12, 320);
      k.restore();
    }
    // 抜けぎわのきらめき
    const tt = lu - 1.38; if (tt > 0 && tt < 0.6) { const q = tt / 0.6, sc = Math.sin(Math.PI * q) * (1 + 0.2 * (1 - q)); k.save(); k.translate(X + BW - 8, Y + 6); k.rotate(q * 0.9); k.fillStyle = '#fff'; star(k, 0, 0, 30 * sc, 0, 0.22, 4); k.fill(); k.restore(); }
  };

  // @element 23
  // 23 グリッチ（文字が横にずれ、色がずれ、帯が走る。明るさの点滅はさせない）
  const TMP = mkCanvas(CW, CH), TK = TMP.getContext('2d');
  const GL = (() => { const R = rand(231), st = []; for (let s = 0; s < 12; s++) { const sl = [], n = 2 + Math.floor(R() * 3); for (let i = 0; i < n; i++) sl.push({ y: Math.floor(40 + R() * 110), h: 10 + Math.floor(R() * 26), dx: Math.round((R() < .5 ? -1 : 1) * (18 + R() * 46)) }); const bars = []; for (let i = 0; i < 3; i++) bars.push({ x: 30 + R() * 420, y: 30 + R() * 150, w: 30 + R() * 90, h: 5 + R() * 7, c: i }); st.push({ sl, bars, rgb: 7 + Math.round(R() * 9) }); } return st; })();
  const GLC = mkCanvas(CW, CH), GK = GLC.getContext('2d'), GLT = mkCanvas(CW, CH), GT = GLT.getContext('2d');
  CELLS[22] = (k, w, h, u) => {
    const content = kk => { txt(kk, 'GLITCH', w / 2, h / 2 + 4, `800 104px ${DISP}`, '#fff', 'center', 'middle', '2px'); };
    const step = 0.14; let si = -1;
    if (u >= 0.55 && u < 0.55 + step * 5) si = Math.floor((u - 0.55) / step);
    else if (u >= 2.9 && u < 2.9 + step * 6) si = 5 + Math.floor((u - 2.9) / step);
    stage(k);
    if (si < 0) { content(k); return; }
    const S = GL[si];
    TK.setTransform(1, 0, 0, 1, 0, 0); TK.clearRect(0, 0, w, h); content(TK);
    const tint = col => { GT.setTransform(1, 0, 0, 1, 0, 0); GT.globalCompositeOperation = 'source-over'; GT.clearRect(0, 0, w, h); GT.drawImage(TMP, 0, 0); GT.globalCompositeOperation = 'source-in'; GT.fillStyle = col; GT.fillRect(0, 0, w, h); GT.globalCompositeOperation = 'source-over'; return GLT; };
    GK.setTransform(1, 0, 0, 1, 0, 0); GK.fillStyle = C.navy; GK.fillRect(0, 0, w, h);
    GK.drawImage(tint(C.coral), -S.rgb, 2); GK.drawImage(tint('#22D3EE'), S.rgb, -2); GK.drawImage(TMP, 0, 0);
    k.drawImage(GLC, 0, 0);
    for (const sl of S.sl) { k.fillStyle = C.navy; k.fillRect(0, sl.y, w, sl.h); k.drawImage(GLC, 0, sl.y, w, sl.h, sl.dx, sl.y, w, sl.h); }
    for (const b of S.bars) { k.fillStyle = [C.coral, '#22D3EE', C.yel][b.c]; k.fillRect(b.x, b.y, b.w, b.h); }
  };

  // @element 24
  // 24 インパクトシェイク（重い見出しの板がドンと落ち、その衝撃で画面ごと揺れる）
  CELLS[23] = (k, w, h, u) => {
    const T = CYC / 2, n = Math.floor(u / T), lu = u - n * T;
    const floor = h - 30, SW = 250, SH = 100, tI = 0.62, tau = lu - tI;
    let y = lu < 0.3 ? -SH - 20 : lu < tI ? lerp(-SH - 20, floor - SH, eIn(P(lu, 0.3, tI))) : floor - SH;
    y -= 300 * backIn(P(lu, 1.85, 2.2), 1.6);
    let dx = 0, dy = 0, rot = 0;
    if (tau > 0 && tau < 1.1) { const e = Math.exp(-5 * tau), ph = 2 * Math.PI * 5 * tau; dx = 15 * e * Math.sin(ph); dy = 11 * e * Math.cos(ph * 1.3); rot = 0.02 * e * Math.sin(ph + 0.6); }
    k.fillStyle = C.navy; k.fillRect(0, 0, w, h);
    k.save(); k.translate(w / 2 + dx, h / 2 + dy); k.rotate(rot); k.translate(-w / 2, -h / 2);
    k.fillStyle = C.navy; k.fillRect(-40, -40, w + 80, h + 80);
    // 背景の小物（衝撃で少し跳ねる）
    [[34, 62, 86, C.navy2, 0.06], [104, 46, 54, C.navy3, 0.03], [w - 150, 50, 66, C.navy3, 0.03], [w - 90, 62, 104, C.navy2, 0.06]].forEach(([x, bw, bh, col, dl]) => { const t = tau - dl, hop = t > 0 && t < 0.5 ? -24 * Math.sin(Math.PI * t / 0.5) * (1 - t) : 0; k.fillStyle = col; rr(k, x, floor - bh + hop, bw, bh, [10, 10, 0, 0]); k.fill(); k.fillStyle = C.blue; k.globalAlpha = 0.55; rr(k, x + 10, floor - bh + 12 + hop, bw - 20, 8, 4); k.fill(); k.globalAlpha = 1; });
    k.fillStyle = C.navy3; k.fillRect(-40, floor, w + 80, 5);
    // 衝撃の線とほこり
    if (tau > 0 && tau < 0.55) {
      const q = eOut(tau / 0.55); k.strokeStyle = '#fff'; k.lineCap = 'round'; k.lineWidth = 7 * (1 - q);
      for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, j = Math.floor(i / 2), a = -0.12 - j * 0.34, r0 = 140 + 46 * q, r1 = r0 + 32; k.beginPath(); k.moveTo(w / 2 + s * Math.cos(a) * r0, floor - 4 + Math.sin(a) * r0); k.lineTo(w / 2 + s * Math.cos(a) * r1, floor - 4 + Math.sin(a) * r1); if (q < 0.97) k.stroke(); }
      k.fillStyle = C.dim; k.globalAlpha = 0.8 * (1 - q); for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, d = 130 + q * (50 + i * 14); k.beginPath(); k.arc(w / 2 + s * d, floor - 8 - q * (6 + i * 4), 9 + q * 8 - i, 0, 7); k.fill(); } k.globalAlpha = 1;
    }
    const sq = tau > 0 && tau < 0.3 ? 1 - 0.22 * Math.sin(tau / 0.3 * Math.PI) : (lu < tI && lu > 0.3 ? 1.12 : 1);
    k.save(); k.translate(w / 2, y + SH); k.scale(2 - sq, sq);
    k.fillStyle = n ? C.coral : C.yel; rr(k, -SW / 2, -SH, SW, SH, 18); k.fill();
    k.fillStyle = 'rgba(15,26,61,.14)'; rr(k, -SW / 2, -16, SW, 16, [0, 0, 18, 18]); k.fill();
    txt(k, n ? 'SALE' : 'NEW!', 0, -SH / 2 + 4, `800 74px ${DISP}`, n ? '#fff' : C.navy, 'center', 'middle', '2px');
    k.restore();
    k.restore();
  };

  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [] };
});
