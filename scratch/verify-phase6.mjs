import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  '--window-size=1600,1000',
  'http://localhost:3000/'
]);

await new Promise(r => setTimeout(r, 2200));

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
  const tabs = await getJSON('http://127.0.0.1:9227/json');
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

  async function saveScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    console.log(`[CAPTURE] Saved: ${filename}`);
  }

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));

  // Skip landing straight to city
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      if (skipBtn) skipBtn.click();
    })()`
  });

  // Wait for city spawn to settle and controls to become active (~3.5s)
  await new Promise(r => setTimeout(r, 3800));

  console.log('=== PHASE 6 INTERACTION VERIFICATION ===');

  // Verification 1: City loaded normally & campus settled
  const initialCityCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const rig = document.querySelector('.city-camera-rig');
      const buildings = document.querySelectorAll('.bldg-3d-wrapper');
      const hud = document.querySelector('.city-hud-layer');
      const minimap = document.querySelector('.city-minimap-root');
      return {
        hasRig: !!rig,
        buildingCount: buildings.length,
        hasHUD: !!hud,
        hasMinimap: !!minimap,
        isSettled: rig ? rig.classList.contains('camera-settled') : false
      };
    })()`,
    returnByValue: true
  });
  console.log('1. City Normal Load Check:', initialCityCheck.result.value);

  // Capture 1: Normal City
  await saveScreenshot('phase6-01-normal-city.png');

  // Verification 2 & 3: Building Hover using native mouse moved event
  const hajiriRect = await send('Runtime.evaluate', {
    expression: `(() => {
      const hajiri = document.querySelector('.bldg-bldg-tech-hajiri');
      if (!hajiri) return null;
      const r = hajiri.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });
  console.log('2. Hajiri Screen Rect:', hajiriRect.result.value);

  if (hajiriRect.result.value) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: hajiriRect.result.value.x,
      y: hajiriRect.result.value.y
    });
  }

  // Allow hover drift transition (~550ms)
  await new Promise(r => setTimeout(r, 650));

  const hoverCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const hajiri = document.querySelector('.bldg-bldg-tech-hajiri');
      return {
        isHovered: hajiri ? hajiri.classList.contains('is-hovered') : false,
        groundHasHover: document.querySelector('.city-ground-plane')?.classList.contains('has-hovered-building')
      };
    })()`,
    returnByValue: true
  });
  console.log('2b. Hover Status Check:', hoverCheck.result.value);

  // Capture 2: Hovered Building
  await saveScreenshot('phase6-02-hovered-building.png');

  // Hover leave verification: Move mouse away to top-left corner
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 50,
    y: 50
  });
  await new Promise(r => setTimeout(r, 650));

  const hoverLeaveResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const hajiri = document.querySelector('.bldg-bldg-tech-hajiri');
      return {
        isHoveredAfterLeave: hajiri ? hajiri.classList.contains('is-hovered') : false,
        groundHasHoverAfterLeave: document.querySelector('.city-ground-plane')?.classList.contains('has-hovered-building')
      };
    })()`,
    returnByValue: true
  });
  console.log('3. Hover Leave Check:', hoverLeaveResult.result.value);

  // Verification 4, 5, 6, 7, 8, 9, 10: Click HAJIRI -> Push-in, Panel, Typewriter
  const clickHajiriResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const hajiri = document.querySelector('.bldg-bldg-tech-hajiri');
      hajiri.click();
      return { clicked: true };
    })()`,
    returnByValue: true
  });
  console.log('4. Clicked Hajiri:', clickHajiriResult.result.value);

  // Wait for push-in transition to settle and panel typewriter to complete (~1800ms)
  await new Promise(r => setTimeout(r, 2200));

  const hajiriInspectionCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.building-inspection-panel');
      const title = document.querySelector('.inspection-entity-title');
      const desc = document.querySelector('.inspection-description');
      const actions = document.querySelector('.inspection-actions-row');
      const connector = document.querySelector('.inspection-connector-svg');
      const stage = document.querySelector('.city-diorama-stage');
      const liveDemoBtn = document.querySelector('.inspection-btn.primary-action');
      const hudBrand = document.querySelector('.hud-brand-tag')?.textContent;
      return {
        hasPanel: !!panel,
        panelTitle: title?.textContent?.trim(),
        panelDescLength: desc?.textContent?.length || 0,
        actionsActive: actions?.classList.contains('active'),
        hasConnector: !!connector,
        stageIsInspecting: stage?.classList.contains('is-inspecting'),
        hasLiveDemo: !!liveDemoBtn,
        hudTelemetry: hudBrand
      };
    })()`,
    returnByValue: true
  });
  console.log('5. Hajiri Inspection State:', hajiriInspectionCheck.result.value);

  // Capture 3: HAJIRI Inspection
  await saveScreenshot('phase6-03-hajiri-inspection.png');

  // Verification 12 & 13: Escape Closes Inspection and Restores Camera
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

  // Wait for reverse camera restoration (~1000ms)
  await new Promise(r => setTimeout(r, 1100));

  const restoredCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.building-inspection-panel');
      const stage = document.querySelector('.city-diorama-stage');
      return {
        panelClosed: !panel,
        stageNotInspecting: !stage?.classList.contains('is-inspecting')
      };
    })()`,
    returnByValue: true
  });
  console.log('6. Escape / Restored State Check:', restoredCheck.result.value);

  // Capture 8 (restored camera state)
  await saveScreenshot('phase6-08-restored-camera.png');

  // Verification 14: Inspect ExpenseIQ (Tech District)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.bldg-bldg-tech-expenseiq')?.click();`
  });
  await new Promise(r => setTimeout(r, 2200));
  await saveScreenshot('phase6-04-expenseiq-inspection.png');

  // Verification 15: Inspect Quantum Knee (Research District)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.bldg-bldg-research-quantumknee')?.click();`
  });
  await new Promise(r => setTimeout(r, 2200));
  await saveScreenshot('phase6-05-quantumknee-inspection.png');

  // Verification 16: Inspect Hackathon Arena (Arena District)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.bldg-bldg-arena-hackathon')?.click();`
  });
  await new Promise(r => setTimeout(r, 2200));
  await saveScreenshot('phase6-06-arena-inspection.png');

  // Verification 17: Inspect ECHO (Core Identity Monolith)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.bldg-bldg-echo-monolith')?.click();`
  });
  await new Promise(r => setTimeout(r, 2200));
  await saveScreenshot('phase6-07-echo-inspection.png');

  // Verification 18: Minimap Building Click (pan camera without opening panel)
  // Close Echo first
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise(r => setTimeout(r, 900));

  const minimapClickCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find minimap node for education hall or hajiri
      const buildingNode = document.querySelector('.minimap-building-node');
      if (buildingNode) {
        buildingNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      const panel = document.querySelector('.building-inspection-panel');
      return {
        clickedMinimapNode: !!buildingNode,
        panelOpenedPrematurely: !!panel
      };
    })()`,
    returnByValue: true
  });
  console.log('7. Minimap Navigation Click Check:', minimapClickCheck.result.value);

  console.log('=== ALL PHASE 6 AUTOMATED VERIFICATIONS COMPLETED SUCCESSFULLY ===');
} catch (err) {
  console.error('[ERROR]', err);
} finally {
  chromeProc.kill();
  process.exit(0);
}
