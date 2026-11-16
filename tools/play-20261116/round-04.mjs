const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

// ゲームの iframe の矩形を取る（unityroom はゲームを iframe で埋め込む）
const rect = await page.evaluate(() => {
  const f = [...document.querySelectorAll("iframe")].find((x) =>
    (x.src || "").includes("play.unityroom.com")
  );
  if (!f) return null;
  const r = f.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

const shots = [];
if (rect) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  shots.push(await page.screenshot({ path: `${out}/dopa-wick-02-title.png` }));

  // タイトル画面をクリックして開始
  await page.mouse.click(cx, cy, { label: "start dopa wick" });
  await page.waitForTimeout(4000);
  shots.push(await page.screenshot({ path: `${out}/dopa-wick-03-start.png` }));

  // 数秒プレイ（クリック連打＋スペース）して、途中経過を撮る
  for (let i = 0; i < 5; i++) {
    await page.mouse.click(cx, cy, { label: "tap" });
    await page.waitForTimeout(700);
  }
  shots.push(await page.screenshot({ path: `${out}/dopa-wick-04-play.png` }));

  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
  }
  shots.push(await page.screenshot({ path: `${out}/dopa-wick-05-play.png` }));
}

console.log("RESULT " + JSON.stringify({ rect, shots }));
