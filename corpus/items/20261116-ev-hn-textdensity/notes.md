# 20261116-ev-hn-textdensity — Hacker News

## 何を見たか

- `https://news.ycombinator.com/` の HTML を 2026-11-16 に HTTP GET（1回）。
- その HTML が参照するスタイルシート 1本（7,457 文字）も HTTP GET。
- 取得したのは**テキストのみ**。ブラウザ描画・スクリーンショット・動画は無し。

## どこを見れば確認できるか

- トップページ: `https://news.ycombinator.com/`
- HTML 内の `<img` の出現（2件）と `<a>`/表組みの多さ（231 href）
- 参照 CSS（HTML の `<link rel=stylesheet>`）

## 見た範囲

- HTML 33,673 文字の全体、CSS 7,457 文字の全体を正規表現で走査。1回のみ。
- 画面幅・デバイスは未確認。

## なぜドパガキ研究の素材になるか

画像をほぼ使わず、DOM と文字だけで画面を埋める例。`intensity`（刺激量・密度）が画像枚数では測れないことの対照素材になる（自己判断。第三者の「ドパい」評は見つけていない）。
