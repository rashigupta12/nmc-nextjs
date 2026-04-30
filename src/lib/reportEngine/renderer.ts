// ============================================================
// Report Engine — PDF Renderer
//
// The ONLY file in the engine that imports Puppeteer.
// Exports two functions used by the generic route:
//   renderHtmlToPdf(html)  → Buffer
//   renderHtml(html)       → string (passthrough for HTML preview)
// ============================================================

// ─── Browser factory ─────────────────────────────────────────────────────────

async function getBrowser() {
  // ── Option A: Standard Node.js (local dev / VPS)
  // npm install puppeteer
  // const puppeteer = await import('puppeteer');
  // return puppeteer.default.launch({
  //   headless: true,
  //   args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  // });

  // ── Option B: Vercel / AWS Lambda
  // npm install puppeteer-core @sparticuz/chromium
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');
  return puppeteer.default.launch({
    args:            chromium.default.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath:  await chromium.default.executablePath(),
    headless:        true,
  });
}

// ─── Main PDF renderer ────────────────────────────────────────────────────────

/**
 * Converts an HTML string to a PDF Buffer via Puppeteer.
 * Waits for fonts (networkidle0 + document.fonts.ready) before printing.
 */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout:   30_000,
    });

    // Wait for web fonts (Poppins etc.) to finish loading
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format:          'A4',
      printBackground: true,
      margin:          { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── HTML passthrough (dev preview) ──────────────────────────────────────────

/**
 * Returns the HTML string as-is.
 * Used for the "html" format mode — no Puppeteer involved.
 */
export function renderHtml(html: string): string {
  return html;
}
