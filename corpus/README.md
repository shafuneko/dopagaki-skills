# 素材（corpus）

観察対象の作品を1件1ディレクトリで登録する。ここに置くのは**メタ情報だけ**。本体メディアは `corpus/private/` に置く（[ADR 0002](../docs/04-decisions/0002-media-in-private.md)）。

## 構成

```
corpus/
├── items/
│   └── 20261116-example-slug/
│       ├── meta.yml     ← 必須。ここが台帳
│       └── notes.md     ← 拾った理由・見た範囲・注意
└── private/             ← Git 管理外。同期はされる
    └── 20261116-example-slug/
        ├── first-view.png
        ├── scroll-01.png
        └── scroll-10s.mp4
```

## 1件足す手順

1. `corpus/items/_TEMPLATE/` を `corpus/items/<YYYYMMDD>-<slug>/` にコピー
2. `meta.yml` を埋める（`id` はディレクトリ名と完全一致させる）
3. メディアを `corpus/private/<同じslug>/` に置き、`media:` に相対パスを列挙
4. `node tools/build-index.mjs` で整合性確認
5. 観察を書く（[observations/](../observations/)）

## 何を撮るか（観察に足る素材）

静止画1枚では `tempo` `motion` `audio` が測れない。最低限:

- ファーストビュー（初期表示）のフルスクショ
- スクロール/操作の**録画**（10〜20秒）— 時間軸が最重要
- 主要な状態（ホバー、モーダル、遷移後）のスクショ
- コードが読める場合は DOM/CSS の該当部分（DevTools のコピー）

## 命名

- `id` / ディレクトリ名: `<YYYYMMDD>-<英小文字スラッグ>`（例: `20261116-neo-brutalist-lp`）
- 連番は使わない（2人の採番が衝突するため。→ [CONTRIBUTING.md](../CONTRIBUTING.md)）

## 権利

- 第三者の素材: `rights: third-party`、`source` に出典URL、`author` に作者。本体は `private/` のみ。
- 自分の作品: `rights: own`。
- 引用は最小限。長い文章の転載はしない。

## やらないこと

- 出典不明の素材を登録する（後から検証できない）
- `private/` の中身を要約して Git 管理下のファイルに転記する
- 1つのディレクトリに複数作品を詰める（1件1ディレクトリ）
