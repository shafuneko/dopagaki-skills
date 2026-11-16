# 2026-11-16 ブラウザで「音で刺激する」ための設計と制約

対象: 2026-11 時点の Chrome / Safari / Firefox（デスクトップ＋iOS Safari）。ポリシーと実装は変わるので、日付とバージョンを添えて読むこと。出典 URL は各節の末尾に置く。

## 0. このメモの読み方

- **【事実】** 仕様・ベンダー文書・MDN で確認できた範囲。
- **【実務値・未検証】** 一次出典が見つからない実装上の目安。検証条件を書いていない数値はすべてこれ。
- **【落とし穴】** 実装時に踏みやすい挙動。原因が未特定のものは「未確認」と書く。
- ここに書いたことは規則ではない。規則にするなら `observations/` → `patterns/` → `rules/` の順で昇格させる。

## 1. 自動再生ポリシー — 何が許され、何が止まるか

**【事実】Chrome**
- 音ありの自動再生は、そのオリジンでユーザーが操作した / デスクトップで MEI（Media Engagement Index）の閾値を超えた / PWA としてインストール済み（モバイルはホーム画面追加）のいずれかで許可される。ミュート再生は常に許可。
- MEI の加点は「7 秒以上の再生・音がミュートでない・タブがアクティブ・動画が 200x140 px 以上」。デスクトップのみで、`chrome://media-engagement` で確認できる。プロファイルローカルで端末間同期しない。
- Web Audio も 2018-10 以降このポリシーの対象で、`AudioContext` は `suspended` で始まる。
- 出典: https://developer.chrome.com/blog/autoplay , https://developer.chrome.com/blog/web-audio-autoplay

**【事実】Safari**
- Safari 11 以降、音ありの自動再生はユーザー操作が必要。ミュートまたは音声トラックなしは許可。iOS はさらに厳しく、操作なしの音は基本的に鳴らない（Web Audio も同じ）。
- 出典: https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/ , https://webkit.org/blog/6784/new-video-policies-for-ios/

**【事実】Firefox**
- 既定で音ありの自動再生をブロックする（Firefox 66 以降）。ミュートは許可。サイト情報パネルから個別許可できる。
- `about:config` の `media.autoplay.default` は 0=許可 / 1=音ありブロック / 5=全ブロック。
- 出典: https://support.mozilla.org/en-US/kb/block-autoplay , https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

**【実装】**
- 最初のクリック／タップ／キー入力で `AudioContext` を作るか `resume()` する（`{ once: true }`）。
- 操作なしで音を出したい画面は「ミュートで開始 → 操作で解除」の 2 段構えにする。音が鳴らないことを異常と決めつけない（ミュート設定・タブミュート・端末のサイレントスイッチは検知できない）。

**【落とし穴】**
- クリックハンドラ内でも `await fetch(...)` の後だと一時的なユーザー活性（transient activation）が切れることがある。生成と `resume()` は最初に済ませる。
- ページ遷移で活性はリセットされる。SPA でも別ドキュメント扱いになる操作に注意。
- クロスオリジン iframe は親の操作をそのまま使えない（自前の操作が要る）。埋め込みプレイヤーで問題になるが、仕様上の詳細は未確認。

## 2. `AudioContext` の状態遷移と `resume()` の落とし穴

**【事実】**
- `state` は `suspended` / `running` / `closed`。Safari では `interrupted`（通話・画面ロック等）も返る。
- ユーザー操作の外で生成すると `suspended` で始まり、操作後の `resume()` で `running` になる。`resume()` は Promise を返し、`statechange` で遷移を観測できる。
- `close()` は不可逆。`suspend()` は一時停止で、ハードウェアアクセスを手放し CPU／バッテリーを節約する。
- 出典: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state , https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume , https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

**【実装】**
```js
const ctx = new AudioContext({ latencyHint: 'interactive' });
async function unlock() {
  if (ctx.state !== 'running') await ctx.resume();
  return ctx.state; // 'running' になったか必ず確認する
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) ctx.suspend();
  else ctx.resume().catch(() => {}); // 操作なしの resume は失敗しうる
});
```

**【落とし穴】**
- `resume()` が resolve しても `state` が `suspended` のままのことがある（ポリシーで拒否）。戻り値だけで成功判定しない。
- `await` を挟んだ `resume()` は iOS で効かないことがある。ハンドラ先頭で同期に呼ぶ。AudioContext は 1 ページ 1 個を基本に使い回す（同時生成数の上限は未確認）。
- 自動再生ブロック中でも `decodeAudioData` は動く。デコードは先に済ませ、再生だけ操作後にできる。

## 3. 効果音の頻度設計 — 1 秒に何個まで耐えるか

**【実務値・未検証】一次出典なし。以下はすべて目安。**
- 同時発音は 3〜5 個、新規発音は毎秒 4〜8 個まで。超えると「音の壁」になり情報が消える。
- 同じ音の連打は 50〜80 ms 未満で 1 つに融合して聞こえる。最短間隔は 60〜100 ms を確保する。
- UI 効果音の長さは 40〜120 ms。0.2 秒を超えると次の操作と重なる。
- 1 画面で使う音の種類は 1〜2 種。音色を増やすより、同じ音の高さ・長さで強弱を付ける。
- 連続通知は最初の 1 回だけ鳴らし、以降は無音＋視覚に切り替える。
- 聴覚の時間分解能（20〜30 ms 程度）は一般論で、UI での検証値ではない。

**【実装】**
```js
let active = 0;
const lastAt = new Map();
function canPlay(id, { maxVoices = 4, minGap = 80 } = {}) {
  const now = performance.now();
  if (active >= maxVoices) return false;
  if (now - (lastAt.get(id) ?? -Infinity) < minGap) return false;
  lastAt.set(id, now);
  return true; // 再生開始で active++、source.onended で active-- する
}
```

**【落とし穴】**
- 非表示タブでは `setTimeout` が間引かれ、復帰時に通知がまとめて鳴る。音のスケジュールは `ctx.currentTime` 基準にする。
- 同じ音を重ねると振幅が足し算されクリップする。同時発音を制限するか master の `GainNode` を下げる。
- ユーザーが連打できる UI では、レート制限を UI 側にも入れる（音だけ止めると反応が無いように見える）。

## 4. ラウドネス — LUFS / EBU R128 と Web の目標値

**【事実】**
- LUFS は ITU-R BS.1770 の K 特性フィルタ＋ゲーティングで測る番組ラウドネスの単位。EBU R 128 は番組ラウドネスを **-23.0 LUFS**（通常 ±0.5 LU 以内）、True Peak の上限を **-1 dBTP** と推奨する。
- Web Audio に LUFS メーターは無い。`AnalyserNode` が返すのは波形と FFT で、K 特性もゲーティングもしていない。したがって RMS から dBFS を出しても、それを LUFS と呼んではいけない。
- 測るなら DAW、`ffmpeg -af ebur128`、または K 特性＋ゲーティングを JS で実装した外部ライブラリ（実装は未検証）。
- 出典: https://tech.ebu.ch/publications/r128 , https://tech.ebu.ch/docs/r/r128-2014.pdf , https://www.itu.int/rec/R-REC-BS.1770

**【実務値・未検証】Web 画面での目安**
- 短い UI 効果音: ピークを -12〜-6 dBFS に置き、体感で調整する。ピーク基準で揃えると音量差が残るので最後は耳で決める。
- BGM／環境音: -27〜-23 LUFS 相当を目安に、効果音より 10 dB 以上下げる。マスターは True Peak -1 dBTP を超えない（合算で超えやすいので master に `GainNode` を 1 段置く）。
- 配信サービスの正規化値（-14 LUFS 前後など）は各社で変わる。Web UI の目標値としてそのまま使わない。数値は未確認。

**【実装】ピーク正規化**
```js
function peakGain(buffer, targetDb = -1) {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  }
  if (peak === 0) return 1;
  return Math.pow(10, targetDb / 20) / peak; // GainNode.gain に入れる
}
```
- `DynamicsCompressorNode` は安全策であってラウドネス正規化ではない。音色が変わり、ルックアヘッド分の遅延も出るので master の 1 段に留める。

## 5. 無音の使い方 — 対比で刺激を作る

**【設計原則（主観・実務値）】**
- 音は「状態が変わった瞬間」にだけ付ける。定常状態に音を足さない。
- 鳴らした直後に止める。100〜300 ms で release を書き、余韻を残さない。
- 連続イベントの間は 200 ms 以上の無音を空ける。埋めたくなったら音を間引く方を選ぶ。
- 成功＝音、失敗＝無音＋視覚、という対比は強い。ただし「無音＝失敗」が学習されると、音を切った人に意味が伝わらない。
- 環境音のループは刺激として弱く、長時間では注意力を削る。常時鳴らす前提にしない。

**【落とし穴】**
- 急に止めるとクリックノイズが出る。無音に落とすのもエンベロープで（§7）。
- 音が止まったのか故障なのか分からない状態を作らない。状態は視覚側で必ず示す。
- 無音区間の体感は端末・出力（スピーカー／イヤホン）で変わる。固定値にしない。

## 6. ミュート前提の設計

**【事実】**
- WCAG 2.1 1.4.2（Audio Control）: 自動的に 3 秒を超えて鳴る音には、一時停止／停止、または OS の音量と独立した音量調整を用意する。出典: https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html

**【実装】**
- 初期状態はミュート、または `localStorage` に前回設定を保存。トグルは画面の分かりやすい位置に常設する。
- ミュート中は `AudioContext` を作らない（バッテリー）。ただし初回発音にレイテンシが出るので、最初の操作時に無音で 1 回鳴らして温める。
- 音を情報の唯一の手段にしない。視覚キュー＋テキストを同じタイミングで出す（WCAG 1.1.1 の考え方）。通知音の内容は字幕／テキストでも出す。`aria-live` は読み上げの制御であって音の代替ではない。
- `prefers-reduced-motion` は動きの設定で音は制御しない。標準の `prefers-reduced-sound` は確認できず、独自トグルが必須。

**【落とし穴】**
- OS ミュート・タブミュート・iPhone のサイレントスイッチは JS から検知できない。`ctx.state === 'running'` でも聞こえないことがある。
- ミュートを「音を出さない」だけで実装すると `resume()` のタイミングを逃して次に鳴らない。「音声エンジンの状態」と「ユーザー設定」を分けて持つ。

## 7. Web Audio で短い効果音を合成する最小コード

コピペで動く最小例。クリックノイズ回避のため、ゲインは 0 からではなく極小値からランプする。

```html
<button id="play">鳴らす</button>
<script>
let ctx;
function ensureCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state !== 'running') return ctx.resume();
  return Promise.resolve();
}
function blip({ freq = 880, dur = 0.08, peak = 0.2, type = 'sine' } = {}) {
  const t0 = ctx.currentTime + 0.005; // 予約の余裕
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // exponentialRamp は 0 を目標にできない → 0.0001 から/へ
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008); // attack 8ms
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // release
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02); // release の後に停止
  osc.onended = () => { osc.disconnect(); g.disconnect(); };
}
document.getElementById('play').addEventListener('click', async () => {
  await ensureCtx();
  blip({ freq: 660 });
});
</script>
```

- `osc.stop()` を忘れるとノードが残る。`onended` で `disconnect()` する。
- 周波数を途中で動かすと「ピコッ」という UI 音になる。`frequency.exponentialRampToValueAtTime(freq * 0.6, t0 + dur)` を足す。
- サイン波は小音量でも聞こえやすい。矩形波は倍音が多く、同じ peak でも刺激が強い。

## 8. 音のファイル形式とサイズ、先読み

| 形式 | 展開後 | サイズ目安 | 向き |
| --- | --- | --- | --- |
| WAV (44.1k/16bit/stereo) | 非圧縮 | 約 176 kB/s（約 10.6 MB/分） | 短い SFX・ループ。デコード不要で確実 |
| MP3 128 kbps | 圧縮 | 約 16 kB/s（約 0.96 MB/分） | 互換性は最高。頭切れ・ループ不向き |
| Ogg Vorbis / Opus | 圧縮 | MP3 より小さい | Chrome/Firefox 可。Safari の Ogg 対応は限定的（未確認） |
| AAC / M4A | 圧縮 | MP3 同等 | Safari/Chrome 可 |

- デコード後の `AudioBuffer` は Float32。44.1 kHz・ステレオで **約 21 MB/分** をメモリに持つ。長い BGM を全部デコードしない。
- `decodeAudioData(arrayBuffer)` は Promise（古い Safari はコールバックのみ）。コンテキストの `sampleRate` にリサンプルされる。`AudioBufferSourceNode` は 1 回きりなので、再生ごとに作って `start()` する。
- 出典: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData , https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs

**【実装】先読みとキャッシュ**
```js
const cache = new Map();
async function loadSound(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio ${res.status}`);
  const buf = await res.arrayBuffer();
  const decoded = await ctx.decodeAudioData(buf); // 再利用するなら buf.slice(0)
  cache.set(url, decoded);
  return decoded;
}
```

**【落とし穴】**
- `decodeAudioData` は渡した ArrayBuffer を detach する実装がある。同じデータを再利用するなら `slice(0)` でコピーする（未確認の挙動を含む）。
- 初回デコードは数十 ms かかる。再生直前にやると最初の 1 回が欠ける。アイドル時に読む。
- CDN から読むと CORS で失敗する。`crossOrigin` とレスポンスヘッダを確認する。
- `<link rel="preload" as="audio">` はデコードまで保証しない。`fetch` → `decodeAudioData` を自分で行う。
- MP3 はエンコーダ遅延で先頭が切れる／ループが繋がらない。ループ素材は WAV か Ogg にする。

## 9. 未確認リスト（2026-11-16 時点）

- 1 秒あたりの許容発音数（§3 はすべて実務値。一次出典なし）。
- iPhone のサイレントスイッチで Web Audio が無音になる件の公式記述。
- Safari が Ogg Vorbis / Opus をどのバージョンから再生できるか。
- 1 ページで同時に作れる `AudioContext` 数の上限。
- `resume()` が `suspended` のまま resolve する条件（ポリシー別）。
- Web UI 向けのラウドネス目標値（標準が存在しない）。
- クロスオリジン iframe のユーザー活性の継承可否。

主要出典: Chrome autoplay https://developer.chrome.com/blog/autoplay / Web Audio autoplay https://developer.chrome.com/blog/web-audio-autoplay / MDN Autoplay https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay / MDN Web Audio https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices / EBU R 128 https://tech.ebu.ch/publications/r128 / WCAG 1.4.2 https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
