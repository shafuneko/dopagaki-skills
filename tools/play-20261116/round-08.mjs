const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("https://dopa-pong.vercel.app/");
await page.waitForTimeout(1800);

// スタート → チュートリアルの「プレイ開始」
const started = await page.evaluate(() => {
  const find = (t) => [...document.querySelectorAll("button,a,[role=button]")].find((e) => (e.innerText || "").includes(t));
  const s = find("ゲームスタート");
  if (s) s.click();
  return !!s;
});
await page.waitForTimeout(700);
const playStart = await page.evaluate(() => {
  const find = (t) => [...document.querySelectorAll("button,a,[role=button]")].find((e) => (e.innerText || "").includes(t));
  const b = find("プレイ開始") || find("次へ");
  if (b) b.click();
  return b ? b.innerText.trim() : null;
});
await page.waitForTimeout(1500);

// 30秒ぶん、200ms 間隔で canvas のピクセルと DOM 数値を記録
const probes = [];
for (let i = 0; i < 20; i++) {
  const p = await page.evaluate(() => {
    const txt = document.body.innerText;
    const grab = (label) => {
      const i = txt.indexOf(label);
      return i < 0 ? null : txt.slice(i, i + 28).replace(/\s+/g, " ");
    };
    const cvs = document.querySelector("canvas");
    let px = null;
    if (cvs) {
      const off = document.createElement("canvas");
      off.width = 64;
      off.height = 96;
      const c = off.getContext("2d");
      c.drawImage(cvs, 0, 0, 64, 96);
      const d = c.getImageData(0, 0, 64, 96).data;
      let r = 0, g = 0, b = 0, n = 0, sat = 0, bright = 0, hot = 0;
      const hue = new Array(12).fill(0);
      for (let k = 0; k < d.length; k += 4) {
        const R = d[k], G = d[k + 1], B = d[k + 2];
        r += R; g += G; b += B; n++;
        const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
        const s = mx === 0 ? 0 : (mx - mn) / mx;
        sat += s;
        const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        bright += lum;
        if (lum > 180) hot++;
        if (s > 0.4 && mx > 60) {
          let hh;
          const dd = mx - mn;
          if (mx === R) hh = 60 * (((G - B) / dd) % 6);
          else if (mx === G) hh = 60 * ((B - R) / dd + 2);
          else hh = 60 * ((R - G) / dd + 4);
          if (hh < 0) hh += 360;
          hue[Math.floor(hh / 30) % 12]++;
        }
      }
      const hs = hue.reduce((a, v) => a + v, 0) || 1;
      px = {
        rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)],
        sat: +(sat / n).toFixed(3),
        lum: Math.round(bright / n),
        hotPct: +((100 * hot) / n).toFixed(1),
        hue: hue.map((v) => Math.round((100 * v) / hs)),
      };
    }
    return {
      score: grab("SCORE"), combo: grab("COMBO"), mult: grab("MULTIPLIER"), time: grab("TIME LEFT"),
      animations: (document.getAnimations?.() ?? []).length,
      px,
    };
  });
  probes.push(p);
  await page.waitForTimeout(200);
}

await page.screenshot({ path: `${out}/dopa-pong-04-play.png` });
console.log("RESULT " + JSON.stringify({ started, playStart, probes }));
