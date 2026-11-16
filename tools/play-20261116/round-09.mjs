const task = await taskSpace(4);
const page = task.page("p2");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
const setup = await page.evaluate(() => {
  window.__ev = [];
  const types = ["mousedown", "mouseup", "click", "pointerdown", "touchstart"];
  types.forEach((t) =>
    document.addEventListener(
      t,
      (e) => window.__ev.push({ t, x: e.clientX, y: e.clientY, tag: e.target.tagName, id: e.target.id }),
      true,
    ),
  );
  return {
    url: location.href.slice(0, 40),
    canvases: [...document.querySelectorAll("canvas")].map((c) => {
      const r = c.getBoundingClientRect();
      return { id: c.id, w: c.width, h: c.height, rect: [r.left, r.top, r.width, r.height] };
    }),
    hasFocus: document.hasFocus(),
    unityInstance: typeof window.unityInstance,
  };
});
console.log(JSON.stringify(setup));
await page.mouse.click(810, 731, { label: "start poikatsu retry" });
await page.waitForTimeout(600);
console.log(JSON.stringify(await page.evaluate(() => window.__ev)));
await page.keyboard.press("Space");
await page.waitForTimeout(400);
console.log(JSON.stringify(await page.evaluate(() => window.__ev.slice(-5))));
await page.screenshot({ path: dir + "dopa-wick-06.png" });
