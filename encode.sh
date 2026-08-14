#!/usr/bin/env bash
# Encode captured PNG frames to 4K video files.
# Reads tempDir and outputDir from project.json.
# Usage: bash encode.sh [clip-id | all]

set -euo pipefail
cd "$(dirname "$0")"

# Resolve paths from project.json via node
TEMP_DIR=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('project.json'));console.log(p.tempDir)}catch(e){console.log('temp')}" 2>/dev/null)
OUTPUT_DIR=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('project.json'));console.log(p.outputDir)}catch(e){console.log('output')}" 2>/dev/null)

mkdir -p "$OUTPUT_DIR"

# Resolve ffmpeg
FFMPEG="${FFMPEG:-ffmpeg}"
if ! command -v "$FFMPEG" &>/dev/null; then
  CANDIDATE="$HOME/Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac"
  if [ -f "$CANDIDATE" ]; then
    FFMPEG="$CANDIDATE"
    echo "Using Playwright ffmpeg: $FFMPEG"
  else
    echo "ERROR: ffmpeg not found. Install with: brew install ffmpeg"
    exit 1
  fi
fi

encode() {
  local clip="$1" fps="${2:-30}"
  local frames_dir="${TEMP_DIR}/frames/${clip}"
  if [ ! -d "$frames_dir" ] || [ -z "$(ls -A "$frames_dir" 2>/dev/null)" ]; then
    echo "No frames for clip ${clip}, skipping."
    return
  fi

  echo ""
  echo "━━━ Encoding clip ${clip} ━━━"

  local count; count=$(ls "$frames_dir"/frame_*.png 2>/dev/null | wc -l | tr -d ' ')
  echo "  Frames: $count @ ${fps}fps"

  local out="${OUTPUT_DIR}/clip-${clip}-4k.mp4"
  "$FFMPEG" -y \
    -framerate "$fps" \
    -i "${frames_dir}/frame_%06d.png" \
    -c:v libx264 \
    -preset slow \
    -crf 10 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -color_primaries bt709 \
    -color_trc bt709 \
    -colorspace bt709 \
    "$out"

  local size; size=$(du -sh "$out" | cut -f1)
  echo "  Output: $out ($size)"
}

CLIP="${1:-all}"
if [ "$CLIP" = "all" ]; then
  AUTO_CLIPS=$(find "${TEMP_DIR}/frames" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | xargs -I{} basename {} | sort)
  if [ -z "$AUTO_CLIPS" ]; then
    echo "No clip directories found in ${TEMP_DIR}/frames/. Run capture.mjs first."
    exit 1
  fi
  for clip in $AUTO_CLIPS; do
    encode "$clip"
  done
else
  encode "$CLIP"
fi

echo ""
echo "Encode complete. Files in ${OUTPUT_DIR}/:"
ls -lh "$OUTPUT_DIR/" 2>/dev/null || true
