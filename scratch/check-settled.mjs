import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:3001/';

const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--disable-gpu',
  '--window-size=1920,1080',
  targetUrl,
]);

await new Promise((r) => setTimeout(r, 2000));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

try {
  const tabs = await getJSON('http://127.0.0.1:9224/json');
  const targetTab = tabs.find((t) => t.url.includes('3001')) || tabs[0];
  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (event) => {
        const res = JSON.parse(event.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1200));

  // Scroll to bottom and click Enter
  await evaluate(`(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  })()`);
  await new Promise((r) => setTimeout(r, 500));
  await evaluate(`(() => {
    document.querySelector('.enter-vcity-button')?.click();
  })()`);

  // Total time to settled:
  // 320ms pause + 660ms turb + 770ms whiteout + ~2000ms typewriter + 700ms hold + 250ms flash + 1200ms aerial + 3200ms descent = ~9.1s
  console.log('Waiting 10s for full transition to settle into Campus Spawn...');
  await new Promise((r) => setTimeout(r, 10000));

  const settledState = await evaluate(`(() => {
    const rig = document.querySelector('.entry-camera-rig');
    const welcome = document.querySelector('.campus-welcome-banner');
    const cityContainer = document.querySelector('.city-entry-container');
    const campusZone = document.querySelector('.campus-district-zone');
    return {
      hasCityContainer: cityContainer !== null,
      cameraClass: rig?.className,
      isSettled: rig?.classList.contains('camera-settled-isometric'),
      hasCampusZone: campusZone !== null,
      welcomeText: welcome?.textContent?.trim(),
      welcomeVisible: welcome !== null,
      visitorControlActive: document.querySelector('.city-entry-viewport')?.classList.contains('visitor-control-active')
    };
  })()`);

  console.log('SETTLED STATE RESULT:', settledState);

  // Wait 2s for welcome banner to fade and visitor control to activate
  await new Promise((r) => setTimeout(r, 2200));
  const handoffState = await evaluate(`(() => {
    return {
      visitorControlActive: document.querySelector('.city-entry-viewport')?.classList.contains('visitor-control-active'),
      controlHudText: document.querySelector('.visitor-control-hud')?.textContent?.trim()
    };
  })()`);
  console.log('CONTROL HANDOFF RESULT:', handoffState);
} finally {
  chromeProc.kill();
  process.exit(0);
}
