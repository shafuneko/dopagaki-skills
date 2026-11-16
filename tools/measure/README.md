# tools/measure — 「ドパガキ」計測スニペット

観察の前に、印象ではなく**数値**を取るための道具。`probe.js` は1ファイルで完結し、外部依存も通信もない。

- `probe.js` — ブラウザの DevTools に貼って使う計測コード。Node では `--selftest` だけ動く（DOM 非依存部分の検証）。
- この README — 何を測るか、10軸との対応、貼り方、限界、`observations/` への転記書式。

計測結果は `observations/` の「2. 事実（測定）」に、**値＋測り方**のセットで転記する。数値だけを一人歩きさせない。

---

## 1. 使い方（ブラウザ）

1. 対象ページを開く（`chrome://` や `edge://`、PDF ビューア、ブラウザ拡張のページでは動かない）。
2. DevTools → **Sources → Snippets → New snippet** に `probe.js` の中身を貼り、Ctrl+Enter。
   - Console に直接貼ってもよい。Chrome が「paste を許可」と出たら画面の指示に従う。
   - Snippets 経由のほうが CSP（`unsafe-eval` 禁止）の影響を受けにくい。
3. 約3秒（DOM 変更の観測待ち）で JSON が console に出る。
4. コピーする場合:

```js
copy(JSON.stringify(await window.__dopagakiProbeResult, null, 2))
```

再実行は `await window.dopagakiProbe.collect({})`。オプション:

| オプション | 既定 | 意味 |
| --- | --- | --- |
| `layoutWindowMs` | `3000` | MutationObserver で DOM 変更を数える時間（ms） |
| `sample` | `0`（全要素） | 遷移時間の計測対象を等間隔に N 要素へ間引く（大きいページ用） |

例: `await window.dopagakiProbe.collect({ layoutWindowMs: 5000, sample: 500 })`

> 注意: 画面外・別タブでは `requestAnimationFrame` やアニメーションが止まる。**表示中・最前面**で実行する。
> 結果は `window.__dopagakiProbeResult` に Promise として残る。ページ遷移で消えるので、必要なら先にコピーする。

---

## 2. 出力の形

```json
{
  "measuredAt": "2026-11-16T06:00:00.000Z",
  "url": "https://example.com/",
  "viewport": { "width": 1280, "height": 800, "dpr": 2, "userAgent": "..." },
  "values": {
    "base": {}, "duration": {}, "animations": {}, "page": {}, "media": {},
    "scroll": {}, "rewardSignals": {}, "contrast": {}, "reducedMotion": {},
    "hueApprox": {}, "layoutMutations": {}
  },
  "approximations": ["近似の説明..."]
}
```

- 各項目は独立に `try/catch` している。壊れた項目は `{"error": "..."}` になり、他の項目は返る。
- `approximations` には**近似の理由**が入る。0件でも「全部正確」ではない。下の「限界」を必ず併読する。
- 時刻は UTC（ISO 8601）。日本時間で記録するなら +9 時間して転記する。

---

## 3. 何を測っているか

| `values` のキー | 内容 | 主なフィールド |
| --- | --- | --- |
| `base` | 基本情報 | `measuredAt`, `url`, `title`, `viewport` |
| `duration` | 全要素の `transition-duration` / `animation-duration`（computed style） | `transition.{count,medianMs,minMs,maxMs,elementsWithTransition}`, `animation.{...}`, `infiniteIterationElementsFromStyle` |
| `animations` | `document.getAnimations()` の件数と要素数比 | `count`, `running`, `infiniteIterations`, `elementCount`, `ratio` |
| `page` | 要素数・可視テキスト量・画面数 | `elementCount`, `visibleTextChars`, `innerTextChars`, `viewportVisibleTextChars`, `screens`, `charsPerScreen` |
| `media` | 自動再生メディアと AudioContext | `videos[]`, `audios[]`, `autoplayAttrCount`, `playingVideos`, `audioContextConstructor` |
| `scroll` | scroll-snap とスクロール量 | `scrollSnapElements`, `scrollSnapElementCount`, `scrollHeight`, `viewportHeight`, `scrollHeightRatio` |
| `rewardSignals` | 未読・カウントダウン・streak らしきテキスト | `unread[]`, `countdown[]`, `streak[]`（各最大8件） |
| `contrast` | 本文要素の WCAG コントラスト比 | `sampled`, `median`, `min`, `below45`, `worst[]` |
| `reducedMotion` | `prefers-reduced-motion` の現在値と、CSS 内の該当メディアクエリ | `matchesReduce`, `mediaRuleCount`, `neutralizeRuleCount`, `stylesheets`, `inaccessibleStylesheets` |
| `hueApprox` | CSS 宣言から集めた色の色相数（近似） | `uniqueColorCount`, `hueBinCount`, `hueBinsUsed`, `declarationsScanned`, `stylesheetRulesScanned` |
| `layoutMutations` | 3秒間の DOM 変更回数 | `supported`, `windowMs`, `totalMutations`, `childListMutations`, `attributeMutations`, `perSecond` |

補足:

- `duration` は **0ms を除外**し、`animation-name: none` の要素は数えない。擬似要素（`::before` 等）は対象外。
- `animation-iteration-count: infinite` は `duration.infiniteIterationElementsFromStyle`（computed style 由来）と `animations.infiniteIterations`（Web Animations API 由来）の2経路で見る。両者は一致しないことがある。
- `page.visibleTextChars` は `innerText` ベース。折り返し・スクロール位置は考慮しない。`viewportVisibleTextChars` は Range の矩形交差による近似。
- `media.playingVideos` は `<video>` の `paused === false` の数。`<audio>` は `paused` を含むが、自動再生の判定は属性と `paused` を併読する。
- `rewardSignals` は日本語・英語の正規表現一致（例: 「未読」「あと3日」「連続7日」）。**画像内の文字・アイコンだけのバッジは拾えない**。
- `contrast` は本文系セレクタ（`p, li, h1..h6, a, button, span, td, th, label, figcaption, blockquote`）から最大60要素を等間隔抽出。直接テキストを持つ要素のみ。
- `reducedMotion.neutralizeRuleCount` は `@media (prefers-reduced-motion)` 内で `transition/animation: none` または `*-duration: 0s` を宣言しているルール数。**「打ち消されている遷移があるか」の近似**で、JS 側の分岐は見ていない。
- `hueApprox` は CSS の `color` / `background-color` / `border-color` / `outline-color` / `fill` / `stroke` / `background-image` 宣言から色を集め、30°ごとのビンに入れたもの。**描画された画素ではない**。

---

## 4. 10軸との対応（docs/02-taxonomy.md）

10軸の定義・測り方は [docs/02-taxonomy.md](../../docs/02-taxonomy.md) が正。ここは「probe.js のどの値が、どの軸の議論に使えるか」の対応表であり、**値そのものが軸の判定ではない**。

| 軸 | 主に使える値 | 読み方の例（仮説として書く） |
| --- | --- | --- |
| tempo | `duration.*.medianMs`, `animations.count`, `layoutMutations.perSecond` | 遷移の中央値が短い＝テンポが速い、とは限らない。間隔の短さは `layoutMutations` と併読 |
| intensity | `contrast.median`, `hueApprox.hueBinCount`, `duration.transition.maxMs` | 色数・コントラストの強さ。刺激の「強度」の代理指標 |
| motion | `animations.count`, `animations.ratio`, `layoutMutations.totalMutations`, `reducedMotion.matchesReduce` | 動きの量と止められるか |
| reward | `rewardSignals.unread`, `rewardSignals.streak`, `animations.infiniteIterations` | バッジ・連続記録・点滅の存在。報酬設計の徴候 |
| audio | `media.autoplayAttrCount`, `media.playingVideos`, `media.audioContextConstructor` | 音の自動再生と、音を扱う素地の有無 |
| copy | `page.visibleTextChars`, `page.charsPerScreen`, `rewardSignals.*` | 文字量と1画面あたりの情報量。文言の型は別途読む |
| flow | `scroll.scrollHeightRatio`, `scroll.scrollSnapElementCount`, `page.screens` | 縦の長さ・スナップ・画面数。導線の長さの代理 |
| style | `hueApprox.hueBinCount`, `contrast.median`, `duration.*` | 色相の幅・コントラスト・動きの質感 |
| restraint | `reducedMotion.neutralizeRuleCount`, `duration.*.maxMs`, `contrast.below45`, `media.autoplayAttrCount` | 動き・音・低コントラストをどこまで抑えているか |
| backlash | `reducedMotion.matchesReduce`, `layoutMutations.perSecond`, `animations.infiniteIterations`, `media.autoplayAttrCount` | 動きすぎ・自動再生・止められなさ。**「後悔」そのものは測れない**ので徴候のみ |

> 軸の判定に使うときは、必ず「この値は何の代理指標か」を1行添える。値から因果を飛ばさない（AGENTS.md の「事実/測定/印象/仮説を混ぜない」）。

---

## 5. 限界（近似でしか測れないもの・測れないもの）

### 近似でしか測れないもの

- **遷移時間**: computed style の `transition-duration` / `animation-duration` のみ。擬似要素、`@keyframes` 内の個別指定、JS（Web Animations API / `style` 書き換え）によるアニメは含まれない。`getAnimations()` の件数も、一時停止中・終了済みの扱いでぶれる。
- **文字数**: `innerText` は CSS 非表示を除外するが、折り返し・スクロール位置・`text-overflow` を考慮しない。`viewportVisibleTextChars` は Range 交差の近似で、行の途中も1文字単位で数える。
- **コントラスト**: 最も近い**非透過**の背景色を親に遡って採用。半透明は白と合成。グラデーション、背景画像、影、`mix-blend-mode`、擬似要素は未考慮。`below45` は「4.5:1 未満の要素数」で、WCAG の合否判定そのものではない（大きい文字は 3:1）。
- **色相数**: CSS 宣言中の色だけ。canvas / SVG 属性 / 画像 / グラデーションの中間色は含まない。「1画面内」ではなく**ページ全体の宣言**である。
- **reduced-motion の打ち消し**: CSS のメディアクエリだけを見る。JS の `matchMedia` 分岐や、OS 設定に応じた出し分けは検出できない。cross-origin の stylesheet は `cssRules` を読めず `inaccessibleStylesheets` に計上される。
- **レイアウト変化**: MutationObserver は DOM の変更（childList / style・class・hidden 属性）を数える。**レイアウト再計算の回数ではない**。CSS アニメーションだけでは mutation は出ない。
- **自動再生**: `autoplay` 属性と `paused` の現在値。ユーザー操作で一時停止した後か、音声トラックの有無、`AudioContext` が生成済みかは分からない。

### 測れないもの

- 意味・文脈・ユーザーの感情（「ドパガキ」感そのもの）。
- 画像・動画・canvas の中の文字やバッジ。
- iframe 内部（同一オリジンでも `querySelectorAll` は届かない）。
- Shadow DOM 内部（open でも `*` セレクタでは入れ子に届かない。`shadowRoot` を辿る実装はしていない）。
- スクロール位置による出し分け（IntersectionObserver 的な「見えた瞬間」）。
- 音の実出力（音量・BGM の有無）。
- 通信量・CPU 負荷・FPS。

---

## 6. `observations/` への転記書式

`observations/_TEMPLATE.md` の「2. 事実（測定）」に、**指標 / 値 / 測り方**の3列で書く。生 JSON は本文に貼らず、必要なら `observations/raw/` に置いてパスを書く（新規ディレクトリ。まだ無ければ作ってよい）。

```markdown
### 2. 事実（測定）

計測: `tools/measure/probe.js`（2026-11-16 15:00 JST / 1280×800 / dpr 2 / Chrome 142）
対象: https://example.com/ のトップページ全体（スクロール前）

| 指標 | 値 | 測り方 |
| --- | --- | --- |
| 遷移時間 中央値 | 220 ms | `duration.transition.medianMs`。全 812 要素、computed style、0ms 除外 |
| 遷移時間 最大 | 1200 ms | `duration.transition.maxMs`。同上 |
| アニメーション件数 | 14 件（要素比 1.7%） | `animations.count` / `animations.ratio`。`getAnimations()` |
| 無限ループ指定の要素 | 3 要素 | `duration.infiniteIterationElementsFromStyle` |
| 可視テキスト文字数 | 4,210 字 | `page.visibleTextChars`。`innerText` の空白除去 |
| 1画面あたり文字数 | 780 字 | `page.charsPerScreen`。`visibleTextChars / screens` |
| スクロール高さ比 | 5.4 画面 | `scroll.scrollHeightRatio`。`scrollHeight / innerHeight` |
| コントラスト中央値 | 7.1 : 1 | `contrast.median`。本文系 48 要素、最近接の非透過背景 |
| 4.5:1 未満 | 6 要素 | `contrast.below45`。同上 |
| reduced-motion 該当 | true / 中和ルール 2 件 | `reducedMotion.matchesReduce` / `neutralizeRuleCount`。CSS のみ |
| 3秒間の DOM 変更 | 42 回（14.0 回/秒） | `layoutMutations.perSecond`。MutationObserver |
| 色相ビン数 | 8 / 12 | `hueApprox.hueBinCount`。CSS 宣言ベースの**近似** |
```

書き方の注意:

- 単位を必ず付ける（ms / 字 / 画面 / : 1 / 回/秒）。
- 「測り方」には **何を・どの範囲で・何回** を書く。`probe.js` のフィールド名を併記すると再現できる。
- 近似値には「近似」と書く。`approximations` の内容を1行に要約して添える。
- 測定できなかった項目は「未測定（理由）」と書く。空欄にしない。
- 数値から言えるのは「事実」まで。意味づけは「5. 仮説」に分ける。

---

## 7. selftest

DOM に依存しない部分（時刻文字列のパース、色パース、WCAG 計算、色相、テキストパターン、中央値）を検証する。

```bash
node tools/measure/probe.js --selftest
# => selftest: 40/40 passed
```

ブラウザ実測はこのテストでは代替できない。実ページでの実行結果（`values` の形）は、初回に必ず目視で確認する。
