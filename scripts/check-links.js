/**
 * Checks that every source and portal URL in data/countries/*.yaml still responds.
 * Some official sites block scripted requests (HTTP 403); those are reported so
 * you can open them in a browser. Run it as part of the yearly refresh.
 *
 * Usage: npm run data:check-links
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const countriesDir = path.join(__dirname, '../data/countries');
const UA = 'Mozilla/5.0 (compatible; find-country-for-phd link checker)';

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
      if (res.ok || method === 'GET') return res.status;
    } catch (e) {
      if (method === 'GET') return e.name === 'TimeoutError' ? 'timeout' : (e.cause?.code || 'error');
    }
  }
}

const urls = new Map();
for (const file of fs.readdirSync(countriesDir).filter(f => f.endsWith('.yaml'))) {
  const d = yaml.load(fs.readFileSync(path.join(countriesDir, file), 'utf8'));
  for (const s of [...(d.sources || []), ...(d.contact_portals || [])]) {
    if (!urls.has(s.url)) urls.set(s.url, []);
    urls.get(s.url).push(d.id);
  }
}

console.log(`Checking ${urls.size} unique URLs ...`);
const results = await Promise.all([...urls.keys()].map(async url => [url, await check(url)]));
let broken = 0;
for (const [url, status] of results.sort((a, b) => String(a[1]).localeCompare(String(b[1])))) {
  if (typeof status === 'number' && status >= 200 && status < 300) continue;
  // 403 = the site blocks scripts; certificate errors are usually an incomplete TLS chain
  // that browsers tolerate. Both need a manual look but are not counted as broken.
  const manual = status === 403 || /CERT|SIGNATURE|UNABLE_TO_VERIFY/.test(String(status));
  const label = manual ? 'CHECK IN A BROWSER' : 'BROKEN';
  if (!manual) broken++;
  console.log(`${label.padEnd(28)} ${String(status).padEnd(8)} ${url}  [${urls.get(url).join(', ')}]`);
}
console.log(`\n${results.filter(([, s]) => s >= 200 && s < 300).length}/${urls.size} OK, ${broken} broken.`);
process.exit(broken > 0 ? 1 : 0);
