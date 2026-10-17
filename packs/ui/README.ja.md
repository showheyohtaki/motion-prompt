<!-- tools/build.mjs が meta.json から作ったファイルです。直すときは meta.json を編集してください。 -->

# UIパーツの名前

24 個の名前 · #049–072 · パック `ui` · 言語: [English](README.md) / [Español](README.es.md)

名前を見つけたら、そのままAIに伝えてください。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。

## 開く・重なるパーツ

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#049](https://showheyohtaki.github.io/motion-prompt/#049) | **モーダル** | Modal dialog | 画面を暗くして中央に窓が出る | 削除ボタンを押したらモーダルで確認を出して。背景は4割ほど暗くし、0.3秒で少し拡大しながらフェードイン。 |
| [#050](https://showheyohtaki.github.io/motion-prompt/#050) | **ドロワー** | Drawer (Off-canvas) | 横からメニューが引き出される | メニューボタンを押したら左からドロワーを出して。幅は画面の4割、0.4秒で引き出し、背景は少し暗く。 |
| [#051](https://showheyohtaki.github.io/motion-prompt/#051) | **ボトムシート** | Bottom sheet | 下からパネルがせり上がる | 「詳細を見る」を押したらボトムシートで詳細を出して。高さは画面の4割、0.4秒でせり上げ、下へ引くと閉じる。 |
| [#052](https://showheyohtaki.github.io/motion-prompt/#052) | **アコーディオン** | Accordion | 押すと中身が開閉する | よくある質問をアコーディオンにして。押した項目だけ0.35秒で開き、矢印を180度回して。 |
| [#053](https://showheyohtaki.github.io/motion-prompt/#053) | **ドロップダウン** | Dropdown (select) | 押すと選択肢が下に広がる | 都道府県の入力欄をドロップダウンにして。押したら0.25秒で選択肢を下に開き、選んだら閉じて値を入れて。 |
| [#054](https://showheyohtaki.github.io/motion-prompt/#054) | **ツールチップ** | Tooltip | 乗せると小さな説明が出る | 「?」アイコンにツールチップを付けて。カーソルを乗せて0.2秒で上に説明を出し、離れたら消して。 |
| [#055](https://showheyohtaki.github.io/motion-prompt/#055) | **ポップオーバー** | Popover | 押すと吹き出しの小窓が出る | 「詳細」ボタンにポップオーバーを付けて。押したら右に吹き出しの小窓を0.3秒で出し、OKで閉じて。 |
| [#056](https://showheyohtaki.github.io/motion-prompt/#056) | **トースト** | Toast notification | 隅に通知が出て自動で消える | 保存したら右下にトーストで「保存しました」と出して。0.35秒で右から出し、2秒後に自動で消して。 |

## 選ぶ・切り替えるパーツ

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#057](https://showheyohtaki.github.io/motion-prompt/#057) | **タブ** | Tabs | 見出しを押して中身を切り替える | 料金ページの上にタブを3つ置いて。押したら下線を0.25秒で滑らせ、中身を0.2秒のクロスフェードで切り替えて。 |
| [#058](https://showheyohtaki.github.io/motion-prompt/#058) | **カルーセル** | Carousel | 横に送って順番に見せる | トップの画像をカルーセルにして。右矢印で1枚ずつ0.4秒で送り、下に今の位置の点を出して。 |
| [#059](https://showheyohtaki.github.io/motion-prompt/#059) | **トグルスイッチ** | Toggle switch | オン・オフを切り替える | 通知設定の各行にトグルスイッチを置いて。押したら0.2秒でつまみを滑らせ、オンは青にして。 |
| [#060](https://showheyohtaki.github.io/motion-prompt/#060) | **セグメントコントロール** | Segmented control | 並んだボタンで表示を切り替える | グラフの上に「日・週・月」のセグメントコントロールを置いて。押したら選択の背景を0.25秒で滑らせ、グラフも同時に変えて。 |
| [#061](https://showheyohtaki.github.io/motion-prompt/#061) | **チップ** | Filter chips | 押して絞り込み条件を付け外し | 一覧の上に絞り込みのチップを並べて。押したらチェックを付けて青くし、0.15秒で一覧を絞り込んで。 |
| [#062](https://showheyohtaki.github.io/motion-prompt/#062) | **レンジスライダー** | Range slider | つまみ2つで範囲を選ぶ | 価格の絞り込みをレンジスライダーにして。つまみは2つ、動かしている間は値を吹き出しで出して。 |
| [#063](https://showheyohtaki.github.io/motion-prompt/#063) | **ステッパー** | Stepper (+/−) | ＋/−ボタンで数を増減する | 数量の欄をステッパーにして。＋と−で1ずつ増減し、押すたびに数字を0.25秒で少し弾ませて。 |
| [#064](https://showheyohtaki.github.io/motion-prompt/#064) | **ページネーション** | Pagination | 番号でページを送る | 検索結果の下にページネーションを付けて。今のページは青い丸にし、押したら0.2秒で丸を移して一覧を入れ替えて。 |

## 案内する・状態を伝えるパーツ

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#065](https://showheyohtaki.github.io/motion-prompt/#065) | **ハンバーガーメニュー** | Hamburger menu | 三本線を押すとメニューが開く | スマホのヘッダー右にハンバーガーメニューを置いて。押したら三本線を0.3秒で×に変え、メニューを上から下ろして。 |
| [#066](https://showheyohtaki.github.io/motion-prompt/#066) | **パンくずリスト** | Breadcrumbs | 今いる場所を階層で示す | 記事ページの上にパンくずリストを付けて。「ホーム › 講座 › Web制作」の形で、今のページは太字でリンクなし。 |
| [#067](https://showheyohtaki.github.io/motion-prompt/#067) | **メガメニュー** | Mega menu | 大きな一覧メニューが広がる | ヘッダーの「製品」にメガメニューを付けて。乗せたら0.25秒で全幅のパネルを下ろし、3列のリンクと画像を並べて。 |
| [#068](https://showheyohtaki.github.io/motion-prompt/#068) | **ステップインジケーター** | Step indicator | 手続きの何番目かを示す | 申し込みフォームの上にステップインジケーターを付けて。入力・確認・支払い・完了の4段階で、済んだ段階はチェックにして。 |
| [#069](https://showheyohtaki.github.io/motion-prompt/#069) | **スケルトン** | Skeleton screen | 読み込み中に灰色の枠を出す | 一覧の読み込み中はスケルトンを出して。中身と同じ形の灰色の枠にして、光が左から右へ0.9秒で流れるように。 |
| [#070](https://showheyohtaki.github.io/motion-prompt/#070) | **スピナー** | Spinner | くるくる回って待ちを示す | 送信中はボタンの上にスピナーを出して。1秒に1回転強で回し、終わったら青い丸のチェックに替えて。 |
| [#071](https://showheyohtaki.github.io/motion-prompt/#071) | **バッジ** | Badge | 件数を小さな丸で示す | ヘッダーのベルにバッジを付けて未読数を出して。増えるたびに0.3秒で少し弾ませ、開いたら消して。 |
| [#072](https://showheyohtaki.github.io/motion-prompt/#072) | **エンプティステート** | Empty state | 中身がないときの案内画面 | リストが空になったらエンプティステートを出して。線画のアイコン、「まだ何もありません」、追加するボタンを0.35秒で出して。 |

番号を押すと、ギャラリーの動く見本が開きます。1つの名前の秒数・イージングの数値・参考コード: `api/v1/ja/e/<id>.txt` ([#049](../../api/v1/ja/e/049.txt)).

[パックの一覧](../README.md)
