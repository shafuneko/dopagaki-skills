# 2026-11-16 「音がドパい」を測る — ラウドネス・密度・構造の計量メモ

対象: 2026-11 時点で確認できた仕様・ベンダー文書・計測ツール。**数値には必ず「仕様値か／誰が測ったか／経験則か」を添える。**
このメモは調査メモであり規則ではない（[research/README.md](README.md)）。規則化は観察 → 傾向 → 規則の順。

## 0. 読み方と、既存メモとの分担

- **【仕様値】** 規格・ベンダー文書に書かれている値。
- **【実測】** 誰かが測って公開した値。測り方と母数が分かる範囲で書く。
- **【経験則・未検証】** 一次出典が見つからない実務上の目安。検証条件が無いものは全部これ。
- **【提案】** 公開計測が見つからないので、こちらで測り方を設計したもの。

**既存の [20261116-sound-design.md](20261116-sound-design.md) との分担**: あちらは「自動再生ポリシー・`AudioContext` の状態・ミュート前提の設計・最小実装コード」。こちらは**測る側**（規格の数値、プラットフォーム目標、計測コマンド、密度・構造の指標）。第 8 節だけ実装の含意に触れるが、コードはあちらに置く。

## 1. ラウドネスの仕様値 — LUFS / True Peak / LRA

**【仕様値】ITU-R BS.1770-5（2023-11 承認、現行）**
- 番組ラウドネスは K 特性フィルタ後の二乗平均から `LK = -0.691 + 10 log10(Σ Gi·zi)` で求める（チャンネル重み `Gi`）。
- ゲーティングは **400 ms のブロックを 75 % 重複**で走査。絶対ゲート **-70 LUFS**、相対ゲート **-10 LU**。
- True Peak は連続時間波形のピークを**オーバーサンプリングで推定**した値（dBTP）。
- 出典: https://www.itu.int/rec/R-REC-BS.1770-5-202311-I/en , PDF https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-5-202311-I!!PDF-E.pdf

**【仕様値】EBU R 128**
- 番組ラウドネス **-23.0 LUFS**（通常 ±0.5 LU 以内）、True Peak 上限 **-1 dBTP**。
- 出典: https://tech.ebu.ch/publications/r128 （本文 PDF は https://tech.ebu.ch/docs/r/r128-2014.pdf）

**【仕様値】EBU Tech 3342（LRA）**
- LRA（Loudness Range）= **ショートターム（3 秒）ラウドネス分布の 10 パーセンタイルと 95 パーセンタイルの差**。-70 LUFS の絶対ゲートと -20 LU の相対ゲートをかけた後の分布。
- 出典: https://tech.ebu.ch/docs/tech/tech3342.pdf

**【仕様値】EBU Tech 3341（M / S / I の定義）**
- Momentary = 0.4 秒窓・ゲートなし、Short-term = 3 秒窓・ゲートなし（メーターは毎秒 10 回以上更新）、Integrated = 番組全体のゲート付き。
- 出典: https://tech.ebu.ch/docs/tech/tech3341.pdf

**用語の注意**: LKFS と LUFS は同じ量（米国仕様が LKFS、欧州が LUFS）。混在させない。
出典（用語）: https://www.boomboxpost.com/blog/2025/11/06/demystifying-loudness-specifications

## 2. 配信プラットフォームの目標値 — 一次情報と二次情報を分ける

| サービス | 配信側の正規化値 | True Peak | 情報の種類 |
| --- | --- | --- | --- |
| Spotify | **-14 LUFS**（ITU 1770 準拠） | マスターは **-1 dBTP 未満**、-14 LUFS より大きいマスターは **-2 dBTP 未満** | **一次**（Spotify for Artists 公式ヘルプ） |
| Spotify（視聴者の設定） | Loud -11 / Normal -14 / Quiet -19 LUFS | Loud は TP を無視し、リミッター（-1 dB で作動、attack 5 ms / decay 100 ms） | **一次** |
| YouTube | 二次情報で -14 LUFS 前後。**公式ヘルプで数値目標を明示したページは確認できず** | 二次情報で -1 dBTP | **未確認**（YouTube Studio の「コンテンツのラウドネス」は目標比の dB 表示で、絶対 LUFS は出さない） |
| Apple Music | 二次情報で -16 LUFS（Sound Check） | 未確認 | **未確認**（Apple 公式の数値ページを見つけられず） |
| TikTok / Reels | 公式に数値目標の明示なし。二次情報で「-14 LUFS 前後」「-16 LUFS / -1 dBTP を出発点に」 | 同左 | **未確認**（配信側で再エンコード＋圧縮が入る） |

- Spotify 一次出典: https://support.spotify.com/us/artists/article/loudness-normalization/
  - 同ページの明記事項: **Web プレイヤーとサードパーティ機器（TV・スピーカー）はラウドネス正規化を使わない**。アルバム単位で正規化し、シャッフル／プレイリストではトラック単位。
  - つまり「-14 LUFS に合わせたマスター」は **Web プレイヤーでは効かない**。Web 実装の目標値として流用してはいけない。
- Apple -16 LUFS の二次情報: The Mastering Show #84（ポッドキャスト） https://podcasts.apple.com/us/podcast/the-mastering-show-84-apple-switch-to-lufs-and/id1095931813?i=1000565571924
- TikTok / ソーシャル系の二次情報: https://www.criticallisteninglab.com/en/learn/loudness/social-media , https://apu.software/tiktok-instagram-reels-loudness （APU は「-16 LUFS / -1 dBTP は作業上の出発点であり、正規化の保証ではない」と明記）
- YouTube の二次情報（測定者による観察）: https://siggidori.wixsite.com/skonrokk-studios/single-post/2017/03/28/youtube-loudness-normalization （2017 年の測定。**現在の値ではない**）

**この節の含意**: 「どのサービスも -14 LUFS」は 2026 年時点でも**言い切れない**。Spotify だけが数値を一次で明示しており、他は二次情報。Web ページに埋め込む音の目標値は、どのみち存在しない（§8）。

## 3. 音量戦争の計量 — DR / crest factor / PLR

**【定義の整理】**
- **crest factor**: ピークと平均（RMS / VU / ラウドネス）の差。平均の測り方が複数あるので「標準化された量」ではない。
  出典: https://www.meterplugs.com/blog/2017/05/18/crest-factor-psr-and-plr.html
- **DR（Dynamic Range）値**: 3 秒ブロックごとの peak と RMS の比を平均する方式で、Pleasurize Music Foundation の DR メーター系ツールが広めた指標。**規格の一次文書は確認できていない**（ツール実装に基づく値）。
- **PLR（Peak to Loudness Ratio）**: `最大 True Peak - Integrated Loudness`（単位 LU）。EBU モードのメーターが表示する。**正規化後の音量差を説明できる**のが利点。
  出典: https://tech.ebu.ch/docs/tech/tech3342.pdf , 解説 https://doc.flux.audio/mira/Metering_Loudness.html
- **PSR（Peak to Short-term Ratio）**: `最大 True Peak - 最大 Short-term ラウドネス`。短区間のトランジェント保持を見る。

**【参考値・未確認】PLR の目安**（測定者・母数の記載なし。**仕様値ではない**）
- 12〜15 LU: ダイナミクスが残っている / 8〜12 LU: 現代の制作でよくある / 8 LU 未満: 圧縮・リミッティングが強い。
- 出典: https://doc.flux.audio/mira/Metering_Loudness.html （ベンダーの解説。統計的裏付けは示されていない）

**【仮説】音量戦争と聴感**
- ラウドネス正規化が入ると、**マスターを上げても再生音量は上がらない**（Spotify は負のゲインを当てる）。残る差は PLR の低下、つまり「音が前に出る代わりに、静と動の差が減る」。
- ただし「圧縮が強い＝ドパく感じる」という因果は**この調査では確認できていない**。聴感研究の一次文献を当たれていないので【未確認】とする。
- 参考（歴史と背景）: https://en.wikipedia.org/wiki/Loudness_war （百科事典。一次ではない）

## 4. 測るコマンド（ffmpeg / Python）

**前提**: 以下のコマンドは**手元で実行していない**（この環境に音声ファイルと ffmpeg が無い）。フィルタ名とオプション名は FFmpeg のフィルタドキュメントで確認したが、実行結果は未検証。
出典: https://ffmpeg.org/ffmpeg-filters.html#loudnorm , https://ffmpeg.org/ffmpeg-filters.html#ebur128-1

### 4.1 統合ラウドネス・LRA・True Peak（EBU R128 モード）
```bash
ffmpeg -hide_banner -nostats -i input.wav \
  -af ebur128=peak=true -f null - 2>&1 | tail -30
```
- 末尾に `I:`（Integrated, LUFS）/ `LRA:`（LU）/ `Peak:`（dBFS, sample peak）/ `True peak:`（dBTP）が出る。
- **ffmpeg の ebur128 は 400 ms ブロック・75 % 重複で BS.1770 に従う**が、True Peak の推定精度は実装依存（オーバーサンプル倍率は未確認）。

### 4.2 配信向けに正規化する（測ってから当てる 2 パス）
```bash
# 1 パス目: 測る
ffmpeg -hide_banner -i input.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null -
# 2 パス目: 測った値を渡して線形に寄せる
ffmpeg -i input.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=-18.2:measured_TP=-0.4:measured_LRA=6.0:measured_thresh=-28.5:linear=true -ar 48000 output.wav
```
- `loudnorm` の既定値は放送向け（I=-24 / TP=-2.0 / LRA=7）。**配信向けの数値は明示指定が要る**。既定値はバージョンで変わりうるので `ffmpeg -h filter=loudnorm` で確認する。
- `linear=true` でも TP を超える場合はダイナミクス圧縮にフォールバックする。音色が変わるので、**測るだけなら 1 パス目だけ使う**。

### 4.3 ピーク / RMS / クレストファクター
```bash
ffmpeg -hide_banner -nostats -i input.wav -af astats=metadata=1:reset=0 -f null - 2>&1 \
  | grep -E "Peak level|RMS level|Crest factor"
```
- `astats` の `Crest factor` はピーク / RMS 比（dB）。**DR 値や PLR とは別物**。混同しない。

### 4.4 無音区間の割合
```bash
ffmpeg -hide_banner -nostats -i input.wav -af silencedetect=noise=-40dB:d=0.3 -f null - 2>&1 \
  | grep silence
```
- `silence_start` / `silence_duration` の合計 ÷ 全体長 = 無音率。閾値 -40 dBFS・最小 0.3 秒は**こちらで置いた仮の値**で、根拠のある標準値ではない。BGM のループ素材なら -50 dBFS / 0.1 秒など、目的に合わせて変える。

### 4.5 オンセット（音の立ち上がり）を数える — 密度の基本量
```python
# pip install librosa soundfile
import librosa
y, sr = librosa.load("input.wav", mono=True, sr=22050)
onset = librosa.onset.onset_detect(y=y, sr=sr, units="time", backtrack=False)
dur = len(y) / sr
print(f"onsets={len(onset)} duration={dur:.2f}s per_min={len(onset)/dur*60:.1f}")
```
- **注意**: `onset_detect` はスペクトルフラックス系のヒューリスティックで、**「人が知覚した音の数」ではない**。BGM のコードチェンジ・ドラム・効果音が混ざる。閾値（`delta`, `wait`）で結果が大きく変わるので、**同じ設定で比較する**ことだけが意味を持つ。
- 出典（API）: https://librosa.org/doc/latest/generated/librosa.onset.onset_detect.html

### 4.6 LUFS をブラウザで測らない
- Web Audio の `AnalyserNode` は K 特性もゲーティングもしていない。RMS から出した dBFS を **LUFS と呼んではいけない**（[20261116-sound-design.md](20261116-sound-design.md) §4 と同じ結論）。
- サイト全体の「ラウドネス」を 1 つの数値で測ることもできない（同時に鳴る音の合算は、利用者の操作順で変わる）。**素材ごとに測り、合成後のピークだけ master の `GainNode` で管理する**。

## 5. 短い動画の「音の密度」— 公開計測は見つからない

**【実測】カット密度（音ではない）**
- FYPNow の分析（2026-08-04）: TikTok 動画の中央値で尺 29 秒・シーン 5 個、**平均シーン長 6.5 秒**。母数の動画本数は非公開。
- Sutra Haus: 短尺広告の**平均ショット長の中央値 0.83 秒**。
- 出典（両方を引用している二次整理）: https://sceneos.io/kb/average-shot-length
- **限界**: これは「シーン／ショット」であって「音イベント」ではない。音の密度の代理指標にしかならない。また 6.5 秒と 0.83 秒は**対象が違う**（UGC 動画 vs 広告）ので並べて比較しない。

**【提案】1 分あたりの音イベント数を数える手順**（公開計測が見つからないため、こちらで設計）
1. 音声を 3 層に分ける: (a) BGM、(b) 効果音（ジングル・whoosh・クリック）、(c) 声。**層ごとに数える**（合算すると意味が消える）。
2. 効果音は「オンセット検出 + 目視/聴取で確定」。自動検出だけだと BGM のドラムを拾う。
3. カット（映像）は 1 カットごとにタイムコードを書き、**カット頭に効果音が付いているか**を 0/1 で記録。→ 「カットあたり効果音率」が出る。
4. BGM の変化（曲がわり・ブレイク・転調）は秒単位で別に記録。
5. 指標は 3 つに固定する: `SFX/分`、`カット/分`、`BGM 変化/分`。尺が違う動画を比べられるよう**必ず分あたりに正規化**する。
6. 30 秒動画を 20 本、同じ人が同じ手順で数える。**測り手を変えると 2 割は動く**と想定しておく（検証していない）。

## 6. BGM の構造指標 — BPM・転調・サビ・ループ・無音

| 指標 | 測り方 | 定番値の出典状況 |
| --- | --- | --- |
| BPM | `librosa.beat.beat_track` / DAW のテンポ検出 / 手拍子で 4 拍を 15 秒数える | **J-POP の分布を示す一次統計は見つからず**【未確認】 |
| 転調 | サビ頭のキーを比較（耳＋コード判定）。半音上か全音上か | **半音上の転調がラストサビの定番**という解説は複数（下記） |
| サビの長さ | サビ頭から次のセクションまで。小節数で数える（4/4 なら 1 小節 = 4 拍） | **統計なし**【未確認】 |
| ループ長 | BGM ファイルの継ぎ目（波形の一致点）を探す。8 / 16 小節が目安とされるが根拠未確認 | **経験則** |
| 無音率 | §4.4 の `silencedetect` | 曲ジャンル別の統計なし【未確認】 |

**【解説・二次情報】ラストサビの半音上げ**
- 「半音上転調は J-POP の定番技法で、特に最後のサビに入る直前で象徴的に用いられる」。実例として「心であれたら」（D♭→D）、「HANABI」が挙げられている。
  出典: https://soundquest.jp/quest/chord/chord-mv4/modulation-in-pops-2
- 「最後のサビでキーを半音か全音上げる」を王道パターンとする解説。つなぎ方は「転調直前にドミナントを挟む」「サビ前に一瞬の間を作る」。
  出典: https://www.starroute.jp/column/tenchou-tsukaikata
- **注意**: どちらも**音楽理論の解説記事**で、楽曲全体を統計処理した研究ではない。「J-POP の何割が半音上げか」は**未確認**。
- 転調の聴感効果（高揚感）は記事の主張であり、**主観**として扱う。

## 7. 効果音の文法 — 長さ・ピッチ・連打間隔

**【ベンダー指針】UI 効果音の長さ**
- 「**約 200 ms 以下**に保つ。それより長いと、確認している視覚要素より遅れて感じられる」。
  出典: https://app.cinevva.com/game-assets/free-ui-sound-effects （素材販売元の指針。**測定値ではなく制作上の目安**）
- Apple の WWDC17「Designing Sound」: 音はハプティクス／アニメーションと**同じ瞬間に同期**させる。UI 音は「耳障りでなく、雑音の中でも抜ける」ものが良い。使いすぎない。
  出典: https://developer.apple.com/videos/play/wwdc2017/803 （Apple 公式の設計指針。具体的な ms は示されない）

**【二次情報】決定音（コイン音）の作り**
- スーパーマリオのコイン音は「オクターブまたは 4 度上の音程を速いテンポで鳴らす」＋矩形波＋短いディケイ、という再現チュートリアル。
  出典: https://www.daviddumaisaudio.com/how-to-make-the-super-mario-coin-sound-effect （個人の再現記事。**原曲の仕様ではない**）
- **典型長の一次データは見つからない**。「コイン音は 0.3〜0.5 秒」等の数値は出典を確認できていないので書かない。

**【経験則・未検証】連打の間隔**
- 同じ音を 50〜80 ms 未満で連打すると 1 つに融合して聞こえる、という目安があるが、**一次出典は無い**（[20261116-sound-design.md](20261116-sound-design.md) §3 と同じ扱い）。UI では最短 60〜100 ms を空ける、という実装目安も**検証値ではない**。
- 代わりに測れる形にする: 「同じ音の連打間隔の中央値」と「融合して聞こえた境界（主観申告）」を別々に記録する。前者は実装から、後者は聴取実験から出る。

## 8. Web 実装への含意（測る側から見た制約）

1. **自動再生規制下では「最初の操作より前に鳴らせない」**。したがって「ページを開いた瞬間にドパい」は原理的に不可能で、測れるのは**操作後 0〜3 秒の音響密度**になる（ポリシーの詳細は [20261116-sound-design.md](20261116-sound-design.md) §1）。
2. **マスターを上げても配信では音量が上がらない**（Spotify は負のゲインで -14 LUFS に寄せる）。効くのは PLR と密度。→ 「音量でドパくする」より「イベント密度とトランジェントでドパくする」方が、プラットフォーム差に強い。
3. **Web には音のラウドネス目標値が存在しない**。基準を置くなら「効果音のピークを -12〜-6 dBFS、BGM を効果音より 10 dB 以上下」のような**相対関係**で決め、絶対値は環境ごとに調整する（数値は経験則）。
4. **`prefers-reduced-motion` は音を止めない**。`prefers-reduced-sound` のような標準メディア特性は確認できていない（2026-11 時点）。→ **独自の音トグルが必須**。WCAG 2.1 1.4.2 は「自動的に 3 秒を超えて鳴る音」に停止手段か独立音量を要求する（https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html）。
5. **ミュート前提**: 初期は無音、操作で `AudioContext` を作る／`resume()` する。状態は `ctx.state` と「ユーザー設定」を**別々に持つ**（`running` でも端末が無音なことがある。検知不能）。
6. **測るタイミング**: 素材（WAV）を書き出す前に ffmpeg で `ebur128` と `astats` を通し、**素材ごとの I / TP / crest factor を表に残す**。合成後の値は環境依存なので保証しない。

## 9. 未確認リスト（2026-11-16 時点）

- YouTube が公式に明示している配信ラウドネス値（-14 LUFS は二次情報のみ）。
- Apple Music の Sound Check の公式な対象値（-16 LUFS は二次情報のみ）。
- TikTok / Instagram Reels の正規化値と圧縮の実装（公式の数値目標なし）。
- J-POP の BPM 分布、転調の使用率、サビの平均小節数（統計が見つからない）。
- 効果音の「典型長」の一次データ（200 ms 以下はベンダー指針）。
- DR 値の公式な定義（Pleasurize Music Foundation の一次文書を確認できていない）。
- 「圧縮が強い音がドパく感じる」の因果（聴感研究の一次文献を未確認）。
- 短尺動画の**音**イベント密度の公開計測（見つからないので §5 は提案）。
- 本メモの ffmpeg / librosa コマンドは**未実行**（この環境に音声ファイルと ffmpeg が無い）。

## 10. 出典一覧

- ITU-R BS.1770-5 (2023-11): https://www.itu.int/rec/R-REC-BS.1770-5-202311-I/en
- EBU R 128: https://tech.ebu.ch/publications/r128 / https://tech.ebu.ch/docs/r/r128-2014.pdf
- EBU Tech 3341（M/S/I）: https://tech.ebu.ch/docs/tech/tech3341.pdf
- EBU Tech 3342（LRA）: https://tech.ebu.ch/docs/tech/tech3342.pdf
- Spotify for Artists「Loudness normalization」: https://support.spotify.com/us/artists/article/loudness-normalization/
- FFmpeg filters（loudnorm / ebur128 / astats / silencedetect）: https://ffmpeg.org/ffmpeg-filters.html
- librosa onset_detect: https://librosa.org/doc/latest/generated/librosa.onset.onset_detect.html
- Crest factor / PSR / PLR の解説: https://www.meterplugs.com/blog/2017/05/18/crest-factor-psr-and-plr.html / https://doc.flux.audio/mira/Metering_Loudness.html
- 平均ショット長（TikTok / 短尺広告）: https://sceneos.io/kb/average-shot-length
- 半音上転調（J-POP）: https://soundquest.jp/quest/chord/chord-mv4/modulation-in-pops-2 / https://www.starroute.jp/column/tenchou-tsukaikata
- UI 効果音の長さ指針: https://app.cinevva.com/game-assets/free-ui-sound-effects
- Apple WWDC17「Designing Sound」: https://developer.apple.com/videos/play/wwdc2017/803
- マリオのコイン音の再現: https://www.daviddumaisaudio.com/how-to-make-the-super-mario-coin-sound-effect
- WCAG 2.1 1.4.2: https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
