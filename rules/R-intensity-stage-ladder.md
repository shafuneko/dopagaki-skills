---
id: R-intensity-stage-ladder
domain: intensity
strength: 4
status: draft
evidence: [O-20261116-play-dopa-pong, O-20261116-play-dopa-wick, O-20261116-case-dopagaki-signs]
updated: 2026-11-16
---

# R-intensity-stage-ladder — 演出は3段階以上のラダーにし、各段で変化の種類を2つ以上変える

## 規則

主要な演出（1回の「見せ場」）は、少なくとも3段階（通常・予兆・到達）で構成し、
隣り合う段階では「色 / 速度 / レイヤ数 / 音 / 文字 / 抽選」のうち**2つ以上**を同時に変える。

## 実装

```html
<div class="stage" data-stage="L0">
  <div class="stage__bg"></div>
  <div class="stage__figure"></div>
  <div class="stage__light"></div>
  <div class="stage__text"></div>
</div>
```

```css
/* 段階ごとに「変える項目」を増やす。L0 は基準点 */
.stage[data-stage="L0"] { --count: 1; --glow: 0; --speed: 0s; }
.stage[data-stage="L1"] { --count: 1.1; --glow: 0.2; }          /* 色＋音 */
.stage[data-stage="L2"] { --count: 1.4; --speed: 900ms; }        /* 速度＋文字 */
.stage[data-stage="L3"] { --count: 2; }                          /* レイヤ追加＋間 */
.stage[data-stage="L4"] { --glow: 1; --speed: 600ms; }           /* 全部 */
```

```js
// 段階の遷移だけを JS が持つ（見た目は CSS 変数）
const el = document.querySelector(".stage");
const ladder = ["L0", "L1", "L2", "L3", "L4"];
let i = 0;
const next = () => { if (i < ladder.length - 1) el.dataset.stage = ladder[++i]; };
```

タイムラインの型は [`skills/dopagaki-direction/references/escalation-ladder.md`](../../skills/dopagaki-direction/references/escalation-ladder.md)。

## なぜ効くか（仮説）

段階の差が「量」だけだと単調になり、知覚上の段差が生まれないと考えられる（H6 対比）。
パチンコ・スロットの液晶演出は、予兆→リーチ→発展→大当りと**質の違う段**を重ねることで期待を保持している。
dopa-pong は倍率の階段を常設表示し、段階の存在を画面上で可視化している（O-20261116-play-dopa-pong S-1）。

## 効く条件

- 演出に「待ち時間」がある（ローディング、抽選、結果表示）
- 到達点が明確（当たり、購入完了、獲得）
- 画面に段階を示す場所がある（HUD、バー、倍率）

## 効かない・逆効果の条件

- 演出が1秒未満で終わる（段階を入れる余地がない）
- 段階をユーザーが操作できない読み物・記事（予告が冗長になる）
- 段階の意味が説明されない（何の段階か分からないと、ただの点滅）
- L4 を毎回同じ強さで出す（2回目以降、慣れて効かなくなる。H7）

## 強度の根拠

strength 4: 演出の骨格そのものを決める規則で、守らないと「派手だが単調」になりやすい。
一方、段階の数や名前は作品ごとに変えられるため 5 ではない。

## 出典・根拠ID

- `observations/O-20261116-play-dopa-pong.md`（FEVER LEVEL 5段、DOPA SLOT）
- `observations/O-20261116-play-dopa-wick.md`
- `observations/O-20261116-case-dopagaki-signs.md`（S-1〜S-6）
- パチンコ演出の一般的な段階構造（出典は `research/20261116-pachinko-slot-grammar.md` を参照。**未検証**）
