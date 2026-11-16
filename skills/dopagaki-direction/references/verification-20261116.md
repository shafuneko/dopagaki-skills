# 描画検証 2026-11-16（ego lite）

`tools/play-20261116/spectacle-test.html` を ego lite（Chromium 系）で開き、`tools/play-20261116/round-20.mjs` で計測した結果。

| 技法 | 結果 | 実測値 |
|---|---|---|
| 虹リング（`@property --angle` + conic-gradient） | **描画 OK** | `getAnimations()` 8件すべて running / infinite。`computedStyle.backgroundImage` に conic-gradient が出る |
| 多層 text-shadow の発光文字 | **描画 OK** | `text-shadow` が **5レイヤ**として計算される |
| 白フラッシュ（2.4s 周期・`steps(1,end)`） | **描画 OK** | スクショに閃光の瞬間が写る（1秒3回未満の設計） |
| 強度1〜5の離散切替（CSS変数 `--dur-1..5`） | **描画 OK** | 5本のバーが別々の周期で動く（3000/2000/1100/700/450ms） |
| `CSS.supports` の判定 | conic-gradient / `background-clip:text` / `mix-blend-mode:plus-lighter` / `-webkit-text-stroke` / `backdrop-filter` はすべて **true** | — |
| `prefers-reduced-motion` | テスト環境では `reduce` = **false**（既定） | reduce 時の見え方は**未計測** |

- スクリーンショット: `corpus/private/play-20261116/spectacle-test-01.png`（1695×967 / 100,987 bytes）
- 制約: **1枚・1回の計測のみ**。スクロール後、低スペック時、reduce 強制時の挙動、FPS、GPU コストは未計測。
- `mix-blend-mode:plus-lighter` が `CSS.supports` で true でも、重ね方によっては期待どおり加算されないことがある（見た目の検証は未実施）。
- この検証は `research/20261116-spectacle-techniques.md` の T01 / T05 / T09 / T17 に対応する。
  **同ファイルの他の18技法は未検証のまま。**
