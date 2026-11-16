# 用語

| 語 | 意味 |
|---|---|
| 素材（corpus item） | 観察対象の作品1件。`corpus/items/<slug>/` にメタ情報、本体メディアは `corpus/private/` |
| 徴候（sign） | 観察で見つかった、測定・記述できる特徴の最小単位。観察ファイル内で `S-1` のように番号を振る |
| 観察（observation） | 1素材についての記録。事実・測定・印象・仮説を分離して書く |
| 傾向（pattern） | 3件以上の観察が同じ徴候を指したときに立てる、条件つきの一般化 |
| 規則（rule） | 実装可能な命令形1文＋強度＋条件。根拠IDを持つ |
| 昇格（promote） | 観察 → 傾向 → 規則 → スキルへと層を上げること。各層にゲートがある（[01-method.md](01-method.md)） |
| 強度（strength） | 規則の効き目の大きさ。1（わずか）〜5（支配的）。二値にしない |
| 反例（counterexample） | 規則や傾向が当てはまらない事例。必ず残す |
| 軸（axis） | 観察の切り口。`tempo` `intensity` `motion` `reward` `audio` `copy` `flow` `style` `restraint` `backlash` の10（[02-taxonomy.md](02-taxonomy.md)） |
| ドパガキ度 | ルブリックによる多次元スコア。単一の合計点にはしない（[../evals/rubric.md](../evals/rubric.md)） |
| 翻訳 | 印象語を測定語に置き換えること（例: 「うるさい」→ 点滅Hz・色相数） |
| 未翻訳 | まだ測定語にできていない印象。捨てずに残す |
| 記入例 | 形式を示すための架空の例。`SAMPLE.md` という名前で、ID規則に一致させない（ツールが無視する） |
