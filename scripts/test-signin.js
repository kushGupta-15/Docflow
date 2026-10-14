const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  await page.goto('https://docflow-lyart.vercel.app', { waitUntil: 'networkidle2' });
  console.log('Current URL:', page.url());
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(b => ({
      tag: b.tagName,
      text: b.innerText?.trim(),
      href: b.href
    }));
  });
  console.log('Found interactive elements:', elements);
  await browser.close();
})();
