# ドパガキ演出のレシピ集（虹色・発光・光線・揺れ・文字・記号）

実装のコピペ用。**ブラウザでの動作確認は一部のみ**（各節に「未検証」と書いた）。
数値は出発点で、作品内で一貫させることが優先。
虹リング・多層 shadow・白フラッシュ・強度1〜5切替の4つは ego lite で**描画確認済み**（[verification-20261116.md](verification-20261116.md)）。

- 前提: 暗い背景（`#0b0b0d` 前後）＋高彩度3〜4色
- 段階は `data-stage="L2"` のような属性で切り替える（[`escalation-ladder.md`](escalation-ladder.md)）

## 1. 虹色

### 1.1 色相を回す（虹色リング・虹色文字）

```css
/* @property が使えるブラウザ（Chrome/Safari 16.4+/Firefox 128+） */
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.rainbow {
  background: conic-gradient(
    from var(--angle),
    #ff004c, #ff8a00, #ffee00, #38ff4a, #00e5ff, #4b5bff, #c400ff, #ff004c
  );
  animation: spin-hue 2.4s linear infinite;
}

@keyframes spin-hue {
  to { --angle: 360deg; }
}
```

`@property` が無い環境では `filter: hue-rotate()` で回す（背景全体に効くので安易に使わない）。

```css
.rainbow-fallback {
  background: linear-gradient(90deg, #ff004c, #ff8a00, #ffee00, #38ff4a, #00e5ff, #c400ff);
  animation: hue 2.4s linear infinite;
}
@keyframes hue { to { filter: hue-rotate(360deg); } }
```

- **周期 2〜3 秒**が出発点。実測では ドパWick のタイトル背景が **約2.4秒で色相が一巡**（`observations/O-20261116-play-dopa-wick.md` §8）。
- 色相を回しても**彩度と輝度は動かさない**。これが「虹色なのにチカチカしない」作り方（WCAG 2.3.1 は輝度変化で判定）。
- 状態: 構文は MDN 準拠。**ローカルでの実機確認は未実施**（Chrome 系での動作は一般的）。

### 1.2 文字だけ虹色

```css
.rainbow-text {
  background: linear-gradient(90deg, #ff004c, #ffee00, #00e5ff, #ff004c);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: slide 2.4s linear infinite;
}
@keyframes slide { to { background-position: 300% 0; } }
```

注意: `background-clip: text` と `text-shadow` は併用できない（影が透明文字の外に出ない）。縁取りたいときは SVG の `text` か、下に重ねた複製要素を使う。

## 2. 発光・まぶしさ

### 2.1 多層グロー

```css
.glow {
  color: #fff;
  text-shadow:
    0 0 4px #fff,
    0 0 12px #00e5ff,
    0 0 28px #00e5ff,
    0 0 60px #4b5bff;
}
```

- 3〜4層で「芯・近景・遠景」を作る。層を増やすほど光が太る。
- `box-shadow` でも同じ。`filter: drop-shadow()` は文字以外（SVG・画像）に。

### 2.2 加算合成（光を重ねる）

```css
.light-layer {
  position: absolute;
  inset: 0;
  mix-blend-mode: screen;      /* 黒が消えて光だけ残る */
  pointer-events: none;
}
```

`plus-lighter` はより強い加算（Chrome/Safari 可、Firefox は要確認）。`color-dodge` は白飛びしやすいので L4 の一瞬だけ。

### 2.3 白フラッシュ

```css
.flash {
  position: fixed;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
}
.flash.is-on { animation: flash 120ms ease-out; }
@keyframes flash {
  0% { opacity: 0; }
  20% { opacity: 0.85; }
  100% { opacity: 0; }
}
```

- **連続で撃たない。** 1秒に3回を超えると WCAG 2.3.1 に触れる。L4 の頭で1回、以降は 400ms 以上あける。
- 面積が広い（画面の1/4以上）フラッシュは特に注意。`0.85` でも眩しさは十分。

### 2.4 明滅（脈動）

```css
.pulse { animation: pulse 900ms ease-in-out infinite alternate; }
@keyframes pulse {
  from { filter: brightness(1) saturate(1); }
  to   { filter: brightness(1.35) saturate(1.6); }
}
```

- `filter` は合成レイヤで動くので比較的安いが、**大きな領域に毎フレームかけると重い**。`will-change: filter` は常用しない。

## 3. 光線・集中線

```css
/* 放射状の集中線（CSS のみ） */
.burst {
  position: absolute;
  inset: -30%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0) 0deg 1.2deg,
    rgba(255, 255, 255, 0.9) 1.2deg 1.8deg
  );
  mask-image: radial-gradient(circle, transparent 22%, #000 60%);
  animation: burst-spin 900ms linear infinite;
}
@keyframes burst-spin { to { transform: rotate(360deg); } }
```

- 線の角度 0.6〜2度、本数は 100〜300 本相当。細くするほど鋭い。
- **回転は 0.8〜1.2 秒/周**が出発点。速すぎると縞模様の点滅に見える（輝度が動くと 2.3.1 の対象になりうる）。

SVG で線を引く場合は `stroke-dasharray` + `stroke-dashoffset` のアニメで「線が走る」表現ができる。

## 4. 揺れ・崩れ

```css
/* 画面振動（減衰つき） */
@keyframes shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(-6px, 3px) rotate(-0.4deg); }
  25% { transform: translate(5px, -4px) rotate(0.5deg); }
  45% { transform: translate(-3px, 2px) rotate(-0.2deg); }
  70% { transform: translate(2px, -1px) rotate(0.1deg); }
}
.shake { animation: shake 320ms cubic-bezier(0.36, 0.07, 0.19, 0.97); }
```

- 振幅は 4〜8px、時間 250〜400ms。**画面全体を揺らすのは L4 の1回だけ**にする（多用すると酔う。前庭刺激）。
- reduced-motion では振動を消し、代わりに発光を1段強くする。

```css
/* グリッチ（RGB ずらし） */
.glitch { position: relative; }
.glitch::before, .glitch::after {
  content: attr(data-text);
  position: absolute; inset: 0;
  mix-blend-mode: screen;
}
.glitch::before { color: #00e5ff; transform: translate(-2px, 0); animation: gl 700ms steps(2) infinite; }
.glitch::after  { color: #ff004c; transform: translate(2px, 0);  animation: gl 900ms steps(2) infinite reverse; }
@keyframes gl { 0%,100% { clip-path: inset(0 0 78% 0); } 50% { clip-path: inset(62% 0 0 0); } }
```

## 5. 文字の過剰演出

```css
/* 極太縁取り（多重 text-shadow） */
.heavy-outline {
  color: #fff;
  text-shadow:
    -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
    0 0 10px #ffee00, 0 0 24px #ff8a00;
  -webkit-text-stroke: 1px #000;   /* 併用は環境差あり（下記） */
}
```

- `-webkit-text-stroke` と `paint-order` は Chromium では併用が効かない（`research/20261116-jp-tv-grammar.md`）。太い縁が欲しいなら SVG の `text` + `stroke` + `paint-order: stroke fill` が確実。
- 1文字ずつ出す: 文字を `<span>` に分割し、`animation-delay: calc(var(--i) * 40ms)`。

## 6. 記号（射幸の見た目）

### 6.1 リール（スロット）

```html
<div class="reel" data-stage="L2">
  <div class="reel__strip" style="--n: 3">
    <span>D</span><span>O</span><span>P</span>
  </div>
</div>
```

```css
.reel { width: 96px; height: 96px; overflow: hidden; background: #111; border: 2px solid #00e5ff; }
.reel__strip { display: grid; animation: roll 420ms cubic-bezier(0.2, 0.9, 0.1, 1) 1; }
@keyframes roll { from { transform: translateY(calc(-100% * var(--n))); } to { transform: translateY(0); } }
```

- 停止は段階で決める（L4 で揃う）。揃った瞬間にフラッシュ1回＋グロー。
- 実例: dopa-pong の「DOPA SLOT」は D / O / P の3リール（`observations/O-20261116-play-dopa-pong.md`）。

### 6.2 倍率の階段

```html
<ol class="ladder">
  <li class="is-current">NORMAL <b>×1</b><small>0–4</small></li>
  <li>HYPE <b>×2</b><small>5–9</small></li>
  <li>FEVER <b>×5</b><small>10–19</small></li>
  <li>OVERDRIVE <b>×20</b><small>20–29</small></li>
  <li>DOPA MAX <b>×100</b><small>30+</small></li>
</ol>
```

- **階段を常設で見せる**のがポイント（当たってから驚かせない）。現在地を示すバーと、到達時の発光。
- 実例: dopa-pong の FEVER LEVEL は上記5段（`observations/O-20261116-play-dopa-pong.md`）。

### 6.3 保留・抽選

- 保留 = キュー。`<ol class="holds"><li>` を最大 N 個並べ、消化で減らす。
- 抽選 = 進捗バー（`0 / 100`）＋当選時の即時発動。実例: dopa-pong のアイテム抽選（`0 / 100 抽選 0件`、`当選で即発動・使用中ならストック`）。

## 7. 安全弁（演出特化でも必須）

```css
@media (prefers-reduced-motion: reduce) {
  .rainbow, .burst, .pulse { animation: none; }
  .shake, .glitch::before, .glitch::after { animation: none; }
  .flash.is-on { animation: none; opacity: 0; }
  /* 色と光は残す。動きだけ止める */
}
```

```js
// 停止手段（WCAG 2.2.2）: ループを止めて L0 に戻す
const root = document.documentElement;
document.querySelector("[data-stop]")?.addEventListener("click", () => {
  root.dataset.stage = "L0";
  root.classList.add("is-stopped");   // CSS 側で animation-play-state: paused;
});
```

```css
.is-stopped *, .is-stopped *::before, .is-stopped *::after {
  animation-play-state: paused !important;
}
```

- **止めた後もレイアウトと色は保つ**（真っ白・真っ黒にしない）。
- 音量は UI で 0 にできること。音を出さなくても成立すること。

## 8. 性能

- 動かすのは `transform` / `opacity` / `filter` に限定する（レイアウトを起こす `width`/`top` は使わない）。
- 同時に走る無限アニメは 5〜8 個まで。L4 では一時的に増えてよいが、L5 では減らす。
- 大きなぼかし（`blur(40px)` 以上）を全面にかけない。光芒は gradient か mask で作る。
