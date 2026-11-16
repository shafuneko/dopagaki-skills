const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("https://dopa-pong.vercel.app/");
await page.waitForTimeout(2000);

// 「ゲームスタート」を押す（テキストで探してクリック）
const clicked = await page.evaluate(() => {
  const els = [...document.querySelectorAll("button,a,[role=button]")];
  const b = els.find((e) => (e.innerText || "").includes("ゲームスタート"));
  if (!b) return { clicked: false, candidates: els.map((e) => (e.innerText || "").trim()).slice(0, 20) };
  b.click();
  return { clicked: true, text: b.innerText.trim() };
});

await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/dopa-pong-02-start.png` });

// 操作（左右のパドル: 上下キーとポインタ移動を混ぜる）
for (let i = 0; i < 6; i++) {
  await page.keyboard.press(i % 2 === 0 ? "ArrowUp" : "ArrowDown");
  await page.waitForTimeout(200);
}

// ピクセルを直接読んで色の時間変化を測る（1回の evaluate は短く保つ）
const probes = [];
for (let i = 0; i < 12; i++) {
  const p = await page.evaluate(() => {
    const cvs = document.querySelector("canvas");
    const el = cvs || document.body;
    let ctx, w, h;
    if (cvs) {
      const off = document.createElement("canvas");
      off.width = 90;
      off.height = 160;
      ctx = off.getContext("2d");
      ctx.drawImage(cvs, 0, 0, off.width, off.height);
      w = off.width;
      h = off.height;
    }
    const d = cvs ? ctx.getImageData(0, 0, w, h).data : null;
    const dom = {
      score: document.body.innerText.match(/SCORE[\s\S]{0,40}/)?.[0]?.replace(/\s+/g, " "),
      combo: document.body.innerText.match(/COMBO[\s\S]{0,40}/)?.[0]?.replace(/\s+/g, " "),
      mult: document.body.innerText.match(/MULTIPLIER[\s\S]{0,30}/)?.[0]?.replace(/\s+/g, " "),
      time: document.body.innerText.match(/TIME LEFT[\s\S]{0,30}/)?.[0]?.replace(/\s+/g, " "),
    };
    if (!d) return { dom, canvas: false };
    let r = 0, g = 0, b = 0, n = 0, sat = 0;
    const hueBins = new Array(12).fill(0);
    for (let p = 0; p < d.length; p += 4) {
      const R = d[p], G = d[p + 1], B = d[p + 2];
      r += R; g += G; b += B; n++;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      const s = mx === 0 ? 0 : (mx - mn) / mx;
      sat += s;
      if (s > 0.35 && mx > 50) {
        let hh = 0;
        const dd = mx - mn;
        if (mx === R) hh = 60 * (((G - B) / dd) % 6);
        else if (mx === G) hh = 60 * ((B - R) / dd + 2);
        else hh = 60 * ((R - G) / dd + 4);
        if (hh < 0) hh += 360;
        hueBins[Math.floor(hh / 30) % 12]++;
      }
    }
    const binsum = hueBins.reduce((a, v) => a + v, 0) || 1;
    return {
      dom,
      canvas: true,
      rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)],
      sat: +(sat / n).toFixed(3),
      hue: hueBins.map((v) => Math.round((100 * v) / binsum)),
    };
  });
  probes.push(p);
  await page.waitForTimeout(200);
}

await page.screenshot({ path: `${out}/dopa-pong-03-play.png` });
console.log("RESULT " + JSON.stringify({ clicked, probes }));
