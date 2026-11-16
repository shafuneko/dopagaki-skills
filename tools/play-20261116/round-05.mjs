const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

const rect = await page.evaluate(() => {
  const f = [...document.querySelectorAll("iframe")].find((x) =>
    (x.src || "").includes("play.unityroom.com")
  );
  if (!f) return null;
  const r = f.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

const frames = [];
const cx = rect.x + rect.w / 2;
const cy = rect.y + rect.h / 2;

// 8フレーム・400ms間隔で、クリックしながら撮る（画面の色変化を見る）
for (let i = 0; i < 8; i++) {
  await page.mouse.click(cx, cy + 40, { label: "tap wick" });
  await page.waitForTimeout(120);
  frames.push(await page.screenshot({ path: `${out}/adm-wick-f${i}.png` }));
  await page.waitForTimeout(280);
}

const meta = await page.evaluate(() => ({
  url: location.href,
  animations: document.getAnimations().length,
  videoCount: document.querySelectorAll("video").length,
  audioCount: document.querySelectorAll("audio").length,
  title: document.title,
}));

console.log("FRAMES " + JSON.stringify({ rect, frames, meta }));
