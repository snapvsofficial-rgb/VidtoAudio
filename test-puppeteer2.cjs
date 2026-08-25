const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  
  // Wait for the FFmpeg loading or simulate uploading a file?
  // The app only loads FFmpeg when processAudio is called.
  // Let's call processAudio manually via evaluate
  await page.evaluate(async () => {
     try {
       const blob = new Blob(["test"], { type: "video/mp4" });
       await window.processAudio(blob, 'wav');
     } catch (e) {
       console.error(e);
     }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
