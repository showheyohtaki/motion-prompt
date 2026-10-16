# Motion Prompt

[English](README.md) | **日本語** | [简体中文](README.zh-Hans.md)

AIに何かを作ってもらうときに使う「名前」のライブラリです。名前の1つずつに、動く見本・一言の意味・AIへの頼み方の例が付いています。いま入っているのは、モーショングラフィックスの動き（`motion`）、カメラワーク（`camera`）、UIパーツの名前（`ui`）、LP・Webサイトの演出（`lp`）、写真の表現・光と画風（`photo`）の5つで、それぞれ24個、合わせて120個です。同じような名前の見本を、自分の分野・自分の言語で作るためのプロンプトも入っています。

| モーショングラフィックス | カメラワーク |
|---|---|
| ![モーショングラフィックスの名前 01–08](assets/preview-motion.gif) | ![カメラワークの名前 01–08](assets/preview-camera.gif) |

- ギャラリー（全部の見本が動きます）: https://showheyohtaki.github.io/motion-prompt/
- GitHub の上でそのまま読める名前の一覧: [`packs/`](packs/README.md)
- 名前と見本を公開しているほかの人たちの事例（X のポストの埋め込みとリンク）: https://showheyohtaki.github.io/motion-prompt/found.html

## なぜ作ったか

モーショングラフィックスやカメラワークの「名前」を並べた短い動画を投稿したら、この数日、いろんなコメントをもらいました。その中に、自分を悩ませていたのは想像力の欠如ではなく、こういう動かし方を何と呼ぶのか分からないことだった、という趣旨のコメントがありました。

それを見て、いろんな言語で、各ジャンルの専門家の人たちが、AIを使いこなす上で必要な「共通言語」を、ライブラリにして見せてくれるんだったら、めちゃくちゃ役に立つと思いました。だから、それを GitHub にしてみました。

1個のスタイルを配るリポジトリではありません。ここのプロンプトと指示を使えば、こういうモーショングラフィックスを作れますし、自分の分野・自分の言語・自分の好きな見た目で、同じような名前の見本も作れます。そういう場所にしたいと思っています。

もう1つ、こんなコメントももらいました。"this is how you become a creative director"。まさに、です。世界中に、AIと共にすばらしい才能を発揮するクリエイティブディレクターが増えたら、素敵なことだと思います。

大滝昇平

## いま入っている名前

| 番号 | パック | 個数 | 一覧 |
|---|---|---|---|
| 001–024 | `motion`: モーショングラフィックスの動き | 24 | [日本語](packs/motion/README.ja.md) · [English](packs/motion/README.md) |
| 025–048 | `camera`: カメラワークと切り替え | 24 | [日本語](packs/camera/README.ja.md) · [English](packs/camera/README.md) |
| 049–072 | `ui`: UIパーツの名前 | 24 | [日本語](packs/ui/README.ja.md) · [English](packs/ui/README.md) |
| 073–096 | `lp`: LP・Webサイトの演出 | 24 | [日本語](packs/lp/README.ja.md) · [English](packs/lp/README.md) |
| 097–120 | `photo`: 写真の表現・光と画風 | 24 | [日本語](packs/photo/README.ja.md) · [English](packs/photo/README.md) |

一覧には、番号・名前・英語名・一言の意味・AIへの頼み方の例が並んでいます。同じ名前が[ギャラリー](https://showheyohtaki.github.io/motion-prompt/)で動きます。

パックごとに見た目が違います。モーショングラフィックスは濃紺に4色、カメラワークは薄いグレーに青1色です。UIパーツは温かみのある白に黒と青1色で、カーソルが触れると部品が動きます。LP・Webサイトの演出は、薄いグレーの机の上に白いブラウザの窓を描き、差し色は朱、ページの中の写真には青を使います。写真の表現には共通の色がなく、カードごとにその場面の色で描き、効果がかかっては戻るので前後を見比べられます。わざとそうしています。パックがそろえるべきなのは名前であって、決まった見た目ではありません。

## 3つの使い方

### 1. ライブラリを出して、選んで、AIに渡す

Claude Code や Codex に `motion-prompt` スキルを入れると、AIに頼むだけでこのギャラリーが開きます。名前や番号を覚えていなくてかまいません。分からないときに、辞書を引くように出してもらう使い方です。

```sh
npx skills add showheyohtaki/motion-prompt
```

1. AIに頼みます。
   ```text
   motion-prompt のライブラリ出して
   ```
2. ブラウザでギャラリーが開きます。使いたい見本の「選ぶ」を押します。いくつでも選べます。画面の下のメモ欄に「冒頭のタイトルに」のような一言も書けます。
3. 「AIに渡す」を押すと、選んだ物がAIに届きます。AIの画面に戻って、どうしたいかを伝えます。
   ```text
   この動画の冒頭をこんな感じに編集して
   ```

AIは選ばれた物だけを使います。仕様と参考コードを取り出し、あなたの動画やサイトの作り方に合わせて組み込みます。「カメラワークの一覧見せて」のように種類を言うと、そのパックに絞った状態で開きます。

スキルを入れていないAIに頼むときは、ギャラリーで選んでから、画面の下の「選んだ物をコピー」を押して、その文をチャットに貼ってください。見本と仕様のURLが入っています。

**番号が分かっているとき**は、ギャラリーを開かずに番号で頼むこともできます。

```text
motion-prompt スキルで #012 と #045 を使って、このサービス紹介の動画をプロっぽく作ってください。
```

```text
今のタイトルが出る部分を、motion-prompt の #005 の演出に差し替えてください。尺と前後のつながりはそのままで。
```

```text
motion-prompt の #032 のカメラワークを、Veo に渡す英語のプロンプトにしてください。被写体は机の上のコーヒーカップです。
```

ほかの入れ方と、AI が何をするかは、下の[スキルの説明](#スキルの説明)にあります。

### 2. 名前を調べて、そのままAIに頼む

[一覧](packs/README.md)かギャラリーを開き、頭の中にある動きを探して、その名前を指示に入れます。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。

```text
タイトルをマスクリビールで下からせり上げて。0.6秒、行ごとに少しずらして。
```

```text
人物の顔へゆっくりドリーイン。ズームではなく、カメラごと近づく。
```

これだけなら、何も入れる必要はありません。名前は、コーディングAIにも、動画生成AIにも、人への依頼にも使えます。

### 3. 自分の分野・自分の言語の版を作る

[`make-your-own/`](make-your-own/README.ja.md) に、コーディングAIに貼るプロンプト、動画を書き出すスクリプト、完成した見本2つ（HTMLのソース・動画3本・早見表の画像）が入っています。

| やりたいこと | プロンプト |
|---|---|
| 同じ動画を別の言語で作る | [`01-translate.md`](make-your-own/prompts/ja/01-translate.md) |
| 自分の分野の名前を、自分の好きな見た目で作る | [`02-your-own-field.md`](make-your-own/prompts/ja/02-your-own-field.md) |
| 1枚の早見表の画像を作る | [`03-cheatsheet-image.md`](make-your-own/prompts/ja/03-cheatsheet-image.md) |

映像でなくてもかまいません。照明、音、UI、写真、料理、建築など、名前を知っていることが頼めることにつながる分野なら、どこでも作れます。

## あなたの分野の名前を足す

よく知っている分野があれば、その分野の共通言語を、あなたの言語でここに足してください。パックの足し方、今あるパックへの言語の足し方、名前を入れるときの基準は [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) に書いてあります。作る作業の大半は、上のプロンプトでコーディングAIに任せられます。

## 元のポスト

きっかけになった動画（X）:

- https://x.com/showheyohtaki/status/2108065874511077598
- https://x.com/showheyohtaki/status/2109112248832503895
- https://x.com/showheyohtaki/status/2109840044554891464

1本目（Webサイト・LPのアニメーションの名前）のセットは、このリポジトリにはまだ入っていません。`lp` パックはそれとは別の物です。パララックスやスクロールスナップのように重なる名前もありますが、選び方と見本はこのリポジトリのために新しく作りました。`ui` パックは、10月10日にXに投稿した「UIパーツ名24」を元にしています。`photo` パックも、このリポジトリのために新しく作りました。

## スキルの説明

Node.js 18 以上が必要です。

### 入れ方

**プロンプトで入れる。** Claude Code や Codex に、次の文を貼ります。

```text
https://github.com/showheyohtaki/motion-prompt を読んで、motion-prompt スキルをこの環境に入れてください。入れたら、使い方を3行で教えてください。
```

**コマンドで入れる。** Agent Skills に対応したエージェント（Claude Code、Codex など）で使えます。

```sh
npx skills add showheyohtaki/motion-prompt
```

**Claude Code のプラグインとして入れる。**

```text
/plugin marketplace add showheyohtaki/motion-prompt
/plugin install motion-prompt@motion-prompt
```

**手でコピーする。** `skills/motion-prompt` フォルダを、次のどれかにコピーします。

| 置き場所 | 対象 |
|---|---|
| `~/.claude/skills/` | Claude Code（全プロジェクト） |
| `~/.agents/skills/` | Codex など（全プロジェクト） |
| プロジェクトの `.claude/skills/` | Claude Code（そのプロジェクトだけ） |
| プロジェクトの `.agents/skills/` | Codex など（そのプロジェクトだけ） |

### エージェント向けの導入手順

この節は、上の「プロンプトで入れる」の文を受け取った AI エージェントが読む手順です。

1. `node --version` で Node.js 18 以上が使えることを確かめます。
2. 利用者のプロジェクトのフォルダで、次を実行します。どのエージェントに入れるか聞かれたら、いま動いている自分自身を選びます。
   ```sh
   npx skills add showheyohtaki/motion-prompt -y
   ```
3. 2 が使えない場合は、リポジトリを取得してフォルダをコピーします。コピー先は、自分が Claude Code なら `.claude/skills/`、それ以外なら `.agents/skills/` です（全プロジェクトで使うなら `~/.claude/skills/` または `~/.agents/skills/`）。
   ```sh
   git clone --depth 1 https://github.com/showheyohtaki/motion-prompt.git /tmp/motion-prompt
   mkdir -p .claude/skills
   cp -R /tmp/motion-prompt/skills/motion-prompt .claude/skills/
   ```
4. 入ったことを確かめます。`<skill-dir>` は `SKILL.md` があるフォルダです。取得元と要素の件数が表示されれば成功です。
   ```sh
   node <skill-dir>/scripts/motion-prompt.mjs info
   ```
   終了コード 3 は、データの取得元に届いていないという意味です。ネットワークの許可を得てもう一度実行してください。
5. `<skill-dir>/SKILL.md` を読み、利用者に使い方を 3 行で伝えます。例:
   - 「motion-prompt のライブラリ出して」と言うと、ギャラリーが開きます。使いたい物の「選ぶ」を押して、「AIに渡す」を押してください。
   - 渡したあとは「この動画の冒頭をこんな感じに編集して」のように、どうしたいかを伝えてください。
   - 番号が分かっていれば、「#012 と #045 を使って」と直接頼むこともできます。

既存の設定ファイルやほかのスキルは変更しないでください。

### AI がすること

AI は次の順に進めます。

1. 「ライブラリ出して」と頼まれたら、ギャラリーをブラウザで開き、あなたが選んで「AIに渡す」を押すのを待ちます（最大15分）。
2. プロジェクトの動画の作り方（Canvas、Remotion、CSS、After Effects、動画生成 AI へのプロンプトなど）を読みます。
3. 頼まれた内容を場面ごとの動きに分けます。
4. あなたが選んだ物、または番号で指定された物だけを取得します。足したり減らしたりはしません。どちらも無いときは、ギャラリーで選ぶことを勧めます。AIに選ぶよう頼んだときは、場面ごとに検索して選びます。
5. 時間・イージング・量の数値を保ったまま、プロジェクトの方式に移します。文字・色・素材はあなたの物に替えます。
6. 使った要素を、番号・使った場所・変えた点・見本の URL 付きで報告します。

### 仕組み

- 要素は 1 個が 1 つの関数です。`cells[i](ctx, w, h, u)` の形で、`ctx` は Canvas 2D のコンテキスト、`w` と `h` はカードの寸法、`u` は周期の中の秒数です。
- 関数は時刻 `u` だけで絵が決まります（現在時刻や乱数を描画時に使いません）。そのため、ブラウザでの再生と 1 フレームずつの書き出しで同じ絵になります。
- 色・寸法・周期・共通の補助関数は、パックごとの「kit」にまとまっています。要素を使うときは、そのパックの kit も一緒に読み込みます。
- 外部ライブラリは使っていません。

スキルの中身は、`SKILL.md`、移植の手引き（`references/porting.md`）、依存なしの小さな CLI（`scripts/motion-prompt.mjs`）です。

| コマンド | 内容 |
|---|---|
| `pick` / `pick --pack camera` | ギャラリーを開き、「AIに渡す」で届いた選択（番号・名前・仕様・メモ）を表示する。最大15分待つ |
| `search typewriter text` / `search 文字 登場` | 場面に合う要素を探す（英語・日本語） |
| `list` / `list --pack motion` | パックとカテゴリの一覧、または 1 パックの全要素 |
| `get 12 #045` | 選んだ要素の仕様とコード（1 回に 8 個まで） |
| `kit motion` | そのパックの共通コード |
| `prompt 12` | その要素のコピー用プロンプト |
| `info` | 取得元・件数・版・キャッシュの場所 |

データは静的ファイルで、次の場所から読みます。CLI はこれらを取得するだけで、あなたのプロジェクトの情報を送信しません。`pick` は手元（127.0.0.1）に一時的な受け口を開き、ギャラリーの「AIに渡す」から、選んだ番号とメモだけを受け取ります。

1. `https://showheyohtaki.github.io/motion-prompt/api/v1/`
2. 1 に届かないとき: `https://raw.githubusercontent.com/showheyohtaki/motion-prompt/main/api/v1/`

| ファイル | 内容 |
|---|---|
| `catalog.json` | 版、件数、パック、全要素の名前・一言の意味・要約・仕様・タグ |
| `{ja,en}/catalog.tsv` | 1 行 1 要素の一覧（id、pack、category、title、tags、summary） |
| `{ja,en}/e/{id}.txt` | 要素 1 個: ライセンス行、説明、仕様、コード |
| `{ja,en}/p/{id}.txt` | 要素 1 個のコピー用プロンプト |
| `kit/{pack}.js` | パックの共通コード |

このリポジトリを丸ごと clone して使う場合、CLI は手元の `api/v1` を優先して読むので、ネットワークは不要です。取得したデータはディスクに保存され、取得元に届かないときは保存済みの分を使います。

| 環境変数 | 既定 |
|---|---|
| `MOTION_PROMPT_BASE` | 取得元の差し替え（フォルダか URL。カンマ区切りで複数） |
| `MOTION_PROMPT_CACHE` | `~/.cache/motion-prompt`（書けなければ一時フォルダ） |
| `MOTION_PROMPT_TTL` | `21600`（カタログを取り直すまでの秒数） |

### ギャラリーを手元で動かす

```sh
git clone https://github.com/showheyohtaki/motion-prompt.git
cd motion-prompt
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開くと、ギャラリー（`index.html`）が表示されます。clone したリポジトリでは、`node skills/motion-prompt/scripts/motion-prompt.mjs pick --local` で、手元のギャラリーを開いて選ぶこともできます。ファイルの形式は [FORMAT.md](FORMAT.md) に書いてあります。

## ライセンス

[MIT](LICENSE) © 2026 Shohei Ohtaki

コード・動画・画像とも、商用の制作に使えます。要素のコードを使うときは、先頭の 1 行（`// Motion Prompt #ID · MIT License (c) 2026 Shohei Ohtaki · …`）を残してください。

掲載の削除・訂正の依頼は [Issue のフォーム](https://github.com/showheyohtaki/motion-prompt/issues/new?template=3-removal.yml) から受け付けます。確認後、すみやかに対応します。

## 謝辞

動く UI のギャラリーとエージェントスキルを組み合わせた [Lucian UX/UI Prompt](https://lucianlabs.dev/uxui-prompt/) から着想を得ました。CLI のコマンド構成と静的ファイルの置き方も同プロジェクトに倣っています（[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)）。

## 作者

大滝昇平（株式会社デイトラ） / X [@showheyohtaki](https://x.com/showheyohtaki)
