# Claude Renders — Reusable 4K Animation Pipeline

This repo captures Claude Design animations frame-by-frame via Playwright and encodes them to 4K MP4 using ffmpeg. It is designed to be reused across multiple YouTube video projects.

---

## Starting a Session

When the user provides a Claude Design URL (e.g. `https://claude.ai/design/p/...`):

1. Read `project.json` — if the URL matches what is already there and frames/output already exist, skip to wherever the pipeline left off.
2. If it is a new URL or a new project, run `bash reset.sh` first to clear the previous project's generated files.
3. Follow the **Full Pipeline** steps below.

---

## Full Pipeline

### Step 1 — Connect to Claude Design

Run `/design-login` if DesignSync is not already authenticated in this session. Then use the `DesignSync` tool to fetch the project at the URL the user provided.

From the DesignSync response, extract:
- Project name and author
- All animation component JSX source files
- Per-clip information: component name, scene list (with durations), background colour, and any props

Save the JSX files to `src/` — one file per component (e.g. `src/thumb-broll.jsx`). The animation engine `src/animations-v3.jsx` is already present; only overwrite it if DesignSync returns a newer version.

Clips that use the house-backdrop get `src/stage-bg.jsx` mounted alongside the main component.

### Step 2 — Update project.json

Write the current project state to `project.json` so the next session can resume without re-fetching.

The `projectId` is the UUID from the design URL (e.g. `https://claude.ai/design/p/{projectId}`).

```json
{
  "designUrl": "https://claude.ai/design/p/...",
  "projectId": "uuid-from-url",
  "projectName": "...",
  "author": "...",
  "tempDir": "temp/uuid-from-url",
  "outputDir": "output/uuid-from-url",
  "clips": [
    {
      "id": "01",
      "component": "ComponentName",
      "renderHtml": "render-01.html",
      "dur": 8.0,
      "bg": "#00b140",
      "isGreenScreen": true,
      "extraComponents": [],
      "scenes": "[{\"name\":\"...\",\"dur\":2.6,\"desc\":\"...\"}]",
      "props": {}
    }
  ]
}
```

- `projectId` — UUID from the design URL path segment after `/p/`
- `tempDir` — `temp/{projectId}` — render HTMLs, captured frames, and assets live here
- `outputDir` — `output/{projectId}` — final MP4 files land here
- `id` — clip identifier; used for the frames subdirectory and output filename
- `dur` — total clip duration in seconds (sum of all scene `dur` values)
- `bg` — `"#00b140"` for green screen clips, `"#0b0b0c"` for house-backdrop clips
- `isGreenScreen` — true means the clip will be keyed in DaVinci Resolve; avoid soft shadows or glows in these clips
- `extraComponents` — additional components to mount (e.g. `["StageBg"]`)
- `scenes` — JSON string passed verbatim as `window.OM_SCENES`
- `props` — props passed to the main component

### Step 3 — Compile JSX

```bash
node compile.mjs
```

This transpiles every `src/*.jsx` → `dist/*.js` using Babel (classic runtime + IIFE wrap). Run it after saving or editing any source file.

### Step 4 — Create Render HTML Files

Create one `render-{id}.html` per clip inside `{tempDir}/`. Use this template:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" crossorigin />
<style>
  * { margin: 0; padding: 0; }
  html, body { width: 3840px; height: 2204px; overflow: hidden; background: #000; }
  #root { position: fixed; inset: 0; width: 3840px; height: 2204px; }
</style>
<script>
  window.OM_SCENES = '...scenes JSON string from project.json...';
  window.OM_PLAYBACK = '{"mode":"times","count":1}';
</script>
</head>
<body>
<div id="root"></div>
<script src="/dist/animations-v3.js"></script>
<!-- add /dist/stage-bg.js here if extraComponents includes StageBg -->
<script src="/dist/{component-filename}.js"></script>
<script>
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(CompositionStage,
      { width: 3840, height: 2160, bg: '{bg}', scenes: window.OM_SCENES, playback: window.OM_PLAYBACK },
      /* React.createElement(StageBg, null), — include if extraComponents has StageBg */
      React.createElement({ComponentName}, {
        /* spread props from project.json */
      })
    )
  );
</script>
</body>
</html>
```

### Step 5 — Capture Frames

Start the HTTP server (if not already running):

```bash
npx http-server . -p 8080 --cors -c-1 &
```

Then capture:

```bash
node capture.mjs all        # all clips from project.json
node capture.mjs 01         # single clip
```

`capture.mjs` reads clip IDs, URLs, and durations from `project.json` automatically.

### Step 6 — Encode to MP4

```bash
bash encode.sh all          # encodes whatever is in frames/
bash encode.sh 01           # single clip
```

Output files land in `output/clip-{id}-4k.mp4`, tagged BT.709, yuv420p, CRF 10 — ready to import into DaVinci Resolve.

---

## Starting a New Project (Reset)

```bash
bash reset.sh
```

This removes all generated files (frames, output, smoke, render-*.html, project-specific src/*.jsx and dist/*.js, assets/) and resets project.json to an empty template. The animation engine (`animations-v3.*`) and pipeline scripts are preserved.

After reset, provide the new Claude Design URL to begin.

---

## Technical Reference

### 4K Viewport Math

- Stage canvas: 3840×2160 (authored 1920×1080, scaled ×2 with CSS)
- Playwright viewport: 3840×2204 (2204 = 2160 + 44 for the stage playback bar)
- This gives `scale = min(3840/3840, (2204-44)/2160) = 1.0` — no letterboxing, pixel-perfect
- Screenshot: `page.screenshot({ clip: { x:0, y:0, width:3840, height:2160 } })` — clipped page screenshot, NOT element screenshot (element screenshot adds 1px due to flexbox sub-pixel layout)

### Seek Protocol

The animation engine exposes a custom event on its SVG canvas:

```js
svg.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', {
  detail: { time: seekTime, sync: true },
}));
```

With `sync: true`, the engine calls `ReactDOM.flushSync` internally, so the DOM is fully updated before `dispatchEvent` returns. No `await` or extra delay needed after seeking.

The SVG is identified by: `document.querySelector('[data-om-exportable-video-with-duration-secs]')`

### Babel / IIFE

All `.jsx` files are compiled with:
- `@babel/preset-react` + `{ runtime: 'classic' }` — generates `React.createElement(...)` calls, not ESM imports
- IIFE wrap: `;(function() { ... }());` — prevents top-level `const`/`function` declarations in different files from conflicting in the shared global scope

### Green Screen vs House Backdrop

| Type | bg | DaVinci Resolve | Notes |
|---|---|---|---|
| Green screen | `#00b140` | Delta Keyer | No soft shadows, glows, or transparency near edges |
| House backdrop | `#0b0b0c` | No keying | Mount `StageBg` alongside the main component |

### Font Stack

- Satoshi (via fontshare.com): 400, 500, 600, 700, 900
- JetBrains Mono (Google Fonts): 400, 500, 600

Both are loaded via `<link>` in the render HTML. The capture script waits for `document.fonts.ready` + 1.5 s settle before starting frame capture to ensure fonts are fully painted.

---

## Directory Structure

```
claude_renders/
  CLAUDE.md               ← this file
  project.json            ← current project state (gitignored)
  compile.mjs             ← JSX compiler
  capture.mjs             ← frame capture
  encode.sh               ← MP4 encoder
  reset.sh                ← project cleanup
  src/                    ← JSX sources (committed; engine files only)
  dist/                   ← compiled JS  (gitignored)
  temp/                   ← gitignored
    {projectId}/
      render-01.html      ← per-clip render pages
      render-02.html
      frames/
        01/  02/  …       ← captured PNG frames
      assets/             ← images from DesignSync
      smoke/              ← smoke-test frames
  output/                 ← gitignored
    {projectId}/
      clip-01-4k.mp4
      clip-02-4k.mp4
      …
```

## File Reference

| File | Role | Changes per project? |
|---|---|---|
| `CLAUDE.md` | This file — pipeline guide | No |
| `project.json` | Current project state | Yes — updated each session |
| `compile.mjs` | JSX → JS compiler | No |
| `capture.mjs` | Frame capture (Playwright) | No — reads project.json |
| `encode.sh` | MP4 encoding (ffmpeg) | No — reads project.json |
| `reset.sh` | Clean slate for new project | No |
| `src/animations-v3.jsx` | Animation engine | Only if engine updated |
| `src/stage-bg.jsx` | House backdrop component | Rarely |
| `src/{name}.jsx` | Project component sources | Yes — fetched from DesignSync |
| `dist/*.js` | Compiled JS (gitignored, generated) | Yes — output of compile.mjs |
| `temp/{id}/render-{n}.html` | Per-clip render pages | Yes — created per project |
| `temp/{id}/frames/{n}/` | Captured PNG frames | Yes — generated |
| `temp/{id}/assets/` | Images from DesignSync | Yes — extracted per project |
| `output/{id}/` | Final MP4 files | Yes — generated |
