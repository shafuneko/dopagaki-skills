---
id: O-20261116-fe-tinybird-hardborder
date: 2026-11-16
contributor: "research-fe"
corpus: ["20261116-fe-tinybird-hardborder"]
axes: [style, motion, tempo, backlash]
# axes: tempo, intensity, motion, reward, audio, copy, flow, style, restraint, backlash
confidence: low
# confidence: low（1回見た） | mid（複数回・複数サイズ） | high（他の観察者も確認）
status: draft
# status: draft | reviewed | superseded
---

# O-20261116-fe-tinybird-hardborder — tinybird.co（200/300ms の量子化＋1px 枠＋ガラス質）

## 1. 対象と見た範囲

- 素材: `corpus/items/20261116-fe-tinybird-hardborder/`
- 取得: 2026-11-16、`https://www.tinybird.co/` の HTML（323,440 文字）と、そこが参照する CSS 5本
  `/_next/static/immutable/chunks/{2ifownkhrb_iq,1w6_1gqbvjip7,1h4b13balrum5,0tlcgt95gejbt,1lxysxhkerqp4}.css`
  （合計 177,644 文字）を HTTP GET。
- デバイス / 画面幅: **未確認**（描画・スクリーンショットなし。静的取得のみ）
- ブラウザ: 使用せず（HTTP 取得のみ。UA は Chrome 131 を名乗る）
- 見た範囲と時間: 上記6ファイル全体を正規表現で走査。1回のみ。

> 測り方の限界: 宣言ベース（computed style ではない）。`getAnimations()` 未使用。`var()` 未解決。
> 5本の CSS を連結してから数えており、ファイル別の内訳は取っていない。
> 枠・影の数値は `var()` や `rgba()` 内の数字を誤読しうるため**弱い証拠**として扱う。

## 2. 事実（測定）

| 指標 | 値 | 測り方 |
|---|---|---|
| `transition-duration:` 宣言数 | 18件（値あり9件） | 全 CSS 連結に対し `(?<!-)transition-duration\s*:\s*([^;}]+)` |
| `transition-duration` 値の中央値 | **300ms**（min 0 / max 1000） | 9件を ms 正規化。分布 0,100,150,200,300×3,500,1000 |
| `transition:` 省略記法 | 14件 / 値19件、中央値 **200ms** | `(?<!-)transition\s*:`。分布 1ms×3,100×2,150×2,200×3,300×9 |
| `animation:` 省略記法 | 9件 / 時間値1件（1000ms） | 同上 |
| `animation-duration:` | 1件 / 値 0ms | 同上 |
| `@keyframes` | 5件 | 文字列カウント |
| `prefers-reduced-motion` | 1件 | 文字列カウント |
| `backdrop-filter` | 8件 | 文字列カウント（ガラス質） |
| `clip-path` | 2件 | 文字列カウント（切り抜きの土台） |
| `mix-blend-mode` / `conic-gradient` / `steps(` | 0 / 0 / 0 件 | 文字列カウント |
| `animation-timeline` / `scroll-timeline` / `view-transition` | 0 / 0 / 0 件 | 文字列カウント（scroll-driven・View Transitions は未採用） |
| `border:` 省略記法の幅 | 宣言9件 / 幅が取れた5件（**1px×4、4px×1**） | 値の先頭の長さを抽出 |
| `box-shadow:` 宣言 | 9件（うち**ぼかし0と判定できたもの0件**） | 3番目の長さが0か判定。`var()` で失敗しうる |
| `border-radius: 0` | 4件 | `border-radius\s*:\s*0(px)?\s*[;}]` |
| HTML のタグ数 / `<img>` 数 | 983 / 18 | `<[a-zA-Z]` と `<img` のカウント |

## 3. 徴候

- **S-1**: 遷移時間が 200ms(×3) と 300ms(×9) に**量子化**されている。中間値（250ms 等）が無い＝デザイントークンの段階値を使っている可能性。
- **S-2**: 省略記法19件のうち 300ms が9件で最多。宣言ベースの中央値200msは「短い側の裾（1ms×3、100×2）」に引かれている。**中央値だけ見ると速く見える**。
- **S-3**: `backdrop-filter` 8件＋`clip-path` 2件。ガラス質と切り抜きが同一 CSS に併存。
- **S-4**: 枠は 1px が4件・4px が1件、`border-radius: 0` が4件。**極太枠ではなく細い枠＋角丸0**で硬さを作っている（gumroad と同じ傾向）。
- **S-5**: `box-shadow` 9件でぼかし0は0件。硬いドロップシャドウは観察できなかった。
- **S-6**: `animation-timeline` / `scroll-timeline` / `view-transition` が 0件。2026年時点で**採用例が観察できなかった**技法の実例。
- **S-7**: `prefers-reduced-motion` は1件のみ。`@keyframes` 5件・`transition` 32件に対して被覆は薄い。
- **S-8**: 画像18枚に対しタグ983個。密度を画像ではなく**DOM とタイポグラフィ**で作っている（gumroad の129枚と対照）。

## 4. 印象（主観）

- 「硬質で、押すと即座に沈む」— 観察者1名。**画面は未確認**。1px 枠・角丸0・300ms という数値から受けた印象で、視覚的裏付けは無い。

## 5. 仮説

- H1（テンポ）: 200/300ms の二段だけを使うと「速い」より「揃っている」印象になる、という仮説。速度そのものより**段階の少なさ**が効く可能性。
- H4（即時性）: 省略記法の裾に 1ms が3件。押下フィードバックだけ極端に速くし、他は300msに置く**役割分担**の可能性。
- H6（対比）: ガラス質8件と1px 枠の併存は、対比で硬さを強調する意図かもしれない（未検証）。

## 6. 反例・例外

- 「速い＝ドパガキ的」の反例: 中央値300msは `docs/02-taxonomy.md` 付録の NN/g 推奨（単純なマイクロインタラクション 100–150ms）より**遅い**。それでも硬質な刺激は成立しうる。
- `steps()` 0件。グリッチの定番実装（`clip-path` + `steps()`）は、`clip-path` 2件はあるが組み合わせでは使われていない。
- `@keyframes` 5件に対して `animation-duration` の宣言が1件（0ms）。ループの実体は省略記法側にあり、**宣言場所が分散している**ため単純集計は過小評価になりうる。

## 7. 未翻訳・次に測る

- 未翻訳: 「硬い」。枠幅（1px×4、4px×1）と角丸0（4件）では説明しきれない。線の色（黒か中間色か）を測っていない。
- 次に測る: (1) `border-color` と `box-shadow` の色の分布（黒なら硬い、グレーなら柔らかい）。(2) 5本の CSS をファイル別に集計し、遷移がどのチャンクに集中しているか。(3) 実ブラウザで `prefers-reduced-motion: reduce` 時の差分を取る。
