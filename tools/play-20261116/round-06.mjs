const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("https://dopa-pong.vercel.app/");
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/dopa-pong-01-title.png` });

const info = await page.evaluate(() => {
  const cvs = [...document.querySelectorAll("canvas")].map((c) => ({
    w: c.width,
    h: c.height,
    cssW: Math.round(c.getBoundingClientRect().width),
    cssH: Math.round(c.getBoundingClientRect().height),
  }));
  const anims = document.getAnimations?.() ?? [];
  return {
    url: location.href,
    title: document.title,
    canvases: cvs,
    elements: document.querySelectorAll("*").length,
    text: (document.body.innerText || "").slice(0, 600),
    animationCount: anims.length,
    audio: document.querySelectorAll("audio").length,
    video: document.querySelectorAll("video").length,
    bodyBg: getComputedStyle(document.body).background,
  };
});

// canvas があればピクセルを直接読んで色の時間変化を測る（同一オリジンなので getImageData 可能）
const colorSeries = await page.evaluate(async () => {
  const cvs = document.querySelector("canvas");
  if (!cvs) return { error: "no canvas" };
  const off = document.createElement("canvas");
  off.width = 90;
  off.height = 160;
  const ctx = off.getContext("2d");
  const frames = [];
  for (let i = 0; i < 12; i++) {
    ctx.drawImage(cvs, 0, 0, off.width, off.height);
    const d = ctx.getImageData(0, 0, off.width, off.height).data;
    let r = 0, g = 0, b = 0, n = 0, sat = 0;
    const hueBins = new Array(12).fill(0);
    for (let p = 0; p < d.length; p += 4) {
      const R = d[p], G = d[p + 1], B = d[p + 2];
      r += R; g += G; b += B; n++;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      const s = mx === 0 ? 0 : (mx - mn) / mx;
      sat += s;
      if (s > 0.35 && mx > 50) {
        let h = 0;
        const dd = mx - mn;
        if (mx === R) h = 60 * (((G - B) / dd) % 6);
        else if (mx === G) h = 60 * ((B - R) / dd + 2);
        else h = 60 * ((R - G) / dd + 4);
        if (h < 0) h += 360;
        hueBins[Math.floor(h / 30) % 12]++;
      }
    }
    const binsum = hueBins.reduce((a, v) => a + v, 0) || 1;
    frames.push({
      t: i * 200,
      rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)],
      sat: +(sat / n).toFixed(3),
      hue: hueBins.map((v) => Math.round((100 * v) / binsum)),
    });
    await new Promise((res) => setTimeout(res, 200));
  }
  return { frames };
});

await page.keyboard.press("ArrowUp");
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/dopa-pong-02-play.png` });

console.log("RESULT " + JSON.stringify({ info, colorSeries }));
