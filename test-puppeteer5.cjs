const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(async () => {
     try {
       const workerScript = `
         self.onmessage = async (e) => {
           try {
             importScripts('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js');
             console.log("imported asynchronously!");
           } catch(err) {
             console.error("importScripts error:", err);
           }
         };
       `;
       const blob = new Blob([workerScript], {type: 'text/javascript'});
       const url = URL.createObjectURL(blob);
       const worker = new Worker(url);
       worker.postMessage("test");
     } catch (e) {
       console.error("ERROR", e);
     }
  });
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
