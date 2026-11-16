---
id: R-style-rainbow-two-modes
domain: style
strength: 3
status: draft
evidence: [O-20261116-play-dopa-mahjong, O-20261116-play-dopa-wick, O-20261116-play-dopa-pong]
updated: 2026-11-16
---

# R-style-rainbow-two-modes — 虹色は「終端の記号」か「作品の基調」かを先に決める

## 規則

虹色を使う前に、**その虹色が「特定の瞬間の記号」なのか「作品全体の基調」なのか**を1つ選び、
ファイル冒頭のコメントか README に1行で書く。両方を混ぜない。

## 実装

```css
/* 基調モード: 虹は常時。代わりに「終端」は白閃光や金で表す */
:root[data-rainbow="base"] .logo { animation: hue 2.4s linear infinite; }
:root[data-rainbow="base"] .flash { --flash-color: #fff; }   /* 虹以外の記号を確保 */

/* 記号モード: 虹は当たりの瞬間だけ。通常時は単色 */
:root[data-rainbow="signal"] .logo { --angle: 0deg; }
:root[data-rainbow="signal"] .stage-4 .logo { animation: hue 0.8s linear infinite; }
```

- 基調モードでは、**虹の上に別の「強さの記号」を必ず1つ用意する**（白閃光、金、集中線など）。
  でないと「一番派手な状態」を表現できなくなる。
- 記号モードでは、虹を出した瞬間が「ここぞ」になる。使用回数を数えて制限する（1作品3回まで等）。

## なぜ効くか（観察）

- パチンコ・スロットでは虹は**終端記号**（エヴァ15 の虹保留＝確変当り濃厚）で、温存される。
- 一方、Web のドパガキ周辺作品では虹が**様式**として全面に敷かれている例がある（ドパ麻雀のタイトル）。
- 混ぜると、虹が「常時」なのに「ここぞ」の意味も持たせようとして、記号が壊れる。

## 効く条件

- 虹色を使う Web 作品全般（LP、ゲーム、イベントページ）
- 段階ラダー（L0〜L5）を持つ作品

## 効かない・逆効果の条件

- 虹色を使わない作品（当然）
- 静的な名刺・業務画面
- 虹が1箇所しかない（モードを選ぶ意味がない）

## 強度の根拠

strength 3: 設計の一貫性に効くが、見た目の派手さそのものは変えない。

## 出典・根拠ID

- `observations/O-20261116-play-dopa-mahjong.md`（S-1 虹色が様式として全面）
- `observations/O-20261116-play-dopa-wick.md`（色相巡回がタイトル背景）
- `observations/O-20261116-play-dopa-pong.md`（暗い画面＋光の対比）
- `references/pachinko-slot-grammar.md` §3（虹は終端記号）
- `research/20261116-spectacle-cases.md`（エヴァ15 虹保留＝確変当り濃厚）
