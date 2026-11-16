---
id: R-style-rainbow-hue-cycle
domain: style
strength: 3
status: draft
evidence: [O-20261116-play-dopa-wick, O-20261116-play-dopa-pong, P-two-tier-time]
updated: 2026-11-16
---

# R-style-rainbow-hue-cycle — 虹色は「色相を回す」で作り、彩度と輝度は動かさない

## 規則

虹色を演出に使うときは、色相環を回す（2〜3秒で一巡）ことで多色を作り、
彩度を高く保ったまま、輝度は意図した瞬間以外は動かさない。

## 実装

```css
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }

.rainbow {
  background: conic-gradient(from var(--angle),
    #ff004c, #ff8a00, #ffee00, #38ff4a, #00e5ff, #4b5bff, #c400ff, #ff004c);
  animation: hue-cycle 2.4s linear infinite;
}
@keyframes hue-cycle { to { --angle: 360deg; } }

/* @property 非対応環境 */
@supports not (background: conic-gradient(from var(--angle), red, blue)) {
  .rainbow {
    background: linear-gradient(90deg, #ff004c, #ffee00, #00e5ff, #c400ff, #ff004c);
    animation: hue-fallback 2.4s linear infinite;
  }
  @keyframes hue-fallback { to { filter: hue-rotate(360deg); } }
}
```

- 周期の出発点は **2.4 秒**（ドパWick の実測: 0.4秒ごとに全面の色が変わり、約2.4秒で一巡）。
- 彩度は 0.55〜0.7 を維持（実測 0.569〜0.585）。輝度を上下させると点滅に見え、WCAG 2.3.1 の判定対象になりやすい。
- 白フラッシュと併用するときは、フラッシュの**面積と回数**を別に管理する（1秒3回未満）。

## なぜ効くか（仮説）

色相の回転は「色が変わる」強い印象を作るが、輝度が一定なら網膜への刺激の立ち上がりが小さく、
点滅より疲労が少ないと考えられる（H3 過剰性の一形態）。
ドパWick は彩度・輝度をほぼ一定に保ったまま色相だけを回しており、この作り方の実例とみられる。

## 効く条件

- 暗い背景（発光体として見える）
- 面積が大きい（背景・全面・大きな図形）
- 他の要素が少ない（虹色が主役）

## 効かない・逆効果の条件

- 明るい背景の上（虹色が濁る）
- 文字の可読性が必要な領域（コントラストが周期的に壊れる）
- 周期が 1 秒未満（点滅に見える。2.3.1 のリスクと酔い）
- 画面全体を虹色にすると「特別な色」の記号性が失われる（温存が効く）

## 強度の根拠

strength 3: 強い印象を作るが、作品の骨格を決めるのは段階設計（R-intensity-stage-ladder）。
虹色は「ここぞ」で使う装飾であり、単独では作品を成立させない。

## 出典・根拠ID

- `observations/O-20261116-play-dopa-wick.md` §8（色相巡回の実測: 8フレーム、平均RGB差 68〜114、周期約2.4秒）
- `observations/O-20261116-play-dopa-pong.md`（暗い背景＋少数の高彩度色）
- `docs/02-taxonomy.md` 付録（点滅の面積・輝度条件）
