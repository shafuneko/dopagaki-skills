const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());
const out = "C:/Users/szk27/work/dopagaki-skills/corpus/private/play-20261116";

await page.goto("file:///C:/Users/szk27/work/dopagaki-skills/tools/play-20261116/spectacle-test.html");
await page.waitForTimeout(1200);

await page.screenshot({ path: out + "/spectacle-test-01.png" });

const res = await page.evaluate(() => {
  const anims = document.getAnimations();
  const ring = document.querySelector("#ring");
  const glow = document.querySelector("#glow");
  const cs = getComputedStyle(ring);
  const csG = getComputedStyle(glow);
  return {
    animations: anims.length,
    running: anims.filter((a) => a.playState === "running").length,
    infinite: anims.filter((a) => a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity).length,
    ringBgImage: cs.backgroundImage.slice(0, 60),
    glowShadowLayers: csG.textShadow.split(/,(?![^(]*\))/).length,
    support: {
      conicGradient: CSS.supports("background", "conic-gradient(from 0deg, red, blue)"),
      backgroundClipText: CSS.supports("background-clip", "text"),
      plusLighter: CSS.supports("mix-blend-mode", "plus-lighter"),
      textStroke: CSS.supports("-webkit-text-stroke", "2px black"),
      backdropFilter: CSS.supports("backdrop-filter", "blur(4px)"),
    },
    reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
    title: document.title,
  };
});

console.error("RESULT " + JSON.stringify(res));
