// code-motion runtime — every frame is a pure function of the frame number.
// A composition registers scenes; the renderer calls CM.seek(frame) and screenshots.
// Scenes may draw with anything the browser has (DOM, SVG, canvas 2D, WebGL, CSS/WAAPI
// animations) as long as the picture depends only on the local frame `f`.
(() => {
  const W = 1080, H = 1920, FPS = 30;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const E = {
    lin: t => t,
    settle: t => 1 - Math.pow(1 - t, 4),              // power4.out — arrivals
    out3: t => 1 - Math.pow(1 - t, 3),
    inOut: t => (t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
    accel: t => t * t * t,                            // exits
  };
  // 0→1 progress of frame f through [a, a+d] with easing
  const tw = (f, a, d, e = E.settle) => e(clamp((f - a) / d));
  const lerp = (a, b, t) => a + (b - a) * t;
  // seeded PRNG (mulberry32) — deterministic "randomness" only
  const rng = seed => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const h = (tag, attrs = {}, ...kids) => {
    const svg = ['svg', 'path', 'g', 'rect', 'circle', 'line', 'polyline', 'text', 'defs', 'clipPath', 'mask', 'linearGradient', 'stop'].includes(tag);
    const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat()) el.append(k instanceof Node ? k : document.createTextNode(k));
    return el;
  };
  const canvas = (parent, w = W, hgt = H, style = {}) => {
    const c = h('canvas', { width: w, height: hgt, style: { position: 'absolute', left: 0, top: 0, ...style } });
    parent.append(c);
    return c.getContext('2d');
  };

  const scenes = [];
  const root = document.createElement('div');
  root.id = 'cm-root';
  Object.assign(root.style, { position: 'relative', width: W + 'px', height: H + 'px', overflow: 'hidden', background: '#fff' });

  // ramp: {scale:[from,1], x:[from,0], y:[from,0], rot:[deg,0]} — the hard-cut speed ramp.
  // Content enters already moving and decelerates (power4.out) to rest; a short blur sells speed.
  function scene(def) {
    const el = document.createElement('section');
    Object.assign(el.style, { position: 'absolute', inset: 0, overflow: 'hidden', display: 'none', background: def.bg || '#fff' });
    const cam = document.createElement('div');
    Object.assign(cam.style, { position: 'absolute', inset: 0, transformOrigin: '50% 45%' });
    el.append(cam);
    root.append(el);
    const s = { ...def, el, cam, len: def.end - def.start };
    s.state = def.build ? def.build(cam, s) || {} : {};
    scenes.push(s);
    return s;
  }

  function applyRamp(s, f) {
    const r = s.ramp || { scale: [1.25, 1] };
    const d = Math.min(s.rampFrames || 30, Math.max(8, s.len - 8));
    const p = E.settle(clamp(f / d));
    const sc = r.scale ? lerp(r.scale[0], r.scale[1], p) : 1;
    const x = r.x ? lerp(r.x[0], r.x[1], p) : 0;
    const y = r.y ? lerp(r.y[0], r.y[1], p) : 0;
    const rot = r.rot ? lerp(r.rot[0], r.rot[1], p) : 0;
    s.cam.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${sc})`;
    const b = s.blur === 0 ? 0 : (s.blur || 14) * Math.pow(clamp(1 - f / 12), 2);
    s.cam.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
  }

  function seek(frame) {
    // hard cuts: the latest scene that has started owns the frame
    let active = null;
    for (const s of scenes) if (frame >= s.start && frame < s.end) active = s;
    for (const s of scenes) s.el.style.display = s === active ? 'block' : 'none';
    if (!active) return;
    const f = frame - active.start;
    applyRamp(active, f);
    for (const a of active.el.getAnimations({ subtree: true })) { a.pause(); a.currentTime = (f / FPS) * 1000; }
    active.render && active.render(f, active.state, active);
  }

  async function ready() {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    if (window.CM.preload) await window.CM.preload();
  }

  document.addEventListener('DOMContentLoaded', () => document.body.append(root));
  window.CM = { W, H, FPS, E, tw, lerp, clamp, rng, h, canvas, scene, seek, ready, scenes,
    get duration() { return Math.max(...scenes.map(s => s.end)); } };
})();
