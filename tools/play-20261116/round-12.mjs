const task = await taskSpace(4);
const page = task.page("p1");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
const src = await page.evaluate(() => document.querySelector("#webgl-frame").src);
await page.goto(src, { timeout: 60000 });
await page.waitForTimeout(9000);
const info = await page.evaluate(() => {
  window.__ev = [];
  ["pointerdown", "click", "wheel", "keydown"].forEach((t) =>
    document.addEventListener(t, (e) => window.__ev.push({ t, x: e.clientX, y: e.clientY, key: e.key }), true),
  );
  const c = document.querySelector("canvas");
  const r = c ? c.getBoundingClientRect() : null;
  return { url: location.href.slice(0, 40), title: document.title, canvas: r ? [r.left, r.top, r.width, r.height] : null, w: innerWidth, h: innerHeight };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: dir + "dopamine-02.png" });
await page.mouse.click(960, 500, { label: "click game" });
await page.waitForTimeout(1200);
await page.mouse.click(960, 620, { label: "click game lower" });
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => window.__ev)));
await page.screenshot({ path: dir + "dopamine-03.png" });
