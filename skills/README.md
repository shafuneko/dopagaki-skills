# skills

制作に使うスキル。現在 **2つ** ある。どちらも Claude / DSH の `SKILL.md` 形式。

| スキル | 何をするか | いつ使うか |
|---|---|---|
| [dopagaki-production](dopagaki-production/SKILL.md) | 資料台帳（原典・該当箇所）に基づく企画・制作・検証。出典と創作の区別、未確認を未確認として扱う | 文献に当たって制作方針を決めたいとき、制作物のレビューをしたいとき |
| [dopagaki-frontend](dopagaki-frontend/SKILL.md) | 観察軸・強度の決め方・規則の引き方・実装・制御可能性ゲート | 実際にHTML/CSS/JSで作るとき、既存作品のドパ度を上げるとき |

## なぜ2つあるか

2つの環境が同時に骨組みを作ったため（[ADR 0004](../docs/04-decisions/0004-two-structures-merge.md)）。
片方を消す判断はまだしていない。**どちらを入口にするかは協議中**。

- 統合する場合の候補: `dopagaki-production` の資料台帳・レビュー観点を `dopagaki-frontend/references/` に取り込み、
  スキル名を1つにする。
- 統合するまでは、両方の注意書きに従う（矛盾したら [chat.txt](../chat.txt) で確認する）。
