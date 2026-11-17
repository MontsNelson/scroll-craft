// Runs inside the page. Returns the computed colours and fonts that actually
// paint the site, weighted by how much of the page uses them.
(() => {
  const colours = new Map();
  const fonts = new Map();
  const add = (map, key, w) => { if (key) map.set(key, (map.get(key) || 0) + w); };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const area = Math.min(r.width * r.height, 2e6);
    const bg = cs.backgroundColor;
    if (bg && !bg.endsWith(', 0)') && bg !== 'transparent') add(colours, `bg ${bg}`, area);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText) {
      const len = el.textContent.trim().length;
      add(colours, `text ${cs.color}`, len);
      add(fonts, `${cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()} ${cs.fontWeight}`, len);
    }
  }
  const top = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  const logo = [...document.images].find((i) => /logo/i.test(i.alt + i.src + i.className));
  return {
    colours: top(colours, 10),
    fonts: top(fonts, 6),
    logo: logo ? logo.currentSrc || logo.src : null,
    images: [...document.images].filter((i) => i.naturalWidth >= 600).map((i) => i.currentSrc || i.src),
  };
})()
