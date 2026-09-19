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

  await new Promise(r => setTimeout(r, 1500));

  // Reload page fresh to ensure zero manual style overrides
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 1500));

  // 1. Initial State
  const initial = await send('Runtime.evaluate', {
    expression: `(() => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const pct = document.querySelector('.scroll-progress-pct')?.textContent;
      const step = document.querySelector('.telemetry-step')?.textContent;
      return {
        scrollY: window.scrollY,
        docHeight,
        winHeight,
        canScroll: docHeight > winHeight,
        pct,
        step
      };
    })()`,
    returnByValue: true
  });
  console.log('1. INITIAL STATE:\n', JSON.stringify(initial.result.value, null, 2));

  // 2. Incremental Scroll Tests: 20%, 40%, 60%, 80%, 100%
  const targets = [0.20, 0.40, 0.60, 0.80, 1.0];
  const stepResults = [];

  for (const t of targets) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, maxScroll * ${t});
      })()`
    });

    // Wait for RAF lerp to settle
    await new Promise(r => setTimeout(r, 700));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const pct = document.querySelector('.scroll-progress-pct')?.textContent;
        const step = document.querySelector('.telemetry-step')?.textContent;
        return {
          target: '${Math.round(t * 100)}%',
          scrollY: window.scrollY,
          hudPct: pct,
          hudStep: step
        };
      })()`,
      returnByValue: true
    });
    stepResults.push(res.result.value);
  }
  console.log('2. INCREMENTAL SCROLL STEPS:\n', JSON.stringify(stepResults, null, 2));

  // 3. Inspect Terminal elements at 100%
  const terminalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const author = document.querySelector('.terminal-author-name')?.textContent;
      const role = document.querySelector('.terminal-author-role')?.textContent;
      const query = document.querySelector('.terminal-query')?.textContent;
      const enterBtn = document.querySelector('.enter-vcity-button');
      return {
        author,
        role,
        query,
        enterBtnText: enterBtn?.textContent,
        enterBtnVisible: !!enterBtn && enterBtn.offsetParent !== null
      };
    })()`,
    returnByValue: true
  });
  console.log('3. TERMINAL CHECK AT 100%:\n', JSON.stringify(terminalCheck.result.value, null, 2));

  // 4. Reverse Scroll Test: scroll back to 0%
  await send('Runtime.evaluate', {
    expression: `window.scrollTo(0, 0);`
  });
  await new Promise(r => setTimeout(r, 700));

  const reverseCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const pct = document.querySelector('.scroll-progress-pct')?.textContent;
      const step = document.querySelector('.telemetry-step')?.textContent;
      return {
        scrollY: window.scrollY,
        hudPct: pct,
        hudStep: step
      };
    })()`,
    returnByValue: true
  });
  console.log('4. REVERSE SCROLL TO TOP:\n', JSON.stringify(reverseCheck.result.value, null, 2));

  // 5. Scroll back to 100% and test activating ENTER (keyboard & click)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll);
    })()`
  });
  await new Promise(r => setTimeout(r, 700));

  // Test keyboard activation on ENTER button (Enter key)
  const keyActivation = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.enter-vcity-button');
      if (!btn) return { activated: false };
      btn.focus();
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return { activated: true };
    })()`,
    returnByValue: true
  });
  console.log('5. KEYBOARD ACTIVATION RESULT:', keyActivation.result.value);

  // Wait 1.5s to verify PortalTransition launched
  await new Promise(r => setTimeout(r, 1500));

  const portalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const portal = document.querySelector('.portal-transition-layer');
      const whiteout = document.querySelector('.whiteout-screen-cover');
      const typewriter = document.querySelector('.cinematic-typewriter-text')?.textContent;
      return {
        portalActive: !!portal,
        whiteoutActive: !!whiteout,
        typewriterPreview: typewriter
      };
    })()`,
    returnByValue: true
  });
  console.log('6. PORTAL TRANSITION VERIFICATION:\n', JSON.stringify(portalCheck.result.value, null, 2));

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chromeProc.kill();
}
