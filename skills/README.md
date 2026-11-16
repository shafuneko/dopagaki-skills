# skills

制作に使うスキル。現在 **2つ** ある。どちらも Claude / DSH の `SKILL.md` 形式。

| スキル | 何をするか | いつ使うか |
|---|---|---|
| [dopagaki-production](dopagaki-production/SKILL.md) | 資料台帳（原典・該当箇所）に基づく企画・制作・検証。出典と創作の区別、未確認を未確認として扱う | 文献に当たって制作方針を決めたいとき、制作物のレビューをしたいとき |
| [dopagaki-direction](dopagaki-direction/SKILL.md) | **ドパガキ演出**の設計と実装。段階（L0〜L5）の決定、期待感の設計、虹色・発光・集中線・グリッチ・リール・抽選、タイムライン、必須ゲート | パチンコ・スロット的な演出を作るとき、既存の演出を強くするとき、派手さを設計・監査するとき |

## 2026-11-16 の変更（重要）

`dopagaki-frontend` を **`dopagaki-direction` に改名し、中身を「ドパガキ演出」特化に作り直した**。
理由: ユーザーの指示（「ドパガキ向けではなく、ドパガキ演出に特化した skills にしてほしい。パチンコ屋スロットのような虹色で激しいまぶしい演出の方向」）。

- 「作品のドパ度を上げる」から「**演出の段階を設計する**」へ重心を移した
- 追加: `references/pachinko-slot-grammar.md` / `references/spectacle-recipes.md` / `references/escalation-ladder.md`
- 追加: 規則 `R-intensity-stage-ladder` / `R-style-rainbow-hue-cycle`（どちらも draft）
- 旧名 `dopagaki-frontend` への参照が残っていたら、この名前（direction）に読み替える

## なぜ2つあるか

2つの環境が同時に骨組みを作ったため（[ADR 0004](../docs/04-decisions/0004-two-structures-merge.md)）。
**どちらを入口にするかは協議中**（統合するなら production の資料台帳を direction に取り込む案）。

- 矛盾したら [chat.md](../chat.md) で確認する。
