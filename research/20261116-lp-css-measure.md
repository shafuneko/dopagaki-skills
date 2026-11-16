# 派手な日本のLP・キャンペーンサイトのCSS数値比較（宣言ベース）

- 作成: 2026-11-16 / 計測担当（`research/` の調査メモ。規則ではない）
- 取得: 2026-11-16 15:2x〜15:3x JST、Node.js 24 の `fetch`（UA は Chrome 131 相当）で HTML と CSS を取得
- **重要**: 以下の数値は「取得できたCSSテキストを正規表現で数えた宣言の集計」である。**実ブラウザで実行した結果ではない**。画面の見た目・実際に動いているアニメ・体感の派手さとは別物。この前提を無視して「このサイトは300msで動く」と読まないこと。

## 1. 方法と限界

### 1.1 候補の集め方

`web_search` と、国内Webデザインギャラリー（SANKOU! の特設・キャンペーンカテゴリ、me ki ki ki）の掲載URLから、「動きが派手」「配色がはっきり派手」系のタグが付いた特設／キャンペーン／記念サイトを拾った。**「派手」の選定は主観**であり、客観指標ではない。SEO記事の「派手なLP事例」は制作会社の宣伝ページが多く、実サイトのURLとCSSが取れないものが混ざったため、ギャラリー掲載＝実在URLが確認できるものを優先した。

### 1.2 取得と数え方

1. HTML を取得し、`<style>` の中身と `<link rel="stylesheet">` の CSS（最大12ファイル、1ファイル4MB未満）を取得して連結。
2. 連結したテキストに対して、次の正規表現で**出現回数**を数える。

| 指標 | 数え方 |
| --- | --- |
| duration（明示） | `transition-duration:` / `animation-duration:` の値だけを ms に換算 |
| duration（全体） | `transition:` / `animation:` ショートハンドを含む宣言の時間トークン（`0.3s` `300ms`）を ms に換算 |
| `@keyframes` | `@keyframes` 名のユニーク数（`-webkit-` 等の接頭辞で同名のものは1つ） |
| infinite | `animation-iteration-count: ... infinite` の宣言数と、`animation:` ショートハンド内の `infinite` を別々に |
| `!important` | 出現回数 |
| filter / backdrop-filter | プロパティ宣言の出現回数（`filter` は `backdrop-filter` を除く） |
| `linear-gradient(` | 出現回数 |
| `font-family:` | 出現回数（`@font-face` 内も含む） |
| `<img>` / `<video>` | HTML 文字列内のタグ数・有無（JS 生成分は含まない） |

中央値は「昇順に並べたときの中央の値」（偶数個なら下側）。0ms の宣言も除外していない。

### 1.3 限界（数字を読む前に必ず）

- **JS/CSS-in-JS で後から注入されるCSSは取れない**。`nami-nami.jp` は HTML 13KB・CSS 236B しか返らず、実質0件になった。これは「演出が無い」ではなく「この方法では測れない」。
- **CSS の宣言と実行時のアニメは違う**。`transition` は発火しないと動かないし、`@keyframes` は使われないことがある。JS（GSAP・WebGL・Canvas）駆動の演出は duration を持たない。
- **重複を含む**。メディアクエリごとの再宣言、ベンダープレフィックス違い、リセットCSSの `font-family` も数える。`font-family` の数百という数字は「書体の種類」ではない。
- 外部CSSは12ファイルまで。取得失敗（403・タイムアウト）は `cssFails` として捨てた。
- 配信CSSは CDN・キャッシュ・ABテストで変わる。**この時刻のこの応答**の記録である。
- HTML の `<img>` 数は、JS で後から差し込むサイトでは実際の枚数より小さく出る。
- 「派手」の選定、および「派手＝数値が大きい」という前提そのものが未検証。

### 1.4 今回の取得ログ（2026-11-16）

| # | 候補 | 結果 |
| --- | --- | --- |
| 1 | ナミナミダンボール沼（大光紙工） | 200・CSS 236B（実質空） |
| 2 | AHKAH 2026 Holiday | 200・CSS 862KB |
| 3 | Morisawa Fonts 2026 | 200・CSS 606KB |
| 4 | HERALBONY Heartdemic | 200・CSS 311KB |
| 5 | LIGHT THE WAY 10th | 200・CSS 405KB |
| 6 | 元素化思考（CREATIVE CLASS） | 200・CSS 160KB |
| 7 | iDID Day 2026 | 200・CSS 113KB |
| 8 | 眼鏡市場 子どもの目 | 200・CSS 287KB |
| 9 | サクマいちごみるく55周年 | 200・HTML 2.6KB・CSS 366KB |
| 10 | DAIKEN 80周年 | 404（URL 推測が外れ） |

200 が返っても中身が空なら測れない（#1）。404 は数値を埋めず「失敗」として残す（#10）。

## 2. 結果の表

10候補を試し、9件でHTMLを取得、1件は404。うち `nami-nami.jp` は CSS が実質空のため「測定不能」として扱う。

### 2.1 duration と基本量

| サイト | URL | HTML | CSS | CSSファイル | duration全体 n | 中央値 | 最小 | 最大 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ナミナミダンボール沼（大光紙工） | https://nami-nami.jp | 13.0KB | 0.2KB | 1 | 2 | 300ms | 300ms | 600ms |
| AHKAH 2026 Holiday | https://www.ahkah.jp/ext/2026Holiday_mymood_mylove/index.html | 134.5KB | 862KB | 4 | 116 | 300ms | 0ms | 3400ms |
| Morisawa Fonts 2026 | https://new.morisawafonts.com/2026/ | 175.0KB | 606KB | 2 | 70 | 400ms | 0ms | 1200ms |
| HERALBONY Heartdemic | https://heartdemic.heralbony.com/ | 1682.4KB | 311KB | 3 | 16 | 300ms | 1ms | 400ms |
| LIGHT THE WAY 10th | https://light-the-way.jp/10th-anniversary/ | 210.1KB | 405KB | 4 | 866 | 400ms | 0ms | 27500ms |
| 元素化思考（CREATIVE CLASS） | https://creative-class.site/kodama-001-archive/ | 45.8KB | 160KB | 4 | 31 | 500ms | 160ms | 48000ms |
| iDID Day 2026 | https://day2026.idid.team/ | 141.0KB | 113KB | 2 | 79 | 500ms | 100ms | 48000ms |
| 眼鏡市場 子どもの目 | https://www.meganeichiba.jp/kids-eyecare/ | 64.3KB | 287KB | 4 | 33 | 300ms | 1ms | 20000ms |
| サクマいちごみるく55周年 | https://www.sakumaseika.com/ichigomilk1970_2025/ | 2.6KB | 366KB | 2 | 17 | 75ms | 75ms | 500ms |
| DAIKEN 80周年（候補） | https://www.daiken.jp/80th/ | — | — | — | — | — | — | — |

- `duration全体` はショートハンド込み。**明示の `transition-duration` / `animation-duration` だけだと、9サイト中4サイトが0件**（nami-nami・light-the-way・creative-class・sakuma は明示0）。実サイトはショートハンドで書くのが普通で、「duration プロパティを数える」だけでは実態を捉えない。
- 明示のみの中央値: AHKAH 2件（0.01s＝10ms）、モリサワ 2件（1000ms）、HERALBONY 16件（300ms）、iDID 1件（800ms）、眼鏡市場 6件（1ms）、サクマ 2件（75ms）。
- DAIKEN 80周年は URL 推測が外れて **HTTP 404（失敗）**。URL を確認できなかったので数値は無い。

### 2.2 演出・装飾のカウント

| サイト | @keyframes | infinite（明示／SH） | !important | filter | backdrop | linear-gradient | font-family | img | video |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| ナミナミダンボール沼 | 0 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | 0 | なし |
| AHKAH 2026 Holiday | 3 | 0 / 3 | 384 | 5 | 14 | 34 | 488 | 119 | あり |
| Morisawa Fonts 2026 | 15 | 0 / 8 | 4 | 1 | 2 | 8 | 490 | 109 | なし |
| HERALBONY Heartdemic | 0 | 0 / 0 | 4 | 13 | 2 | 5 | 308 | 203 | あり |
| LIGHT THE WAY 10th | 25 | 0 / 122 | 32 | 17 | 0 | 20 | 8 | 347 | あり |
| 元素化思考 | 4 | 0 / 1 | 1 | 3 | 8 | 12 | 150 | 19 | あり |
| iDID Day 2026 | 13 | 0 / 4 | 16 | 2 | 0 | 0 | 41 | 283 | なし |
| 眼鏡市場 子どもの目 | 25 | 5 / 13 | 16 | 0 | 0 | 0 | 258 | 119 | なし |
| サクマいちごみるく55周年 | 3 | 0 / 0 | 563 | 0 | 0 | 0 | 367 | 1 | なし |

- `infinite（明示）` が付いたのは眼鏡市場のみ（5件）。他はショートハンド内の `infinite` で、LIGHT THE WAY の122件が突出。
- `!important` はサクマ563・AHKAH384と、2サイトだけ極端。**派手さの指標ではなく、制作体制・CSS設計の癖**が出ている可能性が高い（仮説）。
- `backdrop-filter` は6サイトで0。すりガラス表現は「派手なサイトの必須要素」ではない。
- `linear-gradient` も3サイトで0。グラデーション無しでも派手さは成立している（少なくとも本サンプルでは）。

### 2.3 取得できなかった項目・サイト

| 対象 | 結果 | 理由 |
| --- | --- | --- |
| DAIKEN 80周年 | 失敗 | `https://www.daiken.jp/80th/` は 404。正しいURL未確認 |
| ナミナミダンボール沼 | 測定不能 | HTML 13KB・CSS 236B。JS製アプリのシェルのみ取得 |
| サクマ55周年 | 一部のみ | HTML 2.6KB・`<img>` 1件。画像はJS生成と推定（未確認） |
| 全サイト共通 | 未取得 | Shadow DOM 内CSS、iframe 内、JS が実行時に差し込むCSS、`<canvas>`/WebGL の描画 |

### 2.4 サイトごとの短い所見（数値の読み方の例）

- ナミナミダンボール沼: CSS 236B。JS製アプリのシェルだけが返った。「演出が無い」ではなく「この方法では測れない」の代表例。
- AHKAH: CSS 862KB は今回の最大。`!important` 384 は同梱ライブラリ由来の可能性がある（未確認）。
- モリサワ: `@keyframes` 15・`font-family` 490。書体サイトらしくフォント宣言が多い。
- HERALBONY: `@keyframes` 0 だが `<video>` あり・`<img>` 203。CSS アニメ以外で見せる型。
- LIGHT THE WAY: duration 866・infinite 122・`<img>` 347。数値上は最も「動く」サイト。
- 元素化思考: `backdrop-filter` 8・gradient 12 で質感寄り、`<img>` 19 と素材は少ない。
- iDID Day: 最長 48000ms・`<img>` 283。長いループと大量画像の組み合わせ。
- 眼鏡市場: 明示の `infinite` 5件は今回で唯一。`@keyframes` 25。
- サクマ: `!important` 563 が最大、`<img>` 1。HTML が薄く JS 依存。

## 3. 気づいたこと

### 3.1 数値から言えること

- **duration の中央値は 300〜500ms に集まる**（9サイト中7サイトが 300, 300, 300, 400, 400, 500, 500ms）。75ms のサクマ、測定不能のナミナミを除けば、この帯域が「派手に見せるサイト」の標準的な刻みになっている。
- **外れ値は 1サイト内で2桁違う**。LIGHT THE WAY は 0〜27500ms、creative-class と iDID は 0〜48000ms。中央値だけ見ると「普通」だが、長い側に 20〜48秒の宣言が混ざる。スクロール連動・ループ演出用の長い keyframes と推測される（**未確認**）。
- **`@keyframes` の数と duration の数は連動しない**。LIGHT THE WAY は keyframes 25・duration 866、AHKAH は keyframes 3・duration 116、HERALBONY は keyframes 0・duration 16。CSS アニメの量はサイトごとに設計が全く違う。
- **`@keyframes` 0 のサイトが2つある**（HERALBONY、ナミナミ）。HERALBONY は `<video>` あり・img 203枚で、動画と JS で見せている可能性がある（仮説）。
- **infinite はショートハンドで書かれる**。明示プロパティは1サイト5件のみ、ショートハンドは最大122件。仕様書的な書き方と実装の書き方は一致しない。
- **`!important` の多さは演出と無関係**。563件のサクマは duration 17件・keyframes 3件で、CSS アニメはむしろ少ない。逆に LIGHT THE WAY は 32件で duration 866件。`!important` は「派手さ」ではなく「上書きの多さ」の指標。
- **`filter` / `backdrop-filter` / `linear-gradient` は全サイト共通の装備ではない**。backdrop は AHKAH 14・creative-class 8 のみ、gradient は AHKAH 34・LIGHT THE WAY 20・creative-class 12 で、他は0〜8。

### 3.2 数値から言えないこと

- **見た目・体感の派手さ**。CSS 宣言が多くても、発火しなければ画面は静か。逆に宣言が少なくても JS で激しく動く。
- **実行時のアニメ**。`transition` は発火条件、`@keyframes` は使用箇所が別。`getAnimations()` で実行時に取るのが本来の測り方（[motion-metrics.md](20261116-motion-metrics.md) の手順）。
- **品質・使いやすさ・アクセシビリティ**。duration の長さも infinite の数も、良し悪しを直接示さない。
- **サイトの新旧・制作会社の傾向**。サンプル9件、1回取得では言えない。
- **「派手」という選定の妥当性**。ギャラリーのタグ付けは主観で、私の選定も主観。母集団の定義が無い。

## 4. 未確認

1. 実ブラウザでの `getAnimations()` 実行（本メモは静的CSSのみ。実行時アニメは未計測）。
2. CSS-in-JS・`<style>` の動的注入（ナミナミ・サクマで過小に出ている可能性）。
3. DAIKEN 80周年の正しいURL、および 404 以外の候補（京都競馬場100周年など）の取得。
4. `<img>` 数と `<video>` 有無の JS 実行後の実数。
5. 同一サイトの再取得での再現性（CDN・ABテスト・キャッシュ）。
6. 「派手」の選定基準の妥当性と、サンプル数の不足（n=9、うち実質8）。
7. `font-family` 数百件の内訳（リセットCSS・メディアクエリ重複の割合）。
