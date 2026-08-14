// Capture 3 frames from clip 01 as a smoke test
import { chromium } from 'playwright';
import fs from 'fs';

const W = 3840, H = 2160, BAR_H = 44;

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu',
         `--window-size=${W},${H+BAR_H}`, '--force-color-profile=srgb'],
});

const ctx = await browser.newContext({
  viewport: { width: W, height: H + BAR_H }, deviceScaleFactor: 1,
});
const page = await ctx.newPage();
page.on('console', m => { if (m.type()==='error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));

console.log('Loading render-01.html…');
await page.goto('http://localhost:8080/render-01.html', { waitUntil: 'domcontentloaded', timeout: 60000 });

console.log('Waiting for animation engine…');
const svg = await page.waitForSelector('[data-om-exportable-video-with-duration-secs]', { timeout: 60000 });
const dur = await page.evaluate(() =>
  parseFloat(document.querySelector('[data-om-exportable-video-with-duration-secs]')
    .getAttribute('data-om-exportable-video-with-duration-secs'))
);
console.log(`Animation duration: ${dur}s`);

await page.waitForFunction(() => document.fonts.ready.then(() => true));
await page.waitForTimeout(1500);

fs.mkdirSync('smoke', { recursive: true });

for (const t of [0, 2.0, 5.0]) {
  await page.evaluate((seekTime) => {
    const svg = document.querySelector('[data-om-exportable-video-with-duration-secs]');
    svg.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', { detail: { time: seekTime, sync: true } }));
  }, t);
  const p = `smoke/frame_t${String(t).replace('.','_')}.png`;
  await page.screenshot({ path: p, clip: { x: 0, y: 0, width: W, height: H } });
  const { size } = fs.statSync(p);
  console.log(`t=${t}s → ${p} (${(size/1024/1024).toFixed(1)} MB)`);
}

await browser.close();
console.log('\nSmoke test passed. Check smoke/ directory for preview frames.');
