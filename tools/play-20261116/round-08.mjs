const task = await taskSpace(4);
const page = task.page("p1");
const dir = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116/";
await page.goto("https://unityroom.com/games/dopamine", { timeout: 60000 });
await page.waitForTimeout(5000);
const info = await page.evaluate(() => {
  const f = document.querySelector("#webgl-frame");
  const r = f ? f.getBoundingClientRect() : null;
  return {
    title: document.title,
    frame: r ? { top: r.top, left: r.left, w: r.width, h: r.height } : null,
    desc: (document.body.innerText.match(/ゲーム紹介[\s\S]{0,600}/) || [""])[0],
  };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: dir + "dopamine-01.png" });
const popupPromise = page.waitForEvent("popup", { timeout: 20000 });
await page.click('text="別タブで開く"');
const pop = await popupPromise;
await pop.waitForLoadState();
console.log(JSON.stringify({ label: pop.label, url: (await pop.url()).slice(0, 60), title: await pop.title() }));
await pop.waitForTimeout(7000);
await pop.screenshot({ path: dir + "dopamine-02.png" });
