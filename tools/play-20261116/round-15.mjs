import { createHash } from "node:crypto";
const task = await taskSpace(4);
const page = task.page("p1");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
const clip = { x: 157, y: 0, width: 1063, height: 598, scale: 0.5 };
const shot = async () => {
  const r = await page.cdp("Page.captureScreenshot", { format: "png", clip });
  return createHash("sha256").update(String(r.data || "")).digest("hex").slice(0, 8);
};
const audio = await page.evaluate(() => {
  const a = [...document.querySelectorAll("audio")].map((x) => ({ paused: x.paused, loop: x.loop }));
  const ctx = window.AudioContext || window.webkitAudioContext;
  return { audioTags: a, hasAudioCtor: !!ctx, canvases: document.querySelectorAll("canvas").length };
});
console.log("audio=" + JSON.stringify(audio));
const h = [];
for (let i = 0; i < 10; i++) { h.push(await shot()); await page.waitForTimeout(500); }
console.log("gameplay12shots=" + JSON.stringify(h));
await page.mouse.click(150, 120, { label: "shop" });
await page.waitForTimeout(1500);
await page.screenshot({ path: dir + "dopamine-07.png" });
await page.mouse.click(500, 300, { label: "mine" });
await page.waitForTimeout(1000);
await page.screenshot({ path: dir + "dopamine-08.png" });
console.log("final=" + (await page.evaluate(() => document.title)));
