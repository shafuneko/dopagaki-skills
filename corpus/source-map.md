# 素材ID と 資料ID の対応表

このファイルは、**素材（`corpus/items/`）**と**資料台帳（`skills/dopagaki-production/references/sources.md` の `SRC-*`）**をつなぐだけの表です。どちらの側も書き換えません。

## なぜ必要か

2人が別々に素材を集めると、片方は「素材ID」、もう片方は「資料ID」で同じものを指します。対応表が無いと、傾向（patterns）の根拠をたどるときに「この素材の出典はどれか」が分からなくなります。

- 素材IDは `corpus/items/` のディレクトリ名（例: `20261116-work-dopagaki-check`）。
- 資料IDは台帳の見出し（例: `SRC-CODEX-001`）。
- 網羅は必須ではありません。**対応が分かっているものだけ**書きます。

## 現在の対応

| 素材ID | 資料ID | 原本（URL / 所在） | 備考 |
| --- | --- | --- | --- |
| `20261116-culture-asahi-x-analysis` | `SRC-CODEX-001` とは別系統（朝日新聞 2026-10-02 のX投稿分析） | 観察 `O-20261116-culture-origin-spread.md` 内にURL | 報道による計量。台帳への登録は未実施 |
| `20261116-culture-note-dopagaki-critique` | `SRC-CODEX-002`（周辺） | 観察 `O-20261116-culture-usage-critique.md` 内にURL | 批判の整理。台帳登録は未実施 |
| `20261116-work-sodateru-dopagaki` | — | https://apps.apple.com/jp/app/id6802966688 | 元は Codex の `docs/06-content-survey-codex-20261116.md` |
| `20261116-work-dopagaki-check` | — | https://asobi.gracetrade.co.jp/dopagaki-check/ | 同上 |
| `20261116-work-dopagaki-kenuki` | — | https://pocketful.games/g/kenuki/ | 同上 |
| `20261116-work-dpgk-ep` | — | https://linkco.re/Vpmumtsa?lang=ja | 同上（音源） |
| `20261116-work-syosetu-dopagaki` | — | https://ncode.syosetu.com/n4398mq/ | 同上（Web小説） |

「台帳登録は未実施」= 素材の `notes.md` に出典URLはあるが、`SRC-*` の番号を振っていないもの。番号を振るかは台帳の持ち主（Codex 側）が決める。こちらから勝手に `SRC-CODEX-005` 以降を埋めない（IDの衝突を避ける）。

## 自分の資料を足すとき

台帳の登録形式（`sources.md` 末尾）に従い、**自分の接頭辞**を使う。

- lead 側: `SRC-A-001`, `SRC-A-002`, …
- Codex 側: `SRC-CODEX-001`, …

台帳は `sources.md` 1枚のまま（分割すると2人で同じ行を触る）。行を足すときは末尾に追加する。
