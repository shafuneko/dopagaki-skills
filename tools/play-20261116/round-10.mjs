const task = await taskSpace(4);
const page = task.page("p2");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
async function tap(x, y) {
  await page.cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, radiusX: 2, radiusY: 2, force: 1 }] });
  await page.waitForTimeout(60);
  await page.cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(120);
}
await page.cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
await page.waitForTimeout(300);
await tap(810, 731);
await page.waitForTimeout(2500);
await page.screenshot({ path: dir + "dopa-wick-06.png" });
const t0 = Date.now();
const pts = [[810, 500], [700, 400], [900, 430], [760, 320], [860, 600], [700, 650], [900, 520], [810, 380]];
for (let i = 0; i < pts.length; i++) {
  await tap(pts[i][0], pts[i][1]);
  await page.waitForTimeout(500);
  if (i === 3) await page.screenshot({ path: dir + "dopa-wick-07.png" });
}
await page.screenshot({ path: dir + "dopa-wick-08.png" });
console.log(JSON.stringify({ elapsed: Date.now() - t0 }));
