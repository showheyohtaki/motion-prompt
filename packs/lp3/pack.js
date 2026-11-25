/* Motion Prompt · pack "lp3" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('lp3', function () {
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

  // @element 01
  // 01 スクローリーテリング（左の文章を読み進めると、右に固定した空の絵が 朝→昼→夜 と切り替わる）
  CELLS[0] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const s = steps([[0.25, 0], [1.05, 1], [1.85, 1], [2.65, 2], [3.6, 2], [4.4, 0]], u);   // 読んでいる段（0〜2）
    const STEP = [['07:00', '朝', '日がのぼる'], ['12:00', '昼', '空が高くなる'], ['21:00', '夜', '星が出てくる']];
    view(k, () => {
      // 左: 文章の列（1段 120px ずつスクロール）
      k.save(); k.translate(0, -s * 120);
      STEP.forEach(([tm, a, b], i) => {
        const on = clamp(1 - Math.abs(s - i) * 1.4), y = 46 + i * 120;
        txt(k, `0${i + 1}`, 28, y, `700 11px ${MONO}`, mix(C.g3, C.blue, on));
        txt(k, `${a}  ${b}`, 28, y + 26, `800 19px ${JP}`, mix(C.g3, C.ink, on));
        bars(k, 28, y + 40, 178, 3, mix(C.soft, C.faint, on));
      });
      k.restore();
      // 右: 固定した絵（スクロールしても動かない）
      const X = 236, Y = 12, PW = 252, PH = 146;
      k.save(); rr(k, X, Y, PW, PH, 10); k.clip();
      const top = s < 1 ? mix(C.blueXL, C.blueM, s) : mix(C.blueM, C.blue, s - 1);
      const bot = s < 1 ? mix('#FFFFFF', C.blueXL, s) : mix(C.blueXL, C.blueM, s - 1);
      const g = k.createLinearGradient(0, Y, 0, Y + PH); g.addColorStop(0, top); g.addColorStop(1, bot); k.fillStyle = g; k.fillRect(X, Y, PW, PH);
      // 星（夜）
      const st = clamp((s - 1.35) / 0.6), R = rng(241);
      for (let i = 0; i < 22; i++) { const sx = X + R() * PW, sy = Y + R() * 80, a = st * (0.5 + 0.5 * R()); k.fillStyle = `rgba(255,255,255,${a})`; k.beginPath(); k.arc(sx, sy, 1 + R() * 1.2, 0, 7); k.fill(); }
      // 太陽（朝は左下 → 昼は真上 → 夕方に右へ沈む）と月
      const th = Math.PI * (0.92 - 0.42 * Math.min(s, 1) - 0.5 * clamp(s - 1));
      const sunA = 1 - clamp((s - 1.25) / 0.45);
      k.fillStyle = rgba('#FFFFFF', sunA); k.beginPath(); k.arc(X + PW / 2 + Math.cos(th) * 104, Y + 118 - Math.sin(th) * 92, 17, 0, 7); k.fill();
      k.fillStyle = rgba('#FFFFFF', sunA * 0.45); k.beginPath(); k.arc(X + PW / 2 + Math.cos(th) * 104, Y + 118 - Math.sin(th) * 92, 25, 0, 7); k.fill();
      const mo = clamp((s - 1.45) / 0.5);
      if (mo > 0) { const mx = X + 192, my = Y + 40 + (1 - mo) * 30; k.fillStyle = rgba('#FFFFFF', mo * 0.25); k.beginPath(); k.arc(mx, my, 22, 0, 7); k.fill(); k.fillStyle = rgba('#FFFFFF', mo); k.beginPath(); k.arc(mx, my, 13, 0, 7); k.fill(); k.fillStyle = rgba(C.blueL, mo); k.beginPath(); k.arc(mx - 4, my - 3, 3, 0, 7); k.arc(mx + 4, my + 4, 2, 0, 7); k.fill(); }
      // 丘（色も時間で変わる）
      const h1 = s < 1 ? mix(C.blueL, C.blueM, s) : mix(C.blueM, C.blueL, s - 1), h2 = s < 1 ? mix(C.blueM, C.blue, s) : mix(C.blue, C.blueM, s - 1);
      k.fillStyle = h1; k.beginPath(); k.moveTo(X, Y + PH); k.quadraticCurveTo(X + 70, Y + 96, X + 150, Y + 116); k.quadraticCurveTo(X + 210, Y + 128, X + PW, Y + 104); k.lineTo(X + PW, Y + PH); k.fill();
      k.fillStyle = h2; k.beginPath(); k.moveTo(X, Y + 128); k.quadraticCurveTo(X + 110, Y + 112, X + PW, Y + 136); k.lineTo(X + PW, Y + PH); k.lineTo(X, Y + PH); k.fill();
      // 時刻のラベル（近い段の時刻）
      const near = Math.round(s), la = clamp(1 - Math.abs(s - near) * 3);
      k.fillStyle = `rgba(255,255,255,${0.88 * la})`; rr(k, X + 12, Y + 12, 58, 22, 11); k.fill();
      txt(k, STEP[near][0], X + 41, Y + 23.5, `700 11px ${MONO}`, rgba(C.ink, la), 'center', 'middle');
      k.restore();
      sbar(k, s / 2, 0.42);
    });
  };

  // @element 02
  // 02 連番アニメーション（スクロール量に合わせて、商品の写真を1コマずつ差し替え、缶が回って見える）
  CELLS[1] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const s = steps([[0.3, 0], [2.3, 1], [2.9, 1], [4.4, 0]], u);       // スクロール量（0〜1）
    const N = 36, f = Math.min(N - 1, Math.floor(s * N + 1e-6));           // いま見せているコマ（36コマで1回転）
    const ang = f / N * TAU;
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      txt(k, 'NEW FLAVOR', 32, 50, `800 11px ${EN}`, C.blue, 'left', 'alphabetic', '2px');
      txt(k, 'レモンソーダ', 32, 80, `800 22px ${JP}`, C.ink);
      bars(k, 32, 96, 150, 3);
      // 進み具合とコマ番号
      k.fillStyle = C.faint; rr(k, 32, 136, 150, 5, 2.5); k.fill();
      k.fillStyle = C.blue; rr(k, 32, 136, 150 * (f + 1) / N, 5, 2.5); k.fill();
      txt(k, `frame ${String(f + 1).padStart(3, '0')} / ${N}`, 32, 158, `600 10px ${MONO}`, C.sub);
      // 舞台
      const X = 330, Y = 86;
      const st = k.createRadialGradient(X, Y + 10, 10, X, Y + 10, 130); st.addColorStop(0, C.blueBg); st.addColorStop(1, rgba(C.blueBg, 0)); k.fillStyle = st; k.fillRect(200, 0, 311, VH);
      k.fillStyle = 'rgba(30,30,33,.14)'; k.beginPath(); k.ellipse(X, Y + 66, 52, 8, 0, 0, 7); k.fill();
      // 缶（円柱）。ラベルの柄を回転角に合わせて横へ送る
      const R = 36, H0 = Y - 56, H1 = Y + 62;
      k.save(); k.beginPath(); k.moveTo(X - R, H0); k.lineTo(X - R, H1); k.ellipse(X, H1, R, 7, 0, Math.PI, 0, true); k.lineTo(X + R, H0); k.closePath(); k.clip();
      k.fillStyle = C.blueL; k.fillRect(X - R, H0 - 8, R * 2, H1 - H0 + 16);
      // 帯（青）と水玉・ロゴ: 経度 phi にある物は x = R sin(phi + ang)、見えるのは cos > 0 の側
      for (let i = 0; i < 12; i++) {
        const phi = i / 12 * TAU + ang, cz = Math.cos(phi);
        if (cz <= 0) continue;
        const x = X + R * Math.sin(phi);
        k.fillStyle = i % 2 ? C.blue : '#FFFFFF'; k.beginPath(); k.ellipse(x, H0 + 22, 5 * cz, 5, 0, 0, 7); k.fill();
        k.fillStyle = C.blueM; k.beginPath(); k.ellipse(x, H1 - 20, 3.5 * cz, 3.5, 0, 0, 7); k.fill();
      }
      k.fillStyle = C.blue; k.fillRect(X - R, Y - 18, R * 2, 36);
      const lc = Math.cos(ang);
      if (lc > 0.05) { const lx = X + R * Math.sin(ang); k.save(); k.translate(lx, Y); k.scale(lc, 1); txt(k, 'LEMON', 0, 1, `900 15px ${EN}`, '#fff', 'center', 'middle', '1px'); k.restore(); }
      const bc = Math.cos(ang + Math.PI);
      if (bc > 0.05) { const bx = X + R * Math.sin(ang + Math.PI); k.save(); k.translate(bx, Y); k.scale(bc, 1); txt(k, 'SODA', 0, 1, `900 15px ${EN}`, C.blueL, 'center', 'middle', '1px'); k.restore(); }
      // 立体の陰
      const sh = k.createLinearGradient(X - R, 0, X + R, 0); sh.addColorStop(0, 'rgba(30,30,33,.28)'); sh.addColorStop(0.35, 'rgba(255,255,255,.28)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(30,30,33,.3)');
      k.fillStyle = sh; k.fillRect(X - R, H0 - 8, R * 2, H1 - H0 + 16); k.restore();
      // ふた
      k.fillStyle = C.faint; k.beginPath(); k.ellipse(X, H0, R, 7, 0, 0, 7); k.fill(); k.strokeStyle = C.g3; k.lineWidth = 1.5; k.beginPath(); k.ellipse(X, H0, R - 4, 5, 0, 0, 7); k.stroke();
      sbar(k, s, 0.3);
    });
  };

  // @element 03
  // 03 ベロシティスキュー（速くスクロールするほど画像が斜めに傾き、止まるとまっすぐに戻る）
  CELLS[2] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const Y = t => steps([[0.25, 0], [1.25, 240], [1.95, 240], [2.55, 480], [3.25, 480], [4.45, 720]], t);   // スクロール量。1周で720px（＝6段）進む
    const y = Y(u), dt = 1 / 60;
    const Ys = t => Y(t) + 720 * Math.floor(t / CYC);                    // 周期をまたいでもつながるスクロール量
    const v = (Ys(u + dt) - Ys(u - dt)) / (2 * dt);                       // 速さ（px/秒）
    const sk = clamp(v / 130, 0, 9) * Math.PI / 180;                      // 傾き（速さ130px/秒ごとに1°、最大9°）
    view(k, () => {
      k.fillStyle = '#fff'; k.fillRect(0, 0, VW, VH);
      const COLS = [40, 190, 340], TW = 130, TH = 96, PITCH = 120;
      for (let c = 0; c < 3; c++) {
        const off = mod(y + c * 40, PITCH * 6);
        for (let r = -1; r < 3; r++) {
          const row = r + Math.floor(off / PITCH), ty = r * PITCH - mod(off, PITCH) + 14;
          const v2 = mod(row * 3 + c, 6);
          k.save(); k.translate(COLS[c] + TW / 2, ty + TH / 2); k.transform(1, Math.tan(sk), 0, 1, 0, 0);
          art(k, -TW / 2, -TH / 2, TW, TH, v2, 8);
          k.restore();
        }
      }
      // 速さの目盛り（右下）
      k.fillStyle = 'rgba(30,30,33,.82)'; rr(k, 380, 136, 112, 24, 12); k.fill();
      txt(k, 'skew', 394, 148.5, `600 10px ${MONO}`, 'rgba(255,255,255,.7)', 'left', 'middle');
      txt(k, `${(sk * 180 / Math.PI).toFixed(1)}°`, 478, 148.5, `700 11px ${MONO}`, C.blueL, 'right', 'middle');
      sbar(k, mod(y, 720) / 720, 0.25);
    });
  };

  // @element 04
  // 04 マルチスクロール（画面を左右2列に分け、1回のスクロールで左の列は上へ、右の列は下へ動いて、次の組がそろう）
  CELLS[3] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const s = steps([[0.35, 0], [1.15, 1], [1.95, 1], [2.75, 2], [3.6, 2], [4.45, 0]], u);   // いまの組（0〜2）
    const HW = VW / 2;
    const SEC = [[C.blue, '01', 'COLOR', 0], [C.blueL, '02', 'SHAPE', 1], [C.blueM, '03', 'MOTION', 3]];
    view(k, () => {
      // 左の列: 0,1,2 の順に上から並び、上へ流れる
      k.save(); k.beginPath(); k.rect(0, 0, HW, VH); k.clip();
      SEC.forEach(([col, no, word], i) => {
        const y = (i - s) * VH;
        if (y > VH || y < -VH) return;
        k.fillStyle = col; k.fillRect(0, y, HW, VH);
        const dark = col === C.blueL || col === C.blueM;
        txt(k, no, 28, y + 44, `700 12px ${MONO}`, dark ? C.ink : 'rgba(255,255,255,.75)');
        txt(k, word, 26, y + 96, `900 40px ${EN}`, dark ? C.ink : '#fff', 'left', 'alphabetic', '1px');
        bars(k, 28, y + 116, 150, 2, dark ? 'rgba(30,30,33,.25)' : 'rgba(255,255,255,.45)');
      });
      k.restore();
      // 右の列: 2,1,0 の順に上から並び（組 i は下から i 番目）、下へ流れる
      k.save(); k.beginPath(); k.rect(HW, 0, HW, VH); k.clip();
      SEC.forEach(([col, no, word, v], i) => {
        const y = (s - i) * VH;
        if (y > VH || y < -VH) return;
        art(k, HW, y, HW, VH, v, 0);
      });
      k.restore();
      // 真ん中の境目と、組の目印
      k.fillStyle = '#fff'; k.fillRect(HW - 1, 0, 2, VH);
      for (let i = 0; i < 3; i++) { const on = clamp(1 - Math.abs(s - i) * 1.5); k.fillStyle = `rgba(255,255,255,${0.45 + 0.55 * on})`; k.beginPath(); k.arc(HW, 58 + i * 27, 3.5 + 2 * on, 0, 7); k.fill(); k.strokeStyle = 'rgba(30,30,33,.25)'; k.lineWidth = 1; k.stroke(); }
      // 矢印（動いている間だけ。左右は逆向き）
      const ds = steps([[0.35, 0], [1.15, 1], [1.95, 1], [2.75, 2], [3.6, 2], [4.45, 0]], u + 0.02) - s;
      if (Math.abs(ds) > 1e-4) {
        const d = ds > 0 ? 1 : -1;
        k.fillStyle = '#fff';
        const tri = (x, y, up) => { k.beginPath(); k.moveTo(x, y + (up ? -7 : 7)); k.lineTo(x - 8, y + (up ? 5 : -5)); k.lineTo(x + 8, y + (up ? 5 : -5)); k.fill(); };
        tri(HW - 22, 146, d > 0); tri(HW + 22, 146, d < 0);
      }
    });
  };

  // @element 05
  // 05 縮むヘッダー（ページの上の幅いっぱいのヘッダーが、スクロールすると細い角丸のピル形に縮んで上に浮く。戻ると元に広がる）
  CELLS[4] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const y = steps([[0.4, 0], [1.9, 150], [2.9, 150], [4.3, 0]], u);     // スクロール量
    const q = eIO(clamp(y / 70));                                         // 縮み具合（70px スクロールで縮みきる）
    view(k, () => {
      // ページ
      k.save(); k.translate(0, -y);
      art(k, 0, 0, VW, 150, 0, 0);
      txt(k, 'SUMMER', 30, 98, `900 38px ${EN}`, '#fff', 'left', 'alphabetic', '2px');
      txt(k, 'COLLECTION', 32, 120, `800 14px ${EN}`, 'rgba(255,255,255,.85)', 'left', 'alphabetic', '3px');
      for (let i = 0; i < 4; i++) { art(k, 24 + i * 120, 170, 106, 84, i + 2, 8); bars(k, 24 + i * 120, 262, 90, 2); }
      art(k, 24, 300, 466, 70, 4, 8);
      k.restore();
      // ヘッダー: 幅 511→310、高さ 46→34、上の余白 0→10、角丸 0→17、白→黒
      const hw = lerp(VW, 310, q), hh = lerp(46, 34, q), hx = (VW - hw) / 2, hy = lerp(0, 10, q), r = lerp(0, 17, q);
      k.save(); k.shadowColor = `rgba(30,30,33,${0.08 + 0.22 * q})`; k.shadowBlur = 6 + 10 * q; k.shadowOffsetY = 2 + 3 * q;
      k.fillStyle = mix('#FFFFFF', C.ink, q * 0.92); rr(k, hx, hy, hw, hh, r); k.fill(); k.restore();
      const ink = mix(C.ink, '#FFFFFF', q), cy = hy + hh / 2;
      k.fillStyle = C.blue; k.beginPath(); k.arc(hx + lerp(22, 20, q), cy, lerp(7, 6, q), 0, 7); k.fill();
      txt(k, 'PALETTE', hx + lerp(34, 31, q), cy + 0.5, `800 ${lerp(13, 11, q)}px ${EN}`, ink, 'left', 'middle', '1px');
      const nav = ['Shop', 'Story', 'Blog'];
      nav.forEach((s, i) => txt(k, s, hx + hw - lerp(232, 168, q) + i * lerp(56, 40, q), cy + 0.5, `600 ${lerp(12, 10.5, q)}px ${EN}`, ink, 'left', 'middle'));
      const bw = lerp(82, 30, q), bh = lerp(28, 24, q);
      k.fillStyle = C.blue; rr(k, hx + hw - bw - lerp(14, 6, q), cy - bh / 2, bw, bh, bh / 2); k.fill();
      k.globalAlpha = 1 - q; txt(k, 'カート', hx + hw - bw / 2 - lerp(14, 6, q), cy + 0.5, `700 11px ${JP}`, '#fff', 'center', 'middle'); k.globalAlpha = 1;
      if (q > 0) { k.globalAlpha = q; k.strokeStyle = '#fff'; k.lineWidth = 1.8; const bx = hx + hw - bw / 2 - 6, by = cy; k.beginPath(); k.moveTo(bx - 6, by - 4); k.lineTo(bx - 4, by + 4); k.lineTo(bx + 5, by + 4); k.lineTo(bx + 6, by - 2); k.lineTo(bx - 5, by - 2); k.stroke(); k.globalAlpha = 1; }
      sbar(k, y / 150, 0.45);
    });
  };

  // @element 06
  // 06 下から現れるフッター（フッターは画面の下に固定され、本文の下に隠れている。最後までスクロールすると本文がめくれるように上がり、フッターが現れる）
  CELLS[5] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const y = steps([[0.35, 0], [2.0, 130], [3.0, 130], [4.35, 0]], u);   // スクロール量。130px でフッターが全部見える
    const q = y / 130;
    view(k, () => {
      // フッター（固定。中身は少し下から上がってくる）
      const FY = VH - 130;
      k.fillStyle = C.blue; k.fillRect(0, FY, VW, 130);
      const fy = FY + 26 * (1 - q);
      txt(k, "Let's make", 28, fy + 48, `900 28px ${EN}`, '#fff');
      txt(k, 'something.', 28, fy + 80, `900 28px ${EN}`, C.blueL);
      [['Work', 'About'], ['Blog', 'Contact']].forEach((col, i) => col.forEach((s, j) => txt(k, s, 290 + i * 80, fy + 44 + j * 22, `600 12px ${EN}`, 'rgba(255,255,255,.85)')));
      k.fillStyle = '#FFFFFF'; k.beginPath(); k.arc(462, fy + 66, 16, 0, 7); k.fill();
      k.strokeStyle = C.blue; k.lineWidth = 2.2; k.beginPath(); k.moveTo(456, fy + 66); k.lineTo(468, fy + 66); k.moveTo(463, fy + 61); k.lineTo(468, fy + 66); k.lineTo(463, fy + 71); k.stroke();
      // 本文（フッターの上に重なり、スクロールで上がる）
      k.save(); k.translate(0, -y);
      k.shadowColor = `rgba(30,30,33,${0.35 * Math.min(1, q * 4)})`; k.shadowBlur = 18; k.shadowOffsetY = 6;
      k.fillStyle = '#fff'; rr(k, 0, -10, VW, VH + 10, [0, 0, 14 * Math.min(1, q * 3), 14 * Math.min(1, q * 3)]); k.fill();
      k.shadowColor = 'transparent';
      txt(k, 'WORKS', 28, 40, `800 11px ${EN}`, C.blue, 'left', 'alphabetic', '2px');
      for (let i = 0; i < 3; i++) { art(k, 28 + i * 156, 54, 142, 78, i + 1, 8); bars(k, 28 + i * 156, 142, 110, 2); }
      k.restore();
      sbar(k, q, 0.55);
    });
  };

  // @element 07
  // 07 カバーフロー（正面に1枚、左右のジャケットは斜めに傾いて重なる。送ると次の1枚が回り込んで正面に来る。床に映り込み）
  CELLS[6] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    const p = steps([[0.25, 0], [0.75, 1], [1.05, 1], [1.55, 2], [1.85, 2], [2.35, 3], [3.0, 3], [4.3, 0]], u);   // 正面にある番号（0〜3）
    const NAMES = ['Sunset Club', 'Lemon Tree', 'Mint Night', 'Pink Noise', 'Blue Hour', 'Deep Sea'];
    view(k, () => {
      const bg = k.createLinearGradient(0, 0, 0, VH); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, C.desk); k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      const CX = 255, CY = 70, S = 88;
      const items = [];
      for (let i = Math.floor(p) - 5; i <= Math.ceil(p) + 5; i++) items.push(i);
      items.sort((a, b) => Math.abs(b - p) - Math.abs(a - p));            // 遠い物から描く
      for (const i of items) {
        const rel = i - p, ar = Math.abs(rel), sg = Math.sign(rel);
        const x = CX + (ar < 1 ? rel * 74 : sg * (74 + (ar - 1) * 30));    // 正面から1つ目は74px、その先は30pxずつ
        const a = clamp(ar) * 62 * Math.PI / 180 * sg;                     // 回転（最大62°）
        if (Math.abs(x - CX) > 300) continue;
        const sx = Math.cos(a), skw = Math.sin(a) * 0.28;
        const draw = (flip) => {
          k.save(); k.translate(x, CY + (flip ? S : 0)); k.transform(sx, -skw, 0, flip ? -1 : 1, 0, 0);
          art(k, -S / 2, flip ? -S : -S / 2, S, S, mod(i, 6), 3);
          if (!flip) { txt(k, String(mod(i, 6) + 1).padStart(2, '0'), -S / 2 + 8, -S / 2 + 16, `800 10px ${MONO}`, rgba(C.ink, 0.55)); }
          k.restore();
        };
        k.globalAlpha = 0.22; draw(true); k.globalAlpha = 1;
        draw(false);
        k.fillStyle = `rgba(255,255,255,${0.45 * clamp(ar)})`;                // 横を向いた物は暗く
        k.save(); k.translate(x, CY); k.transform(sx, -skw, 0, 1, 0, 0); k.fillRect(-S / 2, -S / 2, S, S); k.restore();
      }
      // 映り込みを床でぼかす
      const fl = k.createLinearGradient(0, CY + S / 2, 0, VH); fl.addColorStop(0, rgba(C.desk, 0.35)); fl.addColorStop(0.6, rgba(C.desk, 1)); k.fillStyle = fl; k.fillRect(0, CY + S / 2, VW, VH);
      // 曲名（正面の1枚）
      const near = Math.round(p), la = clamp(1 - Math.abs(p - near) * 3);
      txt(k, NAMES[mod(near, 6)], CX, 140, `800 13px ${EN}`, rgba(C.ink, la), 'center');
      txt(k, 'LP3 Records', CX, 156, `500 10px ${EN}`, rgba(C.sub, la), 'center');
      // 送りのつまみ
      k.fillStyle = C.faint; rr(k, 150, 162, 210, 4, 2); k.fill();
      k.fillStyle = C.blue; rr(k, 150 + 210 * p / 5, 160, 36, 8, 4); k.fill();
    });
  };

  // @element 08
  // 08 無限キャンバス（上下左右に途切れなく続く作品の壁を、つかんでドラッグして見て回る。端が来ない）
  CELLS[7] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 0);
    // ドラッグは2回。1回目は左上へ、2回目は左へ。1周で横に6枚・縦に2段ぶん進む（タイルは 6×2 で繰り返すので継ぎ目なし）
    const TX = 96, TY = 84;
    const d1 = eIO(P(u, 0.3, 1.9)), d2 = eIO(P(u, 2.5, 4.2));
    const ox = -(TX * 3) * d1 - (TX * 3) * d2, oy = -(TY * 2) * d1 + 0 * d2 + 14 * Math.sin(Math.PI * d2);
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      // うすい方眼
      k.strokeStyle = rgba(C.blue, 0.08); k.lineWidth = 1;
      for (let x = mod(ox, 24); x < VW; x += 24) { k.beginPath(); k.moveTo(x, 0); k.lineTo(x, VH); k.stroke(); }
      for (let y = mod(oy, 24); y < VH; y += 24) { k.beginPath(); k.moveTo(0, y); k.lineTo(VW, y); k.stroke(); }
      const i0 = Math.floor(-ox / TX) - 1, j0 = Math.floor(-oy / TY) - 1;
      for (let j = j0; j < j0 + 4; j++) for (let i = i0; i < i0 + 7; i++) {
        const x = ox + i * TX + (mod(j, 2) ? 48 : 0) + 10, y = oy + j * TY + 12;
        const v = mod(i * 5 + j * 3, 6), sz = mod(i + j * 3, 3);
        const tw = [74, 64, 70][sz], th = [58, 52, 46][sz];
        k.save(); k.shadowColor = 'rgba(30,30,33,.14)'; k.shadowBlur = 8; k.shadowOffsetY = 3; art(k, x, y, tw, th, v, 6); k.restore();
      }
      // つかむ印: ドラッグ中は押した輪、間は離して元の位置へ戻る
      const on = (u > 0.3 && u < 1.9) || (u > 2.5 && u < 4.2);
      const gx = on ? (u < 2 ? 380 - 120 * d1 : 400 - 150 * d2) : (u >= 1.9 && u < 2.5 ? lerp(260, 400, eIO(P(u, 1.9, 2.5))) : u >= 4.2 ? lerp(250, 380, eIO(P(u, 4.2, 4.7))) : 380);
      const gy = on ? (u < 2 ? 120 - 60 * d1 : 90 + 14 * Math.sin(Math.PI * d2)) : (u >= 1.9 && u < 2.5 ? lerp(60, 90, eIO(P(u, 1.9, 2.5))) : u >= 4.2 ? lerp(90, 120, eIO(P(u, 4.2, 4.7))) : 120);
      grabber(k, gx, gy, on);
      // 右上の札
      k.fillStyle = 'rgba(30,30,33,.82)'; rr(k, 392, 10, 106, 20, 10); k.fill();
      txt(k, 'DRAG TO EXPLORE', 445, 20.5, `700 8.5px ${EN}`, '#fff', 'center', 'middle', '1px');
    });
  };

  // @element 09
  // 09 ドック風メニュー（下に並んだアイコンの上をカーソルが通ると、近いアイコンほど大きくなって持ち上がり、まわりが押し広がる）
  CELLS[8] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const [cx, cy] = path([[0, 560, 150], [0.5, 470, 136], [2.2, 110, 136], [2.6, 110, 136], [4.2, 470, 136], [4.7, 560, 150]], u);
    view(k, () => {
      const bg = k.createLinearGradient(0, 0, VW, VH); bg.addColorStop(0, C.blueBg); bg.addColorStop(0.55, C.blueXL); bg.addColorStop(1, C.blueL); k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      k.fillStyle = 'rgba(255,255,255,.55)'; k.beginPath(); k.arc(90, 30, 60, 0, 7); k.fill();
      txt(k, '10:24', 482, 46, `200 30px ${EN}`, C.ink, 'right');
      txt(k, 'Tuesday, Nov 24', 481, 62, `600 10px ${EN}`, C.sub, 'right');
      // アイコンの大きさ: 1 + 0.85·exp(−(d/46)²)（d＝カーソルとの横の距離）。カーソルが外ならゆっくり 1 に戻る
      const N = 7, BASE = 34, GAP = 8, ICONS = [C.blue, C.blueM, C.blue, C.blueM, C.blue, C.blueM, C.blue];
      const lab = ['ホーム', '写真', 'メモ', '音楽', '地図', '設定', 'ゴミ箱'];
      let in1 = clamp(P(u, 0.35, 0.65)) * (1 - clamp(P(u, 4.15, 4.45)));
      const base0 = (VW - (N * BASE + (N - 1) * GAP)) / 2;
      const sc = [];
      for (let i = 0; i < N; i++) { const bx = base0 + i * (BASE + GAP) + BASE / 2, d = (cx - bx); sc.push(1 + 0.85 * Math.exp(-(d / 46) * (d / 46)) * in1); }
      const total = sc.reduce((a, s) => a + s * BASE, 0) + (N - 1) * GAP;
      // ドックの台（中身に合わせて伸びる）
      const DY = 152;
      k.fillStyle = 'rgba(255,255,255,.55)'; k.strokeStyle = 'rgba(255,255,255,.9)'; k.lineWidth = 1;
      rr(k, (VW - total) / 2 - 10, DY - BASE - 12, total + 20, BASE + 20, 14); k.fill(); k.stroke();
      let x = (VW - total) / 2, hov = -1, best = 0;
      for (let i = 0; i < N; i++) {
        const s = sc[i] * BASE; if (sc[i] > best) { best = sc[i]; hov = i; }
        const ix = x, iy = DY - 4 - s;
        k.save(); k.shadowColor = 'rgba(30,30,33,.2)'; k.shadowBlur = 6; k.shadowOffsetY = 2;
        k.fillStyle = ICONS[i]; rr(k, ix, iy, s, s, s * 0.24); k.fill(); k.restore();
        // 中の印
        k.fillStyle = 'rgba(255,255,255,.9)'; const m = s / 2;
        if (i % 3 === 0) { k.beginPath(); k.arc(ix + m, iy + m, s * 0.2, 0, 7); k.fill(); }
        else if (i % 3 === 1) { k.beginPath(); k.moveTo(ix + s * 0.28, iy + s * 0.7); k.lineTo(ix + m, iy + s * 0.3); k.lineTo(ix + s * 0.72, iy + s * 0.7); k.fill(); }
        else { rr(k, ix + s * 0.3, iy + s * 0.3, s * 0.4, s * 0.4, s * 0.06); k.fill(); }
        x += s + GAP;
      }
      // いちばん大きいアイコンの名前
      if (best > 1.55) {
        let lx = (VW - total) / 2; for (let i = 0; i < hov; i++) lx += sc[i] * BASE + GAP; lx += sc[hov] * BASE / 2;
        const a = clamp((best - 1.55) / 0.2), ty = DY - 10 - sc[hov] * BASE - 14;
        k.globalAlpha = a; k.fillStyle = 'rgba(30,30,33,.85)'; rr(k, lx - 26, ty - 10, 52, 19, 9.5); k.fill(); txt(k, lab[hov], lx, ty + 0.5, `700 10px ${JP}`, '#fff', 'center', 'middle'); k.globalAlpha = 1;
      }
      cursor(k, cx, cy);
    });
  };

  // @element 10
  // 10 ホログラムカード（カーソルの向きにカードが傾き、表面の虹色の箔と光の反射がカーソルを追って走る）
  CELLS[9] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const cx = 255 + 112 * Math.sin(W1 * u), cy = 86 + 40 * Math.sin(2 * W1 * u);     // カーソル（8の字）
    const nx = (cx - 255) / 112, ny = (cy - 86) / 40;                                  // -1〜1
    const ry = nx * 0.42, rx = -ny * 0.3;                                              // 傾き（ラジアン）
    view(k, () => {
      const bg = k.createRadialGradient(255, 80, 10, 255, 80, 300); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, C.blueXL); k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      const CWd = 172, CHd = 112;
      const [c, g, sc] = layer(k, 'holo', CWd, CHd);
      // 台紙
      const base = g.createLinearGradient(0, 0, CWd, CHd); base.addColorStop(0, C.blueM); base.addColorStop(1, C.blue); g.fillStyle = base; rr(g, 0, 0, CWd, CHd, 10); g.fill();
      // 虹色の箔（帯の位置がカーソルの横位置で流れる）
      g.save(); rr(g, 0, 0, CWd, CHd, 10); g.clip();
      const off = nx * 70 + ny * 30;
      const fo = g.createLinearGradient(-60 + off, -40, 120 + off, 150);
      [C.blue, C.blueL, '#FFFFFF', C.blueM, C.blue, C.blueXL, C.blueL].forEach((col, i) => fo.addColorStop(i / 6, col));
      g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.95; g.fillStyle = fo; g.fillRect(0, 0, CWd, CHd);
      // 箔の細かい斜線（光の当たる帯だけ濃く見える）
      g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.7; g.strokeStyle = '#fff'; g.lineWidth = 1;
      for (let i = -CHd; i < CWd; i += 5) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + CHd, CHd); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      // 絵柄: 星のキャラクター
      g.save(); g.translate(CWd / 2, 52); g.fillStyle = C.blueL; g.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 13 : 30, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fill(); g.fillStyle = C.ink; [-7, 7].forEach(ex => { g.beginPath(); g.arc(ex, 0, 2.6, 0, 7); g.fill(); }); g.restore();
      g.fillStyle = C.blue; rr(g, 10, 10, 44, 15, 7.5); g.fill(); txt(g, '★ RARE', 32, 18, `800 8.5px ${EN}`, '#fff', 'center', 'middle');
      txt(g, 'No.241', 12, CHd - 12, `700 9px ${MONO}`, 'rgba(255,255,255,.85)');
      txt(g, 'STARLING', CWd - 12, CHd - 12, `800 11px ${EN}`, '#fff', 'right', 'alphabetic', '1.5px');
      // 光の反射（カーソルの側に白い光）
      const gx = CWd / 2 + nx * 70, gy = CHd / 2 + ny * 40;
      const gl = g.createRadialGradient(gx, gy, 2, gx, gy, 90); gl.addColorStop(0, 'rgba(255,255,255,.55)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.globalCompositeOperation = 'screen'; g.fillStyle = gl; g.fillRect(0, 0, CWd, CHd); g.globalCompositeOperation = 'source-over';
      g.restore(); g.restore();
      // 影
      k.save(); k.fillStyle = 'rgba(30,30,33,.16)'; k.filter = 'none';
      k.beginPath(); k.ellipse(255 - nx * 14, 160, 78, 6, 0, 0, 7); k.fill(); k.restore();
      // 傾けて描く（奥へ倒れた側が少し細くなる、簡易の遠近）
      k.save(); k.translate(255, 84);
      k.transform(Math.cos(ry), Math.sin(ry) * 0.16, -Math.sin(rx) * 0.16, Math.cos(rx), 0, 0);
      k.drawImage(c, -CWd / 2, -CHd / 2, CWd, CHd);
      k.strokeStyle = 'rgba(255,255,255,.45)'; k.lineWidth = 1; rr(k, -CWd / 2 + 0.5, -CHd / 2 + 0.5, CWd - 1, CHd - 1, 10); k.stroke();
      k.restore();
      cursor(k, cx, cy, 0, C.ink);
    });
  };

  // @element 11
  // 11 イメージトレイル（カーソルを動かすと、通った所に写真が次々に置かれ、古い物から縮んで消えていく）
  CELLS[10] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const pos = t => [255 + 185 * Math.sin(W1 * t), 88 + 46 * Math.sin(2 * W1 * t + 0.6)];   // カーソルの通り道（8の字）
    const DT = CYC / 40, LIFE = 0.85;                                     // 0.1175秒ごとに1枚、0.85秒で消える
    view(k, () => {
      k.fillStyle = C.blueBg; k.fillRect(0, 0, VW, VH);
      txt(k, 'PORTFOLIO', VW / 2, 98, `900 54px ${EN}`, rgba(C.ink, 0.92), 'center', 'alphabetic', '4px');
      txt(k, 'Photo / Art / Motion — 2026', VW / 2, 124, `600 11px ${EN}`, C.sub, 'center');
      const n0 = Math.floor(u / DT);
      for (let j = Math.ceil(LIFE / DT); j >= 0; j--) {
        const n = n0 - j, t0 = n * DT, age = u - t0;
        if (age < 0 || age > LIFE) continue;
        const [x, y] = pos(t0), q = age / LIFE;
        const s = (q < 0.12 ? eBack(q / 0.12) : 1) * (1 - eIn(clamp((q - 0.55) / 0.45)));
        const m = mod(n, 40), rot = (mod(m * 37, 11) - 5) * 0.025;     // 1周で40枚。番号は40で回す（継ぎ目なし）
        k.save(); k.translate(x, y); k.rotate(rot); k.scale(s, s);
        k.shadowColor = 'rgba(30,30,33,.25)'; k.shadowBlur = 8; k.shadowOffsetY = 3;
        k.fillStyle = '#fff'; k.fillRect(-29, -36, 58, 72); k.shadowColor = 'transparent';
        art(k, -25, -32, 50, 64, mod(m, 6), 2);
        k.restore();
      }
      const [cx, cy] = pos(u); cursor(k, cx, cy);
    });
  };

  // @element 12
  // 12 流体シミュレーション（カーソルの通った所から色の煙が湧き、渦を巻いて広がりながら薄れていく）
  CELLS[11] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const pos = t => [255 + 170 * Math.sin(W1 * t), 86 + 48 * Math.sin(2 * W1 * t)];   // カーソル（8の字）
    const DT = CYC / 40, LIFE = 1.4;
    const COL = [C.blue, C.blueM, C.blue, C.blueL, C.blueM].map(hex);
    // 生きている煙の粒（0.1175秒ごとに1つ、1.4秒で消える）
    const B = [];
    for (let n = Math.floor(u / DT) - Math.ceil(LIFE / DT); n <= Math.floor(u / DT); n++) {
      const t0 = n * DT, age = u - t0; if (age < 0 || age > LIFE) continue;
      const m = mod(n, 40), [x, y] = pos(t0), a = m * 0.9 + age * 2.4;
      const r = 12 + 30 * age, wgt = Math.exp(-age * 2.1) * clamp(age / 0.1);
      B.push([x + Math.cos(a) * 26 * age, y + Math.sin(a) * 26 * age - 10 * age, r, wgt, COL[mod(m, 5)]]);
    }
    view(k, () => {
      const NX = 128, NY = 43, sx = VW / NX, sy = VH / NY, ph = W1 * u;
      const bg = hex(C.blueBg);
      field(k, 'fluid', 0, 0, VW, VH, NX, NY, (i, j) => {
        let px = (i + 0.5) * sx, py = (j + 0.5) * sy;
        // うずの歪み（流れて見えるように座標をずらす）
        px += 7 * Math.sin(py * 0.07 + ph * 2); py += 6 * Math.cos(px * 0.05 - ph);
        let r = 0, g = 0, b = 0, sw = 0;
        for (const [bx, by, br, bw, c] of B) {
          const dx = px - bx, dy = py - by, e = bw * Math.exp(-(dx * dx + dy * dy) / (br * br));
          if (e < 0.003) continue; r += c[0] * e; g += c[1] * e; b += c[2] * e; sw += e;
        }
        if (sw <= 0) return `rgb(${bg[0]},${bg[1]},${bg[2]})`;
        const q = Math.min(1, sw * 1.6);                                  // 煙の濃さ。煙の色は重なった粒の色の平均
        return `rgb(${lerp(bg[0], r / sw, q) | 0},${lerp(bg[1], g / sw, q) | 0},${lerp(bg[2], b / sw, q) | 0})`;
      });
      txt(k, 'Touch the color.', 30, 150, `800 15px ${EN}`, C.ink);
      const [cx, cy] = pos(u); cursor(k, cx, cy, 0, C.ink);
    });
  };

  // @element 13
  // 13 スクラッチカード（カードの表面の膜をコインでこすった所だけ削れて、下の当たりが見えてくる。ある程度削ると膜がすっと消える）
  CELLS[12] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const X = 150, Y = 30, CWd = 211, CHd = 106;
    const tri = x => 1 - Math.abs(mod(x, 2) - 1);                        // 0→1→0 の三角波
    const coin = t => [X + 24 + (CWd - 48) * tri((t - 0.45) / 0.42), Y + 20 + (CHd - 40) * clamp((t - 0.45) / 2.0)];
    view(k, () => {
      k.fillStyle = C.blueBg; k.fillRect(0, 0, VW, VH);
      txt(k, 'LUCKY DRAW', VW / 2, 20, `800 10px ${EN}`, C.blue, 'center', 'middle', '3px');
      // 下の当たり
      const pop = eBack(clamp((u - 2.6) / 0.35)) * (u < 4.1 ? 1 : 1);
      k.save(); k.shadowColor = 'rgba(30,30,33,.18)'; k.shadowBlur = 12; k.shadowOffsetY = 4; k.fillStyle = '#FFFFFF'; rr(k, X, Y, CWd, CHd, 12); k.fill(); k.restore();
      const R = rng(13);
      for (let i = 0; i < 26; i++) { k.fillStyle = PAL[i % 5]; const x = X + 8 + R() * (CWd - 16), y = Y + 8 + R() * (CHd - 16); k.save(); k.translate(x, y); k.rotate(R() * 3); k.fillRect(-3, -1.5, 6, 3); k.restore(); }
      k.save(); k.translate(X + CWd / 2, Y + CHd / 2); const ps = 1 + 0.08 * Math.sin(Math.PI * clamp((u - 2.6) / 0.35)); k.scale(ps, ps);
      txt(k, '当たり！', 0, -14, `900 20px ${JP}`, C.ink, 'center', 'middle');
      txt(k, '30% OFF', 0, 16, `900 26px ${EN}`, C.blue, 'center', 'middle', '1px'); k.restore();
      // 表面の膜（画面外に描き、こすった跡を消す）
      const fadeOut = clamp((u - 2.55) / 0.35), fadeIn = clamp((u - 4.1) / 0.45);
      const showFresh = u >= 4.1;
      const alpha = showFresh ? fadeIn : 1 - fadeOut;
      if (alpha > 0) {
        const [c, g] = layer(k, 'scratch', CWd, CHd);
        const fg = g.createLinearGradient(0, 0, CWd, CHd); fg.addColorStop(0, C.blueM); fg.addColorStop(0.5, C.blueL); fg.addColorStop(1, C.blueM); g.fillStyle = fg; rr(g, 0, 0, CWd, CHd, 12); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; for (let i = -CHd; i < CWd; i += 16) { g.beginPath(); g.moveTo(i, CHd); g.lineTo(i + CHd, 0); g.stroke(); }
        txt(g, 'ここをこすってね', CWd / 2, CHd / 2 + 1, `800 14px ${JP}`, '#fff', 'center', 'middle', '1px');
        if (!showFresh && u > 0.45) {
          g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.lineWidth = 24; g.lineCap = 'round'; g.lineJoin = 'round';
          g.beginPath(); const t1 = Math.min(u, 2.45);
          for (let t = 0.45; t <= t1 + 1e-9; t += 1 / 60) { const [x, y] = coin(Math.min(t, t1)); t === 0.45 ? g.moveTo(x - X, y - Y) : g.lineTo(x - X, y - Y); }
          const [ex, ey] = coin(t1); g.lineTo(ex - X, ey - Y); g.stroke(); g.globalCompositeOperation = 'source-over';
        }
        g.restore();
        k.globalAlpha = alpha; k.drawImage(c, X, Y, CWd, CHd); k.globalAlpha = 1;
      }
      // コイン（こすっている間だけカードの上。それ以外は右下で待つ）
      const on = u > 0.45 && u < 2.45;
      const [qx, qy] = on ? coin(u) : u <= 0.45 ? [lerp(420, coin(0.45)[0], eIO(P(u, 0.05, 0.45))), lerp(140, coin(0.45)[1], eIO(P(u, 0.05, 0.45)))] : [lerp(coin(2.45)[0], 420, eIO(P(u, 2.45, 2.9))), lerp(coin(2.45)[1], 140, eIO(P(u, 2.45, 2.9)))];
      k.save(); k.shadowColor = 'rgba(30,30,33,.3)'; k.shadowBlur = 6; k.shadowOffsetY = 2;
      k.fillStyle = '#FFFFFF'; k.beginPath(); k.arc(qx, qy, 13, 0, 7); k.fill(); k.restore();
      k.strokeStyle = C.blue; k.lineWidth = 2; k.beginPath(); k.arc(qx, qy, 9.5, 0, 7); k.stroke();
      txt(k, '★', qx, qy + 0.5, `700 10px ${EN}`, C.blue, 'center', 'middle');
    });
  };

  // @element 14
  // 14 スワイプカード（いちばん上のカードをつかんで右へ払うと「いいね」、左へ払うと「パス」。カードは傾きながら飛んでいき、下のカードが前に出る）
  CELLS[13] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const CARDS = [['レモンのタルト', '★ 4.8 ・ 保存 1,204', 3], ['ミントのモヒート', '★ 4.6 ・ 保存 862', 2]];   // 交互に出てくる2枚（おすすめのレシピ）
    // 1枚目: 0.3〜1.1 右へ引く → 1.1〜1.45 飛ぶ。2枚目: 2.4〜3.2 左へ引く → 3.2〜3.55 飛ぶ
    const sw = (t0) => { const d = 90 * eIO(P(u, t0, t0 + 0.8)), f = eIn(P(u, t0 + 0.8, t0 + 1.15)); return d + f * 320; };
    const out1 = sw(0.3), out2 = -sw(2.4);
    const up1 = eOut(P(u, 1.1, 1.5)), up2 = eOut(P(u, 3.2, 3.6));       // 下のカードが前に出る
    view(k, () => {
      k.fillStyle = C.blueXL; k.fillRect(0, 0, VW, VH);
      txt(k, 'TODAY\'S RECIPES', 26, 30, `800 10px ${EN}`, C.blue, 'left', 'middle', '2px');
      txt(k, '← パス', 70, 150, `700 11px ${JP}`, rgba(C.sub, 0.45 + 0.55 * clamp(-out2 / 90)), 'center', 'middle');
      txt(k, 'いいね →', 440, 150, `700 11px ${JP}`, rgba(C.blue, 0.45 + 0.55 * clamp(out1 / 90) * (u < 2 ? 1 : 0)), 'center', 'middle');
      const card = (idx, dx, depth, stamp, al = 1) => {
        if (al <= 0) return;
        const [ttl, sub, v] = CARDS[idx], s = 1 - depth * 0.06, dy = depth * 9;
        k.save(); k.globalAlpha = al; k.translate(255 + dx, 86 + dy); k.rotate(dx * 0.0016); k.scale(s, s);
        k.shadowColor = 'rgba(30,30,33,.18)'; k.shadowBlur = 12; k.shadowOffsetY = 4; k.fillStyle = '#fff'; rr(k, -78, -72, 156, 144, 14); k.fill(); k.shadowColor = 'transparent';
        art(k, -70, -64, 140, 86, v, 9);
        txt(k, ttl, -68, 40, `800 12.5px ${JP}`, C.ink); txt(k, sub, -68, 58, `500 10px ${JP}`, C.sub);
        if (stamp) { const [lb, col, a] = stamp; if (a > 0) { k.save(); k.globalAlpha = a; k.rotate(lb === 'LIKE' ? -0.25 : 0.25); k.fillStyle = 'rgba(255,255,255,.92)'; rr(k, -36, -44, 72, 28, 6); k.fill(); k.strokeStyle = col; k.lineWidth = 3; k.stroke(); txt(k, lb, 0, -29.5, `900 15px ${EN}`, col, 'center', 'middle', '2px'); k.restore(); } }
        k.restore();
      };
      // 奥から: 3枚目・2枚目・いちばん上
      if (u < 2.0) {
        card(1, 0, 3 - up1, null, up1); card(0, 0, 2 - up1, null); card(1, 0, 1 - up1, null);
        card(0, out1, 0, ['LIKE', C.blue, clamp(out1 / 60)]);
      } else {
        card(0, 0, 3 - up2, null, up2); card(1, 0, 2 - up2, null); card(0, 0, 1 - up2, null);
        card(1, out2, 0, ['NOPE', C.sub, clamp(-out2 / 60)]);
      }
      // つかむ印
      const on1 = u > 0.3 && u < 1.1, on2 = u > 2.4 && u < 3.2;
      const gx = 270 + (on1 ? out1 : on2 ? out2 : u < 2.4 && u >= 1.1 ? lerp(90, 0, eIO(P(u, 1.1, 1.7))) : u >= 3.2 ? lerp(-90, 0, eIO(P(u, 3.2, 3.8))) : 0);
      grabber(k, gx, 110, on1 || on2);
    });
  };

  // @element 15
  // 15 パタパタ表示（駅の発車標のように、1文字ずつの板が上下に割れてめくれ、何枚か途中の文字を経て次の文字に止まる。左から少しずつずれて始まる）
  CELLS[14] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const WORDS = ['TOKYO 09:30', 'PARIS 11:05', 'SEOUL 13:40'];
    const START = [0.5, 2.0, 3.5];                                        // 0→1, 1→2, 2→0 の切り替え開始
    const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
    const FL = 0.09, STAG = 0.045;                                        // 1回めくるのに0.09秒、1文字ごとに0.045秒ずつ遅れる
    // 文字 i の、時刻 u での [今の文字, 次の文字, めくれ具合 0〜1]
    const state = i => {
      let seg = 2; for (let s = 0; s < 3; s++) if (u >= START[s] + i * STAG) seg = s;
      if (u < START[0] + i * STAG) seg = 2;
      const from = WORDS[seg][i], to = WORDS[(seg + 1) % 3][i];
      const t = u - START[seg] - i * STAG + (u < START[0] + i * STAG ? CYC : 0);
      if (from === to) return [to, to, 0];
      const nf = 3 + mod(i * 5 + seg, 3);                                // 途中の文字を含めて3〜5回めくる
      const seq = [from]; for (let j = 1; j < nf; j++) seq.push(CH[mod(CH.indexOf(from) + j * 7 + i, CH.length)]); seq.push(to);
      const step = Math.floor(t / FL);
      if (step >= nf) return [to, to, 0];
      return [seq[step], seq[step + 1], (t - step * FL) / FL];
    };
    view(k, () => {
      k.fillStyle = C.blueBg; k.fillRect(0, 0, VW, VH);
      k.fillStyle = C.ink; rr(k, 24, 30, 463, 110, 14); k.fill();
      txt(k, 'DEPARTURES', 44, 52, `800 10px ${EN}`, C.blue, 'left', 'middle', '3px');
      txt(k, '出発', 467, 52, `800 11px ${JP}`, 'rgba(255,255,255,.7)', 'right', 'middle');
      const N = 11, FW = 34, FH = 54, G = 4, x0 = (VW - (N * FW + (N - 1) * G)) / 2, y0 = 66, mid = y0 + FH / 2;
      const glyph = (c, x, i) => txt(k, c, x + FW / 2, mid + 1.5, `800 30px ${MONO}`, i >= 6 ? C.blueL : '#fff', 'center', 'middle');
      const half = (c, x, i, top, sy = 1) => {       // 上半分 or 下半分（sy で真ん中を軸に縮める）
        k.save(); k.beginPath(); k.rect(x, top ? y0 : mid, FW, FH / 2); k.clip();
        k.translate(0, mid); k.scale(1, sy); k.translate(0, -mid);
        k.fillStyle = C.mark; rr(k, x, y0, FW, FH, 5); k.fill(); glyph(c, x, i);
        if (sy < 1) { k.fillStyle = `rgba(0,0,0,${0.35 * (1 - sy)})`; k.fillRect(x, y0, FW, FH); }
        k.restore();
      };
      for (let i = 0; i < N; i++) {
        const x = x0 + i * (FW + G), [a, b, f] = state(i);
        if (f <= 0) { half(a, x, i, true); half(a, x, i, false); }
        else {
          half(b, x, i, true); half(a, x, i, false);                     // うしろ: 上は次の字、下は今の字
          if (f < 0.5) half(a, x, i, true, 1 - f * 2);                   // 今の字の上半分が倒れてくる
          else half(b, x, i, false, f * 2 - 1);                          // 次の字の下半分が下りてくる
        }
        k.fillStyle = C.ink; k.fillRect(x, mid - 0.75, FW, 1.5);
      }
      bars(k, 44, 128, 120, 1, 'rgba(255,255,255,.18)', 4);
    });
  };

  // @element 16
  // 16 FLIPアニメーション（絞り込みのボタンを押すと、外れたカードが縮んで消え、残ったカードが元の場所から新しい場所へ滑って並び直す）
  CELLS[15] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 1);
    const TYPE = [0, 1, 0, 1, 1, 0, 0, 1], V = [1, 0, 4, 2, 3, 1, 4, 5];   // 0＝写真（山の絵）、1＝イラスト（丸・しま）
    const slot = n => [24 + (n % 4) * 118, 44 + Math.floor(n / 4) * 62];
    const after = []; let c = 0; TYPE.forEach((t, i) => { after[i] = t === 0 ? c++ : -1; });
    // 写真で絞る: 0.6 押す → 0.6〜0.85 イラストが消える → 0.75〜1.4 写真が滑る。すべてに戻す: 2.6 押す → 2.6〜3.2 戻る → 3.0〜3.35 イラストが出る
    const mv = eIO(P(u, 0.75, 1.4)) * (1 - eIO(P(u, 2.6, 3.2)));
    const gone = eOut(P(u, 0.6, 0.85)) * (1 - eOut(P(u, 3.0, 3.35)));
    const [cx, cy] = path([[0, 430, 140], [0.45, 130, 26], [1.4, 130, 26], [2.0, 320, 150], [2.45, 62, 26], [3.4, 62, 26], [4.4, 430, 140]], u);
    const press = Math.max(clamp(1 - Math.abs(u - 0.6) / 0.08), clamp(1 - Math.abs(u - 2.6) / 0.08));
    const sel = u >= 0.6 && u < 2.6 ? 1 : 0;
    view(k, () => {
      k.fillStyle = '#fff'; k.fillRect(0, 0, VW, VH);
      ['すべて', '写真', 'イラスト'].forEach((s, i) => {
        const x = 24 + i * 72, on = i === (sel ? 1 : 0);
        k.fillStyle = on ? C.ink : C.soft; rr(k, x, 12, 64, 22, 11); k.fill();
        txt(k, s, x + 32, 23.5, `700 10.5px ${JP}`, on ? '#fff' : C.ink, 'center', 'middle');
      });
      txt(k, `${sel ? 4 : 8} 件`, 487, 23.5, `600 10px ${JP}`, C.sub, 'right', 'middle');
      for (let i = 0; i < 8; i++) {
        const [x0, y0] = slot(i);
        if (TYPE[i] === 1) {
          if (gone >= 1) continue;
          const s = 1 - 0.25 * gone; k.save(); k.globalAlpha = 1 - gone; k.translate(x0 + 53, y0 + 26); k.scale(s, s); art(k, -53, -26, 106, 52, V[i], 7); k.restore();
          continue;
        }
        const [x1, y1] = slot(after[i]), x = lerp(x0, x1, mv), y = lerp(y0, y1, mv);
        // First（元の場所）の点線の枠: 動いている間だけ
        if (mv > 0.02 && mv < 0.98 && (x0 !== x1 || y0 !== y1)) { k.save(); k.setLineDash([4, 4]); k.strokeStyle = rgba(C.blue, 0.45); k.lineWidth = 1.2; rr(k, x0 + 0.5, y0 + 0.5, 105, 51, 7); k.stroke(); k.restore(); }
        k.save(); k.shadowColor = 'rgba(30,30,33,.16)'; k.shadowBlur = 8; k.shadowOffsetY = 3; art(k, x, y, 106, 52, V[i], 7); k.restore();
      }
      cursor(k, cx, cy, press);
    });
  };

  // @element 17
  // 17 リキッドグラス（カラフルな見出しの上を、ガラスのレンズのような丸いバーが動き、下の絵と文字をふくらませて曲げる）
  CELLS[16] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    view(k, () => {
      // 背景（レンズで曲げるので、見出しまで画面外の1枚に描いておく）
      const [bgc, g, sc] = layer(k, 'lg-bg', VW, VH);
      const base = g.createLinearGradient(0, 0, VW, VH); base.addColorStop(0, C.blue); base.addColorStop(1, C.blueM); g.fillStyle = base; g.fillRect(0, 0, VW, VH);
      g.filter = `blur(${22 * sc}px)`;
      [[C.blueL, 110 + 40 * Math.sin(W1 * u), 40 + 14 * Math.cos(W1 * u), 62], ['#FFFFFF', 400 + 30 * Math.cos(W1 * u), 140, 70], [C.blueXL, 280, 10 + 12 * Math.sin(2 * W1 * u), 54]]
        .forEach(([col, x, y, r]) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
      g.filter = 'none';
      txt(g, 'LIGHT', 30, 74, `900 46px ${EN}`, '#fff', 'left', 'alphabetic', '2px');
      txt(g, 'IN MOTION', 30, 112, `900 34px ${EN}`, 'rgba(255,255,255,.92)', 'left', 'alphabetic', '2px');
      g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 2; i++) { rr(g, 32, 128 + i * 11, i ? 120 : 190, 5, 2.5); g.fill(); }
      g.fillStyle = '#fff'; rr(g, 380, 22, 100, 26, 13); g.fill(); txt(g, 'JOIN NOW', 430, 35.5, `800 11px ${EN}`, C.blue, 'center', 'middle', '1px');
      g.restore();
      k.drawImage(bgc, 0, 0, VW, VH);
      // レンズ（丸いバー）の位置: 左右に往復し、少し上下する
      const LW = 176, LH = 58, lx = 255 + 140 * Math.sin(W1 * u) - LW / 2, ly = 64 + 16 * Math.sin(2 * W1 * u) - LH / 2;
      const ccx = lx + LW / 2, ccy = ly + LH / 2;
      const lens = (inset, z) => { k.save(); rr(k, lx + inset, ly + inset, LW - inset * 2, LH - inset * 2, LH / 2 - inset); k.clip();
        k.translate(ccx, ccy); k.scale(z, z); k.translate(-ccx, -ccy); k.drawImage(bgc, 0, 0, VW, VH); k.restore(); };
      k.save(); k.shadowColor = 'rgba(30,30,33,.35)'; k.shadowBlur = 18; k.shadowOffsetY = 6; k.fillStyle = 'rgba(255,255,255,.01)'; rr(k, lx, ly, LW, LH, LH / 2); k.fill(); k.restore();
      // ふちほど強く曲げる: 外側の輪は大きく拡大、内側はやや拡大
      lens(0, 1.7); lens(7, 1.38); lens(13, 1.22);
      // 白いうすい膜と、上のふちの光、下のふちの色のにじみ
      k.fillStyle = 'rgba(255,255,255,.10)'; rr(k, lx, ly, LW, LH, LH / 2); k.fill();
      const hl = k.createLinearGradient(0, ly, 0, ly + LH); hl.addColorStop(0, 'rgba(255,255,255,.95)'); hl.addColorStop(0.35, 'rgba(255,255,255,0)'); hl.addColorStop(0.8, 'rgba(255,255,255,0)'); hl.addColorStop(1, 'rgba(255,255,255,.6)');
      k.strokeStyle = hl; k.lineWidth = 2; rr(k, lx + 1, ly + 1, LW - 2, LH - 2, LH / 2 - 1); k.stroke();
      k.strokeStyle = rgba(C.blueM, 0.5); k.lineWidth = 1; rr(k, lx + 3, ly + 3.5, LW - 6, LH - 6, LH / 2 - 3); k.stroke();
      // バーの中のアイコン3つ（ナビの形）
      for (let i = 0; i < 3; i++) { k.fillStyle = i === 1 ? '#fff' : 'rgba(255,255,255,.7)'; k.beginPath(); k.arc(ccx + (i - 1) * 46, ccy, i === 1 ? 8 : 6, 0, 7); k.fill(); }
    });
  };

  // @element 18
  // 18 フルーテッドガラス（縦の溝が並んだガラスの板の向こうで、色と文字がにじみ、溝ごとに細く縮んで並ぶ。板はゆっくり左右に動く）
  CELLS[17] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    view(k, () => {
      const blobs = g => {
        const base = g.createLinearGradient(0, 0, VW, VH); base.addColorStop(0, C.blue); base.addColorStop(1, C.blueM); g.fillStyle = base; g.fillRect(0, 0, VW, VH);
        [['#FFFFFF', 330 + 70 * Math.sin(W1 * u), 70 + 30 * Math.cos(W1 * u), 52], [C.blueL, 420 + 40 * Math.cos(W1 * u + 1), 130, 40], [C.blueXL, 250, 20 + 20 * Math.sin(2 * W1 * u), 34]]
          .forEach(([col, x, y, r]) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 7; g.beginPath(); g.arc(400 - 30 * Math.sin(W1 * u), 88, 46, 0, 7); g.stroke();
        txt(g, 'SOFT', 32, 80, `900 50px ${EN}`, '#fff', 'left', 'alphabetic', '3px');
        txt(g, 'FOCUS', 32, 128, `900 50px ${EN}`, C.blueXL, 'left', 'alphabetic', '3px');
      };
      const [bc, bg] = layer(k, 'fl-bg', VW, VH); blobs(bg); bg.restore();
      const [cc, cg, s] = layer(k, 'fl-blur', VW, VH); cg.filter = `blur(${2.5 * s}px)`; blobs(cg); cg.filter = 'none'; cg.restore();
      k.drawImage(bc, 0, 0, VW, VH);
      // ガラスの板: 左の端が 150〜250 を往復。溝 1本 16px は、うしろの 40px ぶんを左右反転して縮めて映す
      const PX = 200 + 50 * Math.sin(W1 * u), RW = 16;
      for (let x = PX; x < VW; x += RW) {
        const src = clamp(x - RW * 0.75, 0, VW - RW * 2.5);
        k.save(); k.translate(x + RW, 0); k.scale(-1, 1); k.drawImage(cc, src * s, 0, RW * 2.5 * s, VH * s, 0, 0, RW, VH); k.restore();
        const sh = k.createLinearGradient(x, 0, x + RW, 0);
        sh.addColorStop(0, 'rgba(255,255,255,.34)'); sh.addColorStop(0.25, 'rgba(255,255,255,.06)'); sh.addColorStop(0.7, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(30,30,33,.18)');
        k.fillStyle = sh; k.fillRect(x, 0, RW, VH);
      }
      k.fillStyle = 'rgba(255,255,255,.08)'; k.fillRect(PX, 0, VW - PX, VH);
      k.fillStyle = 'rgba(255,255,255,.7)'; k.fillRect(PX, 0, 1.5, VH);
    });
  };

  // @element 19
  // 19 リキッドメタル（見出しの文字と球の中を、溶けた金属のような映り込みがうねりながら流れ続ける）
  CELLS[18] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    // 金属の色の並び（黒→青→薄い青→白→中間の青→白→ごく薄い青→青→黒）
    const RAMP = [C.ink, C.blue, C.blueL, '#FFFFFF', C.blueM, '#FFFFFF', C.blueXL, C.blue, C.ink].map(hex);
    const ramp = t => { t = mod(t, 1) * (RAMP.length - 1); const i = Math.floor(t), f = t - i, a = RAMP[i], b = RAMP[Math.min(i + 1, RAMP.length - 1)];
      return `rgb(${lerp(a[0], b[0], f) | 0},${lerp(a[1], b[1], f) | 0},${lerp(a[2], b[2], f) | 0})`; };
    view(k, () => {
      const bg = k.createLinearGradient(0, 0, 0, VH); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, C.desk); k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      const ph = W1 * u;
      const [c, g] = layer(k, 'metal', VW, VH);
      field(g, 'metal-f', 0, 0, VW, VH, 128, 43, (i, j) => {
        const x = i * 4, y = j * 4;
        const v = Math.sin(x * 0.03 + 2.3 * Math.sin(y * 0.045 + ph) + ph) + 0.55 * Math.sin(y * 0.08 - x * 0.018 + 2 * ph) + 0.3 * Math.sin((x + y) * 0.05 - ph);
        return ramp(v * 0.22 + y * 0.002);
      });
      // 形だけ残す（文字と球を1枚の型にまとめてから切り抜く）
      const [mc, mg] = layer(k, 'metal-m', VW, VH);
      txt(mg, 'FLOW', 30, 112, `900 84px ${EN}`, '#000', 'left', 'alphabetic', '2px');
      mg.beginPath(); mg.arc(414, 80, 52, 0, 7); mg.fill(); mg.restore();
      g.globalCompositeOperation = 'destination-in'; g.drawImage(mc, 0, 0, VW, VH);
      g.globalCompositeOperation = 'source-over';
      // 球の立体感
      const sg = g.createRadialGradient(396, 60, 6, 414, 80, 56); sg.addColorStop(0, 'rgba(255,255,255,.55)'); sg.addColorStop(0.55, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(30,30,33,.55)');
      g.fillStyle = sg; g.beginPath(); g.arc(414, 80, 52, 0, 7); g.fill();
      g.restore();
      k.save(); k.shadowColor = rgba(C.blue, 0.25); k.shadowBlur = 14; k.drawImage(c, 0, 0, VW, VH); k.restore();
      txt(k, 'Liquid metal type & objects', 32, 140, `600 11px ${EN}`, C.sub);
      k.fillStyle = 'rgba(30,30,33,.08)'; k.beginPath(); k.ellipse(414, 150, 46, 6, 0, 0, 7); k.fill();
    });
  };

  // @element 20
  // 20 コースティクス（水の底に、波で集まった光の網目がゆらめき続ける。プールの見出しと浮き輪が上に乗る）
  CELLS[19] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    const ph = W1 * u;
    const A = hex(C.blue), B = hex(C.blueM), L = hex('#FFFFFF');
    view(k, () => {
      // 光の網目（自前の式）: 向きと細かさの違う3つの波 w = sin(f·(向きの座標) + m·a + 1.6·sin(0.6f·(直角の座標) + n·a)) を足し、
      // 和が0に近い所ほど明るくする（明るさ = (1 − |和| / 1.6)^6）。a = 2πt/4.7、m・n は整数なので4.7秒で元に戻る
      const WV = [[0.35, 0.050, 1, -1], [2.45, 0.043, -1, 2], [4.15, 0.057, 2, 1]].map(([th, f, m, n]) => [Math.cos(th), Math.sin(th), f, m, n]);
      const NX = 128, NY = 43;
      field(k, 'caustic', 0, 0, VW, VH, NX, NY, (i, j) => {
        const px = (i + 0.5) * VW / NX, py = (j + 0.5) * VH / NY;
        let sum = 0;
        for (const [c, s2, f, m, n] of WV) { const u1 = px * c + py * s2, u2 = -px * s2 + py * c; sum += Math.sin(f * u1 + m * ph + 1.6 * Math.sin(0.6 * f * u2 + n * ph)); }
        const v = Math.pow(clamp(1 - Math.abs(sum) / 1.6), 6);
        const d = j / NY;
        const r = lerp(A[0], B[0], d), g = lerp(A[1], B[1], d), bb = lerp(A[2], B[2], d);
        return `rgb(${lerp(r, L[0], v) | 0},${lerp(g, L[1], v) | 0},${lerp(bb, L[2], v) | 0})`;
      });
      // 浮き輪（影は水の底に落ちる）
      const fx = 400 + 10 * Math.sin(W1 * u), fy = 70 + 5 * Math.sin(2 * W1 * u);
      k.fillStyle = 'rgba(30,30,33,.18)'; k.beginPath(); k.ellipse(fx + 18, fy + 44, 44, 16, 0, 0, 7); k.fill();
      k.save(); k.translate(fx, fy); k.rotate(0.15 * Math.sin(W1 * u));
      for (let i = 0; i < 8; i++) { k.fillStyle = i % 2 ? '#fff' : C.blue; k.beginPath(); k.arc(0, 0, 38, i * Math.PI / 4, (i + 1) * Math.PI / 4); k.arc(0, 0, 18, (i + 1) * Math.PI / 4, i * Math.PI / 4, true); k.fill(); }
      k.fillStyle = 'rgba(255,255,255,.35)'; k.beginPath(); k.ellipse(-14, -22, 12, 5, -0.6, 0, 7); k.fill();
      k.restore();
      k.save(); k.shadowColor = 'rgba(30,30,33,.3)'; k.shadowBlur = 8;
      txt(k, 'POOL DAYS', 30, 58, `800 11px ${EN}`, 'rgba(255,255,255,.9)', 'left', 'alphabetic', '3px');
      txt(k, '夏の、水の底で。', 28, 96, `900 28px ${JP}`, '#fff'); k.restore();
      k.fillStyle = '#fff'; rr(k, 30, 116, 96, 26, 13); k.fill(); txt(k, '予約する', 78, 129.5, `800 11px ${JP}`, C.blue, 'center', 'middle');
    });
  };

  // @element 21
  // 21 木漏れ日（壁に差す光の中で、葉の影がぼけたままゆっくり揺れる。光の当たる所だけ少し明るく暖かい）
  CELLS[20] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    view(k, () => {
      const wall = k.createLinearGradient(0, 0, VW, VH); wall.addColorStop(0, C.desk); wall.addColorStop(1, C.blueBg); k.fillStyle = wall; k.fillRect(0, 0, VW, VH);
      // 窓から差す光（斜めの明るい帯）
      k.save(); k.globalCompositeOperation = 'screen';
      const lg = k.createLinearGradient(150, 0, 420, VH); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.35, 'rgba(255,255,255,.95)'); lg.addColorStop(0.75, 'rgba(255,255,255,.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      k.fillStyle = lg; k.beginPath(); k.moveTo(170, 0); k.lineTo(470, 0); k.lineTo(380, VH); k.lineTo(60, VH); k.fill(); k.restore();
      // 葉の影（画面外に描いてぼかし、青で重ねる）
      const [c, g, s] = layer(k, 'leaf', VW, VH);
      g.filter = `blur(${4.5 * s}px)`; g.fillStyle = C.blue; g.strokeStyle = C.blue;
      const BR = [[520, -20, 2.55, 6, 0], [470, 190, 3.55, 5, 1.7], [-20, -10, 0.75, 5, 3.1]];
      for (const [bx, by, ang0, n, o] of BR) {
        const ang = ang0 + 0.06 * Math.sin(W1 * u + o);
        g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(ang) * 230, by + Math.sin(ang) * 230); g.stroke();
        for (let i = 0; i < n * 2; i++) {
          const d = 40 + i * 18, side = i % 2 ? 1 : -1;
          const lx = bx + Math.cos(ang) * d + Math.cos(ang + side * 1.2) * 16, ly = by + Math.sin(ang) * d + Math.sin(ang + side * 1.2) * 16;
          const rot = ang + side * 0.9 + 0.22 * Math.sin(2 * W1 * u + i * 1.3 + o);
          g.beginPath(); g.ellipse(lx, ly, 17, 7, rot, 0, 7); g.fill();
        }
      }
      g.filter = 'none'; g.restore();
      k.save(); k.globalAlpha = 0.3; k.drawImage(c, 0, 0, VW, VH); k.restore();
      // ページの中身
      txt(k, 'MORNING CERAMICS', 30, 50, `800 10px ${EN}`, C.blue, 'left', 'alphabetic', '3px');
      txt(k, 'ひだまりの器', 28, 86, `900 26px ${JP}`, C.ink);
      bars(k, 30, 100, 160, 2, 'rgba(30,30,33,.15)');
      k.fillStyle = C.ink; rr(k, 30, 126, 92, 26, 13); k.fill(); txt(k, 'SHOP', 76, 139.5, `800 11px ${EN}`, '#fff', 'center', 'middle', '2px');
      // 花びん
      k.fillStyle = 'rgba(30,30,33,.12)'; k.beginPath(); k.ellipse(330, 156, 40, 7, 0, 0, 7); k.fill();
      k.fillStyle = C.blueM; k.beginPath(); k.moveTo(312, 70); k.bezierCurveTo(292, 110, 296, 156, 330, 156); k.bezierCurveTo(364, 156, 368, 110, 348, 70); k.closePath(); k.fill();
      k.fillStyle = 'rgba(255,255,255,.35)'; k.beginPath(); k.ellipse(316, 112, 5, 22, 0.1, 0, 7); k.fill();
      k.strokeStyle = C.blue; k.lineWidth = 2; k.beginPath(); k.moveTo(330, 72); k.quadraticCurveTo(338, 40, 352, 26); k.moveTo(326, 72); k.quadraticCurveTo(314, 46, 300, 36); k.stroke();
      k.fillStyle = C.blue; k.beginPath(); k.arc(352, 26, 6, 0, 7); k.arc(300, 36, 5, 0, 7); k.fill();
    });
  };

  // @element 22
  // 22 トポグラフィック（山の高さを等高線で描いた模様が、地形ごとゆっくりうねって形を変え続ける）
  CELLS[21] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    const ph = W1 * u;
    // 高さ: 動く4つの山 ＋ ゆるい波
    const HILL = [[150, 70, 70, 1.0, 0], [340, 110, 80, 0.9, 1.6], [470, 30, 60, 0.7, 3.2], [60, 150, 55, 0.6, 4.4]];
    const H = (x, y) => {
      let v = 0.12 * Math.sin(x * 0.02 + ph) * Math.cos(y * 0.03 - ph);
      for (const [hx, hy, r, a, o] of HILL) { const cx = hx + 22 * Math.cos(ph + o), cy = hy + 14 * Math.sin(ph + o); v += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (r * r)); }
      return v;
    };
    view(k, () => {
      const bg = k.createLinearGradient(0, 0, VW, VH); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, C.blueBg); k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      const G = 7, NX = Math.ceil(VW / G) + 1, NY = Math.ceil(VH / G) + 1, Z = [];
      for (let j = 0; j < NY; j++) { Z.push([]); for (let i = 0; i < NX; i++) Z[j].push(H(i * G, j * G)); }
      const LV = 11, COLS = [C.blueL, C.blueM, C.blue];
      k.lineWidth = 1.3; k.lineCap = 'round';
      for (let l = 0; l < LV; l++) {
        const iso = -0.08 + l * 0.1, cf = l / (LV - 1) * (COLS.length - 1), ci = Math.floor(cf);
        k.strokeStyle = mix(COLS[ci], COLS[Math.min(ci + 1, COLS.length - 1)], cf - ci); k.globalAlpha = 0.55 + 0.45 * (l / LV);
        k.beginPath();
        for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
          const a = Z[j][i], b = Z[j][i + 1], c = Z[j + 1][i + 1], d = Z[j + 1][i];
          const pts = [];
          const ed = (p, q, x1, y1, x2, y2) => { if ((p < iso) !== (q < iso)) { const t = (iso - p) / (q - p); pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } };
          const x = i * G, y = j * G;
          ed(a, b, x, y, x + G, y); ed(b, c, x + G, y, x + G, y + G); ed(c, d, x + G, y + G, x, y + G); ed(d, a, x, y + G, x, y);
          for (let p = 0; p + 1 < pts.length; p += 2) { k.moveTo(pts[p][0], pts[p][1]); k.lineTo(pts[p + 1][0], pts[p + 1][1]); }
        }
        k.stroke();
      }
      k.globalAlpha = 1;
      k.save(); k.shadowColor = 'rgba(30,30,33,.12)'; k.shadowBlur = 10; k.shadowOffsetY = 3; k.fillStyle = '#FFFFFF'; rr(k, 24, 44, 196, 84, 12); k.fill(); k.restore();
      txt(k, 'GEO LAB OPEN DAY', 40, 68, `800 10px ${EN}`, C.blue, 'left', 'alphabetic', '2px');
      txt(k, '地図にない線を描く', 40, 98, `900 21px ${JP}`, C.ink);
      txt(k, '12.6 Sat ・ 研究所の公開日', 40, 116, `600 10px ${JP}`, C.sub);
    });
  };

  // @element 23
  // 23 ハーフトーン（印刷の網点のように、絵の明るさを点の大きさに置きかえて描く。下の絵が動くと点が育ったり縮んだりする）
  CELLS[22] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    const ph = W1 * u;
    // 下の絵（0〜1）: 右から昇る大きな太陽と、流れる波
    const sun = (x, y) => { const cx = 360 + 20 * Math.sin(ph), cy = 70 - 10 * Math.cos(ph); return clamp(1.15 - Math.hypot(x - cx, y - cy) / 70); };
    const wave = (x, y) => clamp((y - (118 + 12 * Math.sin(x * 0.028 - ph) + 6 * Math.sin(x * 0.06 + 2 * ph))) / 40 + 0.15);
    view(k, () => {
      k.fillStyle = C.blueBg; k.fillRect(0, 0, VW, VH);
      const S = 8;
      const screen = (fn, col, ang, ox, oy) => {
        k.save(); k.fillStyle = col;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        for (let a = -30; a < 50; a++) for (let b = -10; b < 80; b++) {
          const x = ox + (a * ca - b * sa) * S, y = oy + (a * sa + b * ca) * S;
          if (x < 180 || x > VW + 4 || y < -4 || y > VH + 4) continue;
          const fade = clamp((x - 180) / 70);
          const r = S * 0.58 * Math.sqrt(fn(x, y)) * fade;
          if (r > 0.35) { k.beginPath(); k.arc(x, y, r, 0, 7); k.fill(); }
        }
        k.restore();
      };
      k.save(); k.globalCompositeOperation = 'multiply';
      screen(sun, C.blue, 0.26, 200, -40);
      screen(wave, C.blueM, 1.31, 400, -60);
      screen((x, y) => 0.35 * sun(x, y) * wave(x + 30, y - 30), C.blue, 0.79, 300, -50);
      k.restore();
      txt(k, 'POP', 30, 82, `900 50px ${EN}`, C.ink, 'left', 'alphabetic', '3px');
      txt(k, 'PRINT', 30, 128, `900 50px ${EN}`, C.ink, 'left', 'alphabetic', '3px');
      k.fillStyle = C.blue; k.beginPath(); k.arc(186, 66, 8, 0, 7); k.fill();
    });
  };

  // @element 24
  // 24 CRTエフェクト（ブラウン管のように、横の走査線・赤緑青の細い縞・文字の色ずれとにじみ・上から下へ流れる明るい帯・四隅の暗さを重ねる）
  CELLS[23] = (k, w, h, u) => {
    u = snapU(u);
    frame(k, 2);
    const ph = W1 * u;
    view(k, () => {
      k.fillStyle = C.desk; k.fillRect(0, 0, VW, VH);
      const X = 16, Y = 12, SW = VW - 32, SH = VH - 24;
      k.save(); rr(k, X, Y, SW, SH, 24); k.clip();
      const sg = k.createRadialGradient(X + SW / 2, Y + SH / 2, 10, X + SW / 2, Y + SH / 2, SW * 0.6); sg.addColorStop(0, C.mark); sg.addColorStop(1, C.ink); k.fillStyle = sg; k.fillRect(X, Y, SW, SH);
      // 中身（色ずれ: 赤みと青みを左右に1.6pxずらして重ねる）
      const flick = 0.93 + 0.07 * (0.5 + 0.5 * Math.sin(12 * ph));
      const draw = (dx, col, a) => {
        k.save(); k.globalAlpha = a * flick; k.shadowColor = col; k.shadowBlur = 10;
        txt(k, 'PLAY', X + SW / 2 + dx, Y + 74, `900 64px ${MONO}`, col, 'center', 'middle', '6px');
        if (dx === 0) { k.shadowColor = C.blueM; k.shadowBlur = 4; txt(k, 'HI-SCORE 024100', X + SW / 2, Y + 26, `700 11px ${MONO}`, C.blueM, 'center', 'middle', '2px'); }
        k.restore();
      };
      k.globalCompositeOperation = 'lighter';
      draw(-1.6, C.blue, 0.9); draw(1.6, C.blueM, 0.8);
      k.globalCompositeOperation = 'source-over';
      draw(0, '#fff', 0.9);
      if (Math.sin(4 * ph) > -0.2) txt(k, '▶ PRESS START', X + SW / 2, Y + 122, `700 12px ${MONO}`, C.blueL, 'center', 'middle', '2px');
      // 赤緑青の縦の縞
      const RGB = [rgba(C.blue, 0.1), rgba(C.blueM, 0.06), rgba(C.blueXL, 0.05)];
      for (let x = X; x < X + SW; x += 3) for (let c = 0; c < 3; c++) { k.fillStyle = RGB[c]; k.fillRect(x + c, Y, 1, SH); }
      // 走査線
      k.fillStyle = 'rgba(0,0,0,.32)'; for (let y = Y; y < Y + SH; y += 3) k.fillRect(X, y + 2, SW, 1);
      // 流れる明るい帯（4.7秒で上から下へ1回）
      const by = Y - 40 + (SH + 80) * (u / CYC);
      const bg2 = k.createLinearGradient(0, by - 24, 0, by + 24); bg2.addColorStop(0, 'rgba(255,255,255,0)'); bg2.addColorStop(0.5, 'rgba(255,255,255,.08)'); bg2.addColorStop(1, 'rgba(255,255,255,0)');
      k.fillStyle = bg2; k.fillRect(X, by - 24, SW, 48);
      // 四隅の暗さとガラスの反射
      const vg = k.createRadialGradient(X + SW / 2, Y + SH / 2, SH * 0.45, X + SW / 2, Y + SH / 2, SW * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)');
      k.fillStyle = vg; k.fillRect(X, Y, SW, SH);
      k.fillStyle = 'rgba(255,255,255,.05)'; k.beginPath(); k.ellipse(X + SW * 0.3, Y + 10, SW * 0.32, 20, -0.05, 0, 7); k.fill();
      k.restore();
      k.strokeStyle = C.g3; k.lineWidth = 2; rr(k, X, Y, SW, SH, 24); k.stroke();
    });
  };

  // @end
  return { width: CW, height: CH, cycle: LOOP, cells: CELLS, fonts: [] };
});
