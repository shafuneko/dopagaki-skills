const fs = await import("node:fs/promises");
const crypto = await import("node:crypto");
const task = await taskSpace(4);
const page = task.page("p2");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
const hashOf = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 12);
await page.mouse.click(810, 731, { label: "start poikatsu" });
await page.waitForTimeout(2500);
await page.screenshot({ path: dir + "dopa-wick-03.png" });
const samples = [];
let prev = null;
const pts = [
  [810, 500], [700, 400], [900, 430], [760, 320], [860, 600],
  [700, 650], [900, 520], [810, 380], [740, 560], [880, 700],
  [810, 620], [760, 460], [850, 360], [790, 540], [810, 500],
];
const t0 = Date.now();
for (let i = 0; i < pts.length; i++) {
  await page.mouse.click(pts[i][0], pts[i][1], { label: "tap minigame" });
  await page.waitForTimeout(650);
  if (i === 10) {
    await page.mouse.move(600, 900);
    await page.mouse.click(600, 900, { label: "trash area" });
  }
  const p = await page.screenshot();
  const buf = await fs.readFile(p);
  const h = hashOf(buf);
  samples.push({ i, dt: Date.now() - t0, hash: h, changed: prev !== null && h !== prev });
  prev = h;
  if (i === 6) await fs.writeFile(dir + "dopa-wick-04.png", buf);
}
console.log(JSON.stringify({ elapsed: Date.now() - t0, samples, changedCount: samples.filter((s) => s.changed).length }));
await page.screenshot({ path: dir + "dopa-wick-05.png" });
