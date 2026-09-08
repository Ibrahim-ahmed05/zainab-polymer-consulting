import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
await mkdir('qa', { recursive: true });
const results = [];
for (const width of (process.env.TEST_WIDTHS ? process.env.TEST_WIDTHS.split(",").map(Number) : [320, 375, 390, 768, 1024, 1440, 1920])) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8082', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && (box.right > innerWidth + 2 || box.left < -2) && getComputedStyle(el).position !== 'absolute';
  }).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 65) })).slice(0, 12));
  console.log('Checking', width, 'technology count', await page.locator('#technology').count());
  if (!await page.locator('#technology').count()) { console.log((await page.locator('body').innerText()).slice(0, 1200)); }
  await page.locator('#technology').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next diagram', exact: true }).click();
  await page.getByRole('button', { name: 'Expand View:', exact: false }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  if (width < 1280) {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.locator('#mobile-navigation').getByRole('link', { name: 'About', exact: true }).click();
  }
  await page.screenshot({ path: `qa/viewport-${width}.png` });
  results.push({ width, overflow, errors });
  await page.close();
}
await browser.close();
await writeFile('qa/responsive.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.overflow.length || result.errors.length)) process.exitCode = 1;
