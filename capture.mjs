/**
 * 4K frame capture — reads clip config from project.json.
 *
 * Usage:
 *   node capture.mjs [clip]   # clip = id from project.json | all (default: all)
 *
 * Requires: http-server running on port 8080 from the claude_renders directory.
 *   npx http-server . -p 8080 --cors -c-1
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 3840;
const H = 2160;
const BAR_H = 44;         // Stage playback bar — viewport height = H + BAR_H → scale = 1.0
const FPS = 30;
const BASE_URL = 'http://localhost:8080';

// Load clips and paths from project.json
let CLIPS, TEMP_DIR;
try {
  const proj = JSON.parse(fs.readFileSync(path.join(__dirname, 'project.json'), 'utf8'));
  TEMP_DIR = proj.tempDir;
  if (proj.clips && proj.clips.length > 0) {
    CLIPS = {};
    for (const c of proj.clips) {
      CLIPS[c.id] = {
        url: `${BASE_URL}/${proj.tempDir}/${c.renderHtml}`,
        dur: c.dur,
      };
    }
  }
} catch {}

if (!CLIPS || Object.keys(CLIPS).length === 0) {
  console.error('No clips found in project.json. Add clips before capturing.');
  process.exit(1);
}

const target = process.argv[2] || 'all';
const toRender = target === 'all' ? Object.keys(CLIPS) : [target];

console.log(`Rendering clip(s): ${toRender.join(', ')}`);
console.log(`Output: ${W}×${H} @ ${FPS}fps`);

const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    `--window-size=${W},${H + BAR_H}`,
    '--force-color-profile=srgb',
    '--disable-lcd-text',                  // consistent rendering
    '--disable-font-subpixel-positioning',  // consistent rendering
  ],
});

for (const clipId of toRender) {
  const clip = CLIPS[clipId];
  if (!clip) { console.error(`Unknown clip: ${clipId}`); continue; }

  const framesDir = path.join(__dirname, TEMP_DIR, 'frames', clipId);
  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`\n━━━ Clip ${clipId} ━━━`);
  console.log(`  URL:      ${clip.url}`);
  console.log(`  Duration: ${clip.dur}s → ${Math.ceil(clip.dur * FPS)} frames`);

  const ctx = await browser.newContext({
    viewport: { width: W, height: H + BAR_H },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  // Silence console noise from the animation engine
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [page]', msg.text());
  });
  page.on('pageerror', err => console.error('  [pageerror]', err.message));

  console.log('  Loading page…');
  await page.goto(clip.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for the animation engine's SVG canvas to mount
  const svgHandle = await page.waitForSelector(
    '[data-om-exportable-video-with-duration-secs]',
    { timeout: 60000 }
  );

  // Wait for fonts to fully load before capturing
  await page.waitForFunction(() => document.fonts.ready.then(() => true), { timeout: 30000 });

  // Extra settle: let React finish any pending effects
  await page.waitForTimeout(1500);

  console.log('  Fonts loaded, beginning frame capture…');

  const totalFrames = Math.ceil(clip.dur * FPS);
  let t0 = Date.now();

  for (let i = 0; i <= totalFrames; i++) {
    const t = Math.min(i / FPS, clip.dur);

    // Seek the animation engine to time t (sync=true → ReactDOM.flushSync ensures
    // the DOM is updated synchronously before dispatchEvent returns)
    await page.evaluate((seekTime) => {
      const svg = document.querySelector('[data-om-exportable-video-with-duration-secs]');
      svg.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', {
        detail: { time: seekTime, sync: true },
      }));
    }, t);

    // Capture exactly W×H — clip the viewport to the animation area
    const framePath = path.join(framesDir, `frame_${String(i).padStart(6, '0')}.png`);
    await page.screenshot({ path: framePath, clip: { x: 0, y: 0, width: W, height: H } });

    if (i % FPS === 0 || i === totalFrames) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const pct = Math.round((i / totalFrames) * 100);
      console.log(`  [${String(pct).padStart(3)}%] frame ${i}/${totalFrames}  t=${t.toFixed(2)}s  elapsed=${elapsed}s`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  Done. ${totalFrames + 1} frames in ${elapsed}s.`);

  await ctx.close();
}

await browser.close();
console.log('\nAll clips captured. Run encode.sh to produce the MP4s.');
