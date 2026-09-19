import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
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
  const tabs = await getJSON('http://127.0.0.1:9222/json');
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

  // Step 1: Apply style fixes
  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.style.height = 'auto';
      document.documentElement.style.minHeight = '100%';
      document.documentElement.style.overflowX = 'clip';
      document.documentElement.style.overflowY = 'visible';

      document.body.style.height = 'auto';
      document.body.style.minHeight = '100vh';
      document.body.style.overflowX = 'clip';
      document.body.style.overflowY = 'visible';

      window.scrollTo(0, document.documentElement.scrollHeight);
      window.dispatchEvent(new Event('scroll'));
    `
  });

  await new Promise(r => setTimeout(r, 800));

  // Step 2: Now scroll BACK up to 0!
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('scroll'));
    `
  });

  await new Promise(r => setTimeout(r, 800));

  const checkTop = await send('Runtime.evaluate', {
    expression: `(() => {
      const hudPct = document.querySelector('.scroll-progress-pct')?.textContent;
      const hudStep = document.querySelector('.telemetry-step')?.textContent;
      return {
        scrollY: window.scrollY,
        hudPct,
        hudStep
      };
    })()`,
    returnByValue: true
  });
  console.log('REVERSE SCROLL TO TOP:\n', JSON.stringify(checkTop.result.value, null, 2));

  // Step 3: Now click the ENTER button when at bottom to verify PortalTransition
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, document.documentElement.scrollHeight);
      window.dispatchEvent(new Event('scroll'));
    `
  });

  await new Promise(r => setTimeout(r, 800));

  const enterClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.enter-vcity-button');
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('ENTER CLICK RESULT:', enterClick.result.value);

  // Wait 1.5s to see portal-transition active in DOM
  await new Promise(r => setTimeout(r, 1500));

  const checkTransition = await send('Runtime.evaluate', {
    expression: `(() => {
      const portal = document.querySelector('.portal-transition-layer');
      const whiteout = document.querySelector('.whiteout-screen-cover');
      const typewriter = document.querySelector('.cinematic-typewriter-text')?.textContent;
      return {
        hasPortal: !!portal,
        hasWhiteout: !!whiteout,
        typewriterText: typewriter
      };
    })()`,
    returnByValue: true
  });
  console.log('PORTAL TRANSITION CHECK:\n', JSON.stringify(checkTransition.result.value, null, 2));

  ws.close();
} catch (e) {
  console.error('Error:', e);
} finally {
  chromeProc.kill();
}
