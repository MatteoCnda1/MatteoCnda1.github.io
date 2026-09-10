// Runs after `docusaurus build`. Scrapes the already-built HTML for each doc
// page's title and last-updated date (rendered by the LastUpdated theme
// component) and writes a small JSON file the /recent-updates page fetches
// client-side. Reading the built output (rather than recomputing slugs
// ourselves) guarantees the URLs are always correct.
import fs from 'node:fs';
import path from 'node:path';

const BUILD_DIR = 'build';
const ROOTS = ['docs', 'cours-marie'];
const MAX_ENTRIES = 100;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

function extract(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const timeMatch = html.match(/<time datetime=["']?([^"'\s>]+)["']?/);
  if (!timeMatch) return null;
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/);
  let title = titleMatch ? titleMatch[1] : path.dirname(htmlPath);
  title = title.split('|')[0].trim();
  const rel = path.relative(BUILD_DIR, path.dirname(htmlPath));
  const url = '/' + rel.split(path.sep).join('/') + '/';
  const section = rel.startsWith('cours-marie') ? 'marie' : 'docs';
  return { title, url, date: timeMatch[1], section };
}

const results = [];
for (const root of ROOTS) {
  const dir = path.join(BUILD_DIR, root);
  if (!fs.existsSync(dir)) continue;
  for (const htmlPath of walk(dir)) {
    const entry = extract(htmlPath);
    if (entry) results.push(entry);
  }
}

results.sort((a, b) => new Date(b.date) - new Date(a.date));
const trimmed = results.slice(0, MAX_ENTRIES);

fs.writeFileSync(path.join(BUILD_DIR, 'recent-updates.json'), JSON.stringify(trimmed));
console.log(
  `[generate-recent-updates] ${results.length} pages with dates found, kept ${trimmed.length} most recent.`,
);
