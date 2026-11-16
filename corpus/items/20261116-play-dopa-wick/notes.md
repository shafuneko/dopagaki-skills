# 20261116-play-dopa-wick — 実プレイ観察メモ

- 日時: 2026-11-16 15:22–15:28（JST）
- 観察者: research-play（1人・1回）
- 環境: Windows / ego lite 0.6.3.14 / Chromium
- ゲームURL: https://unityroom.com/games/dopa-wick
- 実体: 作品ページの iframe（360x640, left 501 / top 276）。さらにページ内の「別タブで開く」から `https://79246.play.unityroom.com/?expires=...` を別タブ（p2）で開き、ビューポートを 1695x967 にして観察（unityroom のラッパーが無い状態）。
- 音: ミュートせずに観察。**音の有無は判定できなかった**。

## 何をしたか

1. 作品ページを開き、ページ全体のスクショ（dopa-wick-01.png）。
2. iframe のキャンバスが 360x640 と小さく、下部が unityroom のパネルに隠れるため「別タブで開く」を使用 → フルスクリーンのゲーム画面を得た。
3. タイトル画面（dopa-wick-02.png）を撮影。中央に白い吹き出しの手書き風ロゴ「ドパWick」、虹色のグラデーション背景、浮遊する爆弾アイコン、ボタン「ポイ活開始」「遊び方」、右下に Credit、右上に歯車。
4. 「ポイ活開始」ボタン（画面上の座標 810, 731）を**計5回以上クリック**（マウス）。→ 画面はタイトルのまま。
5. 0.65秒間隔で15点をタップ（合計16.1秒、座標は canvas 矩形内でばらつかせた）。→ 14/15 で画像ハッシュが変化したが、**すべて背景グラデーションの常時アニメによる**もので、画面遷移は起きなかった。
6. タッチ入力を試すため `Emulation.setTouchEmulationEnabled` + `Input.dispatchTouchEvent` を CDP 経由で送信。→ 同じく無反応。
7. canvas の状態を `page.evaluate` で診断（round-09）:
   - `id="unity-canvas"`、バッキングストア 816x1451、CSS 矩形 `[575.67, 0.17, 544, 967]`（1.5倍スケール）
   - `document.hasFocus()` = true
   - `typeof window.unityInstance` = "undefined"
   - DOM イベントは**座標どおり到達していた**: `[{"t":"pointerdown","x":810,"y":731,"tag":"CANVAS","id":"unity-canvas"},{"t":"mousedown",...},{"t":"mouseup",...},{"t":"click",...}]`
8. 「遊び方」（ヘルプ）のダブルクリックも試そうとしたが `page.mouse.dblclick is not a function`（ego の API に存在しない）で失敗。
9. 15:28 に打ち切り（1作品あたりの時間上限に達した）。

## 見えたもの

- タイトル画面のみ。虹色グラデーションの背景が常時アニメーションしており、**タイトル画面ですでに「+1000」のポップアップが湧いていた**（ゲーム開始前から報酬演出が動いている）。
- 爆弾アイコンがゆっくり浮遊。背景色は数秒周期で変化。
- 画面に「ポイント」等の数値 HUD はタイトルでは確認できず。

## 測れなかったこと

- プレイ時間・ポイント増加速度・ミニ窓の数・ボーナス出現頻度・爆発までの秒数・リトライ間隔: プレイ状態に到達できなかったため**すべて未測定**。
- 音の有無: DOM に `<audio>` が無く（Unity WebAudio）、聴取もできないため不明。
- 停止手段（ポーズ/ミュート）: タイトル画面の右上歯車は未操作。プレイ中の停止手段は未測定。

## 未解決（次にやる人へ）

- canvas に pointerdown/mousedown/click が届いているのに Unity 側が反応しない理由は未特定。`window.unityInstance` が undefined なので、Unity の入力購読が初期化前に終わっている、あるいは `unity-canvas` とは別の要素がヒットテストを奪っている可能性がある。DevTools の Elements で `elementFromPoint(810,731)` を確認するのが次の一歩。
- 同じ ego 環境でも DopaMINE では**クリックでゲームが開始できた**（observations/O-20261116-play-dopamine.md 参照）。したがって「ego のクリックが届かない」わけではなく、作品側の要因である可能性が高い。

## 生データ

- round-04〜11 のログ: `tools/play-20261116/round-0*.log`（round-05.log にゲーム紹介文の全文、round-09 に canvas 診断結果）
- スクリーンショット原本: `corpus/private/play-20261116/dopa-wick-0*.png`
