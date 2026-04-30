// ============================================================
// Immunity PDF Generator
// Puppeteer wrapper — mirrors womenHealthPdf/pdfGenerator.ts
// ============================================================

import { PdfGeneratorOptions } from '@/types/immunityReport.types';
import { buildImmunityReportHtml } from './immunityTemplate';

// ─── Puppeteer browser factory ────────────────────────────────────────────────

async function getBrowser() {
  // Option A: Standard Node.js (local dev / VPS)
  // npm install puppeteer
  // const puppeteer = await import('puppeteer');
  // return puppeteer.default.launch({
  //   headless: true,
  //   args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  // });

  // Option B: Vercel / AWS Lambda — uncomment and use instead
  // npm install puppeteer-core @sparticuz/chromium
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');
  return puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

// ─── Main PDF generator ───────────────────────────────────────────────────────

export async function generateImmunityPdf(
  opts: PdfGeneratorOptions
): Promise<Buffer> {
  const html = buildImmunityReportHtml(opts);

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    // A4 viewport at 2x scale for crisp rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    });

    // Wait for web fonts (Poppins)
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── HTML-only preview (dev / debugging) ─────────────────────────────────────

export function generateImmunityHtml(opts: PdfGeneratorOptions): string {
  return buildImmunityReportHtml(opts);
}
