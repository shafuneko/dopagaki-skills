# Web の「刺激の強さ」をブラウザで測る手順書

対象: 感覚語（速い・うるさい・落ち着かない）を、第三者が再現できる数値に落とすための実務マニュアル。
すべて Chrome / Edge の DevTools コンソールに貼って動く形。**数値は「刺激の強さ」そのものではなく、刺激の素材になる物理量**である。

- 作成: 2026-11-16 / 計測担当
- 未確認: 各コードは実ページで未実行（検証用ページが無い）。API 名と構文は MDN で確認、挙動は未確認。
- 位置づけ: 調査メモであり規則ではない（[research/README.md](README.md)）。規則化は観察 → 傾向 → 規則の順。

## 0. 共通の前提

1. 測れるのは**画面の物理量**。人がどう感じたかは別に聞き、「主観」とラベルする。
2. **「刺激」と「重さ」は別物**。演出が激しくても軽いページはある。第5節を刺激の代用にしない。
3. 近似は「近似」、測れないものは「測れない」と書く。数字には「何を・どの範囲で・何秒」を添える。
4. コンソールは**計測対象のタブ**で開く。別オリジンの iframe 内は触れない（測れない）。
5. 計測中は DevTools を閉じない。閉じると観測が途切れることがある（未確認）。

## 1. CSS transition / animation の duration 分布

**分かること**: 変化が何 ms で起きるかの分布。短いほど機敏、長いほどゆったり。中央値と p90 の差で「一部だけ極端に長い」も見える。
**手順**: 主要な操作（ホバー・スクロール・タブ切替）を一通りやってから貼る。`getAnimations()` は**その瞬間に生きているアニメ**だけを返す。

```js
// 1. duration 分布（ms）。CSS 宣言の実値で、近似ではない
const toMs = (v) => { const m = /^([\d.]+)(ms|s)$/.exec(String(v).trim()); return m ? parseFloat(m[1]) * (m[2] === 's' ? 1000 : 1) : null; };
const durs = [];
for (const a of document.getAnimations()) {
  const t = a.effect?.getComputedTiming?.();
  if (t && Number.isFinite(t.duration)) durs.push(t.duration);
}
for (const el of document.querySelectorAll('*')) {
  const cs = getComputedStyle(el);
  for (const p of ['transitionDuration', 'animationDuration'])
    for (const v of cs.getPropertyValue(p).split(',')) { const ms = toMs(v); if (ms !== null) durs.push(ms); }
}
const q = (arr, p) => arr.length ? arr.slice().sort((a, b) => a - b)[Math.min(arr.length - 1, Math.floor(p * (arr.length - 1)))] : null;
console.table({ samples: durs.length, unique: new Set(durs).size, median: q(durs, .5), p90: q(durs, .9), max: durs.length ? Math.max(...durs) : null });
```

**限界**: 擬似要素（`::before` 等）の animation は拾えない（`getComputedStyle(el, '::before')` で個別に）。0s の transition は「即時変化」で、サンプルに混ざる。JS の `requestAnimationFrame` 駆動アニメは duration を持たず表に出ない。ページ全体ではなく**その時点で存在する要素**の値である。
出典: [MDN Element.getAnimations](https://developer.mozilla.org/ja/docs/Web/API/Element/getAnimations) / [MDN AnimationEffect.getComputedTiming](https://developer.mozilla.org/ja/docs/Web/API/AnimationEffect/getComputedTiming)

## 2. 1秒あたりの変化回数

**分かること**: DOM がどれくらい頻繁に書き換わるか（`MutationObserver`）、要素がどれくらい動くか（rAF ごとの座標差）。「落ち着かない」の物理的な裏付け。
**手順**: 5秒観測。**無操作で5秒**と**操作しながら5秒**を分けて記録する（混ぜると操作の影響が混ざる）。

```js
// 2. DOM 変化と移動量（5秒）
let mutations = 0, frames = 0, moved = 0;
const last = new WeakMap();
const mo = new MutationObserver((l) => { mutations += l.length; });
mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
const start = performance.now();
const tick = (t) => {
  frames++;
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect(), p = last.get(el);
    if (p && (Math.abs(p.x - r.x) > 0.5 || Math.abs(p.y - r.y) > 0.5)) moved++;
    last.set(el, { x: r.x, y: r.y });
  }
  if (t - start < 5000) return requestAnimationFrame(tick);
  mo.disconnect();
  const sec = (t - start) / 1000;
  console.table({ seconds: +sec.toFixed(1), mutations, mutationsPerSec: +(mutations / sec).toFixed(1), frames, movedElemsPerFrame: +(moved / frames).toFixed(1) });
};
requestAnimationFrame(tick);
```

**限界**: 全要素に `getBoundingClientRect()` を毎フレーム呼ぶと**強制レイアウトで計測自体がページを重くする**（移動量は近似）。Canvas・WebGL・video の中身は見えない。CSS アニメの移動は属性 mutation には出ないので、`mutationsPerSec` は CSS アニメを数えない。
出典: [MDN MutationObserver](https://developer.mozilla.org/ja/docs/Web/API/MutationObserver) / [MDN requestAnimationFrame](https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame)

## 3. 無限アニメ・自動再生の検出

**分かること**: 「止まらないもの」「勝手に始まるもの」の有無。刺激の持続時間と、ユーザーの意思に反して動くものの一覧。

```js
// 3. infinite アニメ・autoplay・AudioContext
const infinite = [];
for (const el of document.querySelectorAll('*')) {
  const cs = getComputedStyle(el);
  if (cs.animationName !== 'none' && cs.animationIterationCount.split(',').map(s => s.trim()).includes('infinite'))
    infinite.push({ tag: el.tagName.toLowerCase(), cls: String(el.className ?? '').slice(0, 40), name: cs.animationName, duration: cs.animationDuration });
}
const videos = [...document.querySelectorAll('video')].map(v => ({ src: (v.currentSrc || v.src || '').slice(-50), autoplay: v.autoplay, muted: v.muted, loop: v.loop, paused: v.paused, currentTime: +v.currentTime.toFixed(2) }));
const ac = new (window.AudioContext || window.webkitAudioContext)();
console.log({ infinite, videos, audioContextState: ac.state });
ac.close();
```

**限界**: 既存の `AudioContext` は列挙できない。上は**新しく1つ作って状態を見ているだけ**で、ページが実際に音を出しているかは分からない（`suspended` なら自動再生制限で止まっている傍証）。`autoplay` が false でも JS の `play()` で鳴る場合がある。擬似要素と JS アニメは取りこぼす。
出典: [MDN animation-iteration-count](https://developer.mozilla.org/ja/docs/Web/CSS/animation-iteration-count) / [MDN AudioContext.state](https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/state) / [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay/)

## 4. 要素数・文字数・色相数（近似）

**分かること**: 画面の情報密度。要素数と文字数はそのまま、色相数は「色が何系統あるか」の近似。

```js
// 4. 要素数・文字数・色相ビン（12分割、彩度の低い色は捨てる）
const all = document.querySelectorAll('*');
const hue = new Array(12).fill(0);
const parse = (c) => {
  const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return (a === 0 || [r, g, b].some(v => !Number.isFinite(v))) ? null : [r, g, b];
};
for (const el of all) {
  const cs = getComputedStyle(el);
  for (const p of ['color', 'backgroundColor', 'borderTopColor']) {
    const rgb = parse(cs.getPropertyValue(p)); if (!rgb) continue;
    const [r, g, b] = rgb.map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < 0.05) continue; // 無彩色は色相を持たない
    let h;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    hue[Math.floor((((h * 60) + 360) % 360) / 30)]++;
  }
}
console.table({ elements: all.length, characters: (document.body.innerText || '').replace(/\s/g, '').length, hueBinsUsed: hue.filter(n => n > 0).length, hue });
```

**限界**: 12分割は粗い近似で、境界の色は隣に寄る。画像・動画・Canvas の色は入らない。非表示要素も数える。半透明は合成後の色ではない。`rgb()` 以外（`color()` / `lab()`）で返る場合は一致せず**取りこぼす**。文字数は `innerText` 基準なので `visibility:hidden` は入らない。
出典: [MDN querySelectorAll](https://developer.mozilla.org/ja/docs/Web/API/Document/querySelectorAll) / [MDN getComputedStyle](https://developer.mozilla.org/ja/docs/Web/API/Window/getComputedStyle)

## 5. パフォーマンス側の指標（「重さ」であって「刺激」ではない）

**分かること**: ページがどれくらい詰まっているか（Long Task・CLS・イベント処理時間・FPS）。**刺激の強さの指標ではない**。演出が静かなページでもここが悪いことはある。

```js
// 5. 10秒間のパフォーマンス観測。eventMaxMs は INP の近似
const out = { longTasks: 0, longTaskMs: 0, cls: 0, events: [] };
new PerformanceObserver(l => { for (const e of l.getEntries()) { out.longTasks++; out.longTaskMs += e.duration; } })
  .observe({ type: 'longtask', buffered: true });
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; })
  .observe({ type: 'layout-shift', buffered: true });
new PerformanceObserver(l => { for (const e of l.getEntries()) out.events.push(Math.round(e.duration)); })
  .observe({ type: 'event', durationThreshold: 40, buffered: true });
let frames = 0;
const start = performance.now();
const tick = (t) => {
  frames++;
  if (t - start < 10000) return requestAnimationFrame(tick);
  const sec = (t - start) / 1000;
  console.table({ seconds: +sec.toFixed(1), fpsAvg: +(frames / sec).toFixed(1), longTasks: out.longTasks, longTaskSec: +(out.longTaskMs / 1000).toFixed(2), cls: +out.cls.toFixed(4), eventMaxMs: out.events.length ? Math.max(...out.events) : null, eventCount: out.events.length });
};
requestAnimationFrame(tick);
```

**限界**: `eventMaxMs` は INP の**近似**。本来の INP は操作ごとの待ち時間を集計し、外れ値を除いた分布から決める（単純な最大値ではない）。FPS は rAF の呼ばれ方で、実際に描かれたコマ数ではない。CLS はユーザー入力を伴わないレイアウトずれの累積。Long Task は 50ms 超のみ。`buffered` で貼る前の履歴も拾えるが、拾えない種類もある（未確認）。
出典: [web.dev INP](https://web.dev/articles/inp) / [web.dev CLS](https://web.dev/articles/cls) / [web.dev optimize long tasks](https://web.dev/articles/optimize-long-tasks) / [Chrome DevTools レンダリング性能](https://developer.chrome.com/docs/devtools/rendering/performance)

## 6. 動画の平均ショット長（ASL）を手作業で測る

**分かること**: カットが何秒ごとに来るか。ASL が短いほど落ち着かない映像になりやすい（因果は仮説）。
**手順**: 動画を一時停止 → 再生バーでカット位置に送る → `__cut()` を実行（カットのたびに）→ 最後に `__asl()`。カット数が 10 未満なら別区間も測る。

```js
// 6. ASL 補助。__cut() でカット、__asl() で集計
const v = document.querySelector('video');
if (!v) console.warn('video 要素が見つからない');
else {
  v.pause();
  const cuts = [];
  window.__cut = () => {
    cuts.push(+v.currentTime.toFixed(3));
    const n = cuts.length;
    console.log(`#${n} ${cuts[n - 1]}s` + (n > 1 ? ` shot=${(cuts[n - 1] - cuts[n - 2]).toFixed(2)}s` : ''));
    return cuts;
  };
  window.__asl = () => {
    if (cuts.length < 2) return console.warn('カットが2点未満');
    const d = cuts.slice(1).map((t, i) => t - cuts[i]).sort((a, b) => a - b);
    const sum = d.reduce((a, b) => a + b, 0), med = d[Math.floor(d.length / 2)];
    console.table({ shots: d.length, asl: +(sum / d.length).toFixed(2), median: +med.toFixed(2), min: +d[0].toFixed(2), max: +d[d.length - 1].toFixed(2) });
    return d;
  };
  console.log('__cut() で記録、__asl() で集計');
}
```

**限界**: 目視なので 0.1 秒精度。速いカット（0.3 秒未満）は取りこぼす。`v.currentTime += 1 / 30` のフレーム送りはキーフレーム単位に丸められる場合がある（未確認）。フェードや手持ちカメラの揺れはカットと誤認しやすい。ストリーミングでは `currentTime` のシーク精度が低いことがある。
出典: [MDN HTMLMediaElement.currentTime](https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement/currentTime)

## 7. 音の測定（RMS まで。ラウドネスは測れない）

**分かること**: 音量の時間変化（RMS）。「うるさい」の物理的な下限。**ラウドネス（LUFS）は測れない**（K 特性フィルタとゲーティングを伴う規格で、`AnalyserNode` だけでは出せない）。
**手順**: 対象の `<audio>` / `<video>` を1つ指定。**クリック後に実行**しないと `AudioContext` が `suspended` のまま。

```js
// 7. RMS（0.5秒ごと、10秒で自動停止）
const el = document.querySelector('video, audio');
if (!el) console.warn('メディア要素なし');
else {
  el.muted = false;
  const ctx = new AudioContext();
  await ctx.resume(); // ユーザー操作後でないと suspended のまま
  const src = ctx.createMediaElementSource(el), an = ctx.createAnalyser(), buf = new Float32Array(an.fftSize = 2048);
  src.connect(an); an.connect(ctx.destination); // 音を消したければ connect しない
  const rows = [];
  const id = setInterval(() => {
    an.getFloatTimeDomainData(buf);
    let s = 0; for (const x of buf) s += x * x;
    const rms = Math.sqrt(s / buf.length);
    rows.push({ rms: +rms.toFixed(4), dBFS: +(20 * Math.log10(rms || 1e-8)).toFixed(1) });
  }, 500);
  setTimeout(() => {
    clearInterval(id);
    const vals = rows.map(r => r.rms);
    console.table({ samples: vals.length, rmsMean: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4), rmsMax: Math.max(...vals), rows });
    src.disconnect(); ctx.close();
  }, 10000);
}
```

**限界**: `createMediaElementSource` は**その要素の音声出力を Web Audio 側に取り込む**ため、実行後はこのノード経由でしか鳴らない（`disconnect` すると無音）。ページ全体のミックス（複数音源・Web Audio 合成）は測れない。`dBFS` はフルスケール基準の概算で、ラウドネスでも音圧でもない。端末の音量設定は反映されない。
出典: [MDN AnalyserNode](https://developer.mozilla.org/ja/docs/Web/API/AnalyserNode) / [MDN getFloatTimeDomainData](https://developer.mozilla.org/ja/docs/Web/API/AnalyserNode/getFloatTimeDomainData)

## 8. 測定の記録フォーマット

数字だけ残すと再現できない。**1計測1行**で以下を埋める。

| 項目 | 例 | なぜ要るか |
|---|---|---|
| 誰が | 計測担当A | 個人差・環境差の切り分け |
| 日時 | 2026-11-16 15:10 JST | ページは更新される |
| URL | https://example.com/ | 後で同じものを見る |
| ブラウザ | Chrome 131.0.6778.86 | API の挙動が変わる |
| OS / 端末 | Windows 11 / ノートPC | 描画性能の差 |
| 画面幅 / DPR | 1280px / 1.25 | レイアウトと要素数が変わる |
| 計測秒数 | 5s（無操作）/ 5s（スクロール） | 短い平均はブレる |
| 操作 | なし / 縦スクロール / ホバー | 刺激は操作で変わる |
| 生データ | `console.table` のコピー | 再計算用 |

```json
{ "who": "A", "at": "2026-11-16T15:10:00+09:00", "url": "https://example.com/",
  "browser": "Chrome 131 / Windows 11", "viewport": { "width": 1280, "dpr": 1.25 },
  "durationSec": 5, "interaction": "none",
  "durationMs": { "median": 200, "p90": 600, "n": 41 },
  "mutationsPerSec": 12.4, "infiniteAnimations": 3,
  "elements": 812, "hueBinsUsed": 5,
  "perf": { "fpsAvg": 58.9, "longTaskSec": 0.3, "cls": 0.02 },
  "notes": "ヒーローだけ常時アニメ。数値は近似" }
```

**注意**: 同じページでも初回表示・スクロール後・タブ復帰後で数字は変わる。比較は「同じ操作を同じ順で」。1回で結論を出さず、3回以上測って中央値で比べる。

## 出典

- HTTP 200 を確認（2026-11-16 取得）: [web.dev INP](https://web.dev/articles/inp) / [Chrome DevTools レンダリング性能](https://developer.chrome.com/docs/devtools/rendering/performance)
- 未確認（URL は記憶ベース。リンク切れの可能性あり）: MDN の各ページ、[web.dev CLS](https://web.dev/articles/cls)、[web.dev optimize long tasks](https://web.dev/articles/optimize-long-tasks)、[Chrome autoplay policy](https://developer.chrome.com/blog/autoplay/)
- INP 200ms などの基準値は**この文書では使っていない**。基準は出典側の更新で変わるため、必要時に原典を確認する。
