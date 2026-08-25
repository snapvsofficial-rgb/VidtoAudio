const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(async () => {
     try {
       const workerScript = `
         try {
           importScripts('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js');
           console.log("imported!");
           console.log("createFFmpegCore is: ", typeof self.createFFmpegCore);
         } catch(e) {
           console.error("importScripts error:", e);
         }
       `;
       const blob = new Blob([workerScript], {type: 'text/javascript'});
       const url = URL.createObjectURL(blob);
       const worker = new Worker(url);
       worker.onmessage = e => console.log(e.data);
     } catch (e) {
       console.error("ERROR", e);
     }
  });
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
