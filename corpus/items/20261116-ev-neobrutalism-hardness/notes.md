# 20261116-ev-neobrutalism-hardness — neobrutalism.dev

## 何を見たか

- `https://neobrutalism.dev/` の HTML を 2026-11-16 に HTTP GET（1回）。
- 参照スタイルシート 2本（合計 168,838 文字）も HTTP GET。
- **テキストのみ**。描画・スクリーンショットは無し。どの要素にどの影が当たるかは未確認。

## どこを見れば確認できるか

- トップページ: `https://neobrutalism.dev/`
- CSS 内の次の宣言（値の実体まで取れている）:
  - `--border: oklch(0% 0 0)`（= 黒）
  - `--shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border)`
    → ぼかし半径 0px・広がり 0px の**硬い影**。色は `--border`（黒）。
  - `--shadow-shadow: var(--shadow)`
  - `border-width: 2px`（3件） / `1.5px`（1件） / `1px`（1件） / `0`（6件）
  - `border-radius: 0`（8件）と `--border-radius: 5px`（1件）の併存

## 見た範囲

- HTML 87,498 文字、CSS 2本の全体を正規表現で走査。1回のみ。
- トークン定義（`:root` 等）は読んだが、コンポーネントごとの適用は未確認。

## なぜドパガキ研究の素材になるか

「硬さ」を色とぼかし半径の数値で確認できる希少な例。様式名（ネオブルータリズム）と実測値が一致するかを試せる（自己判断。第三者の「ドパい」評は見つけていない）。
