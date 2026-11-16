# references/ — ドパガキ演出の参照資料

このディレクトリは **入口**。規則の実体は [rules/](../../../rules/) にあり、ここに複製しない。

## 読む順（タスク別）

### 新規に演出を作る
1. [`escalation-ladder.md`](escalation-ladder.md) — 段階の表とタイムラインを先に埋める
2. [`pachinko-slot-grammar.md`](pachinko-slot-grammar.md) — 段階名・仕掛けの語彙を確認
3. [`spectacle-recipes.md`](spectacle-recipes.md) — 虹色・発光・光線・揺れ・文字・記号のコード
4. [`verification-20261116.md`](verification-20261116.md) — どのレシピが実際に描画確認済みか（ego lite での計測）
4. `SKILL.md` §4 の必須ゲート
5. [evals/rubric.md](../../../evals/rubric.md) で自己評価

### 既存の演出を強くする（ドパ度上げ）
1. `SKILL.md` §1→§2 で「今どの段階か」「何を予告しているか」を確認
2. [`escalation-ladder.md`](escalation-ladder.md) §5「よくある失敗」で原因を特定
3. [`spectacle-recipes.md`](spectacle-recipes.md) から1〜2技法だけ追加（全部足さない）
4. ゲートと rubric で確認

### 演出を監査する
1. `SKILL.md` §4 のゲート
2. [evals/rubric.md](../../../evals/rubric.md)（E 段階の設計 / R 反発）
3. 数値の出典は [docs/02-taxonomy.md](../../../docs/02-taxonomy.md) 付録

## この2つのスキルの関係

| スキル | 役割 |
|---|---|
| [`dopagaki-production`](../../dopagaki-production/SKILL.md) | 資料台帳に基づく企画・制作・レビュー（出典と創作の区別） |
| [`dopagaki-direction`](../../dopagaki-direction/SKILL.md) | ドパガキ演出の設計・実装（段階・虹色・発光・ゲート） |

索引は `node tools/build-index.mjs` で生成（[dist/index.md](../../../dist/index.md)）。
