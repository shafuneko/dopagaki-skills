const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("https://dopa.rotenkogames.com/");
await page.waitForTimeout(3000);

const shots = [];
for (let i = 1; i <= 3; i++) {
  const p = `${out}/dopa-mahjong-0${i}.png`;
  await page.screenshot({ path: p });
  shots.push(p);
  await page.waitForTimeout(800);
}

let info = {};
try {
  info.title = await page.evaluate(() => document.title);
} catch (e) { info.title = "ERROR " + String(e).slice(0, 120); }
try {
  info.text = await page.evaluate(() => document.body.innerText.replace(/\n{3,}/g, "\n").slice(0, 2000));
} catch (e) { info.text = "ERROR " + String(e).slice(0, 120); }
try {
  info.counts = await page.evaluate(() => ({
    elements: document.querySelectorAll("*").length,
    canvas: document.querySelectorAll("canvas").length,
    animations: (document.getAnimations?.() ?? []).length,
  }));
} catch (e) { info.counts = "ERROR " + String(e).slice(0, 120); }
try {
  info.anim = await page.evaluate(() => {
    const a = (document.getAnimations?.() ?? []).slice(0, 400);
    const dur = [];
    let infinite = 0;
    for (const x of a) {
      const t = x.effect?.getTiming?.();
      if (typeof t?.duration === "number") dur.push(t.duration);
      if (t?.iterations === Infinity) infinite++;
    }
    dur.sort((m, n) => m - n);
    return { n: a.length, infinite, median: dur.length ? dur[Math.floor(dur.length / 2)] : null, max: dur.length ? dur[dur.length - 1] : null };
  });
} catch (e) { info.anim = "ERROR " + String(e).slice(0, 120); }

console.log("RESULT " + JSON.stringify({ url: page.url(), shots, info }));
