---
id: R-intensity-preflight-choice
domain: restraint
strength: 4
status: draft
evidence: [O-20261116-play-dopa-pong, O-20261116-play-dopa-wick, O-20261116-play-dopa-mahjong]
updated: 2026-11-16
---

# R-intensity-preflight-choice — 強い演出を出す前に、強度を選ばせる

## 規則

虹色・閃光・画面揺れを含む演出を最初に再生する前に、強度（または「派手さ」の有無）を
利用者が選べる画面を1回出し、あとから設定で変えられるようにする。

## 実装

```html
<dialog id="intensity-gate" open>
  <h2>演出の強さを選んでください</h2>
  <p>この画面は光・揺れ・虹色の演出を含みます。画面酔いや発作の既往がある方は「控えめ」を選んでください。</p>
  <button data-level="full">派手（虹色・揺れあり）</button>
  <button data-level="calm">控えめ（光と色のみ）</button>
  <button data-level="off">最小（動きなし）</button>
</dialog>
```

```js
const root = document.documentElement;
document.querySelector("#intensity-gate").addEventListener("click", (e) => {
  const lv = e.target.dataset.level;
  if (!lv) return;
  root.dataset.intensity = lv;                 // full | calm | off
  localStorage.setItem("intensity", lv);        // 次回も尊重
  e.target.closest("dialog").close();
});
// あとから変えられる導線（設定ボタン）
```

```css
html[data-intensity="calm"] .shake,
html[data-intensity="calm"] .flash { animation: none; }
html[data-intensity="off"] * { animation: none !important; }
```

- 選んだ値は保存し、次回起動時に再確認しない（毎回聞くと邪魔になる）。
- 設定画面に同じ選択肢を置く（`dopa-pong` の「あとからゲーム設定で切り替えられます」に相当）。

## なぜ効くか（仮説）

閃光・揺れの感受性は個人差が大きく（前庭機能障害は成人の約35%という推定もある）、
一律の強度は一部の人にとって身体的リスクになる。
最初に選ばせると、**演出の強度を下げずに安全性を確保**できる（H9 制御可能性の独立）。

## 効く条件

- 演出が最初から自動で始まる（ロード後すぐ動く）
- ゲーム・イベント・LP など、演出が主役の作品
- 強い閃光・揺れ・回転を含む

## 効かない・逆効果の条件

- 演出が弱い（強度1〜2）。毎回ダイアログを出すと邪魔
- 業務システム・フォーム（演出より操作が優先）
- 選択肢の意味が分からない（「派手/控えめ」の説明がない）

## 強度の根拠

strength 4: 安全性と演出の強度を両立させる手段として効果が大きい。
一方で、すべての作品に必要なわけではない（弱い演出には過剰）。

## 出典・根拠ID

- `research/20261116-spectacle-cases.md`（dopa-pong の起動時「SUPER DOPA モード」確認ダイアログの全文）
- `observations/O-20261116-play-dopa-pong.md`（ポーズ画面・設定導線、起動時の SUPER DOPA 確認ダイアログ）
- `observations/O-20261116-play-dopa-wick.md`（起動時に強度を選ばせていない例＝比較対象）
- `docs/07` 相当の a11y 調査: `research/20261116-a11y-and-risk.md`（前庭機能障害 35.4% は NHANES 由来）
- `evals/rubric.md` の G4（prefers-reduced-motion）
