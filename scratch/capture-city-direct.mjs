import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--disable-gpu',
  '--window-size=1600,1000',
  'http://localhost:3000/'
]);

await new Promise(r => setTimeout(r, 2000));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

try {
  const tabs = await getJSON('http://127.0.0.1:9226/json');
  const targetTab = tabs.find(t => t.url.includes('localhost:3000')) || tabs[0];
  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.onopen = resolve);

  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      const handler = (event) => {
        const res = JSON.parse(event.data);
        if (res.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => setTimeout(r, 1000));
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // Click skip button
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      if (skipBtn) {
        skipBtn.click();
        return { clicked: true };
      }
      return { clicked: false, buttons: Array.from(document.querySelectorAll('button')).map(b => b.className) };
    })()`,
    returnByValue: true
  });
  console.log('CLICK RESULT:', clickResult.result.value);

  // Wait until .city-viewport-root exists
  let cityReady = false;
  for (let i = 0; i < 20; i++) {
    const check = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('.city-viewport-root')`,
      returnByValue: true
    });
    if (check.result.value) {
      cityReady = true;
      break;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('CITY READY IN DOM:', cityReady);

  // Allow 2.5s for diorama to render and settle
  await new Promise(r => setTimeout(r, 2500));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const artifactDir = 'C:\\Users\\vansh\\.gemini\\antigravity-ide\\brain\\5520e4b6-a9eb-46dd-a36f-14b94b6408bd';
  const outPath = path.join(artifactDir, 'vcity-phase4-screenshot.png');
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log('SCREENSHOT SAVED TO:', outPath);

  ws.close();
} catch (e) {
  console.error('Error during screenshot capture:', e);
} finally {
  chromeProc.kill();
}
