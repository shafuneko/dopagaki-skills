# notes — 20261116-play-dopa-pong

## 何の素材か

- `https://dopa-pong.vercel.app/` — 60秒のCPU対戦ピンポン。タイトルで「⚡DOPA PONG ARCADE」「ONE BALL. ALL THE CHAOS.」「THE 60-SECOND ADRENALINE RUSH」「たった60秒。限界の、その先へ。」。
- 画面下部に **DOPA SLOT**（D / O / P の3リール、「CHARGE & SPIN」）と **FEVER LEVEL** の階段（NORMAL ×1 / HYPE ×2 / FEVER ×5 / OVERDRIVE ×20 / DOPA MAX ×100）。
- アイテム抽選（0 / 100、NEXT 0 ストックなし、「次の強化をつかめ」「当選で即発動・使用中ならストック」）。
- ポーズ画面「TAKE A BREATHER / PAUSED / ひと息ついたら、もう一度。」。

## 記録したもの

- スクリーンショット 4枚（`corpus/private/play-20261116/dopa-pong-01..04.png`）
- 観察: `observations/O-20261116-play-dopa-pong.md`

## 未取得（重要）

- **実プレイ 0 秒。** チュートリアル突破後にポーズ状態に入り、タイマーは 60 s のまま。プレイ中の刺激は観察できていない。
- canvas のピクセルは `getImageData` で全黒（WebGL のため読めていない可能性）。数値としては使っていない。
- 音は未聴取（自動再生の可否も未確認）。

## 権利

- 第三者の作品。スクリーンショットは `corpus/private/` に置き、Git には含めない（[ADR 0002](../../../docs/04-decisions/0002-media-in-private.md)）。
