const task = await taskSpace("unityroom dopagaki play");
const page = task.page("p1");
await page.goto("https://unityroom.com/games/doper-duper", { timeout: 60000 });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const frames = [...document.querySelectorAll("iframe")].map((f) => ({
    src: f.src,
    w: f.clientWidth,
    h: f.clientHeight,
    id: f.id,
  }));
  const buttons = [...document.querySelectorAll("button, a, input[type=button], input[type=submit]")]
    .slice(0, 80)
    .map((b) => ({
      tag: b.tagName,
      text: (b.innerText || b.value || "").trim().slice(0, 40),
      id: b.id,
      cls: (b.className || "").toString().slice(0, 40),
    }))
    .filter((b) => b.text);
  return { title: document.title, frames, buttons, bodyText: document.body.innerText.slice(0, 1200) };
});
console.log(JSON.stringify({ spaceId: task.spaceId, page: page.label }));
console.log(JSON.stringify(info, null, 1));
await page.screenshot({
  path: "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/doper-duper-01.png",
});
