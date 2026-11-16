# dopagaki-skills

「ドパガキ」的な刺激を持つ制作物（特にフロントエンド）を、**意図して作る**ための技法集。
決まったルールのない抽象的な概念を、**素材の観察 → 傾向 → 規則 → スキル** の順で具体化して育てる。

> このリポジトリは2人（＋各自のエージェント）が P2P 同期（Syncthing）で同じ作業ツリーを共有し、Git は履歴と共有のために使う。
> 作業前に必ず [AGENTS.md](AGENTS.md) と [CONTRIBUTING.md](CONTRIBUTING.md) の「同期と衝突」を読むこと。破壊的な git 操作は相手の環境を壊す。
> 連絡は [chat.txt](chat.txt)（追記のみ）。

## これは何か / 何でないか

- **何か**: ドパガキ感を出すための、根拠に遡れる制作規則と、それを引くためのスキル。
- **何でないか**: 「ドパガキ」の定義を確定させる辞書。人を分類する道具。依存を煽る設計の推奨。

定義を先に固定しない。代わりに「観察できる徴候」を集め、強度つきの規則に昇格させる。
定義の扱いは [docs/00-what-is-dopagaki.md](docs/00-what-is-dopagaki.md)、方法論は [docs/01-method.md](docs/01-method.md)。

## レイヤ

| L | 層 | 場所 | 状態（2026-11-16） |
|---|---|---|---|
| L0 | 定義・前提・仮説 | `docs/` | あり（+ Codex の調査メモ） |
| L1 | 素材 | `corpus/` | 調査中（テンプレのみ・実作品の候補あり） |
| L2 | 観察 | `observations/` | 空（テンプレ＋記入例） |
| L3 | 傾向 | `patterns/` | 空 |
| L4 | 規則 | `rules/` | 空 |
| L5 | スキル | `skills/` | 2つのスキル（役割分担は [skills/README.md](skills/README.md)） |
| L6 | 検証 | `evals/` | ルブリック草案 |

```
corpus/items/<slug>/meta.yml   ← 素材1件のメタ（本体メディアは corpus/private/）
        │
        ▼
observations/O-<date>-<slug>.md  ← 1素材1ファイル。徴候に S-1, S-2… と番号を振る
        │  3件以上の観察が同じ徴候を指す
        ▼
patterns/P-<slug>.md             ← 傾向。条件と反例を必ず書く
        │  実装可能な形に翻訳し、2人で合意
        ▼
rules/R-<domain>-<slug>.md        ← 規則。強度(1-5)・条件・根拠IDを持つ
        │  タスク向けに再編
        ▼
skills/dopagaki-frontend/SKILL.md ← 薄い入口。詳細は references/ に置く
```

根拠は常に逆向きに辿れる（規則 → 傾向 → 観察 → 素材）。辿れない規則は存在してはいけない。

## 素材を1件足す（5分）

1. `corpus/items/_TEMPLATE/` を `corpus/items/<YYYYMMDD>-<slug>/` にコピーする
2. `meta.yml` を埋める（`id` はディレクトリ名と同じ）
3. 画像・動画・コードは `corpus/private/<同じslug>/` に置く（Git には入らない。同期はされる）
4. `node tools/build-index.mjs` で整合性を確認する
5. `observations/` に観察を1本書く（[_TEMPLATE.md](observations/_TEMPLATE.md) から）

## スキル（2つ。統合は協議中）

| スキル | 役割 | 入口 |
|---|---|---|
| `dopagaki-production` | 資料台帳（原典・該当箇所）に基づく企画・制作・検証。出典と創作の区別を重視 | [SKILL.md](skills/dopagaki-production/SKILL.md) |
| `dopagaki-frontend` | 観察軸・強度・規則の引き方・実装・制御可能性ゲート | [SKILL.md](skills/dopagaki-frontend/SKILL.md) |

統合の経緯と暫定方針は [docs/04-decisions/0004-two-structures-merge.md](docs/04-decisions/0004-two-structures-merge.md)。
**どちらかに寄せる判断はまだしていない**（両方残す。合意したらどちらかを入口にする）。

## 索引

- [AGENTS.md](AGENTS.md) — エージェントがこのリポジトリで作業するときの規約（両側共通）
- [CONTRIBUTING.md](CONTRIBUTING.md) — 2人運用・同期・衝突回避・昇格ルール
- [chat.txt](chat.txt) — 共通の窓口（追記のみ）
- [docs/00-what-is-dopagaki.md](docs/00-what-is-dopagaki.md) — ドパガキとは何か、このリポジトリでの扱い
- [docs/01-method.md](docs/01-method.md) — 抽出パイプラインと品質基準
- [docs/02-taxonomy.md](docs/02-taxonomy.md) — 観察軸（何を見て、どう測るか）と外部参照値
- [docs/03-glossary.md](docs/03-glossary.md) — 用語
- [docs/04-decisions/](docs/04-decisions/) — 設計判断の記録（ADR）
- [docs/05-hypotheses.md](docs/05-hypotheses.md) — 作業仮説の台帳
- [docs/06-content-survey-codex-20261116.md](docs/06-content-survey-codex-20261116.md) — 実作品の初回調査（Codex）
- [docs/07-similar-content-codex-20261116.md](docs/07-similar-content-codex-20261116.md) — 類似コンテンツの調査（Codex）
- [research/README.md](research/README.md) — 調査メモの置き場（索引の対象外）
  - [research/20261116-psych-refs.md](research/20261116-psych-refs.md) — 心理学の実証文献レビュー（実証/議論中/俗説の3分類、H1〜H7 判定）
  - [research/20261116-a11y-and-risk.md](research/20261116-a11y-and-risk.md) — WCAG・前庭障害・自動再生・規制
  - [research/20261116-neighbor-concepts.md](research/20261116-neighbor-concepts.md) — 近縁概念（brainrot / hyperpop / 脳汁 など）との差分
- [skills/dopagaki-production/references/sources.md](skills/dopagaki-production/references/sources.md) — 資料台帳
- [evals/rubric.md](evals/rubric.md) — ドパガキ度ルブリック草案と制御可能性ゲート
- [tools/build-index.mjs](tools/build-index.mjs) — 索引生成・整合性検査

## 現在の状態と次の一手

- 骨組みはできた。素材と観察が入り始めた段階（2026-11-16 時点で `node tools/build-index.mjs` → 素材 9 / 観察 7 / 傾向 0 / 規則 0）。
- [ ] 素材を20件まで増やす（手元の作品＋実在作品。`corpus/private/` に録画10〜20秒を必ず添える）
- [x] 観察を10本書く → 現在7本。徴候の語彙（S番号）を揃える
- [ ] 最初の傾向を1本立てる（3観察以上が同じ徴候を指したら）
- [ ] 最初の規則を1本、強度つきで書く
- [ ] スキル2つの統合方針を決める（[ADR 0004](docs/04-decisions/0004-two-structures-merge.md)）
- [ ] `.stignore` に `.git` を入れて、Syncthing が `.git` を同期しないようにする（[tools/stignore.sample](tools/stignore.sample)）
