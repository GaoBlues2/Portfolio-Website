// Build tĩnh cho Cloudflare Workers (static assets): chép trang web sang dist/, bỏ ảnh gốc & file làm việc.
// Không dùng vite build vì các script là <script> thường (không phải module) và ảnh được gọi bằng chuỗi trong JS.
import { cpSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist';
const SKIP = new Set(['assets/raw', 'assets/bg.png', ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `assets/photo_${i}.png`)]);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const p of ['index.html', 'css', 'js', 'assets']) {
  cpSync(p, join(OUT, p), { recursive: true, filter: (src) => !SKIP.has(src.replaceAll('\\', '/')) && !src.endsWith('.src.css') && !src.endsWith('.DS_Store') });
}
let n = 0, size = 0;
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f), s = statSync(p); if (s.isDirectory()) walk(p); else { n++; size += s.size; } } })(OUT);
console.log(`dist: ${n} files, ${(size / 1048576).toFixed(1)} MB`);
