const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(async () => {
     try {
       const workerScriptUrl = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js';
       let workerCode = await fetch(workerScriptUrl).then(r => r.text());
       
       const blob = new Blob([workerCode], {type: 'text/javascript'});
       const classWorkerURL = URL.createObjectURL(blob);
       
       const { FFmpeg } = window.FFmpegWASM;
       const ffmpeg = new FFmpeg();
       const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
       
       const coreURL = `${baseURL}/ffmpeg-core.js`;
       const wasmURL = `${baseURL}/ffmpeg-core.wasm`;

       await ffmpeg.load({ coreURL, wasmURL, classWorkerURL });
       
       ffmpeg.on('log', ({ message }) => console.log('FFMPEG LOG:', message));
       
       const dummyFile = new Uint8Array(1000);
       await ffmpeg.writeFile('input.wav', dummyFile);
       await ffmpeg.exec(['-i', 'input.wav', '-c:a', 'libmp3lame', 'output.mp3']);
       console.log("EXEC DONE!");
     } catch (e) {
       console.error("ERROR", e);
     }
  });
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
