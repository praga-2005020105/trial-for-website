import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const copyDirs = ['js', 'images', 'data', 'css', 'videos'];
for (const dir of copyDirs) {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[copy-assets] Copied ${dir}/ -> dist/${dir}/`);
  }
}

// Minify production JavaScript in dist/js for optimal mobile performance
const distJsDir = path.join(distDir, 'js');
if (fs.existsSync(distJsDir)) {
  const jsFiles = fs.readdirSync(distJsDir);
  for (const file of jsFiles) {
    if (file.endsWith('.js')) {
      const filePath = path.join(distJsDir, file);
      try {
        const rawCode = fs.readFileSync(filePath, 'utf-8');
        const minified = esbuild.transformSync(rawCode, {
          minify: true,
          target: 'es2020',
          legalComments: 'none'
        });
        fs.writeFileSync(filePath, minified.code, 'utf-8');
        console.log(`[copy-assets] Minified dist/js/${file}`);
      } catch (err) {
        console.warn(`[copy-assets] Skip minifying ${file}:`, err.message);
      }
    }
  }
}

const copyFiles = ['favicon.svg', 'robots.txt', 'sitemap.xml'];
for (const file of copyFiles) {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[copy-assets] Copied ${file} -> dist/${file}`);
  }
}

console.log('[copy-assets] Static assets successfully synchronized and optimized in dist!');
