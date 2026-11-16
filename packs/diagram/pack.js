/* Motion Prompt · pack "diagram" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('diagram', function () {
  // @kit
  // 資料で使う図解・グラフの名前24（各カード 539x208・4.7秒周期。各コマは時間 u の純関数）
  // 薄いグレーの地に、グレー3段・青3段・濃いグレーの平面だけで描く。Xの動画（1ページ9.4秒で各カードが2周）と同じ絵。
  // どのカードも「空 → 図が組み上がる → 止める → 4.1〜4.5秒で消える → 空」で1周する（u = 4.7 は u = 0 と同じ）。
  // 数字のグラフ（09〜16）は軸・目盛り・マス目を出したままにして、データだけを出し入れする。
  const CW = 539, CH = 208, CYC = 4.7;
  const C = {
    stage: '#F1F0EE', sub: '#8E8E93', mark: '#3A3A3E',
    blue: '#2F6BEB', blueM: '#9DB8F6', blueL: '#C9D8FB', g2: '#E2E1DE', g3: '#CFCECB', g4: '#A9A8A5'
  };
  const FONT = '"Hiragino Sans", "Helvetica Neue", "PingFang SC", "Noto Sans", "Noto Sans CJK JP", system-ui, sans-serif';
  const TAU = Math.PI * 2;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));                       // 0..1 progress of t between a and b
  const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // cubic-bezier(0.65,0,0.35,1)
  const easeOut = x => 1 - Math.pow(1 - x, 3);                                       // cubic-bezier(0.33,1,0.68,1)
  const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };  // cubic-bezier(0.34,1.56,0.64,1)
  function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; } // seeded random
  function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
  function txt(k, s, x, y, font, col, align = 'left', base = 'alphabetic') {
    k.font = font; k.fillStyle = col; k.textAlign = align; k.textBaseline = base; k.fillText(s, x, y);
  }
  function bg(k, w, h) { k.fillStyle = C.stage; k.fillRect(0, 0, w, h); }
  function fade(u) { return 1 - easeInOut(P(u, 4.1, 4.5)); }              // the whole figure fades out at the end of the cycle
  const CELLS = [];

  // @shared
  // 01〜08（整理する図）の部品: 弾んで出る箱、線を途中まで引く、矢じり
  function pop(u, a, d = 0.3) { const p = P(u, a, a + d); return p <= 0 ? 0 : easeOutBack(p); }   // 0 -> ~1.1 -> 1
  function pen(k, col, lw) { k.strokeStyle = col; k.lineWidth = lw; k.lineCap = 'round'; k.lineJoin = 'round'; }
  // point at distance d along a polyline: {x, y, a (direction), i (segment end index)}
  function along(pts, d) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], s = Math.hypot(x1 - x0, y1 - y0);
      if (d <= s || i === pts.length - 1) { const f = s ? clamp(d / s) : 0; return { x: lerp(x0, x1, f), y: lerp(y0, y1, f), a: Math.atan2(y1 - y0, x1 - x0), i }; }
      d -= s;
    }
    return { x: pts[0][0], y: pts[0][1], a: 0, i: 1 };
  }
  function pathLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  // stroke the first fraction t of a polyline. arrow: arrowhead size at the moving tip (0 = none)
  function trace(k, pts, t, arrow = 0, col = null) {
    if (t <= 0) return;
    const L = pathLen(pts), d = t * L, tip = along(pts, d), end = along(pts, Math.max(0, d - arrow * 0.7));
    k.beginPath(); k.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < end.i; i++) k.lineTo(pts[i][0], pts[i][1]);
    k.lineTo(end.x, end.y); k.stroke();
    if (arrow && d > arrow * 0.8) arrowAt(k, tip.x, tip.y, tip.a, arrow, col || k.strokeStyle);
  }
  function arrowAt(k, x, y, a, s, col) {
    k.save(); k.translate(x, y); k.rotate(a); k.fillStyle = col;
    k.beginPath(); k.moveTo(1, 0); k.lineTo(-s, -s * 0.62); k.lineTo(-s, s * 0.62); k.closePath(); k.fill();
    k.restore();
  }
  function bezPts(p0, c0, c1, p3, n = 28) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      out.push([m * m * m * p0[0] + 3 * m * m * t * c0[0] + 3 * m * t * t * c1[0] + t * t * t * p3[0],
                m * m * m * p0[1] + 3 * m * m * t * c0[1] + 3 * m * t * t * c1[1] + t * t * t * p3[1]]);
    }
    return out;
  }
  // rounded box scaled from its center
  function box(k, cx, cy, bw, bh, r, s, col) {
    if (s <= 0.01) return;
    k.save(); k.translate(cx, cy); k.scale(s, s); k.fillStyle = col; rr(k, -bw / 2, -bh / 2, bw, bh, r); k.fill(); k.restore();
  }

  // @element 01
  // 01 ベン図: two circles slide in from the sides and overlap; only the shared part turns blue
  function venn(k, w, h, u) {
    bg(k, w, h);
    const app = easeOut(P(u, 0.3, 0.7)), m = easeInOut(P(u, 0.5, 1.6));
    if (app <= 0) return;
    const r = 78, cy = h / 2, d = lerp(150, 44, m), ax = w / 2 - d, bx = w / 2 + d;
    k.save(); k.globalAlpha = fade(u) * app;
    k.fillStyle = C.blueL; k.beginPath(); k.arc(ax, cy, r, 0, TAU); k.fill();
    k.fillStyle = C.g2; k.beginPath(); k.arc(bx, cy, r, 0, TAU); k.fill();
    // shared part: B inside A
    k.save(); k.beginPath(); k.arc(ax, cy, r, 0, TAU); k.clip();
    k.fillStyle = C.blue; k.beginPath(); k.arc(bx, cy, r, 0, TAU); k.fill(); k.restore();
    pen(k, C.blueM, 3); k.beginPath(); k.arc(ax, cy, r, 0, TAU); k.stroke();
    pen(k, C.g4, 3); k.beginPath(); k.arc(bx, cy, r, 0, TAU); k.stroke();
    txt(k, 'A', ax - 38, cy + 1, `600 26px ${FONT}`, C.blue, 'center', 'middle');
    txt(k, 'B', bx + 38, cy + 1, `600 26px ${FONT}`, C.mark, 'center', 'middle');
    k.restore();
  }
  CELLS[0] = venn;

  // @element 02
  // 02 4象限マトリクス: two axes cross in the middle, four areas appear, items are placed; top-right is the target
  const MDOTS = [[0.55, -0.55, 1], [0.25, -0.3, 0], [-0.5, -0.45, 0], [-0.3, 0.5, 0], [-0.62, 0.22, 0], [0.45, 0.4, 0], [0.7, 0.62, 0]];
  function matrix(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const cx = w / 2, cy = h / 2, hw = 168, hh = 86, gap = 8;
    // four areas
    [[1, -1], [-1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => {
      const a = easeOut(P(u, 1.0 + i * 0.08, 1.35 + i * 0.08));
      if (a <= 0) return;
      k.save(); k.globalAlpha *= a;
      k.fillStyle = i === 0 ? C.blueL : C.g2;
      const x = sx > 0 ? cx + gap : cx - gap - (hw - 14), y = sy > 0 ? cy + gap : cy - gap - (hh - 8);
      rr(k, x, y, hw - 14, hh - 8, 10); k.fill(); k.restore();
    });
    // axes grow from the center out
    const g = easeInOut(P(u, 0.4, 1.0));
    if (g > 0) {
      pen(k, C.mark, 3);
      k.beginPath(); k.moveTo(cx - hw * g, cy); k.lineTo(cx + (hw - 6) * g, cy); k.stroke();
      k.beginPath(); k.moveTo(cx, cy + hh * g); k.lineTo(cx, cy - (hh - 6) * g); k.stroke();
      const hs = 11 * clamp((g - 0.15) * 3);
      if (hs > 1) { arrowAt(k, cx + hw * g + 2, cy, 0, hs, C.mark); arrowAt(k, cx, cy - hh * g - 2, -Math.PI / 2, hs, C.mark); }
    }
    // items
    MDOTS.forEach(([dx, dy, hot], i) => {
      const s = pop(u, 1.45 + i * 0.1, 0.3);
      if (s <= 0) return;
      const x = cx + dx * (hw - 20), y = cy + dy * (hh - 6), r = hot ? 12 : 8;
      k.fillStyle = hot ? C.blue : C.g4;
      k.beginPath(); k.arc(x, y, r * s, 0, TAU); k.fill();
    });
    k.globalAlpha = 1;
  }
  CELLS[1] = matrix;

  // @element 03
  // 03 ロジックツリー: one box on the left branches to the right, 1 -> 2 -> 4, with elbow lines
  function tree(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const R = [82, h / 2], L2 = [[248, 56], [248, 152]], L3 = [[426, 28], [426, 84], [426, 124], [426, 180]];
    const RW = 66, RH = 50, W2 = 76, H2 = 34, W3 = 92, H3 = 26;
    const elbow = (p, c, pw, cw) => { const x0 = p[0] + pw / 2, x1 = c[0] - cw / 2, xm = (x0 + x1) / 2; return [[x0, p[1]], [xm, p[1]], [xm, c[1]], [x1, c[1]]]; };
    pen(k, C.g4, 3);
    L2.forEach(c => trace(k, elbow(R, c, RW, W2), easeInOut(P(u, 0.75, 1.15))));
    L3.forEach((c, i) => trace(k, elbow(L2[i >> 1], c, W2, W3), easeInOut(P(u, 1.35 + i * 0.06, 1.75 + i * 0.06))));
    const rs = pop(u, 0.4);
    box(k, R[0], R[1], RW, RH, 10, rs, C.blue);
    if (rs > 0.6) txt(k, '?', R[0], R[1] + 2, `700 30px ${FONT}`, '#FFFFFF', 'center', 'middle');
    L2.forEach((c, i) => box(k, c[0], c[1], W2, H2, 9, pop(u, 1.05 + i * 0.08), C.blueM));
    L3.forEach((c, i) => box(k, c[0], c[1], W3, H3, 8, pop(u, 1.65 + i * 0.08), C.blueL));
    k.globalAlpha = 1;
  }
  CELLS[2] = tree;

  // @element 04
  // 04 ピラミッド図: a triangle in four layers, stacked from the bottom up; the top layer is blue
  function pyramid(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const top = 16, base = 192, hwB = 168, n = 4, gp = 6, cx = w / 2;
    const th = (base - top - gp * (n - 1)) / n, half = y => hwB * (y - top) / (base - top);
    const cols = [C.g3, C.blueL, C.blueM, C.blue];
    for (let i = 0; i < n; i++) {                       // i = 0 bottom
      const p = easeOut(P(u, 0.4 + i * 0.32, 0.8 + i * 0.32));
      if (p <= 0) continue;
      const yb = base - i * (th + gp), yt = yb - th, dy = (1 - p) * -34;
      k.save(); k.globalAlpha *= clamp(p * 1.6); k.translate(0, dy);
      k.fillStyle = cols[i]; k.beginPath();
      if (i === n - 1) { k.moveTo(cx, top); }
      else { k.moveTo(cx - half(yt), yt); k.lineTo(cx + half(yt), yt); }
      k.lineTo(cx + half(yb), yb); k.lineTo(cx - half(yb), yb); k.closePath(); k.fill();
      k.restore();
    }
    k.globalAlpha = 1;
  }
  CELLS[3] = pyramid;

  // @element 05
  // 05 マインドマップ: a center word, curved branches out to both sides, then smaller twigs
  const MM = [
    // [side, end dx, end dy, color, twigs [dx, dy]]
    [1, 128, -52, C.blueM, [[204, -72], [204, -32]]],
    [1, 142, 8, C.g4, []],
    [1, 124, 56, C.blueM, [[204, 76]]],
    [-1, 128, -52, C.g4, [[204, -70]]],
    [-1, 140, 10, C.blueM, []],
    [-1, 124, 56, C.g4, [[204, 36], [204, 76]]],
  ];
  function mindmap(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const cx = w / 2, cy = h / 2;
    MM.forEach(([sd, ex, ey, col, twigs], i) => {
      const x0 = cx + sd * 40, x1 = cx + sd * ex, y1 = cy + ey;
      const pts = bezPts([x0, cy], [cx + sd * 78, cy], [cx + sd * (ex - 50), y1], [x1 - sd * 26, y1]);
      pen(k, col, 3); trace(k, pts, easeInOut(P(u, 0.7 + i * 0.09, 1.2 + i * 0.09)));
      twigs.forEach(([tx, ty], j) => {
        const a = [x1 + sd * 26, y1], b = [cx + sd * tx - sd * 20, cy + ty], t0 = 1.45 + i * 0.07 + j * 0.05;
        const tp = bezPts(a, [a[0] + sd * 22, a[1]], [b[0] - sd * 26, b[1]], b, 16);
        pen(k, col, 2.5); trace(k, tp, easeInOut(P(u, t0, t0 + 0.35)));
        box(k, cx + sd * tx, cy + ty, 40, 18, 9, pop(u, t0 + 0.3, 0.25), col === C.g4 ? C.g3 : C.blueL);
      });
      box(k, x1, y1, 54, 24, 12, pop(u, 1.15 + i * 0.09, 0.28), col === C.g4 ? C.g4 : C.blueM);
    });
    const s = pop(u, 0.4);
    if (s > 0.01) {
      k.save(); k.translate(cx, cy); k.scale(s, s);
      k.fillStyle = C.blue; rr(k, -50, -22, 100, 44, 22); k.fill();
      txt(k, 'テーマ', 0, 1, `700 19px ${FONT}`, '#FFFFFF', 'center', 'middle');
      k.restore();
    }
    k.globalAlpha = 1;
  }
  CELLS[4] = mindmap;

  // @element 06
  // 06 フローチャート: start -> step -> decision (diamond) -> step -> end, with a "No" loop back;
  // then a marker walks the path once (loops back once, then goes on to the end)
  function flow(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const y = 80, S = [64, y], A = [158, y], D = [262, y], B = [364, y], E = [460, y], LY = 172;
    const dw = 46, dh = 36;                                   // diamond half sizes
    const arrows = [
      [[S[0] + 34, y], [A[0] - 36, y]],
      [[A[0] + 36, y], [D[0] - dw, y]],
      [[D[0] + dw, y], [B[0] - 36, y]],
      [[B[0] + 36, y], [E[0] - 34, y]],
    ];
    const loop = [[D[0], y + dh], [D[0], LY], [A[0], LY], [A[0], y + 20]];
    const tA = [0.6, 1.0, 1.4, 1.75];
    pen(k, C.g4, 3);
    arrows.forEach((pts, i) => trace(k, pts, easeInOut(P(u, tA[i], tA[i] + 0.22)), 10, C.g4));
    trace(k, loop, easeInOut(P(u, 2.0, 2.45)), 10, C.g4);
    // shapes
    const pill = (c, s, col) => box(k, c[0], c[1], 66, 36, 18, s, col);
    pill(S, pop(u, 0.4), C.g3);
    box(k, A[0], A[1], 72, 40, 6, pop(u, 0.8), C.blueL);
    const ds = pop(u, 1.2);
    if (ds > 0.01) {
      k.save(); k.translate(D[0], D[1]); k.scale(ds, ds); k.fillStyle = C.blue;
      k.beginPath(); k.moveTo(0, -dh); k.lineTo(dw, 0); k.lineTo(0, dh); k.lineTo(-dw, 0); k.closePath(); k.fill();
      txt(k, '?', 0, 2, `700 26px ${FONT}`, '#FFFFFF', 'center', 'middle');
      k.restore();
    }
    box(k, B[0], B[1], 72, 40, 6, pop(u, 1.6), C.blueL);
    pill(E, pop(u, 1.95), C.g3);
    // marker: start -> A -> D -> (No) loop -> A -> D -> (Yes) -> B -> E
    const path = [S, A, D, [D[0], LY], [A[0], LY], A, D, B, E];
    const m = P(u, 2.6, 3.8);
    const a = Math.min(P(u, 2.5, 2.65), 1 - P(u, 3.8, 4.0));
    if (a > 0) {
      const q = along(path, easeInOut(m) * pathLen(path));
      k.save(); k.globalAlpha *= a; k.fillStyle = C.mark; k.beginPath(); k.arc(q.x, q.y, 8, 0, TAU); k.fill(); k.restore();
    }
    k.globalAlpha = 1;
  }
  CELLS[5] = flow;

  // @element 07
  // 07 サイクル図: four steps on a ring; arrows draw one after another until the ring closes,
  // then the highlight goes round the ring once
  function cycle(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const cx = w / 2, cy = h / 2, RX = 128, RY = 70, nr = 26, n = 4;
    const ang = i => -Math.PI / 2 + i * TAU / n, pos = a => [cx + Math.cos(a) * RX, cy + Math.sin(a) * RY];
    for (let i = 0; i < n; i++) {
      const t = easeInOut(P(u, 0.7 + i * 0.32, 0.98 + i * 0.32));
      if (t <= 0) continue;
      const A = pos(ang(i)), B = pos(ang(i + 1)), pts = [];
      for (let j = 0; j <= 60; j++) {
        const q = pos(lerp(ang(i), ang(i + 1), j / 60));
        if (Math.hypot(q[0] - A[0], q[1] - A[1]) > nr + 10 && Math.hypot(q[0] - B[0], q[1] - B[1]) > nr + 8) pts.push(q);
      }
      pen(k, C.blueM, 3); trace(k, pts, t, 13, C.blueM);
    }
    // highlight going round: 2.2s -> 3.8s, 0.4s per step, soft edges
    const hp = P(u, 2.2, 3.8) * n;
    for (let i = 0; i < n; i++) {
      const s = pop(u, 0.4 + i * 0.32, 0.28);
      if (s <= 0.01) continue;
      const dd = hp - i;
      const on = (u > 2.15 && u < 4.0 && dd > -0.25 && dd < 1.25) ? clamp(Math.min(dd + 0.25, 1.25 - dd) * 2.5) : 0;
      const [x, y] = pos(ang(i));
      k.save(); k.translate(x, y); k.scale(s, s);
      k.fillStyle = C.blueL; k.beginPath(); k.arc(0, 0, nr, 0, TAU); k.fill();
      if (on > 0) { k.save(); k.globalAlpha *= on; k.fillStyle = C.blue; k.beginPath(); k.arc(0, 0, nr, 0, TAU); k.fill(); k.restore(); }
      txt(k, String(i + 1), 0, 1, `700 22px ${FONT}`, on > 0.5 ? '#FFFFFF' : C.blue, 'center', 'middle');
      k.restore();
    }
    k.globalAlpha = 1;
  }
  CELLS[6] = cycle;

  // @element 08
  // 08 フィッシュボーン図: a spine runs right to the head (the result); slanted bones join it from above
  // and below, each with small side bones (the causes)
  function fishbone(k, w, h, u) {
    bg(k, w, h);
    k.globalAlpha = fade(u);
    const y = h / 2, x0 = 52, x1 = 404, hx = 452;
    // tail
    const ta = easeOut(P(u, 0.35, 0.6));
    if (ta > 0) {
      k.save(); k.globalAlpha *= ta; pen(k, C.mark, 3);
      k.beginPath(); k.moveTo(x0 - 26, y - 22); k.lineTo(x0, y); k.lineTo(x0 - 26, y + 22); k.stroke(); k.restore();
    }
    // spine
    const sp = easeInOut(P(u, 0.45, 1.0));
    if (sp > 0) { pen(k, C.mark, 3); trace(k, [[x0, y], [x1, y]], sp, 14, C.mark); }
    // head
    const hs = pop(u, 0.95);
    if (hs > 0.01) {
      k.save(); k.translate(hx, y); k.scale(hs, hs);
      k.fillStyle = C.blue; rr(k, -38, -28, 92, 56, 12); k.fill();
      txt(k, '結果', 8, 1, `700 20px ${FONT}`, '#FFFFFF', 'center', 'middle');
      k.restore();
    }
    // big bones: root on the spine at bx, tip up-left / down-left
    const bones = [[150, -1], [258, -1], [366, -1], [150, 1], [258, 1], [366, 1]];
    bones.forEach(([bx, sd], i) => {
      const a = 1.1 + (i % 3) * 0.14 + (sd > 0 ? 0.07 : 0);
      const t = easeInOut(P(u, a, a + 0.35));
      if (t <= 0) return;
      const tip = [bx - 62, y + sd * 80];
      pen(k, C.blueM, 3); trace(k, [[bx, y], tip], t);
      // small bones (horizontal, pointing left) at 1/3 and 2/3 of the bone
      [0.36, 0.68].forEach((f, j) => {
        const st = easeOut(P(u, a + 0.38 + j * 0.08, a + 0.6 + j * 0.08));
        if (st <= 0) return;
        const px = lerp(tip[0], bx, f), py = lerp(tip[1], y, f);
        pen(k, C.g4, 2.5); k.beginPath(); k.moveTo(px, py); k.lineTo(px - 26 * st, py); k.stroke();
      });
    });
    k.globalAlpha = 1;
  }
  CELLS[7] = fishbone;

  // @shared
  // 09〜16（数字を見せるグラフ）の部品: 色を混ぜる、直線、L字の軸と目盛り線、点。軸は1周ずっと出したまま、データだけ 4.15〜4.55秒で消える
  function hexRGB(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) {   // hex in, hex out
    const A = hexRGB(a), B = hexRGB(b);
    return '#' + [0, 1, 2].map(i => Math.round(lerp(A[i], B[i], clamp(t))).toString(16).padStart(2, '0')).join('');
  }
  const dataFade = (u, a = 4.15, b = 4.55) => 1 - easeInOut(P(u, a, b));
  function seg(k, x0, y0, x1, y1, col, lw = 2.5, dash) {
    k.strokeStyle = col; k.lineWidth = lw; k.lineCap = 'round'; k.lineJoin = 'round';
    if (dash) k.setLineDash(dash);
    k.beginPath(); k.moveTo(x0, y0); k.lineTo(x1, y1); k.stroke();
    if (dash) k.setLineDash([]);
  }
  // L-shaped axes with a few light grid lines
  function axes(k, x0, y0, x1, y1, grid = 3) {
    for (let i = 1; i <= grid; i++) { const y = lerp(y1, y0, i / (grid + 0.4)); seg(k, x0 + 4, y, x1, y, C.g2, 2); }
    seg(k, x0, y0, x0, y1, C.g4, 2.5);
    seg(k, x0, y1, x1, y1, C.g4, 2.5);
  }
  function dot(k, x, y, r, col) { if (r <= 0.05) return; k.fillStyle = col; k.beginPath(); k.arc(x, y, r, 0, Math.PI * 2); k.fill(); }
  const SC = { x0: 96, x1: 448, y0: 24, y1: 184 };   // plot area shared by 09 scatter and 10 bubble

  // @element 09
  // 09 散布図: many small dots pop in from left to right, rising to the right; a dashed trend line follows
  const SCPTS = (() => {
    const r = rand(907), pts = [];
    for (let i = 0; i < 52; i++) {
      const x = 0.04 + r() * 0.92;
      const y = clamp(0.1 + 0.74 * x + (r() + r() - 1) * 0.2, 0.05, 0.95);
      pts.push({ x, y });
    }
    return pts.sort((a, b) => a.x - b.x);
  })();
  function scatter(k, w, h, u) {
    bg(k, w, h);
    const A = SC; axes(k, A.x0, A.y0, A.x1, A.y1);
    const fo = dataFade(u);
    k.save(); k.globalAlpha = fo;
    const X = x => lerp(A.x0 + 10, A.x1 - 8, x), Y = y => lerp(A.y1 - 8, A.y0 + 6, y);
    // trend line (drawn after the dots)
    const tl = easeInOut(P(u, 1.85, 2.5));
    if (tl > 0) {
      const xa = X(0.02), ya = Y(0.11), xb = X(0.98), yb = Y(0.83);
      seg(k, xa, ya, lerp(xa, xb, tl), lerp(ya, yb, tl), C.g4, 2.5, [7, 8]);
    }
    for (const p of SCPTS) {
      const t0 = 0.4 + p.x * 1.25;
      const s = easeOutBack(P(u, t0, t0 + 0.28));
      dot(k, X(p.x), Y(p.y), 5 * s, C.blue);
    }
    k.restore();
  }
  CELLS[8] = scatter;

  // @element 10
  // 10 バブルチャート: a few semi-transparent circles of different sizes grow on the axes
  const BB = [   // x, y (0..1 in the plot), radius px, emphasized
    [0.16, 0.30, 18, 0], [0.34, 0.64, 34, 0], [0.53, 0.34, 25, 0], [0.67, 0.6, 44, 1], [0.89, 0.30, 14, 0],
  ];
  function bubble(k, w, h, u) {
    bg(k, w, h);
    const A = SC; axes(k, A.x0, A.y0, A.x1, A.y1);
    const fo = dataFade(u);
    const X = x => lerp(A.x0 + 10, A.x1 - 8, x), Y = y => lerp(A.y1 - 8, A.y0 + 6, y);
    BB.forEach(([bx, by, br, em], i) => {
      const t0 = 0.45 + i * 0.24;
      const r = br * easeOutBack(P(u, t0, t0 + 0.5));
      if (r <= 0.3) return;
      const col = em ? C.blue : C.blueM;
      k.save(); k.globalAlpha = fo * (em ? 0.42 : 0.5);
      dot(k, X(bx), Y(by), r, col);
      k.restore();
      k.save(); k.globalAlpha = fo; k.strokeStyle = col; k.lineWidth = 2.5;
      k.beginPath(); k.arc(X(bx), Y(by), r, 0, Math.PI * 2); k.stroke();
      k.restore();
    });
  }
  CELLS[9] = bubble;

  // @element 11
  // 11 ヒートマップ: a table of cells; shades of blue sweep across it like a wave
  const HM = (() => {
    const r = rand(1103), cols = 12, rows = 5, v = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const base = 0.5 + 0.42 * Math.sin(i * 0.62 - 0.4) * Math.cos(j * 0.85 - 1.1) + (r() - 0.5) * 0.28;
      v.push(clamp(Math.floor(clamp(base, 0, 0.999) * 5), 0, 4));
    }
    return { cols, rows, v };
  })();
  const HMCOL = [mix(C.stage, C.blueL, 0.55), C.blueL, C.blueM, mix(C.blueM, C.blue, 0.55), C.blue];
  function heatmap(k, w, h, u) {
    bg(k, w, h);
    const { cols, rows, v } = HM;
    const cw = 30, ch = 28, g = 4, gx = 96, gy = (h - (rows * (ch + g) - g)) / 2;
    // row labels (short gray bars) so it reads as a table
    for (let j = 0; j < rows; j++) { rr(k, 46, gy + j * (ch + g) + ch / 2 - 4, 36, 8, 4); k.fillStyle = C.g3; k.fill(); }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const tin = 0.4 + i * 0.075 + j * 0.06;
      const tout = 3.95 + i * 0.025 + j * 0.02;
      const p = easeOut(P(u, tin, tin + 0.32)) * (1 - easeInOut(P(u, tout, tout + 0.22)));
      rr(k, gx + i * (cw + g), gy + j * (ch + g), cw, ch, 4); k.fillStyle = mix(C.g2, HMCOL[v[j * cols + i]], p); k.fill();
    }
  }
  CELLS[10] = heatmap;

  // @element 12
  // 12 レーダーチャート: a spider-web scale; a gray polygon, then the blue polygon spreads out from the center
  const RA = [0.92, 0.58, 0.84, 0.4, 0.76, 0.52];
  const RB = [0.55, 0.74, 0.46, 0.72, 0.5, 0.66];
  function radarPath(k, cx, cy, R, vals, s) {
    k.beginPath();
    vals.forEach((v, i) => {
      const a = -Math.PI / 2 + i / vals.length * Math.PI * 2, r = R * v * s;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i ? k.lineTo(x, y) : k.moveTo(x, y);
    });
    k.closePath();
  }
  function radar(k, w, h, u) {
    bg(k, w, h);
    const cx = w / 2, cy = h / 2 + 2, R = 86, n = 6;
    k.lineJoin = 'round';
    for (let ring = 1; ring <= 4; ring++) {
      radarPath(k, cx, cy, R, Array(n).fill(ring / 4), 1);
      k.strokeStyle = ring === 4 ? C.g4 : C.g3; k.lineWidth = 2; k.stroke();
    }
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i / n * Math.PI * 2;
      seg(k, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, C.g3, 2);
      dot(k, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 4, C.g4);
    }
    const fo = dataFade(u);
    const sb = easeOut(P(u, 0.4, 1.1));
    if (sb > 0.01) {
      k.save(); k.globalAlpha = fo;
      radarPath(k, cx, cy, R, RB, sb);
      k.fillStyle = 'rgba(169,168,165,0.22)'; k.fill();
      k.strokeStyle = C.g4; k.lineWidth = 2.5; k.stroke();
      k.restore();
    }
    const qa = P(u, 0.95, 1.85), sa = lerp(easeOut(qa), easeOutBack(qa), 0.45);   // mild overshoot, stays near the web
    if (sa > 0.01) {
      k.save(); k.globalAlpha = fo;
      radarPath(k, cx, cy, R, RA, sa);
      k.fillStyle = 'rgba(47,107,235,0.28)'; k.fill();
      k.strokeStyle = C.blue; k.lineWidth = 3; k.stroke();
      RA.forEach((v, i) => {
        const a = -Math.PI / 2 + i / n * Math.PI * 2, r = R * v * sa;
        dot(k, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4.5, C.blue);
      });
      k.restore();
    }
  }
  CELLS[11] = radar;

  // @element 13
  // 13 ゲージチャート: a half-circle meter; the needle swings past and settles at 72%
  function gauge(k, w, h, u) {
    bg(k, w, h);
    const cx = w / 2, cy = 152, R = 120, T = 30, V = 0.72;
    const t = Math.max(0, u - 0.5);
    const s = u <= 0.5 ? 0 : 1 - Math.exp(-3.2 * t) * Math.cos(7.5 * t);   // overshoot, wobble, settle
    const f = V * s * (1 - easeInOut(P(u, 4.1, 4.5)));
    k.lineCap = 'butt';
    k.strokeStyle = C.g2; k.lineWidth = T;
    k.beginPath(); k.arc(cx, cy, R - T / 2, Math.PI, Math.PI * 2); k.stroke();
    if (f > 0.002) {
      k.strokeStyle = C.blue; k.lineWidth = T;
      k.beginPath(); k.arc(cx, cy, R - T / 2, Math.PI, Math.PI + Math.PI * f); k.stroke();
    }
    for (let i = 0; i <= 10; i++) {   // ticks every 10%
      const a = Math.PI + Math.PI * i / 10, r0 = R - T - 12, r1 = R - T - (i % 5 === 0 ? 24 : 18);
      seg(k, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, C.g4, 2.5);
    }
    const a = Math.PI + Math.PI * f, L = R - 22, bw = 7;
    const ca = Math.cos(a), sa = Math.sin(a);
    k.fillStyle = C.mark; k.beginPath();
    k.moveTo(cx + ca * L, cy + sa * L);
    k.lineTo(cx - sa * bw, cy + ca * bw);
    k.lineTo(cx - ca * 12, cy - sa * 12);
    k.lineTo(cx + sa * bw, cy - ca * bw);
    k.closePath(); k.fill();
    dot(k, cx, cy, 13, C.mark);
    dot(k, cx, cy, 5, C.stage);
    txt(k, `${Math.round(f * 100)}%`, cx, cy + 36, `700 26px ${FONT}`, C.mark, 'center', 'middle');
  }
  CELLS[12] = gauge;

  // @element 14
  // 14 複合グラフ（棒＋折れ線）: bars on the left scale (gray ticks), a dotted line on the right scale (blue ticks)
  const CB = [42, 55, 50, 66, 74, 88];       // bars (left scale, % of height)
  const CL = [26, 34, 52, 46, 64, 80];       // line (right scale, % of height)
  function combo(k, w, h, u) {
    bg(k, w, h);
    const floor = 186, top = 24, sc = (floor - top) / 100, x0 = 86, x1 = 452, slot = (x1 - x0) / CB.length, bw = 36;
    for (let i = 1; i <= 3; i++) { const y = lerp(floor, top, i / 3.4); seg(k, x0 + 4, y, x1 - 4, y, C.g2, 2); }
    seg(k, x0, top, x0, floor, C.g4, 2.5);
    seg(k, x1, top, x1, floor, C.blue, 2.5);
    seg(k, x0, floor, x1, floor, C.g4, 2.5);
    for (let i = 0; i <= 4; i++) {   // two different scales: gray ticks on the left, blue ticks on the right
      const y = lerp(floor, top, i / 4);
      seg(k, x0 - 10, y, x0, y, C.g4, 2.5);
      seg(k, x1, y, x1 + 10, y, C.blue, 2.5);
    }
    const fo = dataFade(u);
    k.save(); k.globalAlpha = fo;
    CB.forEach((v, i) => {
      const t0 = 0.4 + i * 0.12, p = easeOut(P(u, t0, t0 + 0.36));
      if (p <= 0) return;
      const hh = v * sc * p;
      rr(k, x0 + slot * (i + 0.5) - bw / 2, floor - hh, bw, hh, 3); k.fillStyle = C.blueL; k.fill();
    });
    const pts = CL.map((v, i) => [x0 + slot * (i + 0.5), floor - v * sc]);
    const pl = P(u, 1.3, 2.2) * (pts.length - 1);
    if (pl > 0) {
      k.strokeStyle = C.blue; k.lineWidth = 3.5; k.lineJoin = 'round'; k.lineCap = 'round';
      k.beginPath(); k.moveTo(pts[0][0], pts[0][1]);
      const n = Math.floor(pl);
      for (let i = 1; i <= n; i++) k.lineTo(pts[i][0], pts[i][1]);
      if (n < pts.length - 1) { const f = pl - n; k.lineTo(lerp(pts[n][0], pts[n + 1][0], f), lerp(pts[n][1], pts[n + 1][1], f)); }
      k.stroke();
    }
    pts.forEach(([x, y], i) => {
      const s = easeOutBack(P(u, 1.25 + i * 0.18, 1.45 + i * 0.18));
      if (s > 0) { dot(k, x, y, 7 * s, C.blue); dot(k, x, y, 3 * s, C.stage); }
    });
    k.restore();
  }
  CELLS[13] = combo;

  // @element 15
  // 15 絵グラフ（ピクトグラム）: 10 people in one row pop in gray, then 3 of them turn blue and "30%" counts up
  // faceless pictogram person (the same parts as the camera packs). x,y = feet, h = height in px. o.col: color
  function person(k, x, y, h, o = {}) {
    k.save(); k.translate(x, y); const s = h / 1.8; k.scale(s, -s); if (o.lean) k.rotate(o.lean);
    k.fillStyle = o.col || C.blue;
    const legs = o.legs || [0, 0], arms = o.arms || [0, 0];
    [[-0.08, legs[0]], [0.08, legs[1]]].forEach(([lx, a]) => { k.save(); k.translate(lx, 0.86); k.rotate(a); rr(k, -0.075, -0.86, 0.15, 0.88, 0.07); k.fill(); k.restore(); });
    [[-0.25, arms[0]], [0.25, arms[1]]].forEach(([ax, a]) => { k.save(); k.translate(ax, 1.38); k.rotate(a); rr(k, -0.06, -0.58, 0.12, 0.6, 0.06); k.fill(); k.restore(); });
    rr(k, -0.23, 0.82, 0.46, 0.64, 0.12); k.fill();
    k.beginPath(); k.arc(0, 1.63, 0.16, 0, 7); k.fill();
    k.restore();
  }
  function picto(k, w, h, u) {
    bg(k, w, h);
    const fo = dataFade(u), n = 10, xs = 214, sp = 32, foot = 158, ph = 80, HI = 3;
    k.save(); k.globalAlpha = fo;
    for (let i = 0; i < n; i++) {
      const t0 = 0.35 + i * 0.06, s = easeOutBack(P(u, t0, t0 + 0.3));
      if (s <= 0.02) continue;
      let col = C.g3;
      if (i < HI) { const pc = easeInOut(P(u, 1.25 + i * 0.22, 1.5 + i * 0.22)); col = mix(C.g3, C.blue, pc); }
      person(k, xs + i * sp, foot, ph * s, { col });
    }
    // the share, counting up while the people turn blue
    const pc = easeInOut(P(u, 1.25, 1.94));
    if (pc > 0) {
      const v = Math.round(30 * pc);
      txt(k, `${v}%`, 164, 112, `800 46px ${FONT}`, C.blue, 'right', 'middle');
      txt(k, '10人中3人', 164, 148, `600 16px ${FONT}`, C.sub, 'right', 'middle');
    }
    seg(k, xs - 22, foot + 6, xs + (n - 1) * sp + 18, foot + 6, C.g3, 2);
    k.restore();
  }
  CELLS[14] = picto;

  // @element 16
  // 16 帯グラフ（100%積み上げ）: 4 bands of the same length fill from left to right; dashed lines join the borders
  const BD = [[38, 27, 22, 13], [30, 34, 20, 16], [46, 24, 18, 12], [25, 31, 28, 16]];
  function band(k, w, h, u) {
    bg(k, w, h);
    const COL = [C.blue, C.blueM, C.blueL, C.g3];
    const x0 = 100, bwid = 390, bh = 28, gap = 16, y0 = (h - (4 * bh + 3 * gap)) / 2;
    for (let j = 0; j < 4; j++) { rr(k, 46, y0 + j * (bh + gap) + bh / 2 - 4, 36, 8, 4); k.fillStyle = C.g3; k.fill(); }
    const fo = dataFade(u);
    k.save(); k.globalAlpha = fo;
    const edges = BD.map(r => { let a = 0; return r.map(v => (a += v, x0 + bwid * a / 100)); });
    // dashed lines joining the borders of neighbouring bands (the classic 帯グラフ guide lines)
    const pg = easeInOut(P(u, 1.6, 2.0));
    if (pg > 0) {
      k.save(); k.globalAlpha = fo * pg;
      for (let j = 0; j < 3; j++) for (let s = 0; s < 3; s++) {
        seg(k, edges[j][s], y0 + j * (bh + gap) + bh + 2, edges[j + 1][s], y0 + (j + 1) * (bh + gap) - 2, C.g4, 1.8, [4, 4]);
      }
      k.restore();
    }
    BD.forEach((row, j) => {
      const y = y0 + j * (bh + gap), t0 = 0.4 + j * 0.16, p = easeInOut(P(u, t0, t0 + 0.7));
      if (p <= 0) return;
      k.save(); k.beginPath(); k.rect(x0, y - 2, bwid * p, bh + 4); k.clip();
      let a = x0;
      row.forEach((v, s) => {
        const ww = bwid * v / 100;
        k.fillStyle = COL[s]; k.fillRect(a, y, ww, bh);
        if (s) { k.fillStyle = C.stage; k.fillRect(a - 1, y, 2, bh); }
        a += ww;
      });
      k.restore();
      const pt = P(u, t0 + 0.75, t0 + 1.0);   // % on the first part of each band
      if (pt > 0) {
        k.save(); k.globalAlpha = fo * pt;
        txt(k, `${row[0]}%`, x0 + bwid * row[0] / 200, y + bh / 2 + 1, `700 16px ${FONT}`, '#FFFFFF', 'center', 'middle');
        k.restore();
      }
    });
    k.restore();
  }
  CELLS[15] = band;

  // @shared
  // 17〜24（流れと全体を見せる図）の部品: 出てくる速さ、向きを指定する矢じり
  const appear = (u, a, d) => easeOut(P(u, a, a + d));              // 0..1 appear progress
  function arrowTo(k, x, y, dx, dy, s, col) {                       // filled arrow head pointing along (dx,dy)
    const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    k.fillStyle = col; k.beginPath();
    k.moveTo(x + ux * 2, y + uy * 2);
    k.lineTo(x - ux * s - uy * s * 0.6, y - uy * s + ux * s * 0.6);
    k.lineTo(x - ux * s + uy * s * 0.6, y - uy * s - ux * s * 0.6);
    k.closePath(); k.fill();
  }

  // @element 17
  // 17 ガントチャート: date scale on top, bars start at staggered columns and grow to the right
  function gantt(k, w, h, u) {
    bg(k, w, h);
    const x0 = 84, cols = 8, cw = 52, yAxis = 44, f = fade(u);
    // skeleton: date scale + grid (always visible)
    for (let i = 0; i < cols; i++) txt(k, String(i + 1), x0 + cw * i + cw / 2, 34, `500 18px ${FONT}`, C.sub, 'center');
    k.strokeStyle = C.g2; k.lineWidth = 2;
    for (let i = 0; i <= cols; i++) { k.beginPath(); k.moveTo(x0 + cw * i, yAxis); k.lineTo(x0 + cw * i, 194); k.stroke(); }
    k.strokeStyle = C.g4; k.lineWidth = 2.5; k.lineCap = 'round';
    k.beginPath(); k.moveTo(x0, yAxis); k.lineTo(x0 + cw * cols, yAxis); k.stroke();
    for (let i = 0; i <= cols; i++) { k.beginPath(); k.moveTo(x0 + cw * i, yAxis - 6); k.lineTo(x0 + cw * i, yAxis); k.stroke(); }
    const T = [[0, 2], [1.5, 2], [3, 1.5], [3.5, 3], [6, 2]];
    T.forEach(([s, len], i) => {
      const y = 62 + i * 27;
      txt(k, 'ABCDE'[i], 54, y + 1, `600 18px ${FONT}`, C.g4, 'center', 'middle');
      const p = appear(u, 0.4 + i * 0.3, 0.5) * f;
      if (p <= 0.001) return;
      k.globalAlpha = Math.min(1, p * 3) * f;
      k.fillStyle = i === 3 ? C.blue : C.blueM;
      rr(k, x0 + cw * s + 3, y - 10, Math.max(6, (cw * len - 6) * appear(u, 0.4 + i * 0.3, 0.5)), 20, 6); k.fill();
      k.globalAlpha = 1;
    });
  }
  CELLS[16] = gantt;

  // @element 18
  // 18 タイムライン: one line drawn left to right; dots and short marks appear in order, alternating up/down
  function timeline(k, w, h, u) {
    bg(k, w, h);
    const y = 106, xa = 36, xb = 503, f = fade(u);
    const pl = easeInOut(P(u, 0.4, 2.0));
    const tip = lerp(xa, xb, pl);
    k.globalAlpha = f;
    if (pl > 0) {
      k.strokeStyle = C.mark; k.lineWidth = 3; k.lineCap = 'round';
      k.beginPath(); k.moveTo(xa, y); k.lineTo(tip, y); k.stroke();
      if (pl > 0.97) arrowTo(k, xb + 6, y, 1, 0, 11, C.mark);
    }
    const XS = [78, 166, 254, 342, 430], LB = ['4月', '6月', '8月', '10月', '12月'];
    XS.forEach((x, i) => {
      const t0 = 0.4 + 1.6 * tipT(i, XS, xa, xb);
      const pd = P(u, t0, t0 + 0.25); if (pd <= 0) return;
      const up = i % 2 === 0, last = i === XS.length - 1;
      const s = easeOutBack(pd), r = last ? 10 : 7;
      // short stem + small card
      const ps = appear(u, t0 + 0.1, 0.3);
      const dir = up ? -1 : 1, y1 = y + dir * (r + 4), y2 = y + dir * (r + 4 + 22 * ps);
      k.strokeStyle = last ? C.blue : C.g4; k.lineWidth = 2.5;
      k.beginPath(); k.moveTo(x, y1); k.lineTo(x, y2); k.stroke();
      if (ps > 0) {
        const cwid = 64, chh = 32, cy = up ? y - r - 26 - chh / 2 : y + r + 26 + chh / 2;
        k.globalAlpha = f * ps;
        k.fillStyle = last ? C.blue : '#FFFFFF'; k.strokeStyle = last ? C.blue : C.g3; k.lineWidth = 2;
        rr(k, x - cwid / 2, cy - chh / 2, cwid, chh, 8); k.fill(); k.stroke();
        txt(k, LB[i], x, cy + 1, `600 18px ${FONT}`, last ? '#FFFFFF' : C.mark, 'center', 'middle');
        k.globalAlpha = f;
      }
      k.fillStyle = last ? C.blue : C.blueM;
      k.beginPath(); k.arc(x, y, r * s, 0, 7); k.fill();
      k.strokeStyle = C.stage; k.lineWidth = 2; k.stroke();
    });
    k.globalAlpha = 1;
  }
  // time at which the line tip (easeInOut over 0.4..2.0) reaches XS[i]
  function tipT(i, XS, xa, xb) {
    const target = (XS[i] - xa) / (xb - xa);
    let lo = 0, hi = 1; for (let n = 0; n < 24; n++) { const m = (lo + hi) / 2; if (easeInOut(m) < target) lo = m; else hi = m; }
    return lo;
  }
  CELLS[17] = timeline;

  // @element 19
  // 19 ファネル図: separate center-aligned bars, each shorter than the one above, with light funnel joints
  function funnel(k, w, h, u) {
    bg(k, w, h);
    const cx0 = w / 2, bh = 34, gap = 10, y0 = 21, f = fade(u);
    const WD = [470, 350, 236, 132], NUM = ['100', '58', '27', '9'];
    const COL = [C.blueL, C.blueM, C.blueM, C.blue];
    WD.forEach((wd, i) => {
      const t0 = 0.4 + i * 0.36, p = appear(u, t0, 0.45);
      if (p <= 0) return;
      const y = y0 + i * (bh + gap);
      // joint from the bar above
      if (i > 0) {
        const wa = WD[i - 1], ya = y - gap;
        k.globalAlpha = f * p * 0.8; k.fillStyle = C.g3;
        k.beginPath(); k.moveTo(cx0 - wa / 2 + 6, ya); k.lineTo(cx0 + wa / 2 - 6, ya);
        k.lineTo(cx0 + wd / 2 - 6, y); k.lineTo(cx0 - wd / 2 + 6, y); k.closePath(); k.fill();
      }
      k.globalAlpha = f;
      const ww = wd * p;
      k.fillStyle = COL[i]; rr(k, cx0 - ww / 2, y, ww, bh, 7); k.fill();
      const pt = P(u, t0 + 0.3, t0 + 0.55);
      if (pt > 0) {
        k.globalAlpha = f * pt;
        txt(k, NUM[i], cx0, y + bh / 2 + 1, `700 20px ${FONT}`, i === 3 ? '#FFFFFF' : C.mark, 'center', 'middle');
      }
    });
    k.globalAlpha = 1;
  }
  CELLS[18] = funnel;

  // @element 20
  // 20 カスタマージャーニーマップ: stage headers as plain boxes (columns), an action card under each,
  // then the feeling line goes up and down across the stages, with a smile / frown mark on each point
  const JV = [0.35, 0.7, -0.6, 0.15, 0.85];     // feeling per stage (+ up = good)
  function face(k, x, y, r, good, col) {
    k.fillStyle = col; k.beginPath(); k.arc(x, y, r, 0, Math.PI * 2); k.fill();
    k.fillStyle = '#FFFFFF';
    k.beginPath(); k.arc(x - r * 0.36, y - r * 0.22, r * 0.13, 0, 7); k.fill();
    k.beginPath(); k.arc(x + r * 0.36, y - r * 0.22, r * 0.13, 0, 7); k.fill();
    k.strokeStyle = '#FFFFFF'; k.lineWidth = Math.max(1.6, r * 0.15); k.lineCap = 'round';
    k.beginPath();
    if (good) k.arc(x, y + r * 0.02, r * 0.42, Math.PI * 0.2, Math.PI * 0.8);
    else k.arc(x, y + r * 0.62, r * 0.42, Math.PI * 1.2, Math.PI * 1.8);
    k.stroke();
  }
  function journey(k, w, h, u) {
    bg(k, w, h);
    const f = fade(u), n = 5, xl = 22, xr = w - 22, cw = (xr - xl) / n;
    const cx = i => xl + cw * (i + 0.5);
    const yMid = 150, amp = 36;
    // column separators and the neutral line stay as the frame
    for (let i = 1; i < n; i++) seg(k, xl + cw * i, 14, xl + cw * i, h - 12, C.g2, 2);
    k.globalAlpha = f;
    // stage headers: plain rounded boxes (not arrows), the stage names as short bars
    for (let i = 0; i < n; i++) {
      const p = appear(u, 0.35 + i * 0.1, 0.3);
      if (p <= 0) continue;
      k.save(); k.globalAlpha = f * p;
      rr(k, cx(i) - cw / 2 + 6, 14, cw - 12, 26, 7); k.fillStyle = i === 2 ? C.g3 : C.blueM; k.fill();
      rr(k, cx(i) - 22, 25, 44, 5, 2.5); k.fillStyle = '#FFFFFF'; k.fill();
      k.restore();
    }
    // action cards (what the customer does at each stage)
    for (let i = 0; i < n; i++) {
      const p = appear(u, 0.6 + i * 0.1, 0.3);
      if (p <= 0) continue;
      k.save(); k.globalAlpha = f * p;
      const y = 50 + (1 - p) * 8;
      rr(k, cx(i) - cw / 2 + 10, y, cw - 20, 38, 6); k.fillStyle = '#FFFFFF'; k.fill();
      k.strokeStyle = C.g3; k.lineWidth = 1.5; k.stroke();
      rr(k, cx(i) - cw / 2 + 18, y + 10, cw - 46, 6, 3); k.fillStyle = C.g3; k.fill();
      rr(k, cx(i) - cw / 2 + 18, y + 22, cw - 60, 6, 3); k.fillStyle = C.g2; k.fill();
      k.restore();
    }
    k.globalAlpha = 1;
    seg(k, xl + 4, yMid, xr - 4, yMid, C.g3, 2, [5, 6]);
    k.globalAlpha = f;
    // feeling line (smooth through the 5 points), drawn left to right
    const pts = JV.map((v, i) => [cx(i), yMid - v * amp]);
    const pl = easeInOut(P(u, 1.25, 2.25));
    if (pl > 0) {
      k.save(); k.beginPath(); k.rect(0, 0, lerp(pts[0][0], pts[n - 1][0], pl) + 1, h); k.clip();
      k.strokeStyle = C.blue; k.lineWidth = 3.5; k.lineJoin = 'round'; k.lineCap = 'round';
      k.beginPath(); k.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2;
        k.bezierCurveTo(mx, y0, mx, y1, x1, y1);
      }
      k.stroke(); k.restore();
    }
    pts.forEach(([x, y], i) => {
      const tx = 1.25 + (i / (n - 1)) * 1.0, s = easeOutBack(P(u, tx - 0.05, tx + 0.2));
      if (s <= 0.02) return;
      const good = JV[i] >= 0;
      face(k, x, y, 12 * s, good, good ? C.blue : C.g4);
    });
    k.globalAlpha = 1;
  }
  CELLS[19] = journey;

  // @element 21
  // 21 ツリーマップ: one outer rectangle gets filled by rectangles of different sizes, biggest first
  function treemap(k, w, h, u) {
    bg(k, w, h);
    const f = fade(u);
    const X0 = 50, Y0 = 18, X1 = 489, Y1 = 190;
    k.strokeStyle = C.g3; k.lineWidth = 2; k.setLineDash([6, 6]);
    rr(k, X0, Y0, X1 - X0, Y1 - Y0, 6); k.stroke(); k.setLineDash([]);
    const RS = [                                  // x, y, w, h, color, label
      [50, 18, 206, 172, C.blue, 'A'],
      [260, 18, 140, 96, C.blueM, 'B'],
      [404, 18, 85, 96, C.blueL, 'C'],
      [260, 118, 98, 72, C.blueL, 'D'],
      [362, 118, 70, 72, C.g3, ''],
      [436, 118, 53, 34, C.g3, ''],
      [436, 156, 53, 34, C.g4, ''],
    ];
    RS.forEach(([x, y, ww, hh, col, lb], i) => {
      const p = P(u, 0.4 + i * 0.22, 0.8 + i * 0.22);
      if (p <= 0) return;
      const s = lerp(0.55, 1, easeOutBack(p));
      k.save(); k.globalAlpha = f * Math.min(1, p * 2.5);
      k.translate(x + ww / 2, y + hh / 2); k.scale(s, s);
      k.fillStyle = col; rr(k, -ww / 2, -hh / 2, ww, hh, 5); k.fill();
      if (lb) txt(k, lb, -ww / 2 + 12, -hh / 2 + 26, `700 ${i === 0 ? 24 : 20}px ${FONT}`, i === 0 ? '#FFFFFF' : C.mark, 'left');
      k.restore();
    });
  }
  CELLS[20] = treemap;

  // @element 22
  // 22 スイムレーン図: lane names on the left; boxes and arrows move across the lanes step by step
  function swimlane(k, w, h, u) {
    bg(k, w, h);
    const f = fade(u), X0 = 22, X1 = 517, HW = 62, Y0 = 13, LH = 60, NL = 3;
    const NAMES = ['顧客', '営業', '制作'];
    // skeleton: lanes
    for (let i = 0; i < NL; i++) {
      const y = Y0 + i * LH;
      k.fillStyle = '#FFFFFF'; k.fillRect(X0 + HW, y, X1 - X0 - HW, LH);
      k.fillStyle = C.g2; k.fillRect(X0, y, HW, LH);
      txt(k, NAMES[i], X0 + HW / 2, y + LH / 2 + 1, `600 18px ${FONT}`, C.mark, 'center', 'middle');
    }
    k.strokeStyle = C.g3; k.lineWidth = 2;
    for (let i = 1; i < NL; i++) { k.beginPath(); k.moveTo(X0, Y0 + i * LH); k.lineTo(X1, Y0 + i * LH); k.stroke(); }
    k.beginPath(); k.moveTo(X0 + HW, Y0); k.lineTo(X0 + HW, Y0 + NL * LH); k.stroke();
    rr(k, X0, Y0, X1 - X0, NL * LH, 6); k.stroke();
    // steps
    const BX = [138, 224, 310, 396, 474], BL = [0, 1, 2, 1, 0], bw = 56, bh = 30;
    const cyOf = l => Y0 + l * LH + LH / 2;
    k.globalAlpha = f;
    for (let i = 0; i < BX.length; i++) {
      const t0 = 0.4 + i * 0.38;
      // arrow from previous box: right, then down/up into this box
      if (i > 0) {
        const pa = easeInOut(P(u, t0 - 0.24, t0 + 0.02));
        if (pa > 0) {
          const xs = BX[i - 1] + bw / 2, ys = cyOf(BL[i - 1]), xe = BX[i], ye0 = cyOf(BL[i]);
          const down = ye0 > ys, ye = ye0 + (down ? -bh / 2 - 3 : bh / 2 + 3);
          const l1 = xe - xs, l2 = Math.abs(ye - ys), tot = l1 + l2, d = pa * tot;
          k.strokeStyle = C.mark; k.lineWidth = 2.5; k.lineCap = 'round'; k.lineJoin = 'round';
          k.beginPath(); k.moveTo(xs, ys);
          if (d <= l1) k.lineTo(xs + d, ys);
          else { k.lineTo(xe, ys); k.lineTo(xe, ys + (down ? 1 : -1) * (d - l1)); }
          k.stroke();
          if (pa > 0.98) arrowTo(k, xe, ye, 0, down ? 1 : -1, 9, C.mark);
        }
      }
      const pb = P(u, t0, t0 + 0.28);
      if (pb > 0) {
        const s = easeOutBack(pb), last = i === BX.length - 1, cy = cyOf(BL[i]);
        k.save(); k.translate(BX[i], cy); k.scale(s, s);
        k.fillStyle = last ? C.blue : C.blueL; k.strokeStyle = last ? C.blue : C.blueM; k.lineWidth = 2;
        rr(k, -bw / 2, -bh / 2, bw, bh, 7); k.fill(); k.stroke();
        k.fillStyle = last ? '#FFFFFF' : C.g4;
        rr(k, -16, -3, 32, 6, 3); k.fill();
        k.restore();
      }
    }
    k.globalAlpha = 1;
  }
  CELLS[21] = swimlane;

  // @element 23
  // 23 矢羽根図（シェブロン）: arrow-shaped steps line up from left to right, each with short notes below
  function chevron(k, w, h, u) {
    bg(k, w, h);
    const f = fade(u), n = 5, cw = 104, dp = 24, gp = 6, step = cw - dp + gp;
    const tot = n * step - gp + dp, x0 = (w - tot) / 2, y0 = 40, ch = 74, ym = y0 + ch / 2;
    const COL = [C.blueL, C.blueL, C.blueM, C.blueM, C.blue];
    for (let i = 0; i < n; i++) {
      const t0 = 0.4 + i * 0.3, p = appear(u, t0, 0.42);
      if (p <= 0) continue;
      const x = x0 + i * step - (1 - p) * 34;
      k.globalAlpha = f * Math.min(1, p * 1.6);
      k.fillStyle = COL[i];
      k.beginPath();
      k.moveTo(x, y0); k.lineTo(x + cw - dp, y0); k.lineTo(x + cw, ym); k.lineTo(x + cw - dp, y0 + ch); k.lineTo(x, y0 + ch);
      if (i > 0) k.lineTo(x + dp, ym);
      k.closePath(); k.fill();
      const tx = x + (i > 0 ? dp : 0) / 2 + (cw - dp) / 2 + (i > 0 ? 0 : -2);
      txt(k, String(i + 1), tx + 4, ym + 1, `700 24px ${FONT}`, i === n - 1 ? '#FFFFFF' : C.mark, 'center', 'middle');
      // short notes under each step
      const pn = P(u, t0 + 0.25, t0 + 0.55);
      if (pn > 0) {
        k.globalAlpha = f * pn; k.fillStyle = C.g3;
        const bx = x0 + i * step + (i > 0 ? dp : 0) + 4;
        rr(k, bx, y0 + ch + 20, 62, 8, 4); k.fill();
        rr(k, bx, y0 + ch + 36, 44, 8, 4); k.fill();
      }
    }
    k.globalAlpha = 1;
  }
  CELLS[22] = chevron;

  // @element 24
  // 24 同心円図: circles appear one inside another around the same center (TAM > SAM > SOM)
  function concentric(k, w, h, u) {
    bg(k, w, h);
    const f = fade(u), cx0 = w / 2, cy0 = h / 2 + 2;
    const RR = [91, 61, 31], COL = [C.blueL, C.blueM, C.blue], LB = ['TAM', 'SAM', 'SOM'];
    // skeleton: faint outer ring guide
    k.strokeStyle = C.g2; k.lineWidth = 2; k.beginPath(); k.arc(cx0, cy0, RR[0], 0, 7); k.stroke();
    k.globalAlpha = f;
    RR.forEach((r, i) => {
      const t0 = 0.4 + i * 0.45, p = P(u, t0, t0 + 0.5);
      if (p <= 0) return;
      k.fillStyle = COL[i]; k.beginPath(); k.arc(cx0, cy0, r * lerp(easeOut(p), easeOutBack(p), 0.4), 0, 7); k.fill();
    });
    RR.forEach((r, i) => {
      const t0 = 0.4 + i * 0.45, pt = P(u, t0 + 0.55, t0 + 0.85);
      if (pt <= 0) return;
      k.globalAlpha = f * pt;
      const ly = i < 2 ? cy0 - (r + RR[i + 1]) / 2 : cy0;
      txt(k, LB[i], cx0, ly + 1, `700 18px ${FONT}`, i === 2 ? '#FFFFFF' : C.mark, 'center', 'middle');
    });
    k.globalAlpha = 1;
  }
  CELLS[23] = concentric;

  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [] };
});
