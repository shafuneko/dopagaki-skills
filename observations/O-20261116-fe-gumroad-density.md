---
id: O-20261116-fe-gumroad-density
date: 2026-11-16
contributor: "research-fe"
corpus: ["20261116-fe-gumroad-density"]
axes: [intensity, style, tempo, motion]
# axes: tempo, intensity, motion, reward, audio, copy, flow, style, restraint, backlash
confidence: low
# confidence: low（1回見た） | mid（複数回・複数サイズ） | high（他の観察者も確認）
status: draft
# status: draft | reviewed | superseded
---

# O-20261116-fe-gumroad-density — gumroad.com（商品グリッドの密度＋マーキー＋150ms 応答）

## 1. 対象と見た範囲

- 素材: `corpus/items/20261116-fe-gumroad-density/`
- 取得: 2026-11-16、`https://gumroad.com/` の HTML（129,867 文字）と、そこが参照する CSS 1本
  `https://assets.gumroad.com/vite/assets/entrypoints/design-D3ivUF3s.css`（161,478 文字）を HTTP GET。
- デバイス / 画面幅: **未確認**（描画・スクリーンショットなし。静的取得のみ）
- ブラウザ: 使用せず（HTTP 取得のみ。UA は Chrome 131 を名乗る）
- 見た範囲と時間: 上記2ファイル全体を正規表現で走査。1回のみ。

> 測り方の限界: computed style ではなく**宣言ベース**。`getAnimations()` は使っていない。
> `var(--…)` の解決はしていない（カスタムプロパティは別行で集計）。適用要素数による重み付けもない。
> 数値抽出は `var()` や `rgba()` 内の数字を誤読しうるため、影・枠の値は**弱い証拠**として扱う。

## 2. 事実（測定）

| 指標 | 値 | 測り方 |
|---|---|---|
| `transition-duration:` 宣言数 | 15件（うち値あり6件） | CSS 全体に `(?<!-)transition-duration\s*:\s*([^;}]+)` |
| `transition-duration` 値の中央値 | **150ms**（min 30 / max 300） | 上記6件を ms 正規化して中央値。分布 30,100,150,150,200,300 |
| `--*duration*` カスタムプロパティ | 宣言9件 / 値8件、中央値 **150ms** | `--[\w-]*duration[\w-]*\s*:`（30,100,140,150,150,150,200,300） |
| `transition:` 省略記法 | 1件 / 値1件（100ms） | `(?<!-)transition\s*:` |
| `animation:` 省略記法 | 8件 / 時間値4件 | 同上。値は 1,100 / 20,000 / 60,000 / 80,000 ms |
| `@keyframes` | 6件 | 文字列カウント |
| `animation-iteration-count: infinite` | 0件 | 明示宣言として無し（省略記法側に埋もれている可能性） |
| `prefers-reduced-motion` | 3件 | 文字列カウント |
| `backdrop-filter` / `clip-path` / `steps(` | 2 / 2 / 1 件 | 文字列カウント |
| `mix-blend-mode` / `conic-gradient` | 0 / 0 件 | 文字列カウント |
| `box-shadow:` 宣言 | 38件（うち**ぼかし0と判定できたもの1件**） | `box-shadow\s*:` の値から長さを抽出し3番目が0か判定。`var()` で失敗しうる |
| `border:` 省略記法の幅 | 宣言5件 / 幅が取れた2件（いずれも `0.0625rem`=1px） | 値の先頭の長さを抽出 |
| `border-radius: 0` | 4件 | `border-radius\s*:\s*0(px)?\s*[;}]` |
| HTML のタグ数 / `<img>` 数 | 669 / 129 | `<[a-zA-Z]` と `<img` のカウント |
| `marquee` の語 | 6件（`<marquee>` 要素は0） | HTML 内の大小文字無視カウント |
| Lottie | `lottie` の語6件 / `https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js` | HTML 内の文字列と `<script src>` の一覧 |

## 3. 徴候

- **S-1**: ページ1枚に `<img>` が129個（タグ669個）。商品カードのグリッドが画面を埋め、余白より画像面積が勝つ（`intensity` 高）。
- **S-2**: マイクロインタラクションの宣言値が 150ms に集中（`transition-duration` 6件中2件、カスタムプロパティ8件中3件が150ms）。「押した瞬間に返る」側へ寄せてある。
- **S-3**: 常時ループの `animation` は 20〜80秒（20s/60s/80s）。**速いのではなく長い**。ゆっくり流れ続ける帯が背景に居座る。
- **S-4**: `marquee` の語が6件あり `<marquee>` 要素は0件。旧要素ではなく CSS アニメーションで実装されている。
- **S-5**: `border-radius: 0` 4件、幅が取れた枠は 1px（`0.0625rem`）2件のみ。**太い黒枠は観察できなかった**。硬さの根拠は「角丸0＋極細枠」で、極太枠ではない。
- **S-6**: `box-shadow` は38件あるが、ぼかし0と判定できたのは1件だけ。影は主にぼかし付きで、硬いドロップシャドウ主体ではない（`var()` で判定不能な分は不明）。
- **S-7**: `prefers-reduced-motion` 3件はあるが `animation-iteration-count: infinite` の明示宣言は0件。無限ループの実体は省略記法側で、上書きの可否は未確認。

## 4. 印象（主観）

- 「チープで騒がしい」— 観察者1名。ただし**画面を見ていない**。宣言値とタグ数から受けた印象で、視覚的裏付けは無い。根拠として弱い。

## 5. 仮説

- H1（テンポ）/ H4（即時性）寄り: 応答 150ms・常時ループ 20〜80s という**二層の時間**が「落ち着かないが速すぎない」感じを作る、という仮説。
- H5（反発U字）: 画像129枚と無限ループは刺激量を押し上げるが、`prefers-reduced-motion` 3件があるため「止められない」側には振り切っていない可能性。
- （仮説台帳の実物は未確認。番号は `observations/SAMPLE.md` の用法に合わせた暫定）

## 6. 反例・例外

- 「ドパガキ＝短い間隔」に反する: ループは 20〜80秒で、短い間隔の刺激ではない。**長い帯＋短い応答**の併用。
- 派手さの割に `mix-blend-mode` 0件・`conic-gradient` 0件。コラージュ的な質感は CSS ではなく画像（129枚）側で作っている可能性。
- グリッチ（`clip-path` + `steps()`）は 2件/1件で、主役ではない。
- ネオブルータリズムの定型（極太枠・硬い影）は**数値として確認できなかった**。見た目の印象で様式を決めると誤る例。

## 7. 未翻訳・次に測る

- 未翻訳: 「チープさ」。角丸0の4件か、画像129枚の解像度か、フォント種数か切り分けられていない。
- 次に測る: (1) 実ブラウザで computed style を30要素ぶん抽出し、150ms が実際に効いているか確認。(2) 20〜80s アニメの対象セレクタを特定（帯か、背景か）。(3) `var()` を解決した上で `box-shadow` のぼかし分布を再集計。(4) 129枚の平均ファイルサイズ（体感速度）。
