// code-motion kit — small brand-neutral helpers every composition tends to need.
// Loaded after runtime.js. Brand styling (window chrome, colours, type) lives in the
// project's own <style>, derived from assets/brand/<name>.json — never here.
(() => {
  const { h, tw, E, lerp, clamp, rng, canvas } = CM;
  const px = v => v + 'px';
  const place = (el, x, y, w, hh) => Object.assign(el.style, {
    left: px(x), top: px(y), ...(w != null && { width: px(w) }), ...(hh != null && { height: px(hh) }) });

  // A cursor is an actor: travel (inOut), press (3f down, 5f up), never idle wobble.
  function cursor(parent, fill = '#1E1E1E', stroke = '#FEFEFE') {
    const el = h('div', { class: 'abs', style: { position: 'absolute', width: '64px', height: '64px', zIndex: 50 } });
    el.innerHTML = `<svg width="64" height="64" viewBox="0 0 32 32"><path d="M6 3v22l6-6 4 9 4-2-4-9h8z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></svg>`;
    parent.append(el);
    el.set = (x, y, p = 0) => { el.style.left = px(x); el.style.top = px(y); el.style.transform = `scale(${1 - p * .14})`; };
    return el;
  }
  const press = (f, at) => f < at ? 0 : f < at + 3 ? tw(f, at, 3, E.lin) : f < at + 8 ? 1 - tw(f, at + 3, 5) : 0;

  // Halftone field: ink dots on a ground, dense where the gaussian blobs are. Deterministic.
  // blobs: [[x, y, radius], ...] in frame coordinates. Drawn once in build(); bleeds 200px.
  function halftone(cam, { bg, ink, seed = 1, blobs = [], step = 18, jitter = .18 }) {
    const ctx = canvas(cam, 1480, 2320, { left: '-200px', top: '-200px' });
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1480, 2320);
    const r = rng(seed); ctx.fillStyle = ink;
    for (let y = 0; y < 2320; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < 1480; x += step) {
      let v = 0;
      for (const [bx, by, br] of blobs) { const d = Math.hypot(x - 200 - bx, y - 200 - by) / br; v += Math.exp(-d * d * 2.2); }
      const rad = clamp(v + (r() - .5) * jitter) * step * .5;
      if (rad > .6) { ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); }
    }
    return ctx;
  }

  // Draw `img` (crop [sx,sy,sw,sh]) into ctx as a halftone of cell size c — for dither→photo resolves.
  function halftoneImage(ctx, img, crop, W, H, c, bg, ink) {
    const off = halftoneImage.off || (halftoneImage.off = document.createElement('canvas'));
    const cw = Math.ceil(W / c), ch = Math.ceil(H / c);
    off.width = cw; off.height = ch;
    const o = off.getContext('2d'); o.drawImage(img, ...crop, 0, 0, cw, ch);
    const d = o.getImageData(0, 0, cw, ch).data;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ink;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const k = (j * cw + i) * 4, lum = (d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) / 255;
      const rad = (1 - lum) * c * .62;
      if (rad > .5) { ctx.beginPath(); ctx.arc(i * c + c / 2, j * c + c / 2, rad, 0, 7); ctx.fill(); }
    }
  }

  // Typed text with a block caret: typed(f, start, dur, 'text') → string
  const typed = (f, at, dur, text) => text.slice(0, Math.floor(tw(f, at, dur, E.lin) * text.length));
  const fmtK = v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v / 1e3) + 'K';
  const img = src => Object.assign(new Image(), { src });
  // decode every url before frame 0 (background-image urls are not in document.images)
  const preload = urls => { const prev = CM.preload; CM.preload = async () => { prev && await prev(); await Promise.all(urls.map(u => img(u).decode().catch(() => console.error('missing asset', u)))); }; };

  Object.assign(CM, { px, place, cursor, press, halftone, halftoneImage, typed, fmtK, img, preload });
})();
