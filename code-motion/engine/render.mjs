#!/usr/bin/env node
// Render a code-motion composition to MP4 (or stills) with headless Chrome + ffmpeg.
//   node render.mjs <project>                      → <project>/out/video.mp4 (+ audio from plan.json)
//   node render.mjs <project> --stills 0,45,90     → <project>/out/stills/f<N>.png
//   node render.mjs <project> --sheet [--guides]   → <project>/out/sheet.jpg (first/mid/last per scene)
//   node render.mjs <project> --meta              → prints {dur, scenes} JSON (used by check.py)
//   options: --workers 6  --from F --to F  --out name.mp4
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argv = process.argv.slice(2);
const proj = path.resolve(argv[0] || '.');
const opt = k => { const i = argv.indexOf('--' + k); return i < 0 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const out = path.join(proj, 'out');
fs.mkdirSync(out, { recursive: true });
const url = 'file://' + path.join(proj, 'index.html');

// one browser per worker: pages sharing a browser get background-throttled
const browsers = [];
async function openPage() {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', protocolTimeout: 600000,
    args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });
  browsers.push(browser);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => window.CM.ready());
  return page;
}
const shot = async (page, f, guides) => {
  await page.evaluate((f, g) => { window.CM.seek(f); document.body.classList.toggle('cm-guides', !!g); }, f, guides);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, optimizeForSpeed: true });
};

const probe = await openPage();
const meta = await probe.evaluate(() => ({ dur: window.CM.duration, scenes: window.CM.scenes.map(s => [s.id, s.start, s.end]) }));
// safe-zone guides for review sheets: safe rect x120–960 y240–1540, caption band y1180–1295
const GUIDES = `body.cm-guides::after{content:'';position:fixed;left:120px;top:240px;width:840px;height:1300px;outline:3px dashed rgba(0,160,255,.8);pointer-events:none;z-index:99}
body.cm-guides::before{content:'';position:fixed;left:0;top:1180px;width:1080px;height:115px;background:rgba(255,0,0,.18);pointer-events:none;z-index:99}`;

if (opt('meta')) {
  console.log(JSON.stringify(meta));
} else if (opt('stills')) {
  fs.mkdirSync(path.join(out, 'stills'), { recursive: true });
  await probe.addStyleTag({ content: GUIDES });
  for (const f of String(opt('stills')).split(',').map(Number)) {
    fs.writeFileSync(path.join(out, 'stills', `f${f}.png`), await shot(probe, f, opt('guides')));
    console.log('still', f);
  }
} else if (opt('sheet')) {
  await probe.addStyleTag({ content: GUIDES });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-sheet-'));
  const files = [];
  for (const [id, a, b] of meta.scenes) {
    for (const f of [a + 2, Math.round((a + b) / 2), b - 1]) {
      const p = path.join(dir, `${String(files.length).padStart(3, '0')}.png`);
      fs.writeFileSync(p, await shot(probe, f, opt('guides')));
      files.push(p);
    }
  }
  // 3 frames per scene per row-group; 9 columns = 3 scenes per row
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.png'),
    '-vf', `scale=270:480,tile=9x${Math.ceil(files.length / 9)}:padding=6:margin=6:color=0x222222`, '-frames:v', '1', '-q:v', '3', path.join(out, 'sheet.jpg')]);
  console.log('sheet →', path.join(out, 'sheet.jpg'), `(${meta.scenes.length} scenes)`);
} else {
  const from = Number(opt('from') || 0), to = Number(opt('to') || meta.dur);
  const workers = Number(opt('workers') || Math.max(2, Math.min(8, os.cpus().length - 2)));
  const chunk = Math.ceil((to - from) / workers);
  const t0 = Date.now();
  let done = 0;
  const segs = [];
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = from + w * chunk, b = Math.min(to, a + chunk);
    if (a >= b) return;
    const page = w === 0 ? probe : await openPage();
    const seg = path.join(out, `.seg${w}.mp4`);
    segs[w] = seg;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = a; f < b; f++) {
      const buf = await shot(page, f);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 60 === 0) process.stdout.write(`\r${done}/${to - from} frames`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }));
  const list = path.join(out, '.segs.txt');
  fs.writeFileSync(list, segs.filter(Boolean).map(s => `file '${s}'`).join('\n'));
  const silent = path.join(out, '.silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  segs.filter(Boolean).forEach(s => fs.unlinkSync(s));
  console.log(`\nvideo ${to - from} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const final = path.join(out, opt('out') || 'video.mp4');
  const planPath = path.join(proj, 'plan.json');
  if (fs.existsSync(planPath) && !opt('from')) {
    execFileSync('python3', [path.join(path.dirname(fileURLToPath(import.meta.url)), 'mix.py'), proj, silent, final], { stdio: 'inherit' });
    fs.unlinkSync(silent);
  } else fs.renameSync(silent, final);
  console.log('→', final);
}
await Promise.all(browsers.map(b => b.close()));
