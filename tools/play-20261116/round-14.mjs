import { createHash } from "node:crypto";
const task = await taskSpace(4);
const page = task.page("p1");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
const clip = { x: 157, y: 0, width: 1063, height: 598, scale: 0.5 };
const shot = async () => {
  const r = await page.cdp("Page.captureScreenshot", { format: "png", clip });
  return createHash("sha256").update(String(r.data || JSON.stringify(r).slice(0, 60))).digest("hex").slice(0, 10);
};
console.log("url=" + (await page.evaluate(() => location.href)).slice(0, 60));
const h = [await shot()];
for (let i = 0; i < 5; i++) { await page.waitForTimeout(1000); h.push(await shot()); }
console.log("titleRate=" + JSON.stringify(h));
await page.mouse.click(960, 400, { label: "start" });
await page.waitForTimeout(2500);
await page.screenshot({ path: dir + "dopamine-04.png" });
const h2 = [await shot()];
for (let i = 0; i < 5; i++) { await page.waitForTimeout(1000); h2.push(await shot()); }
console.log("afterStartRate=" + JSON.stringify(h2));
await page.mouse.click(960, 300, { label: "act" });
await page.waitForTimeout(900);
await page.screenshot({ path: dir + "dopamine-05.png" });
await page.waitForTimeout(1300);
await page.screenshot({ path: dir + "dopamine-06.png" });
