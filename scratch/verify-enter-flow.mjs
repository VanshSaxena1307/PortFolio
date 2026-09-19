import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
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
  const tabs = await getJSON('http://127.0.0.1:9224/json');
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
  await new Promise(r => setTimeout(r, 1500));

  // 1. Scroll to 100% on Landing Page
  await send('Runtime.evaluate', {
    expression: `(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll);
    })()`
  });

  // Wait 1.8s for RAF lerp to complete reaching 1.0
  await new Promise(r => setTimeout(r, 1800));

  // 2. Check ENTER button visibility & click it
  const enterClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = document.querySelector('.enter-vcity-button');
      if (enterBtn) {
        enterBtn.click();
        return { clicked: true, text: enterBtn.textContent };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('1. ENTER BUTTON CLICKED:', enterClick.result.value);

  // 3. Verify Portal Transition is active
  await new Promise(r => setTimeout(r, 1000));
  const portalPhaseCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const portal = document.querySelector('.portal-transition-layer');
      const whiteout = document.querySelector('.whiteout-screen-cover');
      return {
        portalActive: !!portal,
        whiteoutActive: !!whiteout
      };
    })()`,
    returnByValue: true
  });
  console.log('2. PORTAL TRANSITION ACTIVE:', portalPhaseCheck.result.value);

  // 4. Wait for portal sequence to reveal city, flyover descent, and settle (~8-9s total)
  console.log('Waiting for flyover descent & campus spawn touchdown...');
  await new Promise(r => setTimeout(r, 8500));

  const postDescentCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const viewport = document.querySelector('.city-viewport-root');
      const cameraRig = document.querySelector('.city-camera-rig');
      const welcomeBanner = document.querySelector('.campus-welcome-banner')?.textContent;
      const hudDistrict = document.querySelector('.hud-district-indicator')?.textContent;
      return {
        inCityWorld: !!viewport,
        cameraRigClass: cameraRig?.className,
        welcomeBanner,
        hudDistrict
      };
    })()`,
    returnByValue: true
  });
  console.log('3. POST-DESCENT CAMPUS ARRIVAL:\n', JSON.stringify(postDescentCheck.result.value, null, 2));

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chromeProc.kill();
}
