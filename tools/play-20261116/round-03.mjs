const task = await taskSpace("dopagaki play observation");
const page = (await task.pages())[0] ?? (await task.newPage());

const state = await page.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const frames = [...document.querySelectorAll("iframe")].map((f) => ({
    src: f.src,
    w: f.getBoundingClientRect().width,
    h: f.getBoundingClientRect().height,
  }));
  const btns = [...document.querySelectorAll("button, [role=button], a[href]")]
    .filter(vis)
    .map((el) => ({
      t: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30),
      cls: (el.className || "").toString().slice(0, 40),
      id: el.id,
    }))
    .filter((b) => b.t)
    .slice(0, 30);
  const canvases = [...document.querySelectorAll("canvas")].map((c) => ({
    w: c.width,
    h: c.height,
    cssW: c.getBoundingClientRect().width,
  }));
  return { url: location.href, title: document.title, frames, btns, canvases };
});

console.log("STATE " + JSON.stringify(state));
