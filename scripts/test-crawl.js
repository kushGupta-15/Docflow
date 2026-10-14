const puppeteer = require('puppeteer-core');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  console.log('Navigating to https://docflow-lyart.vercel.app...');
  await page.goto('https://docflow-lyart.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const title = await page.title();
  const url = page.url();
  console.log('Page loaded:', { title, url });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text snippet:', bodyText.slice(0, 300));

  await browser.close();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
