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

  // Click Sign in button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes('Sign in')) {
      console.log('Clicking Sign in button...');
      await b.click();
      break;
    }
  }

  await page.waitForTimeout ? page.waitForTimeout(4000) : new Promise(r => setTimeout(r, 4000));
  console.log('After Sign in URL:', page.url());
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button')).map(el => ({
      type: el.type,
      placeholder: el.placeholder,
      text: el.innerText
    }));
  });
  console.log('Modal / Form elements:', elements);
  await browser.close();
})();
