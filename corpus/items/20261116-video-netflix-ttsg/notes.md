# 20261116-video-netflix-ttsg — メモ

## これは何か

Netflix の配信向け字幕（Timed Text）スタイルガイドの英語（米国）版。
テロップの「読める上限」を数値で持っている一次資料として使う。

## 確認した箇所（2026-11-16 15:07 に web_fetch、HTTP 200）

- I.2 Character Limitation: 1 行 42 文字
- I.10 Line Treatment: 最大 2 行（＝ 1 画面 最大 84 文字）
- I.14 Reading Speed Limits: 成人向け 20 文字/秒、子ども向け 17 文字/秒

取得したページは末尾が切れたが、上記 3 節は本文で読めた（**検証済み**）。

## 補助に使った資料（検証の度合いが違う）

- BBC Subtitle Guidelines（160〜180 語/分、1 語 0.3 秒以上、1 行 37 文字）
  → BBC のページ本文は該当節がナビゲーションに埋もれて取得できず、[EBU QC](https://qc.ebu.io/references/12) と
  [Clevercast](https://www.clevercast.com/bbc-subtitling-guidelines) の引用で確認した（**部分確認**）。
- ショート動画の実務値（1〜3 語/画面、150〜200 語/分 など）は**マーケティング記事のみ**で、
  計測根拠が示されていない。`confidence: low` の根拠として観察側に明記した。

## 使わなかったもの

- 「Netflix は 5/6 秒以上 7 秒以下の表示を要求」という記述が二次資料にあるが、
  取得した TTSG 本文に対応する節を見つけられなかったので**採用していない**（未確認）。

## 権利

third-party。ガイドライン本文はコピーせず、数値と節番号のみ引用。ページの保存物はなし。

## 関連

- 観察: `observations/O-20261116-video-caption-rate.md`
- 軸: `copy`（1 画面の文字数）、`tempo`（切替回数）
