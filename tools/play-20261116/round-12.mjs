const task = await taskSpace("dopagaki play observation");
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";
const page = await task.newPage();
const log = [];

try {
  await page.goto("https://dopa.rotenkogames.com/");
  log.push("goto ok");
} catch (e) { log.push("goto err " + String(e).slice(0, 140)); }

for (let i = 1; i <= 3; i++) {
  try {
    await page.screenshot({ path: `${out}/dopa-mahjong-0${i}.png` });
    log.push("shot" + i + " ok");
  } catch (e) { log.push("shot" + i + " err " + String(e).slice(0, 140)); }
}

let title = null;
try { title = await page.evaluate(() => document.title); } catch (e) { title = "err " + String(e).slice(0, 100); }

console.log("RESULT " + JSON.stringify({ url: String(page.url()), title, log }));
