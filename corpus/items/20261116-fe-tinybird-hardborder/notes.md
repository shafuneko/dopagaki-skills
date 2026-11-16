# 20261116-fe-tinybird-hardborder — notes

観察: `observations/O-20261116-fe-tinybird-hardborder.md`
種別: `site` / 権利: third-party（CSS・HTML は参照のみ。転載しない）

## 取得したもの（2026-11-16）

| 対象 | URL | サイズ |
|---|---|---|
| ページ HTML | https://www.tinybird.co/ | 323,440 文字 |
| CSS 1 | https://www.tinybird.co/_next/static/immutable/chunks/2ifownkhrb_iq.css | 合計 177,644 文字（5本） |
| CSS 2 | https://www.tinybird.co/_next/static/immutable/chunks/1w6_1gqbvjip7.css | |
| CSS 3 | https://www.tinybird.co/_next/static/immutable/chunks/1h4b13balrum5.css | |
| CSS 4 | https://www.tinybird.co/_next/static/immutable/chunks/0tlcgt95gejbt.css | |
| CSS 5 | https://www.tinybird.co/_next/static/immutable/chunks/1lxysxhkerqp4.css | |

ビルド成果物のため、チャンク名はデプロイごとに変わる。URL は 2026-11-16 時点のもの。

## 技法カタログ（この素材で実測できたもの）

### 1. 遷移時間の量子化（200ms / 300ms）

- 実装: `transition:` 省略記法 19値のうち 300ms が9件、200ms が3件、100ms が2件、150ms が2件、1ms が3件。`transition-duration` の値は9件で中央値300ms。
- 読み方: 段階が少ない＝**トークン化**された設計。中間値（250ms 等）が無い。
- 難度: 低（設計判断のみ）
- パフォーマンス: 対象プロパティ次第。`transform` / `opacity` は合成、`backdrop-filter` や `box-shadow` の遷移は毎フレーム再ペイントになりやすい。
- a11y: 300ms は WCAG の閾値ではなく、5秒未満なので 2.2.2 の対象外。ただし `prefers-reduced-motion` の記述は1件のみ。

```css
/* 実測値の範囲で再構成した例（サイトのコードそのものではない） */
:root { --dur-1: 200ms; --dur-2: 300ms; }
.card { transition: transform var(--dur-1) ease-out, box-shadow var(--dur-2) ease-out; }
@media (prefers-reduced-motion: reduce) { .card { transition-duration: 1ms; } }
```

### 2. ガラス質（`backdrop-filter`）

- 実装: 8件。`clip-path` 2件と併存。
- 難度: 低（1行）だが**性能の罠が大きい**
- パフォーマンス: 背景のぼかしは画面面積に比例して重い。スクロール中に大きな要素へ掛けるとフレーム落ちしやすい。固定ヘッダ・モーダル程度に限定するのが安全。
- a11y: 背景が透けると**文字コントラストが変動**する。背景画像の上に置くと 4.5:1 を割りうる（`docs/02-taxonomy.md` のコントラスト基準）。
- 実例URL: https://www.tinybird.co/ （CSS 8件）

### 3. 1px 枠＋角丸0 の「硬さ」

- 実装: `border:` の幅は 1px×4、4px×1。`border-radius: 0` 4件。`box-shadow` 9件でぼかし0は0件。
- 読み方: 極太枠（4px 以上）は**1件だけ**で主役ではない。硬さは「細い枠＋角丸0」で出している。
- 難度: 低
- パフォーマンス: `border` はレイアウトに影響するが静的なので問題になりにくい。ホバーで `border-width` を変えるとガタつく（`outline` か `box-shadow` で代替する）。
- a11y: 1px の細枠は低解像度で消えやすい。フォーカスリングを枠と同色にすると見えなくなる。

## この素材で観察できなかった技法（0件の実測）

| 技法 | カウント | 意味 |
|---|---|---|
| `scroll-timeline` / `animation-timeline` | 0 / 0 | scroll-driven animations 未採用 |
| `view-transition` | 0 | View Transitions API 未採用 |
| `mix-blend-mode` | 0 | ブレンドモード未使用 |
| `conic-gradient` | 0 | コニックグラデ未使用 |
| `steps()` | 0 | 段階変化（グリッチ）未使用 |

「0件」は静的 CSS に無いという意味。**2026年時点の大規模サイトでも scroll-driven / View Transitions は観察できなかった**、という否定的データとして使う（一般化はしない。n=1）。

## 使うときの注意

- `var()` を解決していないため、`box-shadow` などの値は過小評価になりうる。
- 5本を連結して数えており、どのチャンクに遷移が集中しているかは未計測。
- Next.js のビルド成果物。整形しないと1行が非常に長い。
