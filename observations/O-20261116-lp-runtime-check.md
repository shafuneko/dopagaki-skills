---
id: O-20261116-lp-runtime-check
date: 2026-11-16
contributor: lead@szk27
corpus: [20261116-lp-light-the-way, 20261116-lp-ahkah-holiday, 20261116-lp-sakuma-55th]
axes: [tempo, motion, intensity]
confidence: mid
status: draft
---

# O-20261116-lp-runtime-check — 宣言ベースの計測は実行時の transition と一致するが、animation 層は長い常時ループが支配する

## 1 対象と見た範囲

- 対象: 既存の素材3件（LP）。2026-11-16 15:25 に **ego lite（Chromium）で実際に開き**、`document.getAnimations()` と全要素の computed style を取得した。
- 環境: ビューポート 1377×598、`prefers-reduced-motion: reduce` は false（既定）、ページ読み込み後 2.5秒待って1回だけ計測。ネットワーク状態は未記録。
- 手順: `tools/play-20261116/lead-round-01.mjs`（生データ `tools/play-20261116/lead-measure-01.json`）。1回の計測のみ＝**再現性は未確認**。

## 2 事実と測定

| 素材 | 要素数 | getAnimations 件数 | そのうち infinite | animation duration 中央値 | transition 宣言数 | transition 中央値 (p10–p90) | 150ms 未満の transition | filter / backdrop 使用要素 |
|---|---|---|---|---|---|---|---|---|
| LIGHT THE WAY 10th | 3019 | 1420 | 1354 | 10000ms | 700 | 400ms (300–800) | 13 | 0 / 0 |
| AHKAH 2026 Holiday | 1235 | 1 | 1 | 3400ms | 251 | 300ms (300–400) | 0 | 45 / 18 |
| サクマいちごみるく55周年 | 38 | 0 | 0 | — | 0 | — | — | 0 / 0 |

補足（同じ計測から）:
- LIGHT THE WAY: `animation-duration` の p10 5442ms、p90 87019ms。**アニメの98%（1354/1420）が infinite**。
- AHKAH: transition は 300ms に集中（251件の p10 も p90 も 300/400ms）。**宣言の段階値がそのまま実行値になっている**。
- サクマ: 要素38・アニメ0・**本文文字数 0**。ページは読み込めているが、テキストが DOM に無い（画像のみ、または別フレーム/JS 依存）＝**この計測では内容を観察できていない**。

## 3 徴候

- S-1: 宣言ベースの中央値（400ms / 300ms）と、実行時の transition 中央値（400ms / 300ms）が**一致した**。transition については、宣言の集計が実行値の代理として使える（この2サイト・この条件で）。
- S-2: 一方、`getAnimations()` の側は**別の層**だった。LIGHT THE WAY は 1420 件中 1354 件が infinite で、中央値 10秒。つまり「アニメの数」を速度の指標にすると、**常時ループの本数**を数えてしまう。
- S-3: `under150`（150ms 未満の transition）は 700 件中 13 件（LIGHT THE WAY）、251 件中 0 件（AHKAH）。**速い側の裾はほぼ無い**。
- S-4: AHKAH は filter 45 要素・backdrop-filter 18 要素。LIGHT THE WAY は 0。同じ「派手なLP」でも**質感の手段が違う**（画像の多さ 887 対 120 とも対応）。

## 4 印象

LIGHT THE WAY は「動いている量」が多く、AHKAH は「静かに滲む」感じ。**どちらも transition は 300〜400ms で、体感の差は速度ではなくループの本数と質感の層から来ていそう**（印象）。

## 5 仮説

- H8（局所バースト）の追加材料: 実行時の transition は単峰（300/400ms）で、速い裾が無い。**「ドパく見えるLP」でも transition は速くない**可能性。速さの実体はループの本数・質感・画像密度かもしれない。
- 「アニメ件数」と「速度」は別指標にすべき（S-2）。件数は infinite ループで水増しされる。

## 6 反例

- サクマは**計測が成立していない**（文字0・アニメ0）。「アニメが無い」のではなく「この方法では取れなかった」可能性が高く、反例として使えない。要再計測（スクロール後、`iframe` の確認）。
- AHKAH は transition 251件・アニメ1件で、**派手さの割にアニメの本数が少ない**。「派手＝アニメが多い」の反例候補。
- LIGHT THE WAY の 1420 件のうち 1354 件が infinite であることは、「停止できない要素が多い」ことを意味しない（`animation-play-state` や reduce の実装は未確認）。S-2 を制御可能性の根拠に使わない。

## 7 未翻訳（測れていないこと）

- スクロール後の状態（初回描画のみ計測）。SPA の遷移後、IntersectionObserver で後から付くアニメは未取得。
- CSS-in-JS・影（`box-shadow` は全サイト0件と出たが、`filter: drop-shadow` や画像の影は取れない）。
- 音（この3サイトは無音と推定。`AudioContext` は未検査）。
- 体感の評定（0件）。したがって「速く見える／ドパい」との相関は**未検証**。
- サクマの内容（テキスト0の原因）。

## 8 測り方の改善（次回）

1. 計測前にスクロールを最後まで送り、`requestIdleCallback` 後に取る（遅延付与のアニメを拾う）。
2. `getAnimations()` は **infinite と finite を分けて**報告する（本観察の S-2 の教訓）。
3. transition は宣言と実行の両方を出し、**一致しない場合だけ**差分の理由（CSS-in-JS、`var()`、`!important`）を書く。
4. 1サイトにつき3回計測し、中央値のばらつきを記録する（今回は1回）。
