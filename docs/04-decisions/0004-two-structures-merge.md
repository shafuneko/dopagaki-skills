# 0004 並行してできた2つの構造を統合する

- 状態: 暫定（協議中）
- 日付: 2026-11-16

## 背景

2つの環境が同時に骨組みを作り、Syncthing で同じ作業ツリーに合流した。結果、役割の重なる2つの構造が同居している。

- A（lead@szk27 側）: `docs/00〜05`、`corpus → observations → patterns → rules` の昇格パイプライン、
  `tools/build-index.mjs`（front-matter から索引と整合性を検査）、`evals/rubric.md`、`AGENTS.md` / `CONTRIBUTING.md` / `chat.txt`。
- B（Codex 側）: `skills/dopagaki-production/`（資料台帳 `sources.md`、調査メモ、制作レビュー、P2P共同開発の運用案）、
  `docs/06-content-survey-codex-20261116.md`（「ドパガキ」を題名に含む実作品の調査）。

README.md も2版でき、Syncthing が `README.sync-conflict-20261116-145242-FSHC5WY.md` を生成した。

## 決定（暫定）

1. **両方残す。** B のファイルは削除・移動しない（B の側が作業中の可能性があるため）。
2. README.md は統合版1枚に戻し、競合コピーは削除する（内容は README に取り込み済み）。
3. 制作の骨格は A のパイプライン（`corpus → observations → patterns → rules`）を暫定の本線とする。
4. B の資料台帳は、A の `corpus/items/<id>/meta.yml` の出典欄と対応づけられる（原典URL・該当箇所・適用範囲の書式が近い）。
   `sources.md` は台帳として残し、二重管理にしないため **素材IDと資料IDの対応表**を将来 `corpus/` 側に置く。
5. スキル名を1つに寄せるかは合意後。それまで [skills/README.md](../../skills/README.md) で役割を明示する。

## 理由

- 片方の作業を黙って消すと、相手のコンテキストが失われ、同じ議論をやり直すことになる（[AGENTS.md](../../AGENTS.md) §2）。
- 2つの構造は競合ではなく補完にできる: B は「文献の根拠」、A は「観察と規則の昇格」。ただし入口が2つあると迷うので、暫定の本線を決めた。
- 中央索引を持たない方針（[0001](0001-no-central-index.md)）のため、ファイルを増やしても索引の衝突は起きない。

## 帰結

- `README.md` は1枚。索引に両方の入口を載せる。
- 合意が取れたらこの ADR を「採用」に更新し、統合（または片方の廃止）を別 ADR で記録する。
- 統合時は `AGENTS.md` §1 の4点セット（索引更新 / ADR / chat.txt / 相手の未コミットを壊さない）を守る。
