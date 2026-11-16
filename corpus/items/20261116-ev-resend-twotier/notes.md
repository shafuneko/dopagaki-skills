# 20261116-ev-resend-twotier — Resend

## 何を見たか

- `https://resend.com/` の HTML を 2026-11-16 に HTTP GET（1回）。
- その HTML が参照するスタイルシート 5本（合計 1,050,612 文字）も HTTP GET。
- **テキストのみ**。ブラウザ描画・スクリーンショット・録画は無し。アニメの実効値は未測定。

## どこを見れば確認できるか

- トップページ: `https://resend.com/`
- HTML の `<link rel=stylesheet>` 5本を連結した CSS 内の
  `transition` / `transition-duration` / `animation` / `animation-duration` の宣言
- `prefers-reduced-motion` の出現（12件）

## 見た範囲

- HTML 583,790 文字と CSS 5本の全体を正規表現で走査。1回のみ。
- `var()` は未解決。適用要素数による重み付けは無し（宣言の出現数）。

## なぜドパガキ研究の素材になるか

短い応答（150〜300ms）と長い常時ループ（30秒）が同一 CSS に同居する例。「速い」を平均値で語れないことの素材（自己判断。第三者の「ドパい」評は見つけていない）。
