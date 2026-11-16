/*!
 * tools/measure/probe.js — ドパガキ観察用の計測プローブ（1ファイル完結）
 *
 * 1) ブラウザの DevTools コンソールにこのファイル全体を貼る（JSON が console に出る）
 * 2) `await dopagakiProbe()` でも同じ JSON が返る（window に公開）
 * 3) Node: `node tools/measure/probe.js --selftest`（DOM 非依存の純関数を検証）
 *
 * 出力: { measuredAt, url, viewport, values: {...}, approximations: [...] }
 * 各計測は try/catch で独立。失敗しても他は返る（values.<key>.error）。単位は ms。
 * 近似でしか測れないものは approximations に理由付きで列挙する。
 */
'use strict';

/* ===== 1. 純関数（DOM 非依存 — selftest の対象） ===== */
function isNum(n) { return typeof n === 'number' && isFinite(n); }
function round1(n) { return isNum(n) ? Math.round(n * 10) / 10 : null; }
function clampByte(v) { return Math.max(0, Math.min(255, Math.round(v))); }

/** 中央値。空配列・数値以外は null。偶数個は中央2値の平均。 */
function median(nums) {
  if (!Array.isArray(nums)) return null;
  const a = nums.filter(isNum).sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/** "0.3s" -> 300, "250ms" -> 250。解釈できなければ null。 */
function parseTimeToMs(value) {
  if (typeof value !== 'string') return null;
  const m = value.trim().match(/^([0-9]*\.?[0-9]+)\s*(ms|s)$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return isNum(n) ? (m[2].toLowerCase() === 's' ? n * 1000 : n) : null;
}

/** カンマ区切りの duration リストを ms 配列へ。"0.2s, 400ms" -> [200,400] */
function expandTimes(value) {
  const out = [];
  if (typeof value !== 'string') return out;
  value.split(',').forEach(function (part) {
    const ms = parseTimeToMs(part);
    if (ms !== null) out.push(ms);
  });
  return out;
}

/** ms 配列の要約。count / medianMs / minMs / maxMs。 */
function summarize(nums) {
  const a = (Array.isArray(nums) ? nums : []).filter(isNum);
  if (!a.length) return { count: 0, medianMs: null, minMs: null, maxMs: null };
  return { count: a.length, medianMs: round1(median(a)), minMs: round1(Math.min.apply(null, a)), maxMs: round1(Math.max.apply(null, a)) };
}

const NAMED = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], lime: [0, 255, 0], green: [0, 128, 0],
  blue: [0, 0, 255], yellow: [255, 255, 0], gray: [128, 128, 128], grey: [128, 128, 128],
  orange: [255, 165, 0], purple: [128, 0, 128]
};

/** CSS 色文字列 -> {r,g,b,a}。解釈不能は null。 #rgb/#rgba/#rrggbb/#rrggbbaa/rgb()/rgba()/color(srgb)/名前色。 */
function parseColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (!s || /^(none|currentcolor|inherit|initial|unset)$/.test(s)) return null;
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (NAMED[s]) return { r: NAMED[s][0], g: NAMED[s][1], b: NAMED[s][2], a: 1 };
  if (s.charAt(0) === '#') {
    let h = s.slice(1);
    if (!/^[0-9a-f]+$/.test(h)) return null;
    if (h.length === 3 || h.length === 4) h = h.replace(/./g, '$&$&');
    if (h.length !== 6 && h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean);
    if (p.length < 3) return null;
    const r = parseFloat(p[0]), g = parseFloat(p[1]), b = parseFloat(p[2]);
    if (!isNum(r) || !isNum(g) || !isNum(b)) return null;
    let a = p.length > 3 ? parseFloat(p[3]) : 1;
    if (p.length > 3 && p[3].charAt(p[3].length - 1) === '%') a = parseFloat(p[3]) / 100;
    if (!isNum(a)) a = 1;
    return { r: clampByte(r), g: clampByte(g), b: clampByte(b), a: Math.max(0, Math.min(1, a)) };
  }
  const c = s.match(/^color\(srgb\s+([^)]+)\)$/);
  if (c) {
    const p = c[1].split(/[\s\/]+/).filter(Boolean);
    if (p.length < 3) return null;
    const r = parseFloat(p[0]), g = parseFloat(p[1]), b = parseFloat(p[2]);
    if (!isNum(r) || !isNum(g) || !isNum(b)) return null;
    const a = p.length > 3 ? parseFloat(p[3]) : 1;
    return { r: clampByte(r * 255), g: clampByte(g * 255), b: clampByte(b * 255), a: isNum(a) ? Math.max(0, Math.min(1, a)) : 1 };
  }
  return null;
}

/** WCAG 2.x の相対輝度。 */
function relativeLuminance(c) {
  if (!c) return null;
  function lin(v) { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG コントラスト比（1〜21）。不透明前提。 */
function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg), l2 = relativeLuminance(bg);
  if (l1 === null || l2 === null) return null;
  return round1((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
}

/** 色相 0〜360。無彩色は null。 */
function hueOf(c) {
  if (!c) return null;
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (d === 0) return null;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return ((h * 60) + 360) % 360;
}

/** 色相を 30° ビン（12区分）に丸める。無彩色は -1。 */
function hueBucket(hue) { return hue === null ? -1 : Math.floor(((hue % 360) + 360) % 360 / 30); }

/** 未読・通知件数らしいテキスト。 */
function looksUnread(text) {
  return typeof text === 'string' && /(未読|unread|新着|受信トレイ|inbox|\d+\s*件(の)?(未読|通知|メッセージ|メール)?|通知\s*\d+)/i.test(text);
}
/** カウントダウン・期限らしいテキスト。 */
function looksCountdown(text) {
  return typeof text === 'string' && /(\d{1,2}:\d{2}(:\d{2})?|あと\s*\d+\s*(秒|分|時間|日)|残り\s*\d+|(\d+\s*(秒|分|時間|日)\s*(以内|後|前|まで)))/i.test(text);
}
/** streak・連続ログインらしいテキスト。 */
function looksStreak(text) {
  return typeof text === 'string' && /(連続|連勝|streak|デイリー|daily\s*streak|ログイン\s*\d+\s*日|\d+\s*日\s*連続|🔥)/i.test(text);
}

/** 要素数を母数にした比率（母数 0 は null）。 */
function ratioOf(part, total) {
  if (!isNum(part) || !isNum(total) || total <= 0) return null;
  return Math.round((part / total) * 10000) / 10000;
}

/* ===== 2. DOM 計測（ブラウザのみ。各項目 try/catch） ===== */
function collect(o) {
  const opts = o || {};
  const layoutWindowMs = isNum(opts.layoutWindowMs) ? opts.layoutWindowMs : 3000;
  const sample = isNum(opts.sample) ? opts.sample : 0;
  const values = {}, approximations = [];

  function run(key, fn) {
    try { values[key] = fn(); }
    catch (e) {
      values[key] = { error: String((e && e.message) || e) };
      approximations.push(key + ': 計測中に例外（' + String((e && e.message) || e) + '）');
    }
  }
  function allElements() { return Array.prototype.slice.call(document.querySelectorAll('*')); }

  function durationStats() {
    const els = allElements();
    let picked = els;
    if (sample > 0 && els.length > sample) {
      const step = els.length / sample;
      picked = [];
      for (let i = 0; i < sample; i++) picked.push(els[Math.floor(i * step)]);
      approximations.push('duration: 全 ' + els.length + ' 要素から等間隔に ' + picked.length + ' 要素を抽出（無作為ではなく等間隔）。');
    }
    const trans = [], anim = [];
    let transEls = 0, animEls = 0, infEls = 0;
    picked.forEach(function (el) {
      const cs = getComputedStyle(el);
      const t = expandTimes(cs.transitionDuration).filter(function (ms) { return ms > 0; });
      if (t.length) { transEls++; trans.push.apply(trans, t); }
      const names = String(cs.animationName || '').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== 'none'; });
      const a = expandTimes(cs.animationDuration).filter(function (ms) { return ms > 0; });
      if (names.length && a.length) {
        animEls++; anim.push.apply(anim, a);
        if (String(cs.animationIterationCount).split(',').some(function (s) { return s.trim() === 'infinite'; })) infEls++;
      }
    });
    return {
      elementsSampled: picked.length, transition: Object.assign(summarize(trans), { elementsWithTransition: transEls }),
      animation: Object.assign(summarize(anim), { elementsWithAnimation: animEls }), infiniteIterationElementsFromStyle: infEls,
      note: 'inline style・継承・擬似要素は対象外。0ms は除外。'
    };
  }

  function animationCount() {
    if (typeof document.getAnimations !== 'function') return { supported: false };
    const list = document.getAnimations(), total = document.querySelectorAll('*').length;
    let running = 0, infinite = 0;
    list.forEach(function (a) {
      try {
        if (a.playState === 'running') running++;
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        if (t && t.iterations === Infinity) infinite++;
      } catch (e) { /* 個別アニメの失敗は無視 */ }
    });
    return { supported: true, count: list.length, running: running, infiniteIterations: infinite, elementCount: total, ratio: ratioOf(list.length, total) };
  }

  function pageText() {
    const elCount = document.querySelectorAll('*').length;
    const raw = document.body ? String(document.body.innerText || '') : '';
    const nospace = raw.replace(/\s+/g, '');
    const vh = window.innerHeight || 1;
    const scrollH = Math.max(document.documentElement ? document.documentElement.scrollHeight : 0, window.innerHeight || 0);
    const screens = scrollH / vh;
    let viewportChars = null;
    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let node, scanned = 0, chars = 0;
      while ((node = walker.nextNode()) && scanned < 8000) {
        scanned++;
        const t = node.nodeValue;
        if (!t || !/\S/.test(t)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < (window.innerWidth || 0)) chars += t.replace(/\s+/g, '').length;
      }
      viewportChars = chars;
    } catch (e) { approximations.push('pageText.viewportChars: Range 計測に失敗（' + String((e && e.message) || e) + '）'); }
    return {
      elementCount: elCount, visibleTextChars: nospace.length, innerTextChars: raw.length,
      viewportVisibleTextChars: viewportChars, screens: Math.round(screens * 100) / 100,
      charsPerScreen: screens > 0 ? Math.round(nospace.length / screens) : null,
      note: 'innerText は CSS 非表示を除外するが折り返しやスクロール位置は考慮しない。viewportVisibleTextChars は Range 交差による近似。' };
  }

  function media() {
    function describe(el) {
      return { tag: el.tagName.toLowerCase(), src: (el.currentSrc || el.src || '').slice(0, 200), autoplay: !!el.autoplay, muted: !!el.muted, loop: !!el.loop, paused: typeof el.paused === 'boolean' ? el.paused : null, readyState: typeof el.readyState === 'number' ? el.readyState : null };
    }
    const videos = Array.prototype.map.call(document.querySelectorAll('video'), describe);
    const audios = Array.prototype.map.call(document.querySelectorAll('audio'), describe);
    return {
      videos: videos, audios: audios, videoCount: videos.length, audioCount: audios.length,
      autoplayAttrCount: videos.concat(audios).filter(function (m) { return m.autoplay; }).length,
      playingVideos: videos.filter(function (v) { return v.paused === false; }).length,
      audioContextConstructor: !!(window.AudioContext || window.webkitAudioContext),
      note: 'AudioContext の「存在」はコンストラクタの有無のみ。生成済みか・state はページ内部に公開されないため不明。'
    };
  }
  function scrollInfo() {
    const snaps = [];
    allElements().forEach(function (el) {
      const s = getComputedStyle(el).scrollSnapType;
      if (s && s !== 'none') snaps.push({ tag: el.tagName.toLowerCase(), id: el.id || null, value: s });
    });
    const sc = document.scrollingElement || document.documentElement;
    const scrollH = sc ? sc.scrollHeight : null, vh = window.innerHeight || null;
    return {
      scrollSnapElements: snaps.slice(0, 20), scrollSnapElementCount: snaps.length,
      scrollHeight: scrollH, viewportHeight: vh,
      scrollHeightRatio: scrollH && vh ? Math.round((scrollH / vh) * 100) / 100 : null,
      bodyOverflowY: document.body ? getComputedStyle(document.body).overflowY : null };
  }

  function rewardSignals() {
    const found = { unread: [], countdown: [], streak: [] }, seen = { unread: {}, countdown: {}, streak: {} };
    const els = document.querySelectorAll('a,button,span,div,li,p,strong,em,small,time,label');
    const checks = [['unread', looksUnread], ['countdown', looksCountdown], ['streak', looksStreak]];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (el.children && el.children.length > 2) continue;
      const text = String(el.innerText || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 60) continue;
      checks.forEach(function (pair) {
        const kind = pair[0];
        if (found[kind].length >= 8 || seen[kind][text]) return;
        if (pair[1](text)) { seen[kind][text] = 1; found[kind].push(text); }
      });
    }
    return { unread: found.unread, countdown: found.countdown, streak: found.streak, note: '正規表現によるテキスト一致。見た目のバッジ形状や画像内文字は検出しない。' };
  }

  function contrast() {
    const candidates = document.querySelectorAll('p,li,h1,h2,h3,h4,h5,h6,a,button,span,td,th,label,figcaption,blockquote');
    const results = [];
    const stride = Math.max(1, Math.ceil(candidates.length / 60));
    for (let i = 0; i < candidates.length; i += stride) {
      const el = candidates[i];
      const direct = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && /\S/.test(n.nodeValue || ''); });
      if (!direct) continue;
      const text = String(el.innerText || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
      const fg = parseColor(cs.color);
      if (!fg || fg.a < 0.95) continue;
      let bg = null, node = el, blended = false;
      for (let d = 0; d < 12 && node; d++) {
        const c = parseColor(getComputedStyle(node).backgroundColor);
        if (c && c.a > 0) {
          bg = c.a >= 0.95 ? c : { r: Math.round(c.r * c.a + 255 * (1 - c.a)), g: Math.round(c.g * c.a + 255 * (1 - c.a)), b: Math.round(c.b * c.a + 255 * (1 - c.a)), a: 1 };
          if (c.a < 0.95) blended = true;
          break;
        }
        node = node.parentElement;
      }
      if (!bg) { bg = { r: 255, g: 255, b: 255, a: 1 }; blended = true; }
      const ratio = contrastRatio(fg, bg);
      if (ratio === null) continue;
      results.push({ ratio: ratio, tag: el.tagName.toLowerCase(), text: text.slice(0, 20), blended: blended });
    }
    results.sort(function (a, b) { return a.ratio - b.ratio; });
    const ratios = results.map(function (r) { return r.ratio; });
    return {
      sampled: results.length, median: median(ratios), min: ratios.length ? ratios[0] : null,
      below45: results.filter(function (r) { return r.ratio < 4.5; }).length, worst: results.slice(0, 5),
      note: '文字色と最も近い非透過背景色。半透明背景は白と合成。グラデーション・画像背景・影・擬似要素は未考慮。' };
  }

  function reducedMotion() {
    let mq = null;
    try { mq = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { /* 未対応環境 */ }
    let mediaRules = 0, neutralizeRules = 0, inaccessible = 0, scanned = 0;
    function walk(rules, depth) {
      if (!rules || depth > 5) return;
      for (let i = 0; i < rules.length && scanned < 20000; i++) {
        const rule = rules[i];
        scanned++;
        const cond = rule.conditionText || (rule.media && rule.media.mediaText) || '';
        if (cond && /prefers-reduced-motion/i.test(cond)) {
          mediaRules++;
          const txt = String(rule.cssText || '');
          if (/(transition|animation)[^;]*:\s*(none|0s|0ms)/i.test(txt) || /transition-duration\s*:\s*(0s|0ms)/i.test(txt)) neutralizeRules++;
        }
        try { if (rule.cssRules) walk(rule.cssRules, depth + 1); } catch (e) { /* ネストの失敗は無視 */ }
      }
    }
    let sheets = 0;
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      sheets++;
      try { walk(sheet.cssRules, 0); } catch (e) { inaccessible++; }
    });
    return {
      matchesReduce: mq ? !!mq.matches : null, mediaRuleCount: mediaRules, neutralizeRuleCount: neutralizeRules,
      stylesheets: sheets, inaccessibleStylesheets: inaccessible,
      note: 'cross-origin の stylesheet は cssRules を読めないため数えられない（inaccessibleStylesheets）。' };
  }

  function hueApprox() {
    const colors = {};
    let declarations = 0, ruleCount = 0, styleAttrCount = 0;
    function add(value) {
      const c = parseColor(value);
      if (!c) return;
      declarations++;
      colors[c.r + ',' + c.g + ',' + c.b] = true;
    }
    function scanDecl(style) {
      if (!style) return;
      ['color', 'backgroundColor', 'borderTopColor', 'borderColor', 'outlineColor', 'fill', 'stroke', 'backgroundImage'].forEach(function (p) {
        const v = style[p];
        if (!v) return;
        add(v);
        String(v).replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|color\(srgb[^)]*\))/g, function (m) { add(m); return m; });
      });
    }
    function walkRules(rules, depth) {
      if (!rules || depth > 6) return;
      for (let i = 0; i < rules.length && ruleCount < 20000; i++) {
        const rule = rules[i];
        ruleCount++;
        if (rule.style) scanDecl(rule.style);
        try { if (rule.cssRules) walkRules(rule.cssRules, depth + 1); } catch (e) { /* 無視 */ }
      }
    }
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      try { walkRules(sheet.cssRules, 0); } catch (e) { /* cross-origin */ }
    });
    allElements().forEach(function (el) {
      if (el.getAttribute && el.getAttribute('style')) { styleAttrCount++; scanDecl(el.style); }
    });
    const hues = {}, keys = Object.keys(colors);
    keys.forEach(function (k) {
      const p = k.split(',');
      const b = hueBucket(hueOf({ r: +p[0], g: +p[1], b: +p[2] }));
      if (b >= 0) hues[b] = (hues[b] || 0) + 1;
    });
    return {
      uniqueColorCount: keys.length, hueBinCount: Object.keys(hues).length,
      hueBinsUsed: Object.keys(hues).map(Number).sort(function (a, b) { return a - b; }),
      declarationsScanned: declarations, stylesheetRulesScanned: ruleCount, inlineStyleElements: styleAttrCount,
      note: '近似: 「実際に描画された画素」ではなく CSS 宣言中の色だけを数える。canvas/SVG 属性・画像・グラデーションの中間色は含まない。' };
  }

  function motionMutations(windowMs) {
    return new Promise(function (resolve) {
      if (!window.MutationObserver || !document.body) { resolve({ supported: false }); return; }
      let childList = 0, attrs = 0, total = 0;
      const mo = new window.MutationObserver(function (records) {
        total += records.length;
        records.forEach(function (r) { if (r.type === 'attributes') attrs++; else if (r.type === 'childList') childList++; });
      });
      mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
      setTimeout(function () {
        mo.disconnect();
        resolve({
          supported: true, windowMs: windowMs, totalMutations: total, childListMutations: childList,
          attributeMutations: attrs, perSecond: Math.round((total / windowMs) * 1000 * 100) / 100,
          note: 'DOM 変更の観測であってレイアウト再計算の回数ではない。CSS アニメーション単体では mutation は出ない。' });
      }, windowMs);
    });
  }

  function baseInfo() {
    return { measuredAt: new Date().toISOString(), url: String(location.href), title: String(document.title || ''),
      viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1, userAgent: navigator.userAgent } };
  }

  run('base', baseInfo); run('duration', durationStats); run('animations', animationCount); run('page', pageText);
  run('media', media); run('scroll', scrollInfo); run('rewardSignals', rewardSignals); run('contrast', contrast);
  run('reducedMotion', reducedMotion); run('hueApprox', hueApprox);
  approximations.push('近似: contrast=最近接の非透過背景色 / hueApprox=CSS宣言中の色のみ / pageText.viewportVisibleTextChars=Range交差 / duration=computed styleのみ（擬似要素・継承・JSアニメ除外） / layoutMutations=DOM変更回数。');

  return motionMutations(layoutWindowMs).catch(function (e) {
    values.layoutMutations = { error: String((e && e.message) || e) };
    return null;
  }).then(function (mut) {
    if (mut && mut.supported === false) { values.layoutMutations = mut; approximations.push('layoutMutations: MutationObserver 非対応。'); }
    else if (mut) {
      values.layoutMutations = mut;
      approximations.push('layoutMutations: DOM 変更回数であり「レイアウト変化」そのものではない（' + layoutWindowMs + 'ms 観測）。');
    }
    const base = values.base || { measuredAt: new Date().toISOString(), url: String(location.href) };
    return { measuredAt: base.measuredAt, url: base.url, viewport: base.viewport || null, values: values, approximations: approximations };
  });
}

/* ===== 3. selftest（DOM 非依存） ===== */
function selftest() {
  const tests = [];
  function eq(name, actual, expected) { tests.push({ name: name, ok: JSON.stringify(actual) === JSON.stringify(expected), actual: JSON.stringify(actual), expected: JSON.stringify(expected) }); }
  function near(name, actual, expected, tol) { tests.push({ name: name, ok: isNum(actual) && Math.abs(actual - expected) <= (tol || 0.05), actual: String(actual), expected: '~' + expected }); }

  eq('median odd', median([3, 1, 2]), 2); eq('median even', median([1, 2, 3, 4]), 2.5);
  eq('median empty', median([]), null); eq('median drops non-number', median([10, 'x', 20]), 15);
  eq('parseTime 0.3s', parseTimeToMs('0.3s'), 300); eq('parseTime 250ms', parseTimeToMs('250ms'), 250);
  eq('parseTime 0s', parseTimeToMs('0s'), 0); eq('parseTime 1.5s', parseTimeToMs('1.5s'), 1500);
  eq('parseTime invalid', parseTimeToMs('fast'), null); eq('expandTimes list', expandTimes('0.2s, 400ms'), [200, 400]);
  eq('summarize', summarize([100, 200, 300]), { count: 3, medianMs: 200, minMs: 100, maxMs: 300 });
  eq('parseColor #fff', parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  eq('parseColor rgb', parseColor('rgb(10, 20, 30)'), { r: 10, g: 20, b: 30, a: 1 });
  eq('parseColor rgba alpha', parseColor('rgba(10,20,30,0.5)').a, 0.5);
  eq('parseColor #00000080 alpha', Math.round(parseColor('#00000080').a * 255), 128);
  eq('parseColor transparent', parseColor('transparent'), { r: 0, g: 0, b: 0, a: 0 });
  eq('parseColor invalid', parseColor('notacolor'), null);
  near('luminance white', relativeLuminance({ r: 255, g: 255, b: 255 }), 1, 0.001);
  near('luminance black', relativeLuminance({ r: 0, g: 0, b: 0 }), 0, 0.001);
  near('contrast black/white', contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21, 0.1);
  near('contrast same', contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 }), 1, 0.001);
  eq('contrast null input', contrastRatio(null, { r: 0, g: 0, b: 0 }), null);
  near('hue red', hueOf({ r: 255, g: 0, b: 0 }), 0, 0.001);
  near('hue green', hueOf({ r: 0, g: 255, b: 0 }), 120, 0.001);
  near('hue blue', hueOf({ r: 0, g: 0, b: 255 }), 240, 0.001);
  eq('hue gray', hueOf({ r: 100, g: 100, b: 100 }), null);
  eq('bucket red', hueBucket(0), 0); eq('bucket 359', hueBucket(359), 11); eq('bucket gray', hueBucket(null), -1);
  eq('unread 未読3件', looksUnread('未読 3件'), true); eq('unread inbox', looksUnread('Inbox (12)'), true);
  eq('unread miss', looksUnread('こんにちは'), false);
  eq('countdown clock', looksCountdown('23:59:59'), true); eq('countdown あと3日', looksCountdown('あと3日'), true);
  eq('countdown miss', looksCountdown('商品一覧'), false);
  eq('streak 連続7日', looksStreak('連続7日'), true); eq('streak 🔥', looksStreak('🔥 5'), true);
  eq('streak miss', looksStreak('設定'), false);
  eq('ratio', ratioOf(1, 4), 0.25); eq('ratio zero total', ratioOf(0, 0), null);

  let pass = 0;
  tests.forEach(function (t) {
    if (t.ok) { pass++; console.log('PASS ' + t.name); }
    else console.log('FAIL ' + t.name + '  actual=' + t.actual + ' expected=' + t.expected);
  });
  const failed = tests.length - pass;
  console.log('---');
  console.log('selftest: ' + pass + '/' + tests.length + ' passed' + (failed ? ' (' + failed + ' failed)' : ''));
  return failed === 0;
}
/* ===== 4. 入口 ===== */
(function main() {
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  if (isNode) {
    if (process.argv.indexOf('--selftest') !== -1) process.exit(selftest() ? 0 : 1);
    console.log('usage: node probe.js --selftest');
    console.log('（ブラウザでは DevTools コンソールに貼るか、dopagakiProbe() を await してください）');
    process.exit(0);
    return;
  }
  if (typeof document === 'undefined') { console.log('DOM がありません。Node からは --selftest を使ってください。'); return; }
  const root = typeof window !== 'undefined' ? window : globalThis;
  root.dopagakiProbe = function (opts) { return collect(opts); };
  const p = collect({});
  root.__dopagakiProbeResult = p;
  p.then(function (result) { console.log(JSON.stringify(result, null, 2)); }).catch(function (err) { console.error('[probe] failed', err); });
})();
