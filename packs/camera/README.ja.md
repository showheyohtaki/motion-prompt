<!-- tools/build.mjs が meta.json から作ったファイルです。直すときは meta.json を編集してください。 -->

# カメラワークと切り替え

24 個の名前 · #025–048 · パック `camera` · 言語: [English](README.md) / [简体中文](README.zh-Hans.md)

名前を見つけたら、そのままAIに伝えてください。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。

![カメラワークと切り替え — 見本](../../assets/preview-camera.gif)

## カメラの動き

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#025](https://showheyohtaki.github.io/motion-prompt/#025) | **パン** | Pan | カメラを横に振る | カメラの位置は固定で、街並みを左から右へゆっくりパン。5秒かけて。 |
| [#026](https://showheyohtaki.github.io/motion-prompt/#026) | **ティルト** | Tilt | カメラを縦に振る | 人物の足元から塔の先まで、ゆっくりティルトアップ。 |
| [#027](https://showheyohtaki.github.io/motion-prompt/#027) | **ドリーイン** | Dolly in | カメラごと被写体に近づく | 人物の顔へゆっくりドリーイン。ズームではなく、カメラごと近づく。 |
| [#028](https://showheyohtaki.github.io/motion-prompt/#028) | **ズームイン** | Zoom in | レンズで寄る（位置は動かない） | カメラは動かさず、窓辺の人物へ3秒でズームイン。 |
| [#029](https://showheyohtaki.github.io/motion-prompt/#029) | **トラッキング** | Tracking shot | 被写体と並んで動く | 歩く人物を真横からトラッキング。同じ速さで並んで動く。 |
| [#030](https://showheyohtaki.github.io/motion-prompt/#030) | **オービット** | Orbit (Arc shot) | 被写体の周りを回り込む | 立っている人物の周りを半周オービット。人物は画面の中央のまま。 |
| [#031](https://showheyohtaki.github.io/motion-prompt/#031) | **クレーンアップ** | Crane up | カメラが上へ昇っていく | 人物の目の高さから、街全体が見える高さまでクレーンアップ。 |
| [#032](https://showheyohtaki.github.io/motion-prompt/#032) | **ドリーズーム** | Dolly zoom (Vertigo) | 人物はそのまま背景だけ伸び縮み | 気づいた瞬間の顔にドリーズーム。人物の大きさは変えず、背景だけが遠ざかる。 |

## 撮り方・時間の演出

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#033](https://showheyohtaki.github.io/motion-prompt/#033) | **ラックフォーカス** | Rack focus | ピントを手前と奥のあいだで送る | 手前のカップから奥の人物へ、1秒でラックフォーカス。 |
| [#034](https://showheyohtaki.github.io/motion-prompt/#034) | **手持ち** | Handheld | 手で持って撮ったように小さく揺らす（ハンドヘルド） | 手持ちで、歩く人物の後ろをついていく。揺れは弱めに。 |
| [#035](https://showheyohtaki.github.io/motion-prompt/#035) | **FPV** | FPV drone shot | ドローンで突き進む疾走感 | FPVドローンで、森の木々の間をすり抜けて川の上へ出る。 |
| [#036](https://showheyohtaki.github.io/motion-prompt/#036) | **ダッチアングル** | Dutch angle | 画面を斜めに傾ける | 不安な場面なので、ダッチアングルで15度ほど傾けて。 |
| [#037](https://showheyohtaki.github.io/motion-prompt/#037) | **スローモーション** | Slow motion | 動きをゆっくり見せる | 水しぶきが上がる瞬間を、スローモーションで。 |
| [#038](https://showheyohtaki.github.io/motion-prompt/#038) | **スピードランプ** | Speed ramp | 速い→遅いと速さを変える | ジャンプの頂点だけ遅くなるスピードランプ。前後は通常の速さで。 |
| [#039](https://showheyohtaki.github.io/motion-prompt/#039) | **タイムラプス** | Time-lapse | 長い時間を早送りで見せる | 夕方から夜まで、街の灯りがともっていくタイムラプス。 |
| [#040](https://showheyohtaki.github.io/motion-prompt/#040) | **フリーズフレーム** | Freeze frame | 動きを一瞬止める | 振り向いた瞬間でフリーズフレーム。1秒止めて、名前を出す。 |

## 切り替え（トランジション）

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#041](https://showheyohtaki.github.io/motion-prompt/#041) | **ジャンプカット** | Jump cut | 同じ画角のまま時間を飛ばす | 同じ画角のままジャンプカットでつないで、準備の様子をテンポよく見せる。 |
| [#042](https://showheyohtaki.github.io/motion-prompt/#042) | **マッチカット** | Match cut | 形や動きをそろえて場面を変える | 丸いコーヒーカップから、同じ位置にある満月へマッチカット。 |
| [#043](https://showheyohtaki.github.io/motion-prompt/#043) | **ホイップパン** | Whip pan | 素早く振ってブレで次へ | ホイップパンで右へ素早く振って、次の場所へつなぐ。 |
| [#044](https://showheyohtaki.github.io/motion-prompt/#044) | **クロスディゾルブ** | Cross dissolve | 前後の映像を重ねて溶かす | 朝の部屋から夜の同じ部屋へ、1秒のクロスディゾルブ。 |
| [#045](https://showheyohtaki.github.io/motion-prompt/#045) | **ワイプ** | Wipe | 境目が横切って画面が入れ替わる | 左から右へのワイプで、次の場面に入れ替える。 |
| [#046](https://showheyohtaki.github.io/motion-prompt/#046) | **スマッシュカット** | Smash cut | 対照的な場面へ前触れなく切り替える | 静かな寝室から、騒がしい交差点へスマッシュカット。 |
| [#047](https://showheyohtaki.github.io/motion-prompt/#047) | **Jカット** | J-cut | 次の場面の音が先に聞こえる | Jカットで、次の場面の波の音を先に聞かせてから、海の映像に切り替える。 |
| [#048](https://showheyohtaki.github.io/motion-prompt/#048) | **Lカット** | L-cut | 前の場面の音が後まで残る | Lカットで、彼女の話し声を残したまま、聞き手の顔に切り替える。 |

番号を押すと、ギャラリーの動く見本が開きます。1つの名前の秒数・イージングの数値・参考コード: `api/v1/ja/e/<id>.txt` ([#025](../../api/v1/ja/e/025.txt)).

[パックの一覧](../README.md)
