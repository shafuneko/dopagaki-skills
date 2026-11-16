# 視覚的過剰の実装と測り方 — 色・合成・タイポ・レイアウト

- 作成: 2026-11-16 / 担当: 調査サブエージェント（Web調査のみ。実ブラウザ計測は未実施）
- 位置づけ: [docs/02-taxonomy.md](../docs/02-taxonomy.md) の `intensity`（刺激量・密度）と `style`（質感・様式）、[evals/rubric.md](../evals/rubric.md) の **A 濃度** / **D 様式の過剰さ** を一段具体化するための材料。
- **これは調査メモであり規則ではない。** ここに書いた数値・手法を規則にするには `patterns/` → `rules/` の順で昇格させる（[docs/01-method.md](../docs/01-method.md)）。
- ラベル: `[事実]` = 出典URLで確認できる仕様・研究結果 / `[主張]` = 出典元の主張・実務慣習（検証されていない） / `[推測]` = 本メモ執筆者の推測 / `[提案]` = 実装・計測の提案。
- **実測値は1つも無い。** 本メモに「測った」と読める数値は登場しない（研究論文が報告した数値は「その研究の測定値」として引用する）。

---

## 0. 先に結論（3行）

1. `[事実]` 「色数が多い＝ドパい」を直接支持する研究は見つからなかった。あるのは「色数は視覚的複雑さの構成要素で、視覚的複雑さは覚醒と相関する」という**間接**の証拠。
2. `[事実]` 実装側の過剰さは「色数」より **合成（blend/filter）・文字装飾・レイアウトの逸脱** に現れる。ここは DOM から機械的に数えられる。
3. `[提案]` 既存 `probe.js` の `hueApprox`（CSS宣言ベース）だけでは「実際に描画された色」を捉えない。**描画ピクセル寄りの近似**を3つ、**装飾の層数**を3つ足すのが費用対効果が高い。

---

## 1. 色

### 1.1 実務指針は「数」より「役割」

- `[事実]` Material Design 3 は色を「数」ではなく **役割（role）** で定義する。primary は最重要要素、secondary は緊急でない要素、tertiary はバッジ等の小さな強調、と用途で分け、surface / surface-container 系の階調を別に持つ。つまり「何色使ったか」ではなく「同じ役割に何色割り当てたか」が設計単位。出典: <https://m3.material.io/styles/color/roles>
- `[事実]` Tailwind CSS v4 の既定パレットは **22ファミリー × 11シェード（50〜950）** を OKLCH で定義し、sRGB 外（P3）の彩度も含む。ニュートラル系は chroma をほぼ 0 にしている。出典: <https://tailwindcss.com/blog/tailwindcss-v4>
  - 含意: 「色数」を数えると Tailwind 既定だけで 200 色を超える。**パレット定義数と画面内使用色は別物**として扱う必要がある。
- `[主張]` 60-30-10（主色60%・副色30%・差し色10%）はインテリア実務の経験則。Web の査読研究としての根拠は今回の検索では見つからなかった。出典（実務記事）: <https://www.apartmenttherapy.com/interior-design-rule-60-30-10-explained-37504313>
  - `[推測]` この規則の効能は「比率」そのものより、**面積の序列を先に決める＝色数を増やしても主従が壊れない**点にある。ドパガキ文脈では「色数」より「最大面積色の占有率」を測る方が説明力が高い可能性がある。

### 1.2 彩度・明度・色相距離

- `[事実]` Valdez & Mehrabian (1994) は、彩度（saturation）が覚醒（arousal）を線形に強く上げ、明度（brightness）は覚醒と U 字、快（pleasure）は明度と彩度の結合関数で明度の寄与が強い、と報告。原典: *Journal of Experimental Psychology: General* 123(4). 要約と追試: Wilms & Oberfeld (2018) <https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf>
  - ドパガキへの含意: **彩度は「色数」と独立に覚醒へ効く**。色数を絞っても高彩度なら刺激は高い。
- `[事実]` CSS の `hsl()` の色相は知覚均等ではない。`oklch()` は知覚的に均一な明度・彩度・色相を持つよう設計されている。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch>
  - `[提案]` 「色相距離」を hsl の数値差で測ると、緑〜青領域と赤〜黄領域で体感差がずれる。距離は OKLCH の hue 角で測るか、少なくとも hsl 距離を使うなら**指標名に hsl と明記**する。

### 1.3 グラデーションの実装

- `[事実]` `linear-gradient()` は色停止位置を複数指定でき、同じ位置に2色置くとハードストップ（帯）になる。`repeating-linear-gradient()` は縞模様を生成する。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient>
- `[事実]` `conic-gradient()` は12時方向から時計回りに色相を回す。`from` で開始角を変えられる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient>
- `[事実]` `color-mix()` は色空間を省略すると `oklab` で混色する。`in oklch` を指定すると極色空間になり、彩度が落ちにくい。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix>
- `[提案]` 多色グラデの「過剰さ」は停止点数では測れない。**向きの数（同時に何方向のグラデが画面にあるか）** と **色相の総回転量（停止点の hue 差の合計）** の方が体感に近い、という仮説。

### 1.4 「色数が多い＝ドパい」の根拠はあるか

- `[事実]` 視覚的複雑さ（visual complexity）と覚醒の相関を報告した研究はある。Tuch et al. (2009) は出発ページの複雑さが快・覚醒・生理反応・記憶に影響するとし、複雑さと覚醒の相関 **r = .74** を報告（被験者実験）。出典: <https://www.sciencedirect.com/science/article/abs/pii/S107158190900055X>
- `[事実]` 色数は視覚的複雑さの指標として使われてきた。Reinecke et al. (CHI 2013) は「色数」「テキスト/画像の占有率」等で複雑さを近似できると整理。出典: <https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf>
- `[事実（二次引用）]` Miniukovich & De Angeli の研究では、視覚的複雑さの要因として色数が **物体数に次いで2位** と報告されている（原典未取得、引用元: <https://bia.unibz.it/esploro/fulltext/conferenceProceeding/Quantification-of-interface-visual-complexity/991006493492201241>）。
- `[事実]` ただし「色数 → ドパガキ（短間隔の強い刺激の連続）」を直接測った研究は**見つからなかった**。覚醒・複雑さ・嗜好の研究であって、テンポや反復とは別。
- `[推測]` 「色数が多い＝ドパい」が成立するのは、色数が **画面の分割数（情報の塊の数）** の代理変数になっている場合。単色グラデを10色で作っても分割は増えない。
- **結論**: 根拠は「間接的に一部あり」。単独指標として使うのは不適切。`[提案]` 色は「色数」ではなく **(a) 面積重み付き彩度、(b) 色相クラスタ数、(c) 最大色相距離** の3点で見る。

---

## 2. モーション過多の視覚表現（合成・フィルタ）

### 2.1 `mix-blend-mode`

- `[事実]` ブレンドは**同じスタッキングコンテキスト内**の下位内容とだけ合成される。`isolation: isolate` で新しいスタッキングコンテキストを作ると、外側へのはみ出しを止められる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/isolation>
- `[事実]` `difference` / `screen` / `overlay` は分離可能（separable）モード。一方 `color` / `luminosity` などの非分離モードはブラウザ間で彩度の出方がずれる、という実装報告がある。出典: <https://www.testmuai.com/learning-hub/mix-blend-mode-browser-support>
- `[推測]` 落とし穴は3つ。(1) 親の `opacity` / `transform` / `filter` がスタッキングコンテキストを作り、意図した背景と合成されない。(2) テキストに `difference` をかけると下の画像次第でコントラストが 4.5:1 を割る（G5 違反）。(3) スクロールで下の層が変わると合成結果が毎フレーム変わる。
- `[提案]` 計測上は「`mix-blend-mode` を使っている要素数」より **「ブレンド要素の面積比」** の方が効く。1px の飾りと全画面ヒーローを同列に数えない。

### 2.2 `filter` のコスト

- `[事実]` web.dev の整理では、`grayscale` / `sepia` / `saturate` / `invert` は very fast、`hue-rotate` / `brightness` / `contrast` は fast、`blur` は「加速されない限り遅い」、`drop-shadow` は「遅くなりうる」、`url()` は可変。出典: <https://web.dev/articles/understanding-css>
- `[事実]` `filter` が `none` 以外だと、子孫の `position: fixed` の包含ブロックが変わる（レイアウトの落とし穴）。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/filter>
- `[推測]` ドパガキ的な「常時 hue-rotate で色が回る」演出は、見た目の強度に対して GPU コストが比較的低い。逆に「常時 blur」は面積に比例して重い。**強度あたりのコスト**で見ると hue-rotate は割が良い。

### 2.3 `backdrop-filter`

- `[事実]` `backdrop-filter` が `none` 以外だと新しいスタッキングコンテキストを作る。親に `opacity < 1` があるとその親が backdrop root になり、**背後の一部しかぼかさない**という混乱が起きる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter>
- `[事実]` 非対応環境ではポリフィルではなく**ぼかし済み画像へのフォールバック**が性能上推奨。出典: <https://web.dev/articles/backdrop-filter>
- `[主張]` ぼかし半径・面積・枚数がコストに効くため「半径20px以下・全画面1枚まで」といった実務目安が語られるが、これは環境依存で一般化できない。出典（実務ブログ）: <https://www.mironsoft.de/en/blog/css-backdrop-filter-frosted-glass-effects>
- `[提案]` すりガラスは「様式」としては1様式。**画面内でガラス面が3枚を超えると様式の一貫性が崩れやすい**（主観）。D の採点では「ガラスの枚数」より「他様式との併存」を見る。

### 2.4 `@property` とアニメ可能なカスタムプロパティ

- `[事実]` `@property` でカスタムプロパティに `syntax` / `inherits` / `initial-value` を登録すると、型が確定し**トランジション・アニメーションの対象になる**。未登録のカスタムプロパティは離散的に切り替わる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/@property>
- `[提案]` グラデーションの停止色や角度を `--angle` として登録し、`@property` + `transition` で回すのが「安っぽくならない動き」の実装上の定石。JS の rAF で `style.setProperty` を毎フレーム叩くより、合成側に寄せられる可能性がある（`[推測]`、実測未実施）。

### 2.5 `clip-path` / `mask`

- `[事実]` `clip-path` は基本図形（`polygon()` / `circle()` / `inset()`）で要素を切り抜く。`mask-image` は画像・グラデーションをマスクとして使う。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path> / <https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image>
- `[主張]` 複数マスクの合成（`mask-composite`）はベンダー接頭辞時代の値と仕様値が混在し、Safari で差が出やすい。
- `[提案]` グリッチ表現は「`clip-path` の段階変化 + `mix-blend-mode: screen` + 微小な `translate`」の3層で作られることが多い。層数がそのまま「過剰さ」のカウントになる。

---

## 3. タイポグラフィの過剰

### 3.1 極太・可変フォント

- `[事実]` `font-weight: 900` は数値指定だが、フォントに該当ウェイトが無い場合は最も近いウェイトが選ばれ、合成太字になることがある。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight>
- `[事実]` 可変フォントは `font-variation-settings` で `"wght" 900` のように軸を直接指定できる。ただし `font-weight` と併用すると後勝ち・上書きの関係が分かりにくい。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings>
- `[推測]` 日本語の極太は**ウェイトより字面（アウトライン）**の問題が大きい。同じ 900 でも Noto Sans JP Black と合成太字では、画数の多い漢字の潰れ方が違う。`font-weight` の数値だけを数えても「太さの圧」は測れない。

### 3.2 縁取り（stroke / text-shadow）

- `[事実]` `-webkit-text-stroke` は標準化トラックに無い（non-standard）。`text-shadow` はカンマ区切りで複数指定できる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke> / <https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow>
- `[提案]` `text-shadow` で8方向の縁取りを作る場合、`0 0` の中心影を入れないと字面の内側が汚れる。`-webkit-text-stroke` は輪郭が字面の中心線に乗るため、細い画線が消える。`paint-order: stroke fill` で塗りを上に戻す手がある（SVG 由来、CSS でも解釈される）。
- `[推測]` 縁取りの「安っぽさ」は色数より **縁の太さと字面サイズの比** で決まる。本文サイズ（14〜16px）に 2px 縁取りを付けると潰れる。見出し（40px以上）なら成立する。

### 3.3 斜体・回転・行間・字間

- `[事実]` `transform: rotate(-3deg)` は要素全体を回す。インライン要素には効かないため、`display: inline-block` が必要。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/transform>
- `[事実]` `letter-spacing` は負値も取れる。日本語では `font-feature-settings: "palt" 1` で約物の詰め（プロポーショナル字詰め）ができる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing> / <https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings>
- `[事実]` 縦書きは `writing-mode: vertical-rl`。欧文を正立させたいときは `text-orientation: upright`。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode>
- `[主張]` チラシ制作の実務記事は「行間は文字サイズの1.5〜1.8倍」「字間は詰めすぎない」を読みやすさの目安とする。出典: <https://www.irie-design.com/blog/chirashi-design-tips.html>
- `[推測]` 行間を 1.0 未満に詰めると行が接触し、読みやすさ（R）を犠牲にして密度（A）だけが上がる。**ドパガキとしては「安っぽい過剰」に落ちる典型**。

### 3.4 日本のチラシ・同人告知の慣習

- `[主張]` 日本のポスターは「余白を埋める」方向に発達した、という観察。文字が図像の一部として扱われ、情報量の多さが機能美になる。出典: <https://medium.com/@katyatinmey/typography-in-japanese-posters-ea1aeab53ad6>
- `[主張]` 国内チラシ制作の解説では、**蛍光色の多用・補色（赤と緑）の組み合わせ・文字と背景のコントラスト不足**が「安っぽく見える」失敗例として挙げられる。出典: <https://pamphlet-king.jp/column/2023/94900>
- `[主張]` 同人イベントの告知画像では、背景にイラストやパターンを敷き、文字に効果（縁取り・影）を付ける手法が定番。ただし重要パーツが埋もれるリスクが指摘される。出典: <https://magazine.genseki.me/entry/sp_kibino_20240313> / <https://www.adobe.com/jp/express/discover/ideas/poster/comiket>
- `[事実]` 文字の縁取りは Canva 等の一般ツールで「エフェクト → スプラウト（オフセット0）」として提供されている＝専門技能なしで過剰装飾が可能になった。出典: <https://www.canva.com/ja_jp/features/moji-fuchidori>
- **注意**: 上記はすべて**実務家の主張**であり、「日本のチラシは縁取りが多い」を定量した研究は見つかっていない。`[推測]` 慣習の実在は高いが、頻度・強度は未測定。

---

## 4. レイアウトの過剰

- `[事実]` `grid-template-areas` は名前付き領域で非対称なグリッドを宣言できる。行ごとに `span` 数が違っても成立する。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas>
- `[事実]` `z-index` は位置指定要素・flex/grid アイテムでないと効かない。`transform` 等がスタッキングコンテキストを作ると、子の `z-index` が親の文脈に閉じ込められる。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/z-index>
- `[事実]` `border-style: double` は 3px 以上の border-width で2重線になる。`box-shadow` はカンマ区切りで多層化でき、`0 0 0 Npx` の spread だけの影は「縁取り」として使える。出典: <https://developer.mozilla.org/en-US/docs/Web/CSS/border-style> / <https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow>
- `[事実]` SVG の `feTurbulence` はフラクタルノイズを生成する。`baseFrequency` と `numOctaves` で粒度を変える。インライン SVG を `background-image: url("data:image/svg+xml,...")` で敷くのが定番。出典: <https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence>
- `[推測]` ノイズテクスチャは「色数を増やさずに密度を上げる」数少ない手段。色数指標には引っかからないので、**A 濃度の取りこぼし**になりやすい。
- `[提案]` レイアウトの過剰は「崩しの数」ではなく **「直交しない要素の割合」** で測る。回転・斜めクリップ・重なりを持つ要素が全体の何割か。

---

## 5. 測り方の提案（`tools/measure/probe.js` に足せる指標）

既存の `values.hueApprox` は **CSS 宣言中の色**だけを数え、`contrast` は最近接の不透明背景しか見ない。以下はすべて**近似**であり、スクリーンショットの画素解析の代用にはならない。各指標は独立に `try/catch` で走らせ、`approximations` に限界を push する前提。

| # | key 案 | 式（要約） | 何の近似か | 主な限界 |
|---|---|---|---|---|
| M1 | `paintedHueClusters` | 24px グリッドで `elementFromPoint` → `backgroundColor` の色相を 30° ビンに集計、chroma>0.15 のみ、面積重み | 描画色のクラスタ数 | 画像・グラデ・影・擬似要素は取れない。最前面要素しか見ない |
| M2 | `maxHueDistanceDeg` | M1 のクラスタ重心間の OKLCH 色相円距離の最大値 | 配色の振れ幅 | クラスタ重心は面積重みで歪む |
| M3 | `decorLayerRatio` | 可視要素のうち `filter!=none` / `mixBlendMode!=normal` / `backdropFilter!=none` / `backgroundImage` に gradient を含む割合 | 装飾レイヤーの占有率 | 継承・擬似要素は別要素として数えられない |
| M4 | `shadowLayerMedian` | `boxShadow` をトップレベルカンマで分割した層数の中央値（`none` は 0） | 影の多層化 | `filter: drop-shadow` は別プロパティなので含まれない |
| M5 | `maxCharsPerLine` | ブロック要素ごとに `文字数 / round(高さ / line-height)` の最大値 | 1行の文字詰め込み | 折り返し・`<br>`・縦書きを考慮しない |
| M6 | `tiltedElementRatio` | `DOMMatrixReadOnly(transform)` の `atan2(b,a)` が 1° 超の要素の割合 | レイアウトの逸脱度 | 3D 回転・親の回転を二重計上する |
| M7 | `overlapCellRatio` | 8px セルに可視要素の矩形を塗り、2枚以上が重なるセル数 / 全面セル数 | 重なりの面積近似 | O(n²) を避けるため要素は面積上位150件に制限 |

### 実装スケッチ（M1/M4/M6）

```js
// M1: 描画色の色相クラスタ（近似）
function paintedHueClusters(step = 24) {
  const bins = new Map(), cellArea = step * step;
  for (let y = step / 2; y < innerHeight; y += step) {
    for (let x = step / 2; x < innerWidth; x += step) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const c = parseColor(getComputedStyle(el).backgroundColor);
      if (!c || c.a < 0.5) continue;
      const h = hueOf(c); if (h === null) continue;
      const max = Math.max(c.r, c.g, c.b) / 255, min = Math.min(c.r, c.g, c.b) / 255;
      const chroma = max === 0 ? 0 : (max - min) / max;
      if (chroma < 0.15) continue;           // 無彩色に近いものを除外
      const k = Math.round(h / 30) % 12;
      const b = bins.get(k) || { hue: k * 30, area: 0 };
      b.area += cellArea; bins.set(k, b);
    }
  }
  return [...bins.values()].sort((a, b) => b.area - a.area);
}
// 注意: elementFromPoint は「最前面の要素」を返す。背景画像・グラデ・SVG は取れない。
```

```js
// M4: box-shadow の層数（トップレベルカンマのみ分割）
function shadowLayers(el) {
  const v = getComputedStyle(el).boxShadow;
  if (!v || v === 'none') return 0;
  return v.split(/,(?![^(]*\))/).length;
}
```

```js
// M6: 傾き要素の割合
function tiltedRatio(els) {
  let tilted = 0, visible = 0;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    visible++;
    try {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      if (Math.abs(Math.atan2(m.b, m.a) * 180 / Math.PI) > 1) tilted++;
    } catch (e) { /* 個別失敗は無視 */ }
  }
  return visible ? tilted / visible : null;
}
```

`[提案]` 出力は既存の `values` に `visualDensity: { ... }` としてまとめ、`approximations` に「paintedHueClusters は最前面要素の背景色のみ」「maxCharsPerLine は折り返し未考慮」を必ず入れる。**単一の「ドパガキ度スコア」に合成しない**（重みに根拠が無いため）。A/D の採点は人が各指標を見て決める。

---

## 6. 反例 — 過剰なのに安っぽくない / 控えめなのにドパい

「安っぽさ」は [evals/rubric.md](../evals/rubric.md) の **R（反発）** の話で、A（濃度）・D（様式）とは別軸。以下はすべて `[推測]`（サイトの実測はしていない）。

### 6.1 過剰だが様式化されている例

- **ネオブルータリズム系のポートフォリオ**（例: <https://neobrutalism.dev/> のショーケース）。太い黒枠・硬いオフセット影・原色・角丸なしを**例外なく**適用する。
  - `[推測]` 差は「規則の数が少ないこと」。色は3〜4色、枠は2px、影はオフセット固定。過剰さは**同じ規則の反復**から出ている。規則が増えるほどチープになる。
- **博覧会・アート系の特設サイト**（例: <https://heartdemic.heralbony.com/>）。多色・模様・文字の重なりが多いが、パレットと書体が固定されている。
  - `[推測]` 差は「余白の規則性」。要素は重なるが、外周と見出しの位置は揃っている。

### 6.2 控えめなのにドパい例

- **Apple の製品ページ**（例: <https://www.apple.com/iphone/>）。色数は少なく余白は広い。しかし巨大タイポ・全画面スクロール連動・高コントラストが連続する。
  - `[推測]` A（濃度）は低いのに体感強度が高い。**色数指標では取りこぼす**典型。`style` は 1様式（ミニマル）なのに、`motion` と `tempo` が強度を作っている。
- **高級ブランドのフルスクリーン動画**。ほぼ単色・少要素だが、画面全体が常時動く。
  - `[推測]` 「静的な密度」と「動的な密度」を分けないと誤判定する。A の測り方に `document.getAnimations()` の面積重みを足す理由。

### 6.3 差は何か（仮説）

| 仮説 | 内容 | 検証方法（未実施） |
|---|---|---|
| H1 一貫性 | 様式の規則が少なく、例外がないほど安っぽくならない | 使用されている border-radius / shadow / palette の**ユニーク値の数**を数える |
| H2 余白の規則性 | 余白がランダムでなく倍数関係にあると密度が高くても整理されて見える | 要素間 gap の最大公約数的な値の出現率 |
| H3 色の制限 | 面積の大きい色が2〜3色に収まっている | 面積重み付き色相クラスタの上位3色で 80% を超えるか |
| H4 動きのリズム | 動きがランダムでなく拍がある | `animation-duration` の分布が数値に集中するか（例: すべて 200ms 系） |

`[推測]` H1〜H4 は「過剰さ」と独立に「安っぽさ」を説明する。つまり **A/D を上げても R を上げない方法が存在する**。これは rubric の「R を下げてもドパガキ度は下がらないことがある」と整合する。

---

## 7. 未確認リスト

- [ ] 「色数 → ドパガキ（テンポ・反復を含む強度）」を直接測った研究。今回の検索範囲では存在を確認できず。
- [ ] 60-30-10 の Web における効果検証。実務記事のみ。
- [ ] 日本のチラシ・同人告知における縁取り・蛍光色の**頻度**。定性的な実務記事のみで、コーパス計測は未実施。
- [ ] `mix-blend-mode` の各モードの描画コスト比較。ブラウザ実装依存で、公開ベンチマークを見つけられなかった。
- [ ] `backdrop-filter` の「半径20px以下」等の実務目安の根拠。環境依存の経験則とみられる。
- [ ] `-webkit-text-stroke` の将来の標準化動向。
- [ ] M1〜M7 の実装と検証（`probe.js` への追加は未実施。本メモは提案のみ）。
- [ ] 反例6.1/6.2 の実サイトでのスタイル宣言比較（`research/20261116-lp-css-measure.md` の手法で追試可能）。

---

## 8. 出典一覧

**仕様・実装（一次）**
1. Material Design 3 — Color roles: <https://m3.material.io/styles/color/roles>
2. Tailwind CSS v4 blog（OKLCH パレット）: <https://tailwindcss.com/blog/tailwindcss-v4>
3. MDN `mix-blend-mode` / `isolation`: <https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode> / <https://developer.mozilla.org/en-US/docs/Web/CSS/isolation>
4. MDN `backdrop-filter`: <https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter>
5. web.dev `backdrop-filter`: <https://web.dev/articles/backdrop-filter>
6. web.dev `filter` の性能表: <https://web.dev/articles/understanding-css>
7. MDN `@property`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@property>
8. MDN `oklch()`: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch>
9. MDN `color-mix()`: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix>
10. MDN `conic-gradient()`: <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient>
11. MDN `font-weight` / `font-variation-settings` / `-webkit-text-stroke`: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight> ほか
12. MDN `grid-template-areas` / `z-index` / `box-shadow` / `feTurbulence`: 各 MDN ページ

**研究**
13. Tuch et al. (2009), *Visual complexity of websites*: <https://www.sciencedirect.com/science/article/abs/pii/S107158190900055X>
14. Reinecke et al. (CHI 2013), *Predicting Website Aesthetics...*: <https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf>
15. Wilms & Oberfeld (2018), *Color and emotion*（Valdez & Mehrabian 1994 の追試・要約）: <https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf>
16. Miniukovich & De Angeli（二次引用）: <https://bia.unibz.it/esploro/fulltext/conferenceProceeding/Quantification-of-interface-visual-complexity/991006493492201241>

**実務・慣習（主張）**
17. チラシデザインの注意点（蛍光色・補色）: <https://pamphlet-king.jp/column/2023/94900>
18. チラシのフォント・行間目安: <https://www.irie-design.com/blog/chirashi-design-tips.html>
19. 同人イベント告知の情報整理: <https://magazine.genseki.me/entry/sp_kibino_20240313>
20. Japanese posters の文字組み観察: <https://medium.com/@katyatinmey/typography-in-japanese-posters-ea1aeab53ad6>
21. 60-30-10（インテリア実務）: <https://www.apartmenttherapy.com/interior-design-rule-60-30-10-explained-37504313>

---

*本メモは 2026-11-16 の Web 検索・公開ページ閲覧のみに基づく。ブラウザでの実測、スクリーンショット解析、`probe.js` の改修は行っていない。*
