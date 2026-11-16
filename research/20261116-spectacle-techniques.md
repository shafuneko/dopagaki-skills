# 虹色・発光・光線の実装カタログ — Web で「パチンコ屋の演出」を作る

- 作成: 2026-11-16 / 担当: フロントエンド調査サブエージェント
- 位置づけ: [docs/02-taxonomy.md](../docs/02-taxonomy.md) の `intensity` / `style` を CSS・SVG・Canvas の実装単位まで降ろした調査メモ（規則ではない。[docs/01-method.md](../docs/01-method.md)）。
- 構成: 技法 **T01–T22 の 22 個**。各技法にコピペ可能なコード（1 ブロック 5〜20 行、複数ブロック可）。
- **実行状況: 本メモのコードは 1 つもブラウザで動かしていない。** このセッションではコマンド実行基盤が使えず（`EXECUTOR_UNAVAILABLE`）、ブラウザ起動・スクショ・実測は未実施。**全ブロックが「未検証」**。構文は MDN に照らしたが、描画結果・体感・性能は未確認。外部ライブラリなし。

## 0. 強度を先に離散化する

連続値（スクロール量・乱数）で強度を動かすと点滅周期が 333ms を切る事故が起きる。**5 段の離散**にして各段の色数・発光半径・速度・同時要素数を固定する（T17/T18）。

- 強度 1–3: 色相 2/3/4 色、発光半径 4/10/18px、duration 3000/2000/1100ms、同時要素 1/2/3（差し色・平常・リーチ）。
- 強度 4–5: 色相 5/6 色、発光半径 30/48px、duration 700/450ms、同時要素 4/5（大当たり・確定）。
- duration は片道。`alternate` なら明滅 1 周期は 2 倍（強度5で 900ms ≒ 1.1Hz）。数値は**設計案**で実測根拠はない。

## 1. 虹色

### T01 conic-gradient を回す（`@property` 版 / 擬似要素版）（未検証）
```css
@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.ring {
  --angle: 0deg;
  background: conic-gradient(from var(--angle), #ff004c, #ffd400, #00e676, #00b0ff, #7c4dff, #ff004c);
  animation: turn 3s linear infinite;
}
@keyframes turn { to { --angle: 360deg; } }
```
```css
.ring2 { position: relative; overflow: hidden; border-radius: 50%; }
.ring2::before {
  content: ""; position: absolute; inset: -50%;
  background: conic-gradient(#ff004c, #ffd400, #00e676, #00b0ff, #7c4dff, #ff004c);
  animation: spin 3s linear infinite;
}
@keyframes spin { to { transform: rotate(1turn); } }
```
- 登録しない `--angle` は補間されず 50% でパチッと切り替わる。`initial-value` は必須。擬似要素版は面を回すので継ぎ目が出ず、`inset: -50%` は正方形前提（横長は `-100%`）。

### T02 linear-gradient の多色ストップを流す（未検証）
```css
.band {
  background: linear-gradient(100deg,
    #ff004c 0%, #ffd400 20%, #00e676 40%, #00b0ff 60%, #7c4dff 80%, #ff004c 100%);
  background-size: 200% 100%;
  animation: band-slide 1.2s linear infinite;
}
@keyframes band-slide {
  from { background-position: 0% 50%; }
  to   { background-position: 200% 50%; }
}
```
- 始点と終点を同色にすると 1 周期動かしても**継ぎ目が出ない**。硬い帯は `#ff004c 0 8%, #ffd400 8% 16%`（同位置に 2 色）。`background-position` は再描画なので面積に注意（T19）。

### T03 `hue-rotate` で色相を巡回（未検証）
```css
.hue-cycle {
  filter: saturate(1.35) hue-rotate(0deg);
  animation: hue 2.4s linear infinite;
}
@keyframes hue {
  from { filter: saturate(1.35) hue-rotate(0deg); }
  to   { filter: saturate(1.35) hue-rotate(360deg); }
}
```
- `hue-rotate()` は RGB 行列の近似で**彩度一定の回転ではない**。原色はクリップして白っぽく、淡色はほぼ動かない。彩度維持は「元色を高彩度に + `saturate()` 併用 + 白黒は回らない」、厳密には T01 型で `--h` を登録し `oklch(... calc(var(--h) * 1deg) ...)`（oklch 非対応環境は未確認）。

### T04 `background-clip: text` で文字を虹色に（未検証）
```css
.rainbow-char {
  background: linear-gradient(90deg, #ff004c, #ffd400, #00e676, #00b0ff, #7c4dff, #ff004c);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: char-shift 2.5s linear infinite;
}
@keyframes char-shift { to { background-position: 200% 50%; } }
```
- 3 点セット: `background-clip: text` + `color: transparent` + `-webkit-text-fill-color: transparent`（Safari 用）。縁取りは `-webkit-text-stroke` を別色で（重なり順は未確認）、極太は T14。

## 2. 発光・まぶしさ

### T05 多層 shadow（text-shadow / box-shadow）（未検証）
```css
.neon {
  color: #fff;
  text-shadow:
    0 0 2px #fff, 0 0 8px #ff2d95, 0 0 20px #ff2d95,
    0 0 44px #ff2d95, 0 0 90px #7c4dff;
  animation: breathe 1.1s ease-in-out infinite alternate;
}
@keyframes breathe { to { filter: brightness(1.5) saturate(1.3); } }
```
```css
.bulb {
  width: 96px; height: 96px; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, #ffd400 60%, #ff8a00);
  box-shadow: 0 0 0 3px #ffffffcc, 0 0 16px 6px #ffd400,
              0 0 48px 16px #ff8a00aa, 0 0 120px 40px #ff2d0055;
}
```
- `box-shadow` の `0 0 0 Npx` はぼかさない輪郭リング、後ろほど「空気の光り」。近い半径が芯。3〜5 層で足りる。`brightness()` は乗算なので黒背景は黒のまま（発光は shadow 側で稼ぐ）。10 要素 × 4 層のコストは未計測。

### T06 `drop-shadow` を重ねる（未検証）
```css
.cutout {
  filter:
    drop-shadow(0 0 4px #ffffff)
    drop-shadow(0 0 16px #00e5ff)
    drop-shadow(0 0 48px #7c4dff);
}
```
- `box-shadow` は矩形、`drop-shadow` は **alpha 形状**に沿う。切り抜き画像・SVG・文字向け。フィルタは連鎖するので 3 枚が目安。SVG 内なら `feGaussianBlur` + `feMerge`。

### T07 `mix-blend-mode` で光を足す（未検証）
```css
.stage {
  position: relative;
  isolation: isolate;              /* 混色をこの中に閉じる */
  background: #08040f;
}
.flare {
  position: absolute; inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 45%, #fff 0 8%, #ffd400cc 22%, transparent 62%);
  mix-blend-mode: screen;
}
```
- `screen` は加算寄りで白飛びしにくい。`plus-lighter` は純加算で最も明るいが白飛びしやすく対応差あり（未確認）、`color-dodge` は暗部を強く持ち上げる。`isolation: isolate` で外へ漏れない。光レイヤーは `pointer-events: none`。

### T08 `backdrop-filter` のガラス（未検証）
```css
.glass {
  background: #ffffff14;
  border: 1px solid #ffffff40;
  backdrop-filter: blur(8px) saturate(180%) brightness(1.15);
  -webkit-backdrop-filter: blur(8px) saturate(180%) brightness(1.15);
}
```
- 背後の要素をぼかして明るくする。背後に不透明な絵があるほど効く。祖先の `filter` / `opacity` / `transform` で無効化・範囲変化があり得る。

### T09 光量の山（白フラッシュ / 明度の脈動）（未検証）
```css
.flash {
  position: fixed; inset: 0;
  background: #fff;
  pointer-events: none;
  opacity: 0;
  animation: flash 700ms steps(1, end) 1 both;
}
@keyframes flash { 0% { opacity: 0 } 6% { opacity: .95 } 24% { opacity: .25 } 34%, 100% { opacity: 0 } }
```
```css
.pulse { animation: pulse 900ms ease-in-out infinite alternate; }
@keyframes pulse {
  from { filter: brightness(1) saturate(1); }
  to   { filter: brightness(1.7) saturate(1.9); }
}
```
- `steps(1, end)` で硬い点灯（減衰より断続）。700ms に 1 回 ≒ 1.4Hz。全画面の白は `opacity` 上限 0.9 程度、連打は 334ms 以上空ける（T22）。
- 脈動は点滅ではないが輝度変化が大きいと同様に眩しく、filter は再描画を伴う（T19）。

## 3. 光線・集中線

### T10 光線（repeating-conic / SVG dash）（未検証）
```css
.rays {
  position: absolute; inset: -60%;
  background: repeating-conic-gradient(from 0deg,
    #ffffff00 0deg 5deg, #ffffffb3 5deg 6deg);
  -webkit-mask-image: radial-gradient(circle, #000 0 30%, #0000 68%);
  mask-image: radial-gradient(circle, #000 0 30%, #0000 68%);
  animation: spin 14s linear infinite;
}
@keyframes spin { to { transform: rotate(1turn); } }
```
```html
<svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
  <circle cx="100" cy="100" r="80" pathLength="100"
          fill="none" stroke="#ffd400" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="12 88">
    <animate attributeName="stroke-dashoffset" from="0" to="-100"
             dur="1.4s" repeatCount="indefinite"/>
  </circle>
</svg>
```
- conic の 5deg 間隔 + 1deg の線 = 60 本。mask の放射グラデで中心を抜く（`-webkit-` 併記推奨、unprefixed 対応は未確認）。
- `pathLength="100"` で円周を 100 に正規化すると dash の数値がそのまま % として読める。SMIL は主要ブラウザで動く（CSS の `to { stroke-dashoffset: -100 }` でも可）。

### T11 Canvas パーティクル（加算合成）（未検証）
```js
const cv = document.querySelector('#fx');
const ctx = cv.getContext('2d');
const ps = Array.from({ length: 140 }, () => ({
  x: Math.random() * cv.width, y: Math.random() * cv.height,
  vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5,
  r: 1 + Math.random() * 2, h: Math.random() * 360,
}));
ctx.globalCompositeOperation = 'lighter';
function frame(t) {
  ctx.fillStyle = 'rgba(0,0,0,.16)';   // 黒半透明 = 残像（尾）
  ctx.fillRect(0, 0, cv.width, cv.height);
  for (const p of ps) {
    p.x = (p.x + p.vx + cv.width) % cv.width;
    p.y = (p.y + p.vy + cv.height) % cv.height;
    ctx.fillStyle = `hsl(${(p.h + t * .05) % 360} 100% 62%)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```
- `lighter` で重なりが加算され白い芯が出る。`cv.width/height` は属性値で CSS サイズと一致させ、高 DPI は `devicePixelRatio` で拡大（省略）。140 個は目安で未計測。止めるには T21。

## 4. グリッチ・画面揺れ

### T12 グリッチ（clip-path 分割 / RGB ずらし）（未検証）
```css
.glitch { position: relative; }
.glitch::before, .glitch::after { content: attr(data-text); position: absolute; inset: 0; }
.glitch::before {
  color: #00e5ff; clip-path: inset(0 0 52% 0);
  animation: gl 800ms steps(2, jump-none) infinite;
}
.glitch::after {
  color: #ff2d95; clip-path: inset(52% 0 0 0);
  animation: gl 800ms steps(2, jump-none) infinite reverse;
}
@keyframes gl { 50% { transform: translate(-3px, 1px); } }
```
```css
.rgb { color: #fff; text-shadow: -2px 0 #ff004c, 2px 0 #00e5ff, 0 0 10px #fff;
  animation: jit 200ms steps(2) infinite; }
@keyframes jit { 50% { transform: translate(1px, -1px); } }
```
- `data-text` に同じ文字を入れる（`<h2 class="glitch" data-text="大当たり">大当たり</h2>`）。`inset()` の上下分割が基本、`polygon()` で斜めの裂け目。`steps()` で補間を切ると「デジタルな欠損」に見える。
- RGB ずらしは赤とシアンを 2px。4px 超は読みにくい（主観）。「白い芯 + 両側の色」の 3 層で色収差にする。

### T13 `steps()` でカクつく振動（未検証）
```css
.shake { animation: shake 130ms steps(1, end) infinite; }
@keyframes shake {
  0%   { transform: translate(0, 0) rotate(0deg); }
  33%  { transform: translate(-2px, 1px) rotate(-.4deg); }
  66%  { transform: translate(2px, -1px) rotate(.3deg); }
}
```
- `steps(1, end)` で各コマ保持 = パラパラ漫画。130ms 周期は 7.7Hz のコマ替えで、20ms まで縮めるとノイズに見える。振幅 1〜2px・回転 0.2〜0.4deg が可読性の上限（主観）。固定 4 コマは乱数より軽く酔いにくい。

## 5. 文字の過剰演出

### T14 極太縁取り（text-stroke の限界 → SVG）（未検証）
```css
.heavy {
  color: #ffd400; -webkit-text-stroke: 3px #111;
  text-shadow:
    -3px -3px 0 #111, 0 -3px 0 #111, 3px -3px 0 #111,
    -3px  0   0 #111,                 3px  0   0 #111,
    -3px  3px 0 #111, 0  3px 0 #111,  3px  3px 0 #111;
}
```
```html
<svg viewBox="0 0 320 120" role="img" aria-label="ドパ">
  <text x="160" y="88" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="72" font-weight="900"
        fill="#ffd400" stroke="#111" stroke-width="14"
        stroke-linejoin="round" paint-order="stroke fill">ドパ</text>
</svg>
```
- `text-stroke` は輪郭の**中心線**に乗るので太くすると字面を食う（実用上限は font-size の 8〜10% 程度・主観）。`paint-order: stroke fill` は SVG のみ有効（HTML の挙動は未確認）→ 極太は SVG で。`stroke-linejoin="round"` で角のトゲ防止、`stroke-width` 10〜16 が実用（主観）。文字は選択・検索できず、フォント読込で幅が変わる代償がある（`role="img"` + `aria-label`）。

### T15 傾き + バウンド（`cubic-bezier` のオーバーシュート）（未検証）
```css
.slam {
  display: inline-block;
  transform-origin: 50% 80%;
  animation: slam 620ms cubic-bezier(.2, 1.7, .35, 1) infinite alternate;
}
@keyframes slam {
  from { transform: rotate(-7deg) scale(.82); }
  to   { transform: rotate(-7deg) scale(1.08); }
}
```
- `cubic-bezier` の y を 1 より大きくすると行き過ぎて戻る。回転を固定して scale だけ動かすと「叩きつけ」、回転も動かすと「揺れ」。1.1 倍超は親の `overflow: hidden` で欠ける。`will-change: transform` を併用（T19）。

### T16 1 文字ずつの出現（未検証）
```js
for (const el of document.querySelectorAll('[data-split]')) {
  const sp = [...el.textContent].map((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch; s.style.setProperty('--i', i);
    return s;
  });
  el.replaceChildren(...sp);
}
```
```css
[data-split] span {
  display: inline-block;
  animation: pop 380ms cubic-bezier(.2, 1.8, .4, 1) both;
  animation-delay: calc(var(--i) * 45ms);
}
@keyframes pop { from { opacity: 0; transform: translateY(.35em) scale(.4) rotate(-10deg); } }
```
- `innerHTML` に生テキストは `<` や `&` で壊れるので `textContent` + `createElement`。`[...text]` はサロゲートペアを 1 文字として扱う。空白は `&nbsp;` か `white-space: pre`。45ms × 10 文字 = 450ms、強度5でも 800ms 以内なら「1 アクション = 1 山」。

## 6. 段階エスカレーション

### T17 CSS 変数で強度 1〜5 を切り替える（未検証）
```css
.fx { --sat: 1; --glow: 0px; --speed: 2s; filter: saturate(var(--sat)); }
.fx[data-level="1"] { --sat: 1.0; --glow: 4px;  --speed: 3s; }
.fx[data-level="2"] { --sat: 1.2; --glow: 10px; --speed: 2s; }
.fx[data-level="3"] { --sat: 1.4; --glow: 18px; --speed: 1.1s; }
.fx[data-level="4"] { --sat: 1.7; --glow: 30px; --speed: .7s; }
.fx[data-level="5"] { --sat: 2.0; --glow: 48px; --speed: .45s; }
.fx .glow {
  display: inline-block;
  text-shadow: 0 0 var(--glow) #fff, 0 0 calc(var(--glow) * 2) #ff2d95;
  animation: pulse var(--speed) ease-in-out infinite alternate;
}
@keyframes pulse {
  from { filter: brightness(1); transform: scale(1); }
  to   { filter: brightness(1.4); transform: scale(1.04); }
}
```
- 段階は**離散トークン**で持つ。連続計算だと中間値が安全事故（3Hz 超え）に落ちやすい。切替は `el.dataset.level = 4` の 1 行。`text-shadow` が効かない要素は `box-shadow` に読み替え、`--glow` の倍率は 2 倍まで。

### T18 同時要素数を CSS だけで切り替える（未検証）
```css
.fx .layer { opacity: 0; transition: opacity 200ms linear; }
.fx[data-level="1"] .layer:nth-child(-n + 1),
.fx[data-level="2"] .layer:nth-child(-n + 2),
.fx[data-level="3"] .layer:nth-child(-n + 3),
.fx[data-level="4"] .layer:nth-child(-n + 4),
.fx[data-level="5"] .layer:nth-child(-n + 5) { opacity: 1; }
```
- `:nth-child(-n + 5)` は「先頭 5 枚」。層を 5 枚置き、強度で見せる枚数だけ変える。JS で層を足し引きするとレイアウトが跳ねるので、常に存在させて opacity で切る。強度5でも同時 5 要素まで。

## 7. 性能と安全

### T19 `will-change` と合成だけで動かす（未検証）
```css
.mover {
  will-change: transform, opacity;   /* 動く間だけ。常時は付けない */
  animation: drift 3s linear infinite;
}
@keyframes drift { to { transform: translateX(120px); } }
```
- 合成で済むのは `transform` と `opacity` が基本。`width` / `top` / `box-shadow` / `text-shadow` のアニメはレイアウトか再描画。`filter` は合成されることがあるが `blur()` の半径補間は重い——**ぼかした要素を `transform` で動かす**のが定石。`will-change` はメモリを確保するので終わったら `auto`。

### T20 `prefers-reduced-motion` と一時停止の共通 CSS（未検証）
```css
@media (prefers-reduced-motion: reduce) {
  .fx *, .fx *::before, .fx *::after {
    animation: none !important;
    transition: none !important;
  }
  .fx { filter: saturate(1.3); }   /* 色の過剰さは残す */
}
.is-paused *, .is-paused *::before, .is-paused *::after {
  animation-play-state: paused !important;
}
```
- 動きを止めても**虹色・高彩度は残せる**。刺激ゼロにすると作品の同一性が消える。`prefers-reduced-motion` は本人の OS 設定でしか変えられないので、WCAG 2.2.2 の停止手段には**作品内ボタン**が要る（T21）。`animation-play-state` は Canvas に効かない。

### T21 一時停止ボタン（未検証）
```html
<button id="pause" type="button" aria-pressed="false">一時停止</button>
```
```js
const root = document.documentElement;
const btn = document.querySelector('#pause');
btn.addEventListener('click', () => {
  const paused = root.classList.toggle('is-paused');
  btn.setAttribute('aria-pressed', String(paused));
  btn.textContent = paused ? '再開' : '一時停止';
  window.fxPaused = paused;   // Canvas の rAF はこのフラグを見て止める
});
```
- ボタンは**最初から DOM に置く**（演出中に生成すると止めたい瞬間に押せない）。`aria-pressed` で状態を伝え、実ボタンなのでキーボードでも止まる。Canvas / WebGL / JS タイマーは CSS では止まらないので、ループ先頭に `if (window.fxPaused) return;` を必ず入れる。

### T22 点滅の 3Hz ガード（未検証）
```css
/* 1 周期 = 1 回の点灯。周期 700ms（約 1.4Hz）に固定 */
.blink { animation: blink 700ms steps(1, end) infinite; }
@keyframes blink { 0%, 12% { opacity: 1 } 13%, 100% { opacity: 0 } }
```
- WCAG 2.3.1（A）は「1 秒間に 3 回を超える閃光」を禁止。3Hz = 333ms 周期。**複数の点滅を重ねると合成で超える**ので同時 1 箇所まで。面積条件（10 度視野の 25% 以上）と赤の対になる閃光は閾値が厳しく、全画面の白フラッシュは 1 回で止める（T09）。輝度変化は「相対輝度 0.1 以上」で数え、確認は録画 → フレーム平均輝度 → 1 秒窓で山を数える（自動化は未実装）。

## 8. 出典（一次ドキュメント）

- `@property` <https://developer.mozilla.org/en-US/docs/Web/CSS/@property> / `conic-gradient()` <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient> / `linear-gradient()` <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient>
- `hue-rotate()` <https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/hue-rotate> / `background-clip` <https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip> / `text-shadow` <https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow>
- `drop-shadow()` <https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow> / `mix-blend-mode` <https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode> / `backdrop-filter` <https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter>
- `mask-image` <https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image> / `clip-path` <https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path> / `steps()` <https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function>
- `-webkit-text-stroke` <https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke> / `paint-order` <https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order> / SVG `stroke-dasharray` <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray>
- `will-change` <https://developer.mozilla.org/en-US/docs/Web/CSS/will-change> / `prefers-reduced-motion` <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion> / `animation-play-state` <https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state>
- Canvas 最適化 <https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas> / 合成プロパティ <https://web.dev/articles/animations-guide> / WCAG 2.3.1 <https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html> / WCAG 2.2.2 <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>

未確認: 全コードの実ブラウザ動作（本環境で実行不可。`background-position` の継ぎ目、`mask` の unprefixed 挙動、`steps(1, end)` の見え方）／`plus-lighter`・`paint-order`（HTML テキスト）・`oklch()` の版ごとの対応差／実測コスト（FPS・GPU メモリ。強度表の数値も設計案）。
