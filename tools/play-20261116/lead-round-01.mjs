// lead-round-01.mjs — 宣言ベース計測の検証: 実ブラウザで getAnimations と computed style を取る
const fs = await import("node:fs/promises");

const task = await taskSpace("lp runtime measurement 20261116");
const page = task.page("p1");

const measure = () => {
  const med = (xs) => {
    if (!xs.length) return null;
    const a = [...xs].sort((x, y) => x - y);
    const i = Math.floor(a.length / 2);
    return a.length % 2 ? a[i] : a[i - 1];
  };
  const pct = (xs, p) => {
    if (!xs.length) return null;
    const a = [...xs].sort((x, y) => x - y);
    return a[Math.min(a.length - 1, Math.floor(a.length * p))];
  };

  const anims = document.getAnimations ? document.getAnimations() : [];
  const animDur = anims
    .map((a) => {
      try { return a.effect && a.effect.getTiming().duration; } catch (e) { return null; }
    })
    .filter((d) => typeof d === "number" && d > 0);
  const infinite = anims.filter((a) => {
    try { return a.effect.getTiming().iterations === Infinity; } catch (e) { return false; }
  }).length;

  const els = [...document.querySelectorAll("*")];
  const transDur = [];
  let blend = 0, filter = 0, backdrop = 0, shadow = 0;
  for (const el of els) {
    const cs = getComputedStyle(el);
    (cs.transitionDuration || "").split(",").forEach((t) => {
      const ms = String(t).trim().endsWith("ms") ? parseFloat(t) : parseFloat(t) * 1000;
      if (ms > 0) transDur.push(ms);
    });
    const bm = cs.mixBlendMode || "";
    if (bm && bm !== "normal") blend++;
    if (cs.filter && cs.filter !== "none") filter++;
    if (cs.backdropFilter && cs.backdropFilter !== "none") backdrop++;
    if (cs.boxShadow && cs.boxShadow !== "none") shadow++;
  }

  const txt = document.body ? document.body.innerText || "" : "";
  const imgs = document.images ? document.images.length : 0;

  return {
    url: location.href,
    title: document.title,
    elements: els.length,
    animations: anims.length,
    infiniteAnimations: infinite,
    animDuration: {
      n: animDur.length,
      median: med(animDur),
      p10: pct(animDur, 0.1),
      p90: pct(animDur, 0.9),
      under150: animDur.filter((d) => d < 150).length,
    },
    transitionDuration: {
      n: transDur.length,
      median: med(transDur),
      p10: pct(transDur, 0.1),
      p90: pct(transDur, 0.9),
      under150: transDur.filter((d) => d < 150).length,
    },
    style: { blend, filter, backdrop, boxShadow: shadow },
    text: { chars: txt.length, words: txt.split(/\s+/).filter(Boolean).length },
    images: imgs,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    viewport: { w: innerWidth, h: innerHeight },
  };
};

const out = [];
for (const s of [
  { slug: "light-the-way", url: "https://light-the-way.jp/10th-anniversary/" },
  { slug: "sakuma-55th", url: "https://www.sakumaseika.com/ichigomilk1970_2025/" },
  { slug: "ahkah-holiday", url: "https://www.ahkah.jp/ext/2026Holiday_mymood_mylove/index.html" },
]) {
  try {
    await page.goto(s.url, { timeout: 45000 });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(measure);
    out.push({ slug: s.slug, ok: true, ...r });
    console.log("OK", s.slug, JSON.stringify(r));
  } catch (e) {
    out.push({ slug: s.slug, ok: false, error: String(e && e.message ? e.message : e) });
    console.log("FAIL", s.slug, String(e && e.message ? e.message : e));
  }
}

const path = "C:/Users/szk27/work/dopagaki-skills/tools/play-20261116/lead-measure-01.json";
await fs.writeFile(path, JSON.stringify(out, null, 2), "utf8");
console.error("WROTE " + path + " entries=" + out.length);
