---
id: P-two-tier-time
axes: [tempo, motion]
evidence: [O-20261116-fe-gumroad-density, O-20261116-fe-tinybird-hardborder, O-20261116-ev-resend-twotier, O-20261116-lp-runtime-check]
confidence: low
status: draft
created: 2026-11-16
updated: 2026-11-16
---

# P-two-tier-time — 刺激の多い画面は、時間スケールが2桁違う2つの層（100〜300ms の応答／10〜80秒の常時ループ）を併存させる

## 傾向

「常に何かが動いている」画面を計測すると、時間値が単一の分布に収まらず、**2桁離れた2つの層**に分かれる例が4件で一致した。

- **第1層（応答）**: ホバー・押下・テロップ差し替えなどの 100〜300ms。
- **第2層（常時）**: 背景ループ・アンビエント・スライドショーなどの 10〜80秒（`infinite` が多い）。

平均や中央値を1つだけ出すと、この2層は中間の値に潰れる。**「速い」と「長い」が同時に存在する**のが、刺激の多い画面の時間構造である可能性がある。

## 支持する観察

| 観察 | 第1層 | 第2層 | 測り方 |
|---|---|---|---|
| `O-20261116-fe-gumroad-density` | `transition-duration` 中央値 150ms（30〜300ms） | `animation:` に 20/60/80秒 | 宣言ベース（CSS 文字列） |
| `O-20261116-fe-tinybird-hardborder` | 宣言ベースの中央値 200ms（省略記法19件中 300ms が9件） | 明示は少数（**層が薄い**） | 宣言ベース |
| `O-20261116-ev-resend-twotier` | `transition` 54件・中央値 240ms | `animation` 5件・中央値 1,800ms、**max 30,000ms**、`infinite` 44件 | 宣言ベース（HTTP GET） |
| `O-20261116-lp-runtime-check` | 実行時 `transition` 中央値 400ms（LIGHT THE WAY）／300ms（AHKAH） | 実行時 `getAnimations()` 中央値 10,000ms、**p90 87,019ms**、1420件中1354件が infinite | **実ブラウザ**（ego lite） |

4件のうち3件は宣言ベース、1件（LIGHT THE WAY / AHKAH）は実ブラウザの実行値。**宣言と実行値が一致した**例（transition 400ms / 300ms）があるので、少なくとも transition 層については宣言集計が代理になる。

## 現れる条件

- 背景・装飾に「常時動く」要素がある（グラデーションの移動、粒子、スライドショー、マーキー）。
- 応答系の transition が 100〜300ms に揃っている（マイクロインタラクションの推奨帯）。
- 画面あたりのアニメ要素数が多い（LIGHT THE WAY は 3019要素中 1420 アニメ、うち 1354 が infinite）。
- CSS がビルド生成で、宣言が複数ファイルに分散している（層の切り分けが人手では見えない）。

## 現れない条件

- アニメが皆無、または単一層だけ（`O-20261116-lp-sakuma-55th` は要素38・アニメ0。ただし**計測が成立していない可能性**があり、反例としては弱い）。
- transition が段階値に量子化されていて、層の区別が意味を持たない（tinybird は 300ms が9件で単峰寄り）。
- `prefers-reduced-motion` で第2層が止まる実装（この場合、第2層は「設計上オフにできる層」になる。**実効テストは未実施**）。

## 実装上の対応物

- **層を分けて数える**: `getAnimations()` の結果を `iterations === Infinity` と有限で分割し、それぞれの中央値・p90 を出す（1つの中央値に混ぜない）。
- **第1層は 100〜300ms、第2層は 10秒以上**を初期値にし、第2層には必ず停止手段を付ける（[evals/rubric.md](../evals/rubric.md) G1）。
- 第2層を短くして「速く」しようとしない。10秒のループを 150ms にすると**点滅**になり、閃光・前庭刺激のリスクに変わる（G2）。

```js
// 層を分けて中央値を出す（近似でよい）
const anims = document.getAnimations();
const timing = anims.map((a) => a.effect?.getTiming?.() || {});
const infinite = timing.filter((t) => t.iterations === Infinity);
const finite = timing.filter((t) => typeof t.duration === "number" && t.iterations !== Infinity);
```

## 反例

- **tinybird**: 第2層がほぼ無い（明示の長いループが少数）。「刺激の多い画面＝二層」は成立せず、**単層でも密度は出せる**。
- **gumroad**: 第1層 150ms・第2層 20〜80秒という二層だが、観察者は「速い」より「密度が高い」と評している（印象）。二層であること自体は体感の十分条件ではない。
- **AHKAH**: transition 251件（300/400ms）に対して `getAnimations()` は1件だけ。**第2層が実質無いのに派手に見える**（filter 45要素・backdrop 18要素という別の手段）。二層は「派手さ」の必要条件でもない。
- LIGHT THE WAY の infinite 1354 件は、`animation-play-state` や reduce の実装を確認していないため、**「止められない」ことの根拠にはならない**。

## 強度の分布

- **強い**: 第1層 100〜300ms が多数＋第2層 10秒以上が多数（LIGHT THE WAY: 700 transitions / 1354 infinite）。
- **中**: 第1層 150〜300ms＋第2層が少数の長いループ（gumroad、resend）。
- **弱い**: 第1層のみ（tinybird、AHKAH）。
- **逆**: 二層だが第2層が `prefers-reduced-motion` で完全に止まる（未確認）。

## 反論・保留（2026-11-16 Codex のレビュー方針を先取り）

- 「二層である」ことは**構造の記述**であり、「ドパく感じる」の証拠ではない。体感評定は0件。
- resend の第2層は 2 宣言のみで、「20〜80秒の帯が主役」とは言えない（confidence は low のまま）。
- したがって本傾向は **`status: draft` / `confidence: low`**。規則化しない。

## 未検証・次に測る

- 同一サイトを3回計測し、層の中央値のばらつきを見る（現在は1回）。
- スクロール後の遅延付与アニメを拾う（初回描画のみの計測を改善）。
- `prefers-reduced-motion: reduce` を強制したときの**第2層の残存量**を `getAnimations()` の差分で測る。
- 二層の有無と「ドパい」評定（5段階）の相関。**評定データは0件**。
