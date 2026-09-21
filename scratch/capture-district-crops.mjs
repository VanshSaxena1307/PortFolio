import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9228',
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

const artifactDir = 'C:/Users/vansh/.gemini/antigravity-ide/brain/d6c17ee5-8aed-473e-a284-17ee25418485';

try {
  const tabs = await getJSON('http://127.0.0.1:9228/json');
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

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2500));

  // Skip intro to enter city
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      if (skipBtn) skipBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  // Helper to capture a region bounded by elements or rect
  async function captureDistrict(filename, rect) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, rect.x),
        y: Math.max(0, rect.y),
        width: Math.min(1600 - rect.x, rect.width),
        height: Math.min(1000 - rect.y, rect.height),
        scale: 1
      }
    });
    fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));
    console.log('Saved:', filename);
  }

  // 1. Tech District crop (ExpenseIQ Bank, Campus Core, Hajiri, Climora)
  await captureDistrict('phase5-03-tech-district.png', {
    x: 0,
    y: 420,
    width: 600,
    height: 520
  });

  // 2. Research District crop (Quantum Knee Bio-Lab, Neural Core, Foundry)
  await captureDistrict('phase5-04-research-district.png', {
    x: 100,
    y: 80,
    width: 620,
    height: 480
  });

  // 3. Arena District crop (Hackathon Arena & NCC Parade Ground)
  await captureDistrict('phase5-05-arena-district.png', {
    x: 750,
    y: 120,
    width: 720,
    height: 480
  });

  // 4. Campus District crop (Quad Hall, Skills Construction Crane, LeetCode, GitHub)
  await captureDistrict('phase5-06-campus-district.png', {
    x: 520,
    y: 460,
    width: 750,
    height: 480
  });

  // 5. ECHO Monolith crop
  await captureDistrict('phase5-07-echo.png', {
    x: 440,
    y: 220,
    width: 440,
    height: 440
  });

  ws.close();
} catch (e) {
  console.error(e);
} finally {
  chromeProc.kill();
}
