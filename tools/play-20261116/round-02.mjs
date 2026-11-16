const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());

await page.goto("https://unityroom.com/games/dopa-wick", { timeout: 60000 });
await page.waitForTimeout(6000);

const shot = await page.screenshot({
  path: "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/dopa-wick-01.png",
});

const info = await page.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const text = [...document.querySelectorAll("body *")]
    .filter((el) => el.children.length === 0 && vis(el) && el.textContent.trim())
    .slice(0, 120)
    .map((el) => el.textContent.trim().slice(0, 80));
  return {
    title: document.title,
    url: location.href,
    canvases: document.querySelectorAll("canvas").length,
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src).slice(0, 5),
    clickable: [...document.querySelectorAll("button, a[href], [role=button]")]
      .filter(vis)
      .slice(0, 25)
      .map((el) => (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)),
    text,
    animations: document.getAnimations().length,
  };
});

console.log(JSON.stringify({ shot, info }, null, 1));
