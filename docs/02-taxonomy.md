# 観察軸 — 何を見て、どう測るか

素材を見るときの切り口。**軸は固定ではない**（増減してよい。変えたら README 索引・ADR・chat.txt の3点セット）。

- **徴候（sign）**: 観察できる最小単位。観察ファイル内で `S-1` のように番号を振る。
- 1素材ですべての軸を見ない。まず2〜3軸を仮置きし、徴候が出た軸だけ記録する。空欄も情報。
- 数値には必ず測り方（何を・どの範囲で・何回）を添える。参照値は [付録](#付録-実装数値の参照) に集約。

## 軸の一覧

| コード | 軸 | 一言 |
|---|---|---|
| `tempo` | テンポ | 変化の間隔と速さ |
| `intensity` | 刺激量・密度 | 色・情報・装飾の多さ |
| `motion` | 動き | 何がどれだけ動くか |
| `reward` | 報酬・予測不能性 | 何がいつ返ってくるか |
| `audio` | 音 | 音の有無と同期 |
| `copy` | 言葉 | 文言・記号・リズム |
| `flow` | 構造・導線 | 画面の流れと停止点 |
| `style` | 質感・様式 | 見た目の系統 |
| `restraint` | 抑制・間 | 静けさ・余白・減速 |
| `backlash` | 反発・リスク | 不快・酔い・違反 |

---

## A. `tempo` — テンポ

**見るもの**: 変化の間隔、遷移時間、待ち時間、カット割り。

**徴候の例**
- テロップや画像が 0.5〜2秒間隔で入れ替わる
- ホバー/クリックの応答が 100ms 台で返る
- 画面遷移に待ちがなく、ローディングが見えない
- 自動カルーセルの間隔が短い／速い

**測り方**
- `getComputedStyle(el).transitionDuration` / `animationDuration` を全要素（または無作為30要素）から集め、**ms の中央値**を出す
- 5秒間の変化回数（スクリーン録画のフレーム差分、または `MutationObserver` の mutation 数）
- 動画: カット検出（PySceneDetect 等）で **ASL（平均ショット長）** とショット長の中央値
- 入力→画面変化の遅延（録画のフレーム単位、または Performance API）

**逆側の徴候**: 3秒以上のホールド、400ms 超のゆっくりしたイージング、意図的な待ち。

**注意**: 「速さ」と「変化の多さ」は別。速いが変化が少ない（滑らかなスクロール）は tempo 高・intensity 低になりうる。

---

## B. `intensity` — 刺激量・密度

**見るもの**: 色数、彩度、コントラスト、文字量、装飾の密度、同時に動く要素数。

**徴候の例**
- 1画面に原色が複数、彩度が高い
- 1画面に複数のメッセージ・バッジ・吹き出し
- 影・枠・ステッカー・グラデが重なる
- 同時に多数の要素がアニメーションしている

**測り方**
- スクリーンショットの色相数（k-means 等でクラスタ数、またはユニーク色相のビン数）、平均彩度（HSV の S）
- 1画面あたりの文字数・要素数（DOM の要素数、可視テキストの文字数）
- `document.getAnimations().length / document.querySelectorAll('*').length`（アニメ要素率）
- コントラスト比（WCAG 計算式）— 高いほど刺激、低いほど読みにくい

**逆側の徴候**: 単色・低彩度、余白が広い、要素数が少ない。

---

## C. `motion` — 動き

**見るもの**: 何が、どれだけ、いつ動くか。常時か操作起点か。

**徴候の例**
- 背景が常に動く（パララックス、流体、パーティクル）
- 要素がバウンス・シェイク・回転する
- 動画・GIF が自動再生される
- スクロールに連動して要素が飛ぶ

**測り方**
- 移動量/秒（要素の `getBoundingClientRect` の差分を rAF でサンプリング）
- `animation-iteration-count: infinite` の要素数、ループ周期
- 視差の層数
- `prefers-reduced-motion` への対応有無（対応しているか自体が徴候）

**逆側の徴候**: 静止画中心、ホバー時のみ微小な変化。

---

## D. `reward` — 報酬・予測不能性

**見るもの**: 何が、いつ、どれくらいの確率で返ってくるか。予測できるか。

**徴候の例**
- スクロールするたびに新しい情報が返る（無限フィード）
- ガチャ・ルーレット・ランダム演出
- 連続日数（streak）・バッジ・未読数
- 通知の要求、効果音つきの達成演出
- 「次は何が出るか」が読めない

**測り方**
- 報酬イベントの数/分（画面変化のうち「新しい情報・称賛・報酬」に分類できるもの）
- ランダム分岐の数（`Math.random()` の出現箇所、重み付き抽選の有無）
- streak / badge / 未読バッジの有無
- 通知許可要求の有無とタイミング

**参照**: 可変比率強化（variable ratio）はギャンブル・SNSフィード・ルートボックスの共通構造。

**逆側の徴候**: 進捗が線形・予測可能。報酬が操作の直後に固定的に返る。

---

## E. `audio` — 音

**見るもの**: 音の有無、始まり方、動きとの同期。

**徴候の例**
- BGM が自動再生される／ユーザー操作起点で鳴る
- クリック・ホバー・スクロールに効果音が付く
- 音と映像のキューが同期している

**測り方**
- 音イベント数/分、`<audio autoplay>` の有無、`AudioContext.state`
- 自動再生がブラウザポリシーで許可されているか（ミュート自動再生は可、音付きは操作履歴等が必要）
- ミュート・停止の手段の有無

**注意**: 音は環境依存（イヤホン・公共空間）。作品の評価では「ミュート時にも成立するか」を別途見る。

---

## F. `copy` — 言葉

**見るもの**: 文の長さ、記号・絵文字、語調、情報の順序。

**徴候の例**
- 1文が短い、体言止め、結論が先頭
- 絵文字・記号（`!` `?` `→` `＼`）が多い
- 煽り・呼びかけ（「今すぐ」「あなたは」「知らないと損」）
- 数字・ランキング・断定

**測り方**
- 1文あたり文字数の中央値、感嘆符/疑問符の数、絵文字数
- 結論の位置（見出しの何割が結論か）
- 煽り語彙リストの出現回数（語彙リストは `patterns/` 側で育てる）

**逆側の徴候**: 長文、前置き、丁寧語、余白のある言い回し。

---

## G. `flow` — 構造・導線

**見るもの**: 画面の流れ、停止点、分岐、戻りやすさ。

**徴候の例**
- 無限スクロールで終わりが見えない
- 1スワイプ=1画面のスナップ
- モーダル・ポップアップが連続する
- 分岐が多く、どこにでも行ける
- 戻る操作が分かりにくい／戻ると状態が消える

**測り方**
- スクロールの停止点（自然な区切り）の数、`scroll-snap-type` の有無
- 画面あたりの選択肢（リンク・ボタン）の数
- モーダル/インタースティシャルの数、閉じる手段の有無
- 戻る操作のコスト（クリック数、状態保持の有無）

---

## H. `style` — 質感・様式

**見るもの**: 見た目の系統。素材の「好き嫌い」に引っ張られやすいので、名前で分類する。

**徴候の例**
- ネオブルータリズム（極太の黒枠、硬い影、原色、角丸なし）
- グリッチ（RGBずれ、`clip-path` の段階変化）
- グラスモーフィズム（`backdrop-filter: blur`）
- コラージュ・ステッカー（傾き、ドロップシャドウ、切り抜き）
- 3D・レトロ・ドット絵・ビットマップフォント

**測り方**
- 枠線の太さ、影のぼかし（0 なら硬い）、角丸の有無、フォント種数
- `mix-blend-mode` / `backdrop-filter` / `conic-gradient` の使用数
- 画像の加工（彩度・コントラスト・ノイズ）の強さ

---

## I. `restraint` — 抑制・間

**見るもの**: 静けさ、余白、減速、省略。

**徴候の例**
- 大きな余白、少ない要素
- 無音の区間、フェードの長い遷移
- 1画面1メッセージで、あえて動かさない
- 情報を削って余韻を残す

**測り方**
- 余白率（画面のうち背景のみの面積比）
- 無音時間、静止ホールドの秒数
- フェード/減速の duration

**なぜ独立した軸か**: 抑制は刺激の**対比**として効く（仮説 H6）。単体では「静か」だが、直前の刺激を強める。

---

## J. `backlash` — 反発・リスク

**見るもの**: 刺激が強すぎて不快・危険になっている徴候。

**徴候の例**
- 画面の移動が多く、酔う
- 点滅が速い、閃光がある
- 文字が読みにくい（コントラスト不足、動きすぎ）
- 止められない（自動再生・自動更新・閉じられないモーダル）
- 依存を煽る（通知の強制、無限スクロールのみ）

**測り方**
- 移動量/秒、点滅 Hz（1秒あたりの輝度変化）
- コントラスト比（本文 4.5:1 未満は要注意）
- 停止・一時停止・非表示の手段の有無（WCAG 2.2.2）、閃光（2.3.1）、自動音声（1.4.2）
- `prefers-reduced-motion` の尊重

**扱い**: 反発は「失敗」ではなく軸。強度を上げた結果どこで反発が出るかを記録する（仮説 H5）。

---

## 付録: 実装・数値の参照

観察の基準に使える外部の参照値。**出典なき数値を自前の規則に使わない**ための台帳。

| 項目 | 参照値 | 出典 |
|---|---|---|
| 応答時間の3つの限界 | 0.1s=即時 / 1s=思考が途切れない / 10s=注意の限界 | [NN/g](https://www.nngroup.com/articles/response-times-3-important-limits) |
| RAIL | 入力応答 100ms、アニメ 1フレーム 16ms | [web.dev](https://web.dev/articles/rail) |
| マイクロインタラクションの duration | 単純 100–150ms、モーダル 200–300ms、500ms 超は鈍い | [NN/g](https://www.nngroup.com/articles/animation-duration) |
| Material 3 の duration / easing | short/medium 50–400ms、long 450–600ms、extra-long 700–1000ms / standard `cubic-bezier(0.2,0,0,1)` | [M3](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) |
| カット間隔の実例 | 『ボーン・スプレマシー』ASL 2.4s、戦闘シーケンス 0.58s | [DiVA](https://kth.diva-portal.org/smash/get/diva2:1704346/FULLTEXT01.pdf) |
| 可変報酬 | variable ratio（反応回数がランダムで強化） | [UI-Patterns](https://ui-patterns.com/patterns/Variable-rewards) |
| 通知のダークパターン | デフォルトON＋オプトアウト困難で Roach Motel 型 | [Designlab](https://designlab.com/blog/are-notifications-a-dark-pattern-ux-ui) |
| 無限スクロールの弊害 | 停止点が消え doomscrolling を悪化させる | [Wikipedia](https://en.wikipedia.org/wiki/Doomscrolling) |
| Scroll Snap | `scroll-snap-type: y mandatory` + `scroll-snap-align: start` + `scroll-snap-stop: always` | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts) |
| 音付き自動再生 | ミュート自動再生は可。音付きは操作履歴・MEI・PWA インストール等が必要 | [Chrome](https://developer.chrome.com/blog/autoplay) |
| WCAG 2.2.2 | 5秒超の移動・点滅・自動更新に停止/一時停止/非表示の手段 | [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) |
| WCAG 2.3.1 | 1秒に3回超の閃光の禁止 | [W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) |
| WCAG 2.3.3 (AAA) | 操作起点のアニメを無効化可能に（`prefers-reduced-motion`） | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) |
| 前庭障害 | パララックスでめまい・吐き気。対策は「視差効果を減らす」 | [WebAxe](https://www.webaxe.org/vestibular-issues-parallax-design) |
| 点滅の閾値（面積） | 同時点滅 341×256 = 87,296 CSS px（10度視野の25%）以下、または輝度差10%未満 | [W3C 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) |
| 自動アニメ停止の3条件 | 自動開始・5秒超・他の内容と並置（5秒は生理学値ではなく設計判断） | [W3C 2.2.2 Intent](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) |
| テロップの提示速度 | Netflix 成人 20字/秒・子ども 17字/秒、42字/行・最大2行 | [Netflix TTSG](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements) |
| ラウドネス | −23 LUFS / −1 dBTP（EBU R128）。配信は Spotify/YouTube −14 LUFS 前後が目安 | [EBU R128](https://tech.ebu.ch/docs/r/r128.pdf) |
| 画面振動（ゲーム） | トラウマ値 0〜1・毎秒約1.0減衰・振幅は二乗比例、数Hz〜10Hz、0.15〜0.4秒 | [game-feel 調査](../research/20261116-game-feel.md) |
| ヒットストップ | 軽35ms / 中55ms / 重70ms / クリティカル90ms、120ms超はラグと読まれる | [game-feel 調査](../research/20261116-game-feel.md) |
| LP の transition 実測（宣言ベース） | 9サイトの中央値 300〜500ms（明示プロパティのみだと4サイトが0件） | [lp-css-measure](../research/20261116-lp-css-measure.md) |

**注意**: 上の LP 実測は 2026-11-16 時点の CSS 宣言の集計（実ブラウザの実行時アニメ・CSS-in-JS は未計測、n=9）。「派手なLPは速い」という予想に反して 300〜500ms に集中した。速度の判断は平均値ではなく**局所のバースト**で見る（仮説 H8）。

CSS 実装の候補（様式の観察用）: `backdrop-filter`、`mix-blend-mode`、`conic-gradient`、`clip-path` + `steps()`、`box-shadow: 4px 4px 0 #000`。
