// lib/reportEngine/pdfRenderer.ts
// ============================================================
// Report Engine — PDF Renderer
//
// The ONLY file in the engine that imports Puppeteer.
// ============================================================

async function getBrowser() {
  // For production on Vercel/AWS Lambda
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');
  
  return puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
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
    
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function renderHtml(html: string): string {
  return html;
}