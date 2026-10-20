import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const copyDirs = ['js', 'images', 'data', 'css'];
for (const dir of copyDirs) {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[copy-assets] Copied ${dir}/ -> dist/${dir}/`);
  }
}

const copyFiles = ['favicon.svg'];
for (const file of copyFiles) {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[copy-assets] Copied ${file} -> dist/${file}`);
  }
}

console.log('[copy-assets] Static assets successfully synchronized to dist!');
