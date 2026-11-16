---
id: P-stop-ability
axes: [backlash, flow, motion]
evidence: [O-20261116-fe-gumroad-density, O-20261116-fe-tinybird-hardborder, O-20261116-video-caption-rate, O-20261116-video-asl-cuts]
confidence: low
status: draft
created: 2026-11-16
updated: 2026-11-16
---

# P-stop-ability — 刺激量が同じでも、止める・抜ける・上書きできる手段の有無で「うざさ／止められなさ」が分岐し、強度指標では予測できない

## 傾向

`backlash`（うざさ・止められなさ）は、刺激の**量**ではなく**停止可能性**の側で決まる、という記述が4件の独立した観察に現れた。
具体的には (a) 無限ループの実体が省略記法側にあり、上書き（`prefers-reduced-motion` 等）が効くか読めない、
(b) ループで終端が消えると離脱の判断点が生まれない、
(c) 止められなさは編集（ASL）では説明できず再生側の要因である、の3点。

支持する記述:

- gumroad は `prefers-reduced-motion` が3件あるが、`animation-iteration-count: infinite` の明示宣言は0件で、無限ループの実体は `animation:` 省略記法（20/60/80秒）側。**上書きの可否は未確認**（`O-20261116-fe-gumroad-density` S-3 / S-7）。観察者自身が「止められない側には振り切っていない可能性」と書いている。
- tinybird は `prefers-reduced-motion` が1件のみで、`@keyframes` 5件・`transition` 32件に対して**被覆が薄い**（`O-20261116-fe-tinybird-hardborder` S-7）。
- ショート動画のループは「最終フレーム＝最初のフレーム」で、**終わりが見えないので離脱の判断点が生まれない**という説明（H9）。ループの効果（視聴時間が伸びる）の一次データは**未確認**（`O-20261116-video-caption-rate` S-4 / 反例節）。
- 「止められなさ」は ASL では説明できず、ループ構造・自動再生側の要因と推定されている（`O-20261116-video-asl-cuts` 未翻訳節）。**この1件は数値ではなく未翻訳の印象**であり、支持としては弱い。

## 現れる条件

- 無限ループが省略記法・`animation` に埋もれており、停止用の宣言（`animation-iteration-count: 1`、`prefers-reduced-motion` ブロック）が届くか静的に判断できない。
- `prefers-reduced-motion` のブロック数が、`@keyframes` と `transition` の宣言数に対して著しく少ない（例: tinybird 1 / 37）。
- 終端が開始に一致し、画面の切り替わりで「終わった」ことが提示されない。
- 音声が自動再生され、ミュート・停止の導線が画面内に無い（観察では**音声の実測0件**＝未確認）。
- ページ内に閉じる手段（閉じるボタン、スキップ、停止）が無い、または見つけにくい。

## 現れない条件

- 停止・ミュート・スキップの手段が明示されている（ドパガキ氷は完成後に BGM を止め「本編を開始しますか」と提示＝作品側が止める。`O-20261116-case-dopagaki-signs` S-5）。
- 尺が短く、終端が必ず来る（Shorts の上限 3分のような配信仕様側の終端）。
- ループが無く、遷移が単峰で段階値に量子化されている（tinybird の 200/300ms 中心）。
- `prefers-reduced-motion` の被覆が厚く、`animation-iteration-count` が明示されている。

## 実装上の対応物

- 停止可能性の計測（宣言ベース。文字列カウントであることに注意）:
  - `animation-iteration-count` の明示宣言数（gumroad 0件 / `@keyframes` 6件）
  - `prefers-reduced-motion` ブロック数 ÷（`@keyframes` 数 + `transition` 宣言数）（gumroad 3 ÷ 21、tinybird 1 ÷ 37）
  - `animation:` 省略記法のうち時間値を持つものの数（gumroad 4件、tinybird 1件）＝上書き対象の推定数
- 実装（**案。効果は未検証**）:
  - ループは `animation: marquee 20s linear infinite` ではなく `animation-iteration-count: infinite` を明示し、`@media (prefers-reduced-motion: reduce) { animation: none; }` を同じセレクタに置く。
  - 5秒を超える移動・点滅・自動更新には停止手段（WCAG 2.2.2）。閃光は 1秒3回以下（WCAG 2.3.1）。
  - スクロール側は `scroll-snap-type: y mandatory` + `scroll-snap-stop: always` で1画面ずつ止める。無限スクロールにするなら「ここで終わり」を明示する終端要素を置く。
  - 音は `autoplay` を使わず操作起点にし、`AudioContext.state` を確認して resume を要求する。ミュート導線を1画面内に置く。
- 観察元の数値: ループ 20/60/80秒、`@keyframes` 6件 / 5件、`transition` 15件 / 32件、reduced-motion 3件 / 1件、Shorts 上限 3分。

## 反例

- **ドパガキ氷**: 刺激を売りにしながら完成後に BGM を止める。停止可能性が高い側の例で、`backlash` が刺激量だけでは決まらないことの反例（`O-20261116-case-dopagaki-signs` S-5。本編の内容は未確認）。
- **gumroad**: `prefers-reduced-motion` が3件あり、観察者自身が「止められない側に振り切っていない可能性」と書いている。無限ループがあっても停止手段が効いていれば `backlash` は上がらない、という反例候補。**実効テストは未実施**。
- **caption**: ループの効果（視聴時間が伸びる）について一次データを確認できなかった＝**未確認**。「止められなさ」の因果はまだ示せていない。
- **asl**: 「止められなさ」を ASL で説明できないという記述は、裏を返せば**何が効くかの特定に失敗している**ということ。この傾向の中心命題はまだ仮説段階。

## 強度の分布

- **強い**: 終端が消えたループ＋自動再生＋停止導線なし（観察では該当例を特定できず＝**未確認**）。
- **中**: 無限ループがあるが `prefers-reduced-motion` が部分的に効く（gumroad）。
- **弱い**: ループはあるが尺が短く終端が来る、または作品側が止める（ドパガキ氷）。
- **逆**: 停止・ミュートが1操作で可能で、`animation-iteration-count` が明示されている。

## 未検証・次に測る

- 実ブラウザで `prefers-reduced-motion: reduce` を強制し、gumroad / tinybird のアニメが実際に止まるかを `document.getAnimations().length` の差分で確認（現在は宣言の文字列カウントのみ）。
- 自作の同一ページで「ループあり／なし」「停止ボタンあり／なし」の2×2を作り、平均視聴時間と「うざい」評定（5段階）を測る。
- 停止手段の有無を5段階で評定する尺度を作る（0=手段なし … 4=1操作で停止かつ状態が保存される）。
- 音声の実測（`<audio autoplay>` の有無、`AudioContext.state`）は観察0件。次に音を使う素材を見るときに必ず記録する。
