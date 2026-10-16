<!-- tools/build.mjs が meta.json から作ったファイルです。直すときは meta.json を編集してください。 -->

# LP・Webサイトの演出

24 個の名前 · #073–096 · パック `lp` · 言語: [English](README.md) / [简体中文](README.zh-Hans.md)

名前を見つけたら、そのままAIに伝えてください。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。

## スクロールで起きる演出

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#073](https://showheyohtaki.github.io/motion-prompt/#073) | **パララックススクロール** | Parallax scrolling | スクロールで奥の層ほどゆっくり動く | ファーストビューの背景をパララックススクロールにして。背景はスクロール量の0.3倍で動かして。 |
| [#074](https://showheyohtaki.github.io/motion-prompt/#074) | **スクロールでフェードイン** | Fade-in on scroll | 画面に入った要素がふわっと現れる | 各セクションの見出しとカードを、スクロールでフェードインさせて。下から30px、0.6秒で。 |
| [#075](https://showheyohtaki.github.io/motion-prompt/#075) | **追従ヘッダー** | Sticky header | スクロールしてもヘッダーが上に残る | ヘッダーを追従ヘッダーにして。上に張り付いたら下に薄い影を付けて。 |
| [#076](https://showheyohtaki.github.io/motion-prompt/#076) | **ピン留め** | Pinning | セクションを止めて中身だけ進める | 「3ステップ」のセクションをピン留めして、スクロールで1ステップずつ写真と番号を切り替えて。 |
| [#077](https://showheyohtaki.github.io/motion-prompt/#077) | **横スクロール** | Horizontal scroll | 縦のスクロールで中身が横に流れる | 実績のセクションを横スクロールにして。縦にスクロールした分だけ、カードを左へ流して。 |
| [#078](https://showheyohtaki.github.io/motion-prompt/#078) | **スクロールスナップ** | Scroll snap | スクロールが区切りの位置にピタッと止まる | セクションごとにスクロールスナップさせて。少し回しただけで次のセクションの頭に合わせて。 |
| [#079](https://showheyohtaki.github.io/motion-prompt/#079) | **スクロールプログレスバー** | Scroll progress bar | 読み進めた割合を上の線で見せる | 記事ページの上にスクロールプログレスバーを付けて。太さ4px、色はブランドの朱色で。 |
| [#080](https://showheyohtaki.github.io/motion-prompt/#080) | **マーカーアニメーション** | Highlighter animation | 大事な言葉に蛍光ペンの線が引かれる | 強調したい言葉に、スクロールで画面に入ったらマーカーアニメーションで黄色の線を引いて。0.8秒で左から。 |

## マウス・クリックへの反応

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#081](https://showheyohtaki.github.io/motion-prompt/#081) | **ホバーで浮き上がる** | Hover lift | カーソルを乗せると影を付けて浮く | カードにカーソルを乗せたら、ホバーで浮き上がるようにして。上に8px、影を濃く、0.3秒で。 |
| [#082](https://showheyohtaki.github.io/motion-prompt/#082) | **ホバーで画像ズーム** | Image zoom on hover | 枠はそのままで写真だけ拡大する | 実績の写真にホバーで画像ズームを付けて。枠は固定で、中身を1.1倍まで0.5秒で。 |
| [#083](https://showheyohtaki.github.io/motion-prompt/#083) | **マウスストーカー** | Cursor follower | カーソルを丸が遅れて追いかける | サイト全体にマウスストーカーを付けて。直径30pxの朱色の丸が、少し遅れてカーソルを追うように。 |
| [#084](https://showheyohtaki.github.io/motion-prompt/#084) | **マグネティックボタン** | Magnetic button | 近づいたカーソルにボタンが吸い寄せられる | 問い合わせボタンをマグネティックボタンにして。カーソルとの差の0.3倍だけ寄って、離れたらぷるんと戻して。 |
| [#085](https://showheyohtaki.github.io/motion-prompt/#085) | **リップルエフェクト** | Ripple effect | 押した場所から波紋が広がる | 送信ボタンにリップルエフェクトを付けて。押した位置から白い円が0.6秒で広がって消えるように。 |
| [#086](https://showheyohtaki.github.io/motion-prompt/#086) | **下線アニメーション** | Underline animation | 乗せたリンクの下線が左から伸びる | メニューのリンクに下線アニメーションを付けて。乗せたら左から0.3秒で伸び、離れたら右へ抜けるように。 |
| [#087](https://showheyohtaki.github.io/motion-prompt/#087) | **ビフォーアフタースライダー** | Before/after slider | 境目をドラッグして前と後を見比べる | 施工例の写真をビフォーアフタースライダーにして。真ん中の線をドラッグすると、左が施工前、右が施工後で見比べられるように。 |
| [#088](https://showheyohtaki.github.io/motion-prompt/#088) | **離脱防止ポップアップ** | Exit-intent popup | ページを離れそうな時に出す引き止めの小窓 | LPに離脱防止ポップアップを付けて。カーソルが画面の上へ出たら、クーポンの小窓を1回だけ出して。 |

## 読み込み・移動・動き続ける演出

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#089](https://showheyohtaki.github.io/motion-prompt/#089) | **ローディング画面** | Preloader | 読み込み中に出す画面 | サイトを開いたときのローディング画面を作って。ロゴと％の数字を出して、100%になったら幕が上がるように。 |
| [#090](https://showheyohtaki.github.io/motion-prompt/#090) | **遅延読み込み** | Lazy loading | 画面に入った画像だけを読み込む | ギャラリーの画像を遅延読み込みにして。読み込むまでは灰色の枠、届いたら0.3秒でフェードインして。 |
| [#091](https://showheyohtaki.github.io/motion-prompt/#091) | **無限スクロール** | Infinite scroll | 下まで来ると続きが自動で足される | お知らせの一覧を無限スクロールにして。下まで来たら読み込み表示を出して、10件ずつ足して。 |
| [#092](https://showheyohtaki.github.io/motion-prompt/#092) | **ページ遷移アニメーション** | Page transition | ページを移るときの切り替えの演出 | ページ遷移アニメーションを付けて。リンクを押したら朱色の幕が左から右へ横切って次のページに切り替わるように。 |
| [#093](https://showheyohtaki.github.io/motion-prompt/#093) | **スムーススクロール** | Smooth scroll | ページ内リンクでなめらかに移動する | メニューのページ内リンクをスムーススクロールにして。固定ヘッダーの高さ分ずらして止めて。 |
| [#094](https://showheyohtaki.github.io/motion-prompt/#094) | **マーキー** | Marquee | 文字や画像が帯で流れ続ける | サービス名をマーキーで右から左へ流して。途切れずにループさせて、速さは1秒に80pxくらい。 |
| [#095](https://showheyohtaki.github.io/motion-prompt/#095) | **グラデーションアニメーション** | Animated gradient | 背景の色の混ざり方が動き続ける | ファーストビューの背景をグラデーションアニメーションにして。朱色と青がゆっくり混ざり合うように、10秒で1周。 |
| [#096](https://showheyohtaki.github.io/motion-prompt/#096) | **ふわふわアニメーション** | Floating animation | 飾りがゆっくり上下に浮き沈みする | ファーストビューのスマホの画像に、ふわふわアニメーションを付けて。上下8px、2.4秒で1往復。 |

番号を押すと、ギャラリーの動く見本が開きます。1つの名前の秒数・イージングの数値・参考コード: `api/v1/ja/e/<id>.txt` ([#073](../../api/v1/ja/e/073.txt)).

[パックの一覧](../README.md)
