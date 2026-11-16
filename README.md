# dopagaki-skills

「ドパガキ」的な刺激を持つ制作物（特にフロントエンド）を、**意図して作る**ための技法集。
決まったルールのない抽象的な概念を、**素材の観察 → 傾向 → 規則 → スキル** の順で具体化して育てる。

> このリポジトリは2人（＋各自のエージェント）が P2P 同期（Syncthing）で同じ作業ツリーを共有し、Git は履歴と共有のために使う。
> 作業前に必ず [AGENTS.md](AGENTS.md) と [CONTRIBUTING.md](CONTRIBUTING.md) の「同期と衝突」を読むこと。破壊的な git 操作は相手の環境を壊す。
> 連絡は [chat.md](chat.md)（追記のみ）。

## これは何か / 何でないか

- **何か**: ドパガキ感を出すための、根拠に遡れる制作規則と、それを引くためのスキル。
- **何でないか**: 「ドパガキ」の定義を確定させる辞書。人を分類する道具。依存を煽る設計の推奨。

定義を先に固定しない。代わりに「観察できる徴候」を集め、強度つきの規則に昇格させる。
定義の扱いは [docs/00-what-is-dopagaki.md](docs/00-what-is-dopagaki.md)、方法論は [docs/01-method.md](docs/01-method.md)。

## レイヤ

| L | 層 | 場所 | 状態（2026-11-16） |
|---|---|---|---|
| L0 | 定義・前提・仮説 | `docs/` | あり（+ Codex の調査メモ） |
| L1 | 素材 | `corpus/` | 24件（実作品・実サイト・記事。`private/` にスクショ） |
| L2 | 観察 | `observations/` | 17本（すべて `draft`） |
| L3 | 傾向 | `patterns/` | 4本（すべて `draft`・confidence low/mid） |
| L4 | 規則 | `rules/` | 2本（**draft のみ。2人合意で `adopted` に上げる**） |
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
skills/dopagaki-direction/SKILL.md ← 薄い入口。詳細は references/ に置く
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
| `dopagaki-direction` | **ドパガキ演出（パチンコ・スロット系の虹色・閃光・段階演出）の設計と実装**。強度1〜5、段階ラダー、規則の引き方、制御可能性ゲート、ルブリック自己評価 | [SKILL.md](skills/dopagaki-direction/SKILL.md) |

> `dopagaki-frontend` は 2026-11-16 に `dopagaki-direction` へ改名した（「ドパガキっぽい作品を作る」から
> 「ドパガキ**演出**を作る」へ対象を絞ったため。旧名は読み替え）。references は
> [pachinko-slot-grammar](skills/dopagaki-direction/references/pachinko-slot-grammar.md) /
> [spectacle-recipes](skills/dopagaki-direction/references/spectacle-recipes.md) /
> [escalation-ladder](skills/dopagaki-direction/references/escalation-ladder.md)。

統合の経緯と暫定方針は [docs/04-decisions/0004-two-structures-merge.md](docs/04-decisions/0004-two-structures-merge.md)。
**どちらかに寄せる判断はまだしていない**（両方残す。合意したらどちらかを入口にする）。

## 索引

- [AGENTS.md](AGENTS.md) — エージェントがこのリポジトリで作業するときの規約（両側共通）
- [CONTRIBUTING.md](CONTRIBUTING.md) — 2人運用・同期・衝突回避・昇格ルール
- [chat.md](chat.md) — 共通の窓口（追記のみ）
- [docs/00-what-is-dopagaki.md](docs/00-what-is-dopagaki.md) — ドパガキとは何か、このリポジトリでの扱い
- [docs/01-method.md](docs/01-method.md) — 抽出パイプラインと品質基準
- [docs/02-taxonomy.md](docs/02-taxonomy.md) — 観察軸（何を見て、どう測るか）と外部参照値
- [docs/03-glossary.md](docs/03-glossary.md) — 用語
- [docs/04-decisions/](docs/04-decisions/) — 設計判断の記録（ADR）
- [docs/05-hypotheses.md](docs/05-hypotheses.md) — 作業仮説の台帳
- [docs/06-content-survey-codex-20261116.md](docs/06-content-survey-codex-20261116.md) — 実作品の初回調査（Codex）
- [docs/07-similar-content-codex-20261116.md](docs/07-similar-content-codex-20261116.md) — 類似コンテンツの調査（Codex）
- [research/20261116-dopagaki-direct-content-codex.md](research/20261116-dopagaki-direct-content-codex.md) — ドパガキそのもののコンテンツ調査（Codex。アプリ・PLiCy・itch.io・エッセイ・図鑑）
- [skills/dopagaki-production/references/content-cases.md](skills/dopagaki-production/references/content-cases.md) — 作品事例（Codex）
- [research/README.md](research/README.md) — 調査メモの置き場（索引の対象外）
  - [research/20261116-psych-refs.md](research/20261116-psych-refs.md) — 心理学の実証文献レビュー（実証/議論中/俗説の3分類、H1〜H7 判定）
  - [research/20261116-a11y-and-risk.md](research/20261116-a11y-and-risk.md) — WCAG・前庭障害・自動再生・規制
  - [research/20261116-neighbor-concepts.md](research/20261116-neighbor-concepts.md) — 近縁概念（brainrot / hyperpop / 脳汁 など）との差分
  - [research/20261116-game-feel.md](research/20261116-game-feel.md) — ゲームの手触り（screen shake / hitstop / イージング）
  - [research/20261116-motion-metrics.md](research/20261116-motion-metrics.md) — DevTools での動きの計測手順
  - [research/20261116-sound-design.md](research/20261116-sound-design.md) — 音（自動再生・AudioContext・無音の使い方）
  - [research/20261116-jp-web-excess.md](research/20261116-jp-web-excess.md) — 過剰表現の系譜（点滅規格・広告費・Flash・脳汁横丁）
  - [research/20261116-restraint-patterns.md](research/20261116-restraint-patterns.md) — 抑制の実装カタログ（停止・reduce・音量・点滅回避）
  - [research/20261116-copy-typography.md](research/20261116-copy-typography.md) — 煽りコピー・極太タイポ・可読性の下限
  - [research/20261116-lp-css-measure.md](research/20261116-lp-css-measure.md) — 実在LP 9件の CSS 宣言ベース実測（transition 中央値 300–500ms）
  - [research/20261116-pachinko-slot-grammar.md](research/20261116-pachinko-slot-grammar.md) — パチンコ・スロットの演出文法（保留・先読み・信頼度・虹・段階）
  - [research/20261116-spectacle-cases.md](research/20261116-spectacle-cases.md) — 実機・実作品の演出事例（エヴァ15 / パチスロナイツ / eFガンダムSEED ほか）
  - [research/20261116-spectacle-techniques.md](research/20261116-spectacle-techniques.md) — 虹色・発光・光線の CSS/SVG 実装カタログ T01–T22（**未検証**）
  - [research/20261116-quiet-hits.md](research/20261116-quiet-hits.md) — 静かなのに当たった作品（Balatro / Wordle / Lofi Girl ほか）の反例
  - [research/20261116-visual-density.md](research/20261116-visual-density.md) — 視覚的複雑さの測り方と probe.js への追加指標案
  - [research/20261116-skill-authoring.md](research/20261116-skill-authoring.md) — Agent Skills の仕様と description の書き方
  - [research/20261116-audio-loudness.md](research/20261116-audio-loudness.md) — ラウドネス正規化（Spotify −14 LUFS が一次）と密度の測り方
  - [research/20261116-jp-tv-grammar.md](research/20261116-jp-tv-grammar.md) — 日本のテレビのテロップ・SE 文法
- [corpus/README.md](corpus/README.md) — 素材の集め方
- [corpus/source-map.md](corpus/source-map.md) — 素材ID と 資料ID（`SRC-*`）の対応表
- [skills/dopagaki-production/references/sources.md](skills/dopagaki-production/references/sources.md) — 資料台帳
- [evals/rubric.md](evals/rubric.md) — ドパガキ度ルブリック草案と制御可能性ゲート
- [tools/build-index.mjs](tools/build-index.mjs) — 索引生成・整合性検査

## 現在の状態と次の一手

- 骨組みはできた。**スキルは「ドパガキ演出」特化へ転換済み**（2026-11-16）。素材・観察・傾向・規則が入り始めた段階（`node tools/build-index.mjs` → 素材 27 / 観察 20 / 傾向 4 / 規則 5、エラー0）。
- [x] 素材を20件まで増やす（手元の作品＋実在作品。`corpus/private/` に録画10〜20秒を必ず添える）
- [x] 観察を10本書く → 現在14本。徴候の語彙（S番号）を揃える
- [x] 最初の傾向を4本立てる（`P-switch-rate-over-mean` / `P-edge-burst` / `P-stop-ability` / `P-two-tier-time`。すべて `draft`・confidence low/mid）
- [x] 最初の規則を draft で2本書く（`R-tempo-switch-rate-tail` / `R-tempo-edge-burst`。**2人合意までは draft**）
- [x] パチンコ・スロットの演出文法を調査し、スキルを演出特化へ書き換える（[references/pachinko-slot-grammar.md](skills/dopagaki-direction/references/pachinko-slot-grammar.md)）
- [x] 演出特化の規則を3本追加（`R-intensity-stage-ladder` / `R-style-rainbow-hue-cycle` / `R-intensity-preflight-choice`。すべて draft）
- [x] `dopa-pong`（[O-20261116-play-dopa-pong.md](observations/O-20261116-play-dopa-pong.md)）と `ドパ麻雀`（[O-20261116-play-dopa-mahjong.md](observations/O-20261116-play-dopa-mahjong.md)）を記録
- [ ] `R-style-rainbow-two-modes`（虹＝終端記号か基調か）を実作品で検算する。虹色が「常時」か「瞬間」かを10作品で数える
- [ ] ドパ麻雀の対局画面を再取得する（重くて renderer が無応答。小さいウィンドウ / reduce 強制で再試行）
- [x] 実測を入れる（ego lite で3サイトを実行時計測 → [O-20261116-lp-runtime-check.md](observations/O-20261116-lp-runtime-check.md)。宣言ベースの中央値と実行値が一致した）
- [ ] 規則を `adopted` にする（傾向のレビュー合意 → 規則のレビュー。Codex の指摘は `## 反論・保留` に保存済み）
- [x] unityroom の実プレイ観察（doper-duper / dopa-wick / dopamine）を `observations/` に入れる（3本。**いずれも「開始」まで到達できず部分観察**である点を各観察に明記）
- [x] 面前の色刺激を実測する（ego lite でタイトル画面を8フレーム撮影 → [O-20261116-play-dopa-wick.md](observations/O-20261116-play-dopa-wick.md) §8。**色相が約2.4秒で一巡・平均彩度0.58で一定・輝度は動かない**＝点滅せずに大面積の色変化で刺激する型）
- [ ] 「色相巡回」を徴候として横断確認する（他作品・他サイトで同じ型が出るか。出れば傾向に昇格）
- [ ] 評定（ドパい度の主観スコア）を集める。**現在0件**で、傾向の体感側の裏づけが無い
- [ ] スキル2つの統合方針を決める（[ADR 0004](docs/04-decisions/0004-two-structures-merge.md)）
- [ ] `.stignore` に `.git` を入れて、Syncthing が `.git` を同期しないようにする（[tools/stignore.sample](tools/stignore.sample)）
