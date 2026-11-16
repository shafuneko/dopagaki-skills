# 刺激の強いUIに「制御可能性」を付ける実装カタログ

ドパガキ的な作品（速い・多い・止まらない）の刺激を保ったまま、利用者が「いつ・どれだけ・どこまで」を決められるようにするための実装メモ。要件の整理は [アクセシビリティと反発リスク](20261116-a11y-and-risk.md) 側にあり、本稿は**コピペで動く最小例**だけを置く。

- 最終更新: 2026-11-16
- 区分: **ゲート（必須）** = 満たさない限り作品として出さない / **推奨** = 余裕があれば入れる。ゲートは WCAG 2.2 の A/AA と、プロジェクトの rubric G に対応する。
- コードは依存なし。`<audio src>` や `fetch` の URL は自分の素材・API に置き換える。
- 「効く条件」はその実装が実際に効く入力・環境の範囲。「落とし穴」は、入れても壊れる／満たしたつもりになる点。

---

## 1. 一時停止・停止 — 5秒を超える自動運動

**区分: ゲート（必須）**（WCAG 2.2.2、レベル A）

**何のために**: 自動で流れる文字・カルーセル・自動更新を、読み終わる前に奪われないようにする。刺激を弱めるより先に「止められる」ことを保証する。

```html
<style>
  .ticker__track { display: flex; gap: 2rem; width: max-content;
    animation: ticker 12s linear infinite; }
  .ticker.is-paused .ticker__track { animation-play-state: paused; }
  @keyframes ticker { to { transform: translateX(-100%); } }
</style>
<div class="ticker" id="ticker"><div class="ticker__track">…流れる文字…</div></div>
<button id="toggle" aria-pressed="false">動きを止める</button>
<script>
  const box = document.querySelector('#ticker');
  const btn = document.querySelector('#toggle');
  btn.addEventListener('click', () => {
    const paused = box.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.textContent = paused ? '動きを再開' : '動きを止める';
  });
</script>
```

**効く条件**: CSSアニメ、`requestAnimationFrame` のループ、自動カルーセル、自動更新するカウンタ。停止UIはキーボードで到達でき、`aria-pressed` で状態が分かること。

**落とし穴**: `prefers-reduced-motion` を書いただけでは 2.2.2 を満たさない（OS設定は任意で、止めたい人だけが使う）。停止してもスクロール位置・再生位置を失わない。再開時に先頭へ戻さない。

**出典**: [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

---

## 2. `prefers-reduced-motion` — 止めるのではなく減らす／置き換える

**区分: 推奨**（視差・拡大・回転・画面全体の移動を含むならゲート扱い。WCAG 2.3.3 は AAA）

**何のために**: 前庭刺激の強い動きだけを消し、色の変化や短いフェードなど手がかりは残す。「動きゼロ」にすると、状態変化が分からなくなることがある。

```css
/* 視差・回転・ズームは止め、色のフェードは残す */
@media (prefers-reduced-motion: reduce) {
  .parallax { transform: none !important; }
  .spin { animation: none !important; }
  .card { transition: opacity .15s linear; }
  html { scroll-behavior: auto; }
}
```

```js
const mq = matchMedia('(prefers-reduced-motion: reduce)');
let raf = 0;
const loop = () => { /* 自前の描画 */ raf = requestAnimationFrame(loop); };
function sync() {
  cancelAnimationFrame(raf);
  document.body.classList.toggle('reduce-motion', mq.matches);
  if (!mq.matches) raf = requestAnimationFrame(loop);
}
if (mq.addEventListener) mq.addEventListener('change', sync);
else mq.addListener(sync); // 古い Safari 用
sync();
```

**効く条件**: CSSアニメだけでなく、Canvas／WebGL／`requestAnimationFrame`／JS製トランジションも止める。OS設定を変えた瞬間に追随する（`change` 購読）。

**落とし穴**: `animation-duration: .01ms !important` の一括リセットは、ローディング表示や状態変化の手がかりまで消し、`transitionend` 依存のJSを壊す。止める対象を限定する。

**出典**: [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) / [WebKit: Responsive Design for Motion](https://webkit.org/blog/7551/responsive-design-for-motion/) / [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

---

## 3. 音 — 自動再生しない、独立した音量、resume は操作起点

**区分: ゲート（必須）**（WCAG 1.4.2、レベル A。3秒超の自動音声に停止か独立音量）

**何のために**: 見知らぬ大音量で驚かせない。音の有無と大きさを利用者が決められるようにする。

```html
<audio id="bgm" src="bgm.mp3" loop preload="none"></audio>
<button id="sound" aria-pressed="false">音を出す</button>
<label>音量 <input id="vol" type="range" min="0" max="1" step="0.05" value="0.3"></label>
<script>
  const bgm = document.querySelector('#bgm');
  const sound = document.querySelector('#sound');
  const vol = document.querySelector('#vol');
  let ctx;
  sound.addEventListener('click', async () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume(); // 操作起点
    if (bgm.paused) {
      bgm.volume = Number(vol.value);
      try { await bgm.play(); } catch { sound.textContent = '再生できません'; return; }
      sound.setAttribute('aria-pressed', 'true');
      sound.textContent = '音を止める';
    } else {
      bgm.pause();
      sound.setAttribute('aria-pressed', 'false');
      sound.textContent = '音を出す';
    }
  });
  vol.addEventListener('input', () => { bgm.volume = Number(vol.value); });
</script>
```

**効く条件**: BGM・効果音・Web Audio。初期状態は無音。音量はOSの音量と独立したスライダーで、ミュートとも別に持つ。

**落とし穴**: `autoplay` 属性は失敗しうる（`play()` の Promise が reject する）。reject を握りつぶさず、再生ボタンを出す。`AudioContext` をページ読み込み時に作ると `suspended` になるので、`resume()` はクリック内で呼ぶ。

**出典**: [Chrome: Autoplay policy](https://developer.chrome.com/blog/autoplay) / [MDN AudioContext.resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume) / [W3C Understanding 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)

---

## 4. 点滅・閃光 — 1秒3回を超えない、面積と赤に注意

**区分: ゲート（必須）**（WCAG 2.3.1、レベル A）

**何のために**: 光過敏性の発作を避ける。装飾のストロボは作品の意味に不要なことが多く、削っても刺激は保てる。

```css
/* 2秒周期 = 0.5Hz。速い点滅ではなく、遅い明滅として使う */
@media (prefers-reduced-motion: no-preference) {
  .glow { animation: glow 2s ease-in-out infinite; }
}
@keyframes glow { 50% { opacity: .85; } }
```

```js
// ユーザー操作やランダム表示で連打される点滅に上限をかける
const MAX_PER_SEC = 2; // 仕様は「3回を超えない」。余裕をみて2回に固定
let last = 0;
function pulse(now, el) {
  if (now - last < 1000 / MAX_PER_SEC) return;
  last = now;
  el.classList.toggle('is-lit');
}
```

**効く条件**: グリッチ、ストロボ、色反転、赤と白の交互表示。CSSだけでなくCanvas・動画・GIFも対象。画面全体でなくても、10度視野の25%相当（約0.006ステラジアン）を超える面積なら該当する。

**落とし穴**: 「小さいから安全」は誤り（面積条件は視野角基準）。赤の点滅は別の閾値がある。3回/秒ちょうどは不可で、**1秒間に3回を超えない**が仕様。「3Hz未満」は目安として使う。目視で判断せず、疑わしければ [PEAT](https://trace.umd.edu/peat/) で測る。

**出典**: [W3C Understanding 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) / [WCAG 2.2 用語: general flash and red flash thresholds](https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds)

---

## 5. 速度の調整 — `--speed` で全体を1つの倍率に

**区分: 推奨**

**何のために**: 「速すぎる」を、作品の見た目を変えずに解消する。個別の速さボタンを並べるより、全体の倍率を1つ持つ方が破綻しにくい。

```css
:root { --speed: 1; }
.ticker__track { animation-duration: calc(12s / var(--speed)); }
```

```html
<label>速さ <input id="speed" type="range" min="0.5" max="2" step="0.1" value="1"></label>
<script>
  const speed = document.querySelector('#speed');
  const saved = localStorage.getItem('speed') ?? '1';
  speed.value = saved;
  document.documentElement.style.setProperty('--speed', saved);
  speed.addEventListener('input', () => {
    document.documentElement.style.setProperty('--speed', speed.value);
    localStorage.setItem('speed', speed.value);
  });
</script>
```

**効く条件**: すべてのアニメ時間を `calc(基準 / var(--speed))` で書く。動画は `video.playbackRate` に同じ値を入れる。範囲は 0.5〜2 倍程度にクランプする。

**落とし穴**: 一部だけ固定の `duration` だと倍率が効かない。`--speed: 0` や負値でゼロ除算・逆再生になる。`prefers-reduced-motion` と競合したら reduce を優先する。`setTimeout` でタイミングを組んでいる箇所は、速度変更でずれる。

**出典**: [MDN CSS カスタムプロパティ](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) / [MDN calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) / [MDN playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate)

---

## 6. 集中／静音モード — 刺激を止めて内容だけ読む

**区分: 推奨**（長文の読み物を含むならゲート相当）

**何のために**: 装飾・動き・音を一括で退け、本文の可読性を最優先にするモード。作品の世界観を消すのではなく、いつでも戻せる一時状態にする。

```html
<button id="quiet" aria-pressed="false">静かに読む</button>
<main>
  <div class="fx" aria-hidden="true">…装飾…</div>
  <article class="content">…本文…</article>
</main>
<script>
  const btn = document.querySelector('#quiet');
  const root = document.documentElement;
  const set = (on) => {
    root.classList.toggle('quiet', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? '通常表示に戻す' : '静かに読む';
    localStorage.setItem('quiet', on ? '1' : '0');
  };
  btn.addEventListener('click', () => set(!root.classList.contains('quiet')));
  set(localStorage.getItem('quiet') === '1');
</script>
```

```css
.quiet .fx { display: none; }
.quiet * { animation: none !important; transition: none !important; }
.quiet { scroll-behavior: auto; }
.quiet .content { max-width: 42rem; margin-inline: auto; }
```

**効く条件**: 装飾が `aria-hidden="true"` で本文と分離されている。設定は保存され、再訪時も維持される。切替後もフォーカスがボタンに残る。

**落とし穴**: 装飾に情報を載せていると、消した瞬間に意味が消える。`display: none` でレイアウトが大きく飛ぶなら、装飾の領域を確保したまま `visibility: hidden` にする。モード名は「刺激OFF」ではなく目的で名付ける。

**出典**: [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) / [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

## 7. 終端 — 無限スクロールに「ここまで」を作る

**区分: 推奨**（無限に続くフィードならゲート相当）

**何のために**: 終わりが見えない状態は、やめどきと現在地を奪う。追加読み込みを操作起点にし、終端で件数と戻り先を示す。

```html
<ol id="feed"></ol>
<button id="more">もっと見る</button>
<p id="end" role="status" hidden>ここまで</p>
<script>
  const feed = document.querySelector('#feed');
  const more = document.querySelector('#more');
  const end = document.querySelector('#end');
  let page = 0;
  const LAST = 3;
  more.addEventListener('click', async () => {
    page += 1;
    const res = await fetch(`/api/items?page=${page}`);
    const items = await res.json();
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = item.title;
      feed.append(li);
    }
    if (page >= LAST) {
      more.hidden = true;
      end.hidden = false; // role="status" が読み上げる
      end.textContent = `ここまで（全 ${feed.children.length} 件）`;
    }
  });
</script>
```

**効く条件**: 追加読み込みはボタンなど明示操作から。終端で「全N件」「先頭へ戻る」を示す。追加後もスクロール位置を勝手に動かさない。

**落とし穴**: `IntersectionObserver` だけで自動追加すると、読み終わり位置とキーボードの現在地を失う。`role="status"` の要素に `focus()` すると二重に読み上げられる。終端後に同じ内容を繰り返さない。

**出典**: [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) / [NN/g: Infinite Scrolling Tips](https://www.nngroup.com/articles/infinite-scrolling-tips/) / [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

---

## 8. キーボードとフォーカス — 閉じ込めない、見えるようにする

**区分: ゲート（必須）**（WCAG 2.1.2 レベル A、2.4.7 レベル AA）

**何のために**: マウスが使えなくても全機能に到達でき、今どこにいるかが見えるようにする。Tab巡回を独自実装で止めない。

```html
<a class="skip" href="#main">本文へ</a>
<main id="main" tabindex="-1">…</main>
<button id="open">詳細を開く</button>
<dialog id="dlg">
  <p>…</p>
  <button id="close">閉じる</button>
</dialog>
<script>
  const dlg = document.querySelector('#dlg');
  const open = document.querySelector('#open');
  open.addEventListener('click', () => dlg.showModal());
  dlg.querySelector('#close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => open.focus());
</script>
```

```css
:focus-visible { outline: 3px solid #ffd400; outline-offset: 3px; }
.skip { position: absolute; left: -9999px; }
.skip:focus { left: 1rem; top: 1rem; z-index: 10; }
```

**効く条件**: Tab／Shift+Tabで全機能に到達。Escでダイアログを閉じ、開いたボタンへフォーカスを戻す。`<dialog>` か `inert` で背景を不活性にする。フォーカスリングは背景に対して3:1以上。

**落とし穴**: `outline: none` の一括リセット。`tabindex="1"` のような正の値。`keydown` で Tab を握りつぶす独自トラップ。`:focus-visible` 非対応環境のために `:focus` も併記する。

**出典**: [W3C Understanding 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) / [W3C Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) / [MDN :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)

---

## 9. 出荷前チェック（ゲート→推奨の順）

- [ ] 5秒超の自動運動に、キーボードで押せる停止／再開があり、状態が読み上げられる
- [ ] 初期状態は無音。音量はOSと独立。`play()` の失敗を画面に出す
- [ ] 1秒3回超の閃光・赤の点滅がない。疑わしければPEATで確認した
- [ ] `prefers-reduced-motion: reduce` で視差・拡大・回転・画面移動が消え、内容は読める
- [ ] JSアニメ／Canvasも止まり、OS設定の変更に追随する
- [ ] Tab／Shift+Tabで全機能に到達し、フォーカスが見える。Escで閉じる
- [ ] 無限スクロールに終端・件数・戻る手段がある（推奨）
- [ ] 速度設定と静音モードが保存され、再訪時も維持される（推奨）

## 10. 未確認・注意

- コードは最小例であり、特定のブラウザ名・版での実行検証はしていない。`calc()` の除算、`AudioContext` の生成可否、`:focus-visible` の対応は対象環境で確認する。
- 閃光の可否は目視で判断しない。面積・輝度・周波数の測定が必要で、本書は測定手順の詳細までは扱わない。
- 「集中モード」「静音モード」は仕様用語ではない。WCAG の SC 名として引用しない。
- 出典のうち Chrome の autoplay 記事と WebKit の reduced-motion 記事は 2026-11-16 に到達を確認した。W3C と MDN は既知の安定URLだが、今回の作業では個別に再確認していない。
