/**
 * Compile all src/*.jsx files to dist/*.js.
 * Uses Babel with the classic JSX runtime (generates React.createElement calls)
 * and wraps each file in an IIFE to prevent global scope collisions.
 *
 * Usage: node compile.mjs
 */

import * as babel from '@babel/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

fs.mkdirSync(distDir, { recursive: true });

const files = fs.readdirSync(srcDir)
  .filter(f => f.endsWith('.jsx'))
  .map(f => f.replace(/\.jsx$/, ''));

if (files.length === 0) {
  console.log('No .jsx files found in src/');
  process.exit(0);
}

let ok = 0, fail = 0;

for (const name of files) {
  const srcPath = path.join(srcDir, name + '.jsx');
  const distPath = path.join(distDir, name + '.js');

  try {
    const code = fs.readFileSync(srcPath, 'utf8');
    const result = babel.transformSync(code, {
      presets: [['@babel/preset-react', { runtime: 'classic' }]],
      filename: name + '.jsx',
      configFile: false,
      babelrc: false,
    });
    const wrapped = ';(function() {\n' + result.code + '\n}());';
    fs.writeFileSync(distPath, wrapped);
    const kb = (fs.statSync(distPath).size / 1024).toFixed(1);
    console.log(`  ✓  src/${name}.jsx  →  dist/${name}.js  (${kb} KB)`);
    ok++;
  } catch (err) {
    console.error(`  ✗  src/${name}.jsx  —  ${err.message}`);
    fail++;
  }
}

console.log(`\n${ok} compiled, ${fail} failed.`);
if (fail > 0) process.exit(1);
