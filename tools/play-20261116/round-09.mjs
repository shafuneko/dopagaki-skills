const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("https://dopa.rotenkogames.com/");
await page.waitForTimeout(2500);

const title = await page.evaluate(() => document.title);
const text = await page.evaluate(() => document.body.innerText.replace(/\n{3,}/g, "\n\n").slice(0, 3000));

const stats = await page.evaluate(() => {
  const sheets = [...document.styleSheets];
  const rules = [];
  for (const s of sheets) {
    try { rules.push(...s.cssRules); } catch { /* cross-origin */ }
  }
  const flat = [];
  const walk = (list) => {
    for (const r of list) {
      if (r.cssRules) walk(r.cssRules);
      else flat.push(r.cssText || "");
    }
  };
  walk(rules);
  const css = flat.join("\n");
  const grab = (re) => (css.match(re) ?? []).map(Number);
  const times = grab(/animation-duration:\s*([\d.]+)ms/g)
    .concat(grab(/animation-duration:\s*([\d.]+)s/g).map((v) => v * 1000));
  const trans = grab(/transition-duration:\s*([\d.]+)ms/g)
    .concat(grab(/transition-duration:\s*([\d.]+)s/g).map((v) => v * 1000));
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const med = (a) => (a.length ? sorted(a)[Math.floor(a.length / 2)] : null);
  const anims = document.getAnimations?.() ?? [];
  const dur = anims.map((a) => {
    const t = a.effect?.getTiming?.();
    return t?.duration ?? 0;
  }).filter((v) => typeof v === "number" && v > 0);
  const inf = anims.filter((a) => {
    const t = a.effect?.getTiming?.();
    return t?.iterations === Infinity;
  }).length;
  return {
    elements: document.querySelectorAll("*").length,
    img: document.querySelectorAll("img").length,
    canvas: document.querySelectorAll("canvas").length,
    animations: anims.length,
    infinite: inf,
    animDurationMedian: med(dur),
    cssAnimCount: times.length,
    cssAnimMedian: med(times),
    cssTransCount: trans.length,
    cssTransMedian: med(trans),
    fonts: [...new Set([...document.querySelectorAll("*")].map((e) => getComputedStyle(e).fontFamily))].slice(0, 8),
    gradientDecls: (css.match(/gradient\(/g) ?? []).length,
    blendDecls: (css.match(/mix-blend-mode:/g) ?? []).length,
    filterDecls: (css.match(/filter:/g) ?? []).length,
    shadowDecls: (css.match(/text-shadow:/g) ?? []).length,
    keyframes: (css.match(/@keyframes/g) ?? []).length,
  };
});

await page.screenshot({ path: `${out}/dopa-mahjong-01.png` });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/dopa-mahjong-02.png` });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/dopa-mahjong-03.png` });

console.log("RESULT " + JSON.stringify({ url: page.url(), title, stats, text }));
