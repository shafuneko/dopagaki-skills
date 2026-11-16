---
id: R-tempo-switch-rate-tail
domain: tempo
strength: 3
status: draft
evidence: [P-switch-rate-over-mean, O-20261116-video-asl-cuts, O-20261116-video-caption-rate, O-20261116-fe-gumroad-density, O-20261116-fe-tinybird-hardborder]
updated: 2026-11-16
---

# R-tempo-switch-rate-tail — 遷移の平均・中央値を目標にせず、150ms 未満の短い duration の件数と切替回数/秒を設計目標にする

## 規則

画面内の遷移・テロップ・ショットの「速さ」は平均値・中央値で目標を置かず、**150ms 未満の duration の件数（下方テール）**と**切替回数/秒**を設計目標にする。

## 実装

### 1. 先に計測を置く（実効値）

`document.getAnimations()` で実効 duration を集め、次の2つを出す。

- **下方テール率** = duration が 150ms 未満の件数 ÷ 全件
- **切替回数/秒** = 1秒あたりに DOM が差し替わった回数（テロップ・状態更新）

```js
const pct = (xs, p) => {
  const a = [...xs].sort((x, y) => x - y);
  return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : 0;
};

const durations = document.getAnimations()
  .map((a) => a.effect?.getTiming?.().duration)
  .filter((d) => typeof d === 'number');

const tailRate = durations.length
  ? durations.filter((d) => d < 150).length / durations.length
  : 0;

console.log({
  n: durations.length,
  tailRate,                 // 下方テール率
  p10: pct(durations, 0.1),
  p50: pct(durations, 0.5),
  p90: pct(durations, 0.9),
});
```

```js
// 切替回数/秒（テロップや状態更新の差し替えを数える）
let switches = 0;
new MutationObserver((records) => { switches += records.length; })
  .observe(stage, { childList: true, characterData: true, subtree: true });

setInterval(() => {
  console.log('切替回数/秒', switches);
  switches = 0;
}, 1000);
```

宣言ベース（CSS テキストの正規表現集計）で見る場合は、`transition-duration` と `animation-duration` の全宣言を ms に正規化し、`var()` と `animation:` / `transition:` の省略記法を**別集計**してから同じ2つを出す。省略記法に時間値が埋もれると、明示宣言だけの集計は過小評価になる（gumroad は `animation:` 8件中 時間値4件、`animation-iteration-count: infinite` の明示は0件）。

### 2. 平均を下げるのではなく、短い duration を「数で」増やす

中央値を 150ms に寄せるのではなく、100ms の要素を**10個**置いて位相をずらす。観察側の対応物は「4秒のあと 0.5秒台のショットが10連発」という下方テールの作り方で、平均 ASL を下げる操作とは別物。

```css
:root {
  --dur-fast: 100ms;    /* 応答層 */
  --dur-base: 150ms;    /* 基準 */
  --dur-slow: 300ms;    /* 画面遷移 */
  --dur-ambient: 20s;   /* 常時ループは別層 */
}

/* 押下・ホバーの応答は短い側へ固定する */
.tap {
  transition: transform var(--dur-fast) cubic-bezier(0.2, 0, 0, 1);
}

/* 短い切替を10個並べ、位相をずらして「連発」にする */
.tick {
  animation: tick var(--dur-fast) steps(1, end) 1; /* 1回だけ。連発は delay で作る */
  animation-delay: calc(var(--i) * 100ms); /* --i: 0〜9 */
}

@keyframes tick {
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
}
```

```html
<span class="tick" style="--i:0"></span>
<span class="tick" style="--i:1"></span>
<!-- … 10個まで。--i を 0〜9 にする -->
```

この例は1回で終わるので点滅しない。ループに変える場合は `animation-iteration-count` を明示し、`@media (prefers-reduced-motion: reduce)` で止める（停止可能性のゲート。判定は [evals/rubric.md](../evals/rubric.md) の G1/G4。本規則はゲートを代替しない）。

### 3. 常時ループは短い層に混ぜない

速い応答（100〜300ms）と常時ループ（20秒/60秒/80秒）は**別の層**として設計する。ループ側の duration を 150ms に揃えるのは、この規則の対象外（平均を下げる操作であり、切替回数を増やしていない）。

## なぜ効くか（仮説）

体感の「速さ」は遷移時間の代表値ではなく、(a) 単位時間あたりの切替回数、(b) 間隔の分布の短い側の厚み、で決まる可能性がある（H1 / H8 局所バースト仮説）。平均は「全部 2.4秒」と「4秒のあと 0.5秒が10連発」を区別できない。テロップでも、cps を上げずに1画面の語数を1〜3語へ削ると切替回数だけが増える（H8 の解釈）。

ただし**知覚側は未検証**である。「切替回数/秒」と主観の「速い」評定の相関データは現在0件で、この因果はまだ仮説段階。

## 効く条件

- 情報が「読む」より「流れる」ことが主目的の画面（フィード、LP のヒーロー、演出ページ、ショート動画のテロップ）。
- 切替の総数が多く、間隔の分布が短い側に厚い（下方テール）。
- 同一画面に速い応答（100〜300ms）と遅い常時ループ（20秒以上）が併存し、単一の平均では表せない。
- 宣言ベースの計測で、省略記法・`var()`・`animation-duration` の宣言分散が残っている（分布の山を取り違えやすい）ため、実効値と突き合わせられる。

## 効かない・逆効果の条件

- **読み切る必要がある画面**（長文、フォーム、購入確定、エラー表示）。切替回数を増やすと読解を壊し、H5 反発U字の右側に入る。
- **分布が単峰で量子化されている**場合（tinybird は省略記法19件中 300ms が9件、宣言ベースの中央値 200ms）。この場合は中央値が代表値として機能しうる。裾を人為的に増やすと「揃っている」という利点を壊す。
- **cps を上げて速くしようとする**場合。Netflix の上限は 20cps・42文字/行・最大2行（= 最大84文字）で、文字数/秒を上げると読解負荷になる。速く見せる手段は切替頻度側にある。
- **常時ループを短くする**場合。gumroad の 20/60/80秒は「速い」ではなく「長い」。これを 150ms にすると別の刺激（点滅）になり、前庭刺激・閃光のリスクが出る。閃光は1秒に3回を超えない（WCAG 2.3.1）。
- **なめらかなスクロール**など「速いが変化が少ない」画面。切替回数は増えないため、この規則の指標は動かない（`docs/02-taxonomy.md` の注意）。
- 尺が短く終端が必ず来る作品。切替回数の効果より「終わる」ことの効果が勝つ可能性があり、未検証。

## 強度の根拠

**3（中）。**

- 根拠の強さ: **mid**（`P-switch-rate-over-mean` の `confidence: mid`）。独立した観察は4件あるが、内訳は gumroad / tinybird の2件が宣言ベースの CSS 集計、caption は記事の記述のみ、ASL は文献値で、いずれも一次の知覚測定ではない。評定データは0件。
- 4以上にしない理由: 「切替回数を増やすと速く感じる」の知覚側が未検証で、強い事例（1語テロップ 約3回/秒）も記事の記述のみ。
- 1〜2にしない理由: 平均と分布の乖離は2サイトの実測（gumroad の二峰性、tinybird の下方テール 1ms×3・100ms×2）で確認できており、計測目標としての再現性は高い。効果の大きさではなく、**測り方の規則**としての確度が高い。

## 出典・根拠ID

- 傾向: `P-switch-rate-over-mean`（`confidence: mid`、`status: draft`）
- 観察:
  - `O-20261116-video-asl-cuts` S-2 / S-4（ASL 2.4秒 = 25カット/分、2.0秒 = 30カット/分、局所 0.58秒、平均は分布を隠す）
  - `O-20261116-video-caption-rate` S-2 / S-3（20cps・42文字・2行 = 最大84文字、1語テロップ 150〜200語/分 ≒ 3語/秒、記事の記述のみ）
  - `O-20261116-fe-gumroad-density` S-2 / S-3（`transition-duration` 中央値 150ms、min 30 / max 300、`animation:` 20/60/80秒）
  - `O-20261116-fe-tinybird-hardborder` S-2（省略記法19件中 300ms が9件、中央値 200ms、下方テール 1ms×3・100ms×2）
- 参照値: `docs/02-taxonomy.md` 付録（NN/g マイクロインタラクション 100–150ms、Netflix 20cps・42文字/行・最大2行）、`cubic-bezier(0.2, 0, 0, 1)`（Material 3）
- 仮説: `docs/05-hypotheses.md` の H1（テンポ）、H8（局所バースト）
- ゲート（停止可能性）: `evals/rubric.md` G1 / G4。`P-stop-ability` は規則ではなくゲートとして扱い、本規則には含めない。
