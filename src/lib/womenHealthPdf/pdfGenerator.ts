// ============================================================
// Women's Health PDF Generator Service
// Uses Puppeteer to convert the HTML template → PDF
//
// INSTALL: npm install puppeteer
//          (or: npm install puppeteer-core @sparticuz/chromium)
//          for serverless / Vercel use the sparticuz variant
// ============================================================

import { PdfGeneratorOptions } from '@/types/womenHealthReport';
import { buildWomenHealthReportHtml } from './womenHealthTemplate';



// ─── Puppeteer import (works in both local & serverless) ────

async function getBrowser() {
  // ── Option A: Standard Node.js environment (local dev, VPS)
  // npm install puppeteer
  // const puppeteer = await import('puppeteer');
  // return puppeteer.default.launch({
  //   headless: true,
  //   args: [
  //     '--no-sandbox',
  //     '--disable-setuid-sandbox',
  //     '--disable-dev-shm-usage',
  //     '--disable-gpu',
  //   ],
  // });

  // ── Option B: Vercel / AWS Lambda — uncomment and use instead
  // npm install puppeteer-core @sparticuz/chromium
  //
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');
  return puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

// ─── Main generator ─────────────────────────────────────────

export async function generateWomenHealthPdf(
  opts: PdfGeneratorOptions
): Promise<Buffer> {
  const html = buildWomenHealthReportHtml(opts);

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    // Set A4 viewport
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    await page.setContent(html, {
      waitUntil: 'networkidle0', // wait for fonts / images
      timeout: 30_000,
    });

    // Wait for fonts to settle
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

// ─── HTML-only preview (for dev / debugging) ────────────────

export function generateWomenHealthHtml(opts: PdfGeneratorOptions): string {
  return buildWomenHealthReportHtml(opts);
}
