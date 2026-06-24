import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Wait a bit to ensure Vite server has fully compiled
    await new Promise(r => setTimeout(r, 2000));
    
    await page.goto('http://localhost:5173/Oil-Factory/#/company', { waitUntil: 'networkidle2' });
    
    // Wait for initial load and animations
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'company_view_1.png') });
    
    // Scroll down 900px
    await page.evaluate(() => window.scrollBy(0, 900));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'company_view_2.png') });
    
    // Scroll down another 900px
    await page.evaluate(() => window.scrollBy(0, 900));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'company_view_3.png') });

    // Scroll to very bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'company_view_4.png') });
    
    await browser.close();
    console.log('Successfully saved multiple scroll view screenshots');
  } catch(e) {
    console.error(e);
  }
})();
