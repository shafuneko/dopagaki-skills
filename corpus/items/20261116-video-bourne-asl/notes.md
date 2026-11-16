# 20261116-video-bourne-asl — メモ

## これは何か

『ボーン・スプレマシー』の平均ショット長（ASL）が 2.4 秒であることを報じる Business Insider の記事。
本リポジトリの `docs/02-taxonomy.md` 付録に既に「ASL 2.4s / 戦闘シーケンス 0.58s」の参照値があり、
その出典の 1 つを corpus 側に固定するために追加した。

## 読んだ範囲

- 2026-11-16 15:05〜15:12 に web 検索の抜粋と web_fetch（HTTP 200、本文は途中で切れた）で確認。
- 記事本文のうち確認できた記述: 1 作目『ボーン・アイデンティティー』ASL 約 4 秒 → 2 作目 2.4 秒。
  3 作目『ボーン・アルティメイタム』は 105 分に約 3200 ショット。
- **映画本編は視聴していない。フレームも 1 枚も見ていない。**

## 確認できたこと / できなかったこと

- 確認できた: ASL 2.4 秒という**記述がある**こと、3200 ショット / 105 分という**記述がある**こと。
- 確認できなかった: 計測者・対象ショット数・カット検出の方法。「誰がどう測った 2.4 秒か」は記事にない。
  → 本リポジトリでは**文献値**として扱い、測定値としては扱わない（`observations/O-20261116-video-asl-cuts.md`）。
- 未確認: TikTok / Shorts / Reels 側の ASL。対応する一次計測を見つけられなかった。

## 権利

third-party。記事本文・映像・スクリーンショットは一切保存していない。URL と要旨のみ。
`corpus/private/` にも何も置いていない。

## 参照

- 学術側の裏づけ: [Impact of shot length and motion on cinematic tempo (KTH DiVA)](https://kth.diva-portal.org/smash/get/diva2:1704346/FULLTEXT01.pdf)
- ASL という指標への批判: [Cinemetrics — Median or Mean](https://cinemetrics.uchicago.edu/article/e8c730d6-7312-4af6-9454-f9c847789752)
- 同値を独立に記述する記事: [Filmmakers Academy](https://www.filmmakersacademy.com/glossary/average-shot-length-of-films)
