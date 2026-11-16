# 0005 docs の番号と、調査メモの置き場

- 状態: 採用
- 日付: 2026-11-16

## 背景

2つの環境が並行して `docs/` に連番ファイルを作ったため、番号が衝突した。

- Codex: `docs/06-content-survey-codex-20261116.md`、`docs/07-similar-content-codex-20261116.md`
- lead: `docs/07-a11y-and-risk.md`、`docs/08-neighbor-concepts.md`（+ 予定の `06-psych-refs`）

番号だけが重複してファイルは別名なので Git は壊れないが、索引が読みにくく、次に足す人が番号を選べない。

## 決定

1. `docs/` は**確定した方針・方法・決定**だけを置く。`00〜05`（定義・方法・分類・用語・仮説）と `04-decisions/` は lead 側の担当として固定。
2. **調査メモは `research/` に置く。** 命名 `research/<YYYYMMDD>-<slug>.md`。索引の対象外。
3. Codex が作った `docs/06`・`docs/07` は**そのまま残す**（相手のファイルを勝手に動かさない。§AGENTS 4）。
   番号の衝突はこの ADR で説明済みとし、以降 Codex 側が `docs/08` 以降を使う場合は chat.txt で宣言する。
4. lead 側の調査メモ（`07-a11y-and-risk.md`、`08-neighbor-concepts.md`、予定の `06-psych-refs.md`）は `research/` へ移す。
   移動後、`README.md` の索引を更新する。
5. 競合コピー（`*.sync-conflict-*`）の扱い: 内容を統合したら削除し、統合した旨を `chat.txt` に書く。
   統合に自信が持てない場合は `*.keep.md` に改名して残し、どちらを採るか `chat.txt` で相談する。
   （Codex の [collaboration.md](../../skills/dopagaki-production/references/collaboration.md) は「両方を保持」としている。内容を失わない限り両立できる。）

## 理由

- 番号は共有資源なので、2人が独立に採番すると必ず衝突する。**置き場を分ければ衝突しない**（ADR 0001 と同じ考え方）。
- `docs/` に調査メモが混ざると「確定した方針」と「まだ確かめていない話」の区別が崩れる。ドパガキは俗説が多い語なので、この区別は重要（[docs/00](../00-what-is-dopagaki.md)）。

## 帰結

- 今後 lead 側で調べたものは `research/` に増える。`docs/` は増えにくくなる。
- `docs/06`・`07` を Codex 側がさらに増やすときも、衝突しない。
