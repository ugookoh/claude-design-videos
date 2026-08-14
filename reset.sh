#!/usr/bin/env bash
# Reset the repo for a new project.
# Removes all project-specific generated files while preserving the pipeline.

set -euo pipefail
cd "$(dirname "$0")"

# Read current project info
PROJ_ID=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('project.json'));console.log(p.projectId||'')}catch(e){console.log('')}" 2>/dev/null)
TEMP_DIR=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('project.json'));console.log(p.tempDir||'')}catch(e){console.log('')}" 2>/dev/null)
OUTPUT_DIR=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('project.json'));console.log(p.outputDir||'')}catch(e){console.log('')}" 2>/dev/null)

echo "This will delete all project-specific files for: ${PROJ_ID:-<no project>}"
[ -n "$TEMP_DIR" ]   && echo "  $TEMP_DIR/    (render HTMLs, frames, assets)"
[ -n "$OUTPUT_DIR" ] && echo "  $OUTPUT_DIR/  (encoded MP4s)"
echo "  src/*.jsx     (component sources — keeps animations-v3.jsx)"
echo "  dist/*.js     (compiled JS      — keeps animations-v3.js)"
echo "  project.json  (reset to empty template)"
echo ""
read -rp "Continue? [y/N] " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# Remove project temp folder
[ -n "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"

# Remove project output folder
[ -n "$OUTPUT_DIR" ] && rm -rf "$OUTPUT_DIR"

# Remove project-specific source files (keep engine)
find src -maxdepth 1 -name "*.jsx" ! -name "animations-v3.jsx" -delete 2>/dev/null || true

# Remove project-specific compiled files (keep engine)
find dist -maxdepth 1 -name "*.js" ! -name "animations-v3.js" -delete 2>/dev/null || true

# Reset project.json to empty template
cat > project.json <<'JSON'
{
  "designUrl": "",
  "projectId": "",
  "projectName": "",
  "tempDir": "",
  "outputDir": "",
  "clips": []
}
JSON

echo ""
echo "Done. Provide a Claude Design URL to start a new project."
