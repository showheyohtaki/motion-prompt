/* Motion Prompt · pack "artstyle" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('artstyle', function () {
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

  // @element 01
  // 水彩画: にじみと白い余白が残る淡い絵
  CELLS[0] = (k, w, h, u) => gafu(k, w, h, u, '01');

  // @element 02
  // 油絵（厚塗り）: 絵の具を盛った筆跡が残る
  CELLS[1] = (k, w, h, u) => gafu(k, w, h, u, '02');

  // @element 03
  // 水墨画: 墨の濃淡とぼかしだけで描く
  CELLS[2] = (k, w, h, u) => gafu(k, w, h, u, '03');

  // @element 04
  // 浮世絵: 輪郭線と平らな色の木版画
  CELLS[3] = (k, w, h, u) => gafu(k, w, h, u, '04');

  // @element 05
  // 点描: 小さな色の点を並べて描く
  CELLS[4] = (k, w, h, u) => gafu(k, w, h, u, '05');

  // @element 06
  // 色鉛筆画: 紙の目に残る細い線の重なり
  CELLS[5] = (k, w, h, u) => gafu(k, w, h, u, '06');

  // @element 07
  // リノカット: 彫った版の太い白黒の線
  CELLS[6] = (k, w, h, u) => gafu(k, w, h, u, '07');

  // @element 08
  // ステンドグラス: 黒い枠で区切った光る色ガラス（丘の鉛の枠まで写すため、切り出し位置が違う下絵を使う）
  CELLS[7] = (k, w, h, u) => gafu(k, w, h, u, '08');

  // @element 09
  // ポップアート: 原色の面と太い黒線、少しの網点
  CELLS[8] = (k, w, h, u) => gafu(k, w, h, u, '09');

  // @element 10
  // ネオンサイン: 暗い壁に、光る管で形を描く
  CELLS[9] = (k, w, h, u) => gafu(k, w, h, u, '10');

  // @element 11
  // アールデコ: 金と黒、放射する直線と左右対称
  CELLS[10] = (k, w, h, u) => gafu(k, w, h, u, '11');

  // @element 12
  // アールヌーボー: 草花の曲線で縁取る装飾
  CELLS[11] = (k, w, h, u) => gafu(k, w, h, u, '12');

  // @element 13
  // リソグラフ: 2〜3色のインクがずれて重なる
  CELLS[12] = (k, w, h, u) => gafu(k, w, h, u, '13');

  // @element 14
  // 重ね切り絵: 色紙を切って重ね、段差の影で奥行き
  CELLS[13] = (k, w, h, u) => gafu(k, w, h, u, '14');

  // @element 15
  // フラットイラスト: 線も影もない平らな塗りだけの絵
  CELLS[14] = (k, w, h, u) => gafu(k, w, h, u, '15');

  // @element 16
  // ラインアート: 塗りなしで1色の線だけで描く
  CELLS[15] = (k, w, h, u) => gafu(k, w, h, u, '16');

  // @element 17
  // ドット絵（ピクセルアート）: マス目のドットで描くゲーム風
  CELLS[16] = (k, w, h, u) => gafu(k, w, h, u, '17');

  // @element 18
  // ボクセルアート: 小さな立方体を積んだ3D
  CELLS[17] = (k, w, h, u) => gafu(k, w, h, u, '18');

  // @element 19
  // ローポリ: 三角形の面で組んだ3D
  CELLS[18] = (k, w, h, u) => gafu(k, w, h, u, '19');

  // @element 20
  // ペーパークラフト: 紙を折って組み立てた立体
  CELLS[19] = (k, w, h, u) => gafu(k, w, h, u, '20');

  // @element 21
  // クレイアニメ風: 粘土で作った指あとの残る立体
  CELLS[20] = (k, w, h, u) => gafu(k, w, h, u, '21');

  // @element 22
  // 刺繍: 布に色糸を縫い込んで描く
  CELLS[21] = (k, w, h, u) => gafu(k, w, h, u, '22');

  // @element 23
  // シンセウェイヴ: 80年代風のネオンの格子と縞の夕日（地面の格子を写すため、切り出し位置が違う下絵を使う）
  CELLS[22] = (k, w, h, u) => gafu(k, w, h, u, '23');

  // @element 24
  // ブループリント（設計図風）: 青地に白い線の図面
  CELLS[23] = (k, w, h, u) => gafu(k, w, h, u, '24');

  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [], images: IMG_FILES, ready };
});
