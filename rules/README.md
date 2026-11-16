# 規則（rules）

制作に使える**実装可能な指示**。傾向（patterns）を、数値・手段・判断基準に翻訳したもの。

## 載せる条件（[docs/01-method.md](../docs/01-method.md) の G4）

- 命令形1文で書ける（「〜する」）
- 実装手段がある（CSS/JS/構成/コピーライティング）
- **強度 1-5** がついている（1=わずか、5=支配的）
- 効く条件と、効かない/逆効果の条件がある
- 根拠となる傾向・観察のIDがある
- 2人の合意がある（[CONTRIBUTING.md](../CONTRIBUTING.md)）

## ルール

- ファイル名: `R-<domain>-<slug>.md`（domain は軸コード。例: `R-tempo-short-transition.md`）
- `strength:` は 1-5 の整数
- `status: draft` → 合意で `adopted`。使えなくなったら `retired`（消さない）
- 規則は**単独で読んで実装できる**こと。傾向の説明を読まなくても作れる粒度にする

## 書き方

1. 規則（命令形1文）
2. 実装（数値・コード例）
3. なぜ効くか（仮説。断定しない）
4. 効く条件
5. 効かない・逆効果の条件
6. 強度の根拠
7. 出典・根拠ID

テンプレート: [_TEMPLATE.md](_TEMPLATE.md) / 記入例: [SAMPLE.md](SAMPLE.md)（架空）
