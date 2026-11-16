const task = await taskSpace("dopagaki play observation");
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";
const page = await task.page("p-mahjong");

const shots = [];
try {
  await page.goto("https://dopa.rotenkogames.com/");
  shots.push("goto ok");
} catch (e) {
  shots.push("goto error: " + String(e).slice(0, 160));
}

for (let i = 1; i <= 3; i++) {
  const p = `${out}/dopa-mahjong-0${i}.png`;
  try {
    await page.screenshot({ path: p });
    shots.push("shot " + i + " ok");
  } catch (e) {
    shots.push("shot " + i + " error: " + String(e).slice(0, 160));
  }
}

console.log("RESULT " + JSON.stringify({ url: page.url(), shots }));
