# スキル記述の改善材料 — Agent Skills 仕様の一次情報と、現行2スキルへの提案

- 作成: 2026-11-16
- 目的: `skills/dopagaki-frontend/SKILL.md` と `skills/dopagaki-production/SKILL.md` の記述を直すための材料集め。**この文書は提案までで、既存ファイルは一切変更していない。**
- 調査方法: 公式ドキュメントと公開リポジトリを `web_fetch` で取得（HTTP 200 を確認）。取得元はすべて末尾の「出典」に記載。
- 表記ルール: **【事実】** 取得した一次情報に書かれていたこと / **【他者解釈】** 公式・公開リポジトリの主張や推奨（根拠の説明が薄いもの） / **【推測・仮説】** 本リポジトリへの当てはめで、まだ検証していないもの / **【提案】** 修正案。
- 数値は「読んだ行数」「公式が明記した上限」以外は書かない。文字数の実測はしていない（後述の環境制約）。

---

## 1. 公式仕様（front matter と読み込みの仕組み）

出典: [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) / [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### 1.1 front matter の制約【事実】

`SKILL.md` は YAML front matter が必須で、`name` と `description` の2つが要求される。

| フィールド | 制約 |
|---|---|
| `name` | 最大64文字。小文字英字・数字・ハイフンのみ。XMLタグ不可。予約語 `anthropic` / `claude` を含められない |
| `description` | 非空、**最大1,024文字**。XMLタグ不可。「何をするか」と「いつ使うか」の両方を含める |

- `name` は動名詞形（`processing-pdfs` のような gerund）が推奨。`helper` / `utils` / `tools` のような曖昧な名前は避ける。【他者解釈（公式の推奨）】
- `description` は**三人称**で書く。公式が挙げる良い例は `Processes Excel files and generates reports`、悪い例は `I can help you process Excel files` と `You can use this to process Excel files`。【事実】
- ただし公開スキル集の実例は `Use this skill whenever …` という命令形も多用しており、公式ドキュメント内でも両方の書き方が併存している（§2）。【事実（実例の観察）】

### 1.2 progressive disclosure の3層【事実】

| 層 | 何が読まれるか | いつ | 目安 |
|---|---|---|---|
| L1 metadata | `name` + `description` のみ | セッション開始時、常時 | 1スキルあたり約100トークン |
| L2 本文 | `SKILL.md` 本体 | スキルが起動（trigger）したとき | **5kトークン未満** |
| L3 参照 | `references/` などの追加ファイル、`scripts/` | 本文から明示的に参照されたときだけ | 実質無制限（script は実行され、本文はコンテキストを消費しない） |

- 公式ブログの表現: "the amount of context that can be bundled into a skill is effectively unbounded."（[Equipping agents for the real world with Agent Skills](https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills)）【事実（引用）】
- 同ブログは「新入社員のオンボーディングガイド」の比喩で、L1 の description が「このスキルを開くかどうか」の唯一の判断材料だと説明している。【他者解釈】

### 1.3 本文の書き方（best-practices の要点）【事実】

- 本文は **500行未満** を目安にする。超えるなら分割する。
- **参照は `SKILL.md` から1階層だけ**にする。入れ子の参照（参照先がさらに別ファイルを指す）は、モデルが `head -100` のような部分読みをして情報を取りこぼす。
- 100行を超える参照ファイルは、冒頭に目次を置く。
- 時間に依存する情報（「現在の状態」「今は未確定」など）は本文に置かない。変化しない記述と分ける。
- 用語を統一する。同じものを別名で呼ばない。
- パスは forward slash で書く（Windows 形式のバックスラッシュを書かない）。
- 選択肢を並べすぎず、既定値を1つ示す。
- `scripts/` は「実行するもの」か「読むもの」かを明示する。
- 検証ループ（validator → 修正 → 再実行）を手順に含める。
- 出力テンプレートは「厳格に従う版」と「柔軟に使う版」を書き分ける。
- Input → Output の例を入れると理解が早い。

### 1.4 セキュリティ【事実】

信頼できるスキルだけを使う。同梱の script / 参照ファイルは導入前に監査する。

---

## 2. `description` とトリガー（起動しやすさ）

### 2.1 公式の指針【事実】

- 「何をするか」と「いつ使うか」の**両方**を書く。
- 三人称で書く（§1.1）。
- 具体的なキーワード（ファイル拡張子、タスク名、ユーザーが言いそうな語）を含めると一致しやすい。【他者解釈（公式ドキュメントの記述を要約）】

### 2.2 公開スキル集の実例（`anthropics/skills` の main を raw で取得）【事実】

| スキル | description（原文） | 観察 |
|---|---|---|
| `pdf` | "Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill." | 対象操作を**網羅列挙**し、最後に「.pdf と口にしたら使え」と強い命令で締める。取りこぼし（undertrigger）対策の典型 |
| `frontend-design` | "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults." | 短い。「何を」（visual design）/「どの文脈で」（new UI or reshaping existing）/「何を避けるか」（templated defaults）が1文ずつ入っている |
| `brand-guidelines` | "Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply." | 1文目が「何をするか」、2文目が「いつ使うか」の**役割分担**が明確。三人称 + `Use it when` の併用 |

- 3例に共通する構造: **(1) 何をするか → (2) 対象・文脈の列挙 → (3) 使う条件の言い切り**。
- ファイル構成の実例: `pdf` は `SKILL.md` + `FORMS.md` + `REFERENCE.md` + `scripts/`（1階層参照）。`frontend-design` は本文1ファイルのみ（参照なし）で、本文に「AI生成デザインの典型5パターン」の**アンチパターン列挙**と「plan → brief と照合 → 実装 → 自己批評」の**2パス手順**を持つ。【事実（本文を読んだ範囲）】

### 2.3 「pushy に書く」という助言【他者解釈】

DSH に同梱されている `skill-creator` スキルは、description を「pushy（押しが強い）」に書くよう指示している。理由は **undertrigger**（本来使うべき場面で使われない）の方が overtigger より起きやすいという前提。例文として "Make sure to use this skill whenever the user mentions …" を挙げている。
※ これは同梱スキルの記述であり、公式ドキュメントの文言ではない。統計的な裏付けは示されていない。

### 2.4 トリガーしやすい/しにくい書き方（まとめ・【推測・仮説】を含む）

| 効きやすい | 効きにくい |
|---|---|
| ユーザーが実際に口にする語を列挙（「もっと派手に」「地味」「インパクトが足りない」） | 内部用語だけ（「ドパ度」「軸」「強度」） |
| 成果物の形式を書く（LP、UI、記事、レビュー） | 「制作物」「作品」など範囲が広すぎる名詞 |
| 隣接スキルとの**切り分け**を1文入れる | 2スキルが同じ語（「ドパガキ」）を含み、どちらでも発火する |
| 「〜と言われた場合」と口語の引用を入れる | 「〜を設計したい場合」のような抽象条件だけ |

---

## 3. 本文構成の定番と、長さの弊害

### 3.1 定番の要素【他者解釈（公式 best-practices と公開スキルの共通部分）】

1. 何をするスキルか（1〜2文）
2. 前提・入力（何が渡されていると仮定するか、足りないときは何を確認するか）
3. 手順（番号付き。判断が必要な箇所は判断基準を添える）
4. 判断基準・強度やモードの選び方（表が有効）
5. アンチパターン（「よくある失敗」表。`frontend-design` もこの形）
6. 出力形式と完了条件（何を返すか、何をもって終わりか）
7. 失敗時・想定外時の挙動（規則がない、資料がない、指示が矛盾する）
8. 参照ファイルへの導線（どこを、どの順で読むか）

### 3.2 長さの弊害【事実 + 推測】

- 長すぎる: 本文は起動のたびにコンテキストを消費する。公式は5kトークン未満・500行未満を目安とし、超える場合は分割を指示している。【事実】
- 短すぎる: 判断基準がなく、モデルが一般論で埋める。本リポジトリの `AGENTS.md` §7 が禁じている「規則不足を一般論で埋める」挙動は、まさにこれ。【推測・仮説（当てはめ）】
- 中間の落とし穴: **手順はあるが出力形式と完了条件がない**スキルは、毎回違う成果物を返す。【推測・仮説】

---

## 4. スキルの評価（eval とトリガー精度）

### 4.1 公式の eval-first 手順【事実】

1. まず**スキルなし**で代表タスクを実行し、失敗を記録する。
2. 3シナリオ程度のテストケースを作る。
3. ベースライン（スキルなし）と比較する。
4. 最小限の指示を書いて通す。足りない分だけ足す。
5. 反復する。

- eval ケースの形式は JSON で、`{"skills": ["pdf-processing"], "query": "...", "files": ["..."], "expected_behavior": ["..."]}` のような構造。【事実】
- **公式の eval 実行基盤は存在しない**。ドキュメントに "There is not currently a built-in way to run these evaluations" と明記されている。【事実】
- 反復の進め方として、Claude A（スキル作者）と Claude B（スキル利用者）を分ける方法が紹介されている。B にはスキルだけを渡し、A は B の失敗を見て直す。【他者解釈（公式の提案）】
- 観察すべきポイント: 想定外の探索順 / 参照ファイルの見落とし / 特定の節への過依存 / 一度も読まれない同梱ファイル。【事実】

### 4.2 トリガー精度の測り方（`skill-creator` の方式）【他者解釈】

- `should_trigger` 8〜10件 + `should_not_trigger` 8〜10件の計20クエリを作る。
- train 60% / test 40% に分ける。
- 各クエリを3回実行し、発火率を見る（ばらつきの把握のため）。
- `should_not_trigger` には**near-miss**（隣接するが別スキルの領域）を入れる。
- 単純な一問一答はスキルが発火しにくいので eval に不向き。
- 同梱の `scripts.run_loop` で description を反復最適化できる、とされている（本リポジトリでは未検証）。

### 4.3 本リポジトリ向けの最小評価案【提案】

- `skills/evals/triggers.md` に、`should_trigger` / `should_not_trigger` を各10件、日本語の口語で書く。
- 2スキルが競合する near-miss（例: 「ドパいLPの作り方の記事を書いて」= production / 「ドパいLPを作って」= frontend）を必ず含める。
- 記録は「クエリ / 期待 / 実際に起動したスキル / 判定」の4列。3回試行はコストが高いので、まず1回で当たり判定を見る。

---

## 5. 現行2スキルへの提案

### 5.1 現状（読み取りで確認した事実）

| 項目 | `dopagaki-frontend` | `dopagaki-production` |
|---|---|---|
| 行数 | 79行 | 30行 |
| 見出し構成 | 0.前提 / 1.強度 / 2.軸 / 3.規則を引く / 4.実装+必須ゲート / 5.自己評価 / 6.記録 / よくある失敗 | 現在の状態 / 制作の進め方（5手順）/ 資料から指針を育てる / 二人で開発する場合 |
| 参照 | `rules/` `observations/` `docs/` `evals/rubric.md` `patterns/`（いずれも `../../` の1階層） | `references/` 配下4ファイル（1階層） |
| description の長さ | 日本語で約170字相当（未計測） | 日本語で約80字相当（未計測） |
| 強み | 「規則の実体は rules/ にあり、ここに書き写さない」と明言。progressive disclosure に沿っている。失敗表が具体的 | 出典と創作の区別、未確認を未確認として扱う方針が手順に埋め込まれている |

### 5.2 (a) description の問題

**dopagaki-frontend**

1. **「何をするか」が抽象的。** 「手順と規則の引き方」は方法の説明で、成果物（何が出てくるか）が書かれていない。`pdf` の例のように「何を作る/何ができる」を先に置く方が一致しやすい。
2. **1文が長く、条件が「または」で連結されている。** 「実装時に、〜と言われた場合、または〜したい場合に使う」は、読点が多くて走査しづらい。文を分ける。
3. **ユーザーの口語が不足。** 「ドパガキ」「ドパい」「刺激が強い」「癖になる」「祭り感」はあるが、「もっと派手に」「地味」「インパクトが足りない」「動きが少ない」のような**不満の言い方**が無い。
4. **隣接スキルとの切り分けが無い。** `dopagaki-production` と両方が「ドパガキ」を含むため、資料調査の依頼でも frontend が発火しうる。

**dopagaki-production**

1. **トリガー語が薄い。** 「ドパガキを題材・表現方針とする制作物」は、ユーザーが実際に使う言い回しではない。「資料に当たって裏を取る」「出典を付ける」「根拠を示してレビュー」といった**行為の言い方**が無い。
2. **成果物の形式が不明。** 「制作物」だけでは、記事なのか企画書なのか台本なのか分からない。範囲を狭めるか例を添える。
3. **切り分けが無い。** Web 実装の依頼でも production が発火しうる。
4. 三人称・1024字以内という機械的な制約は満たしている（と読める）。

### 5.3 (b) 本文の冗長な箇所

**dopagaki-frontend**

1. §6「記録」の3点目（骨組みを変えたときの4点セット: 索引更新 / ADR / chat.txt / 相手の未コミット）は、**制作時に毎回読む必要がない**リポジトリ運用規約。`AGENTS.md` に既にあるので、ここでは「骨組み自体を変える場合は AGENTS.md に従う」の1行で足りる。
2. §2 の10軸の列挙は `rules/` の索引と重複しやすい。軸の一覧そのものは必要だが、各軸の説明を足していくと二重管理になる（現状は名前だけなので許容範囲）。
3. §3 は3行しかなく、実質「rules/ を見ろ」で終わっている。「効かない・逆効果の条件」を確認する手順が具体化されていない（§5.4 参照）。

**dopagaki-production**

1. §「現在の状態」は**時間依存情報**（「初回の公開資料調査を実施済み」「未確定」）。公式 best-practices は時間依存情報を本文に置かないよう指示している。参照ファイル側か、日付付きの別節に移す。
2. 手順の各項目が1段落で長く、条件分岐（資料がある/ない）が文の中に埋没している。「資料がある場合」「ない場合」を分けて箇条書きにする。
3. 「資料から指針を育てる」節は、手順4〜5と役割が近い。統合するか、参照ファイルに移せる。

### 5.4 (c) 足りない要素

両方に共通して欠けているもの:

1. **入力の前提。** 何が渡されていると仮定するか（既存コード / デザイン / 対象読者 / 制約 / 納期）。足りないときに何を確認するか。production は手順1で触れているが、frontend には無い。
2. **出力形式と完了条件。** 何を返すか（HTML/CSS の差分か、ファイルか、制作メモか）。どこまでやったら終わりか。frontend §6 は「記録」だが、成果物の形式ではない。
3. **失敗時・想定外時の挙動。** frontend は「規則不足」を明示する方針があるが、production は「資料がない段階では試作」だけで、**指示が矛盾する / 参照ファイルが読めない / 前提が崩れた**場合の扱いが無い。
4. **参照ファイルの読み順。** frontend は §3 で `rules/` に直行するが、`skills/dopagaki-frontend/references/README.md` に「タスク別の読む順」がある。SKILL.md から「まず references/README.md を読む」と1行入れると迷わない（1階層ルールは守れる）。
5. **Input → Output の例。** 短い例が1つも無い。公式は例を推奨している。
6. **トリガー評価。** `evals/rubric.md` は成果物の採点基準だが、スキルが起動するかどうかの評価は無い（§4.3）。

### 5.5 修正案テキスト（提案。ファイルは変更していない）

**dopagaki-frontend の description 案**

```yaml
description: ドパガキ感のある Web フロントエンド（LP・UI・インタラクション・モーション・コピー）を、強度1〜5の設計と rules/ の規則から実装する。ユーザーが「ドパガキ」「ドパい」「刺激が強い」「癖になる」「祭り感」と言ったとき、または「もっと派手に」「地味」「インパクトが足りない」「動きが少ない」と不満を言ったときに使う。新規制作にも既存サイトのドパ度上げにも使える。記事・資料調査が主目的なら dopagaki-production を使う。
```

**dopagaki-production の description 案**

```yaml
description: ドパガキを題材にした制作物（記事・企画・レビュー）を、参照資料の原典箇所と対応づけて企画・執筆・改稿する。ユーザーが「資料に当たって裏を取りたい」「出典を付けて書きたい」「根拠を示してレビューして」と言ったとき、または資料台帳の整理を求められたときに使う。コードとしての Web 実装が主目的なら dopagaki-frontend を使う。
```

**frontend に足す節の案（§0 の後ろ）**

```markdown
## 0.1 入力と出力

- 入力: 対象（新規 / 既存 URL・コード）、形式（LP / UI / 記事埋め込み）、対象読者、避けたい印象、制約（納期・技術）。
- 欠けていて制作判断が変わるものだけ確認する。それ以外は仮定を明示して進める。
- 出力: 実装（HTML/CSS/JS）と、適用した規則ID・変えた数値・判断理由を短く添えたメモ。
- 完了条件: §4 の必須ゲートをすべて満たし、§5 の採点を1回行い、メモを渡した時点。
```

**production に足す節の案**

```markdown
## 失敗したときの扱い

- 参照ファイルが読めない / 原典が未入手: その資料を根拠に使わない。制作メモに「未確認」と書く。
- ユーザーの指示が資料と矛盾する: どちらを採るかを明示し、採らなかった方を制作メモに残す。
- 資料が無い: 構成案・試作まで。ドパガキ固有の表現は未確定として扱う（現行の手順4と同じ）。
```

---

## 6. 未確認事項

- **文字数の実測**: `description` の文字数は未計測。この環境では `ops_bash` が不調で `wc` を使えず、`ops_write_file` は拒否されるため、`write` ツールのみで作業した。公式上限（1,024字 / name 64字）に対する余裕は「読んだ限り明らかに超えていない」という目視判断で、計測値ではない。
- **`skill-creator` の `scripts.run_loop`**: 同梱スキルの記述を読んだだけで、実行していない。トリガー最適化が実際にどの程度効くかは未検証。
- **`agentskills.io`（2025-12-18 公開のオープンスタンダード）**: ブログからのリンクは確認したが、ページ本文は取得していない。仕様の差分は未確認。
- **`anthropics/skills` の全スキル**: `pdf` / `frontend-design` / `brand-guidelines` の3つだけ本文を取得。他のスキル（`pptx` など）は概要のみで、本文は未確認。
- **overtrigger の実害**: 「pushy に書く」の根拠（undertrigger の方が多いという主張）の出典は同梱スキル内で、原典は未確認。
- **本リポジトリでの効果**: §5.5 の修正案は、まだトリガー評価をしていない。効果は未測定。

---

## 7. 出典

- Anthropic, *Agent Skills overview* — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Anthropic, *Skill authoring best practices* — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Anthropic, *Equipping agents for the real world with Agent Skills* — https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills
- `anthropics/skills`（main）— https://github.com/anthropics/skills
  - `skills/pdf/SKILL.md` — https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md
  - `skills/frontend-design/SKILL.md` — https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md
  - `skills/brand-guidelines/SKILL.md` — https://raw.githubusercontent.com/anthropics/skills/main/skills/brand-guidelines/SKILL.md
- Agent Skills オープンスタンダード — https://agentskills.io/ （本文未取得）
- リポジトリ内: [skills/dopagaki-frontend/SKILL.md](../skills/dopagaki-frontend/SKILL.md) / [skills/dopagaki-production/SKILL.md](../skills/dopagaki-production/SKILL.md) / [skills/README.md](../skills/README.md)
