# corpus/private — 素材本体の置き場

ここは **Git 管理外**（`.gitignore`）だが、**Syncthing では同期される**。

- 第三者の画像・動画・コードのコピーはここに置く。Git には載せない（[ADR 0002](../docs/04-decisions/0002-media-in-private.md)）。
- ディレクトリ名は `corpus/items/` の `id` と一致させる。
- ここの中身を要約して Git 管理下のファイルへ転記しない（観察は観察として書く。素材の複製を作らない）。
- 大きすぎるファイルは置かない（同期が重くなる）。動画は10〜20秒に切る。

```
private/
└── 20261116-example-slug/
    ├── first-view.png
    ├── scroll-01.png
    └── scroll-10s.mp4
```

この README だけは Git 管理下に置く（`.gitignore` の例外）。
