# 自分の版を作る

[English](README.md) | **日本語** | [简体中文](README.zh-Hans.md)

自分の「名前の見本」を作るための、プロンプト・書き出しスクリプト・完成した見本2つです。できあがるのは、8枚のカードが動く動画3本（カード1枚が、名前1つの意味を見せる小さなアニメーション）と、1枚の早見表の画像です。

自分の分野で、自分の言語で、自分の好きな見た目で作れます。

| | カメラワーク（`examples/camera-moves/`） | モーショングラフィックス（`examples/motion-graphics/`） |
|---|---|---|
| 見た目 | 薄いグレーに青1色、ピクトグラム風 | 濃紺のカードに4色 |
| 言語 | 英語、日本語 | 日本語 |
| | ![カメラワーク 01–08](../assets/preview-camera.gif) | ![モーショングラフィックス 01–08](../assets/preview-motion.gif) |

同梱の動画と早見表は投稿した物なので、表記は投稿時のままです（例: 10 手持ち風）。[`packs/`](../packs/README.md) の名前の一覧では「手持ち」にしています。

2つの見本は、わざと見た目を変えてあります。1つのスタイルを配るためのひな形ではありません。共通しているのは「名前が主役で、カードはその名前の意味を見せる」という決まりだけです。

## 入っているもの

```
prompts/en, prompts/ja      コーディングAI・画像生成AIに貼るプロンプト
render.mjs                  HTML → mp4（Playwright + ffmpeg）
examples/camera-moves/
  en/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
examples/motion-graphics/
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png  cheatsheet-prompt.md
```

| | |
|---|---|
| 動画 | 1200×1350、30fps、H.264（yuv420p）、音なし、9.4秒、継ぎ目のないループ |
| 早見表の画像 | `prompts/` のプロンプトを使い、画像生成AIで作成 |

動画1本は、`<canvas>` に描くHTMLファイル1つです。ビルドもフレームワークもないので、コーディングAI（Claude Code、Codex、Cursor など）が全体を読んで、そのまま作り替えられます。

## プロンプト

このリポジトリをコーディングAIに読ませて、次のどれかを貼ります。

| やりたいこと | プロンプト |
|---|---|
| 同じ動画を別の言語で作る | [`prompts/ja/01-translate.md`](prompts/ja/01-translate.md) |
| 自分の分野の名前を、自分の好きな見た目で作る | [`prompts/ja/02-your-own-field.md`](prompts/ja/02-your-own-field.md) |
| 1枚の早見表の画像を作る | [`prompts/ja/03-cheatsheet-image.md`](prompts/ja/03-cheatsheet-image.md) |

英語版は [`prompts/en/`](prompts/en/) にあります。

手で直すときの場所（`index.html` の中）:

- `PAGES` と `ITEMS`: 見出しと24個の名前
- `CELLS[0]` 〜 `CELLS[23]`: カード1枚ごとの描画関数
- `C`: 色。`JP`・`EN`・`MONO` / `DISP`: フォント

## 見てみる

`examples/motion-graphics/ja/index.html` をブラウザで開くと、ループ再生されます（Chrome などの Chromium 系を推奨）。

- `?page=2` で2ページ目（ページは1〜3）
- `?t=3.5` で3.5秒の時点の静止画

## mp4に書き出す

[Node.js](https://nodejs.org/) 18以上と、[ffmpeg](https://ffmpeg.org/)（PATHが通っていること）が必要です。`make-your-own/` の中で実行します。

```bash
cd make-your-own
npm install
npx playwright install chromium

node render.mjs examples/camera-moves/ja/index.html --page 1
# -> out/ja-page1.mp4

node render.mjs examples/motion-graphics/ja/index.html --all --sheet
# -> out/ja-page1.mp4、ja-page2.mp4、ja-page3.mp4 と、それぞれのコマ一覧PNG
```

オプション: `--page <n>`、`--all`、`--pages <n>`、`--out <file>`、`--out-dir <dir>`、`--fps <n>`、`--crf <n>`、`--sheet`。くわしくは `node render.mjs --help`。

`--sheet` は、1秒ごとのコマを1枚の画像に並べて保存します。ループを何度も見なくても、8枚のカードの間違いをまとめて確かめられます。

### 書き出しの仕組み

HTMLは実時間の時計を使いません。どのコマも、コマ番号から描きます。

| HTML側 | 意味 |
|---|---|
| `window.N_FRAMES` | 1ページのコマ数（282 = 9.4秒 × 30fps） |
| `window.renderFrame(i)` | `i` 番目のコマを `<canvas id="c">` に描く |
| `window.prepareFrame(i)` | 任意。非同期でもよい |
| `window.READY` | フォントを読み込み終えたら `true` |
| `?page=N`、`?render=1` | 描くページ／プレビューのループを止める |

`render.mjs` はコマごとに `renderFrame(i)` を呼び、canvasをPNGとして読み取り、ffmpegに流し込みます。遅いパソコンでもコマ落ちしません。この約束を守っているHTMLなら、同じスクリプトで書き出せます。

## フォントについて

見本のHTMLは、ネットから何も読み込みません（Webフォント、CDN、画像のいずれもなし）。macOSに入っているフォント（Hiragino Sans、Helvetica Neue、Avenir Next、SF Mono）を使っていて、フォントファイルはこのリポジトリに入れていません。

同梱のmp4はmacOSで書き出したものです。WindowsやLinuxでは別のフォントに置き換わるので、文字の見た目が少し変わります。日本語版は、日本語フォント（Noto Sans JP など）が入っている必要があります。フォントを変えるときは、`index.html` の上のほうにあるフォントの定数を書き換えてください。

## 補足

- 日本語版のHTMLは、もとは3ページを続けて見せる約30秒の動画1本として書いたものです。ここでは英語版と同じく、1ページ＝動画1本で描くようにしてあります。同梱の日本語版mp4は元の投稿で使った物なので、書き出し直すと、一瞬で切り替わる所で1コマずれることがあります。
- 見本のHTMLの中のコメントは、ほとんど日本語です。
- canvasの `roundRect` と `letterSpacing` を使っているので、新しめの Chromium が必要です。Playwright が入れるものなら動きます。
- この2つの見本のカードは、ギャラリーにも `camera`・`motion` パックとして入っています（[`packs/`](../packs/README.md)）。自分の作った物をそこに足すときは、[CONTRIBUTING.ja.md](../CONTRIBUTING.ja.md) を読んでください。

## ライセンス

[MIT](../LICENSE)。コード・動画・画像は、商用も含めて自分の制作に使えます。リンクを張ってもらえるとうれしいですが、必須ではありません。
