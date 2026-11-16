# references — スキル実行時に読むもの

**ここに規則をコピーしない。** 参照先への案内だけを置く。規則を2か所に持つと必ず食い違う。

## タスク別の読む順

### 新規で作る

1. [docs/00-what-is-dopagaki.md](../../docs/00-what-is-dopagaki.md) — 何を作ろうとしているか
2. [docs/02-taxonomy.md](../../docs/02-taxonomy.md) — 軸と測り方、付録の参照値
3. [rules/](../../rules/) — 採用済み規則（`status: adopted`）
4. [evals/rubric.md](../../evals/rubric.md) — 採点と制御可能性ゲート

### 既存作品のドパ度を上げる

1. 現在の作品を [observations/_TEMPLATE.md](../../observations/_TEMPLATE.md) で観察（まず測る）
2. 目標強度を決めて、差分のある軸だけ規則を引く
3. 変更前後で [evals/rubric.md](../../evals/rubric.md) を採点

### 監査する（他人・AI生成の作品）

1. [docs/02-taxonomy.md](../../docs/02-taxonomy.md) の `backlash` 軸 → [evals/rubric.md](../../evals/rubric.md) のゲート
2. ゲート違反を先に報告（点数より優先）
3. その後でドパガキ度を採点

## 規則が足りないとき

- `rules/` に該当 domain が無い / 全部 `draft` → **規則不足と明示**して制作を続ける
- 終わったら観察メモを1本残す（[observations/](../../observations/)）。傾向が3本集まったら [patterns/](../../patterns/) へ
- 勝手に「一般論の規則」を rules/ に足さない（出典と根拠IDが必要）

## 索引

`node tools/build-index.mjs` で `dist/index.md` を生成。手で索引を持たない（[ADR 0001](../../docs/04-decisions/0001-no-central-index.md)）。
