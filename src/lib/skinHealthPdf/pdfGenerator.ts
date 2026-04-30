// /lib/skinHealthPdf/pdfGenerator.ts

import { PdfGeneratorOptions } from './skinHealthTemplate';
import { buildSkinHealthReportHtml } from './skinHealthTemplate';

async function getBrowser() {
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');
  return puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

export async function generateSkinHealthPdf(
  opts: PdfGeneratorOptions
): Promise<Uint8Array> {
  const html = buildSkinHealthReportHtml(opts);

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    // Return as Uint8Array
    return pdf;
  } finally {
    await browser.close();
  }
}

export function generateSkinHealthHtml(opts: PdfGeneratorOptions): string {
  return buildSkinHealthReportHtml(opts);
}