# 20261116-fe-gumroad-density — notes

観察: `observations/O-20261116-fe-gumroad-density.md`
種別: `site` / 権利: third-party（CSS・HTML は参照のみ。転載しない）

## 取得したもの（2026-11-16）

| 対象 | URL | サイズ |
|---|---|---|
| ページ HTML | https://gumroad.com/ | 129,867 文字 |
| CSS（1本） | https://assets.gumroad.com/vite/assets/entrypoints/design-D3ivUF3s.css | 161,478 文字 |
| Lottie プレイヤー | https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js | HTML の `<script src>` から |

再取得すれば同じ数値になるとは限らない（ハッシュ付きアセット名 `design-D3ivUF3s.css` は内容が変われば変わる）。

## 技法カタログ（この素材で実測できたもの）

### 1. 常時ループの帯（マーキー相当）

- 実装: `animation` 省略記法 8件。時間値は 1.1s / 20s / 60s / 80s（20〜80秒の帯）。
- 難度: 低（CSS のみ。JS 不要）
- パフォーマンス: `transform: translateX()` で動かせば合成レイヤのみ。`left` / `margin` を動かすとレイアウトが毎フレーム再計算される。**この素材ではどのプロパティを動かしているか未確認**（`@keyframes` 6件の中身を抽出していない）。
- a11y: 5秒を超える自動移動は WCAG 2.2.2 の停止手段が必要。`prefers-reduced-motion` の記述は3件あるが、帯そのものが止まるかは未確認。
- 注意: 旧 `<marquee>` 要素は0件。`marquee` の語6件はクラス名等で、CSS 実装。

```css
/* 実測値の範囲で再構成した例（サイトのコードそのものではない） */
.marquee { overflow: hidden; }
.marquee__track { display: flex; width: max-content; animation: marquee 20s linear infinite; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none; } }
```

### 2. 150ms に揃えた応答

- 実装: `transition-duration` 6件の中央値 150ms（30/100/150/150/200/300）。`--*duration*` カスタムプロパティ 8件も中央値 150ms（140ms が1件）。
- 難度: 低
- パフォーマンス: 対象プロパティ次第。`transform` / `opacity` なら合成のみ、`width` / `height` / `box-shadow` はペイント・レイアウトを伴う。**対象プロパティは未確認**。
- a11y: `transition` は操作起点なので WCAG 2.2.2 の対象外になりやすい（自動で動き続けない）。ただし前庭障害への配慮として `prefers-reduced-motion` での無効化が望ましい（同サイトは3件記述あり）。

### 3. 密度（カードグリッド）

- 実装: `<img>` 129枚 / タグ669個。CSS 側に特別な仕掛けは不要で、**画像枚数そのもの**が刺激量。
- 難度: 低（ただし素材調達コストは高い）
- パフォーマンス: 129枚の転送が支配的。`loading="lazy"` の有無は未確認。レイアウトシフト（CLS）は `width`/`height` 指定の有無に依存し、未確認。
- a11y: 画像の `alt` 有無は未確認。密度が高いほど読み上げ・キーボード移動の負荷が上がる。

## この素材で観察できなかった技法（0件の実測）

| 技法 | カウント | 意味 |
|---|---|---|
| `mix-blend-mode` | 0 | ブレンドモードによる質感は未使用 |
| `conic-gradient` | 0 | コニックグラデは未使用 |
| `steps()` | 1 | 段階変化（グリッチ的）はほぼ無い |
| `clip-path` | 2 | 切り抜きは少数 |
| `scroll-timeline` / `animation-timeline` | 0 / 1 | scroll-driven は実質未採用 |
| `view-transition` | 0 | View Transitions API 未採用 |
| `animation-iteration-count: infinite` | 0 | 無限ループは省略記法側に書かれている |

「0件」は**静的 CSS に無い**という意味で、JS で後から付与される可能性は排除できない。

## 使うときの注意

- 数値は宣言ベース。実ブラウザの computed style ではない。
- 129枚の画像は第三者の商品画像。**再現には使わない**（構造だけ参考にする）。
- `design-D3ivUF3s.css` はビルド成果物。読むときは整形してから検索する（1行が長い）。
