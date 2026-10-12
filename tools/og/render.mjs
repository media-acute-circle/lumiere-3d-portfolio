// Renders the Open Graph images in assets/og/ from the templates in this folder.
//   npm i -D playwright && npx playwright install chromium
//   node tools/og/render.mjs
// Step 1 captures the live WebGL pendant from portfolio.html (Dark Gallery);
// step 2 composes og-portfolio.jpg and og-access.jpg at 1200×630
// (JPEG keeps them under WhatsApp's ~300 KB preview limit).
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const HASH = '31d7e1681777aa28a58007dc7c351b241ce0f02dc31eefb81bb0d972046c1b84';
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});

// 1. Capture the pendant
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.addInitScript(h => sessionStorage.setItem('lumiere-access', h), HASH);
await page.goto(pathToFileURL(path.join(root, 'portfolio.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  document.querySelector('.dock [data-set-theme="gallery"]').click();
  document.querySelectorAll('.hero-switch, .hero-dial, .hero-panel, .hero-word, .nav, .dock, .progress').forEach(el => { el.style.visibility = 'hidden'; });
});
await page.waitForTimeout(3500);
await page.locator('#heroStage').screenshot({ path: path.join(here, 'pendant.png') });
await page.close();

// 2. Compose the cards
for (const name of ['og-portfolio', 'og-access']) {
  const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await card.goto(pathToFileURL(path.join(here, name + '.html')).href, { waitUntil: 'networkidle' });
  await card.evaluate(() => document.fonts.ready);
  await card.screenshot({ path: path.join(root, 'assets/og', name + '.jpg'), type: 'jpeg', quality: 86 });
  await card.close();
  console.log('wrote assets/og/' + name + '.jpg');
}
await browser.close();
