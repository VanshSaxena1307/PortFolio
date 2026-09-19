import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
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
  const tabs = await getJSON('http://127.0.0.1:9223/json');
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
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  // 1. Check Initial Landing Page
  const landingCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      const enterBtn = document.querySelector('.enter-vcity-button');
      return {
        hasSkipBtn: !!skipBtn,
        hasEnterBtn: !!enterBtn,
        title: document.title
      };
    })()`,
    returnByValue: true
  });
  console.log('1. INITIAL LANDING CHECK:', landingCheck.result.value);

  // 2. Click Skip Intro to directly enter V-City
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      if (skipBtn) skipBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1500));

  // 3. Inspect City Environment
  const cityWorldCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const viewport = document.querySelector('.city-viewport-root');
      const cameraRig = document.querySelector('.city-camera-rig');
      const diorama = document.querySelector('.city-diorama-stage');
      const groundPlane = document.querySelector('.city-ground-plane');
      const quad = document.querySelector('.campus-quad-container');
      const spawnNexus = document.querySelector('.campus-spawn-nexus');
      const buildings = Array.from(document.querySelectorAll('.bldg-3d-wrapper')).map(el => ({
        className: el.className,
        width: el.style.width,
        height: el.style.height
      }));
      const roads = document.querySelector('.city-roads-network');
      const vehicles = document.querySelectorAll('.vehicle-entity').length;
      const parkedCars = document.querySelectorAll('.parked-car').length;
      const pedestrians = document.querySelectorAll('.city-pedestrian-entity').length;
      const welcomeBanner = document.querySelector('.campus-welcome-banner');
      const welcomeText = welcomeBanner?.textContent;
      const minimap = document.querySelector('.city-minimap-root');
      const hud = document.querySelector('.city-hud-layer');
      const hudDistrict = document.querySelector('.hud-district-indicator')?.textContent;

      // Check if any floating text badges exist inside building wrappers
      const floatingLabels = Array.from(document.querySelectorAll('.bldg-3d-wrapper span, .bldg-3d-wrapper p, .bldg-3d-wrapper h1, .bldg-3d-wrapper h2, .bldg-3d-wrapper h3')).filter(el => {
        return !el.classList.contains('warning-beacon-blip') && !el.classList.contains('roof-helipad');
      }).map(el => el.textContent);

      return {
        viewportPresent: !!viewport,
        cameraRigPresent: !!cameraRig,
        cameraRigClass: cameraRig?.className,
        dioramaPresent: !!diorama,
        groundPlanePresent: !!groundPlane,
        quadPresent: !!quad,
        spawnNexusPresent: !!spawnNexus,
        buildingCount: buildings.length,
        roadsPresent: !!roads,
        vehiclesCount: vehicles,
        parkedCarsCount: parkedCars,
        pedestriansCount: pedestrians,
        welcomeBannerVisible: !!welcomeBanner,
        welcomeText,
        minimapPresent: !!minimap,
        hudPresent: !!hud,
        hudDistrict,
        floatingLabelsFound: floatingLabels
      };
    })()`,
    returnByValue: true
  });
  console.log('2. CITY WORLD ENVIRONMENT CHECK:\n', JSON.stringify(cityWorldCheck.result.value, null, 2));

  // 4. Test Scroll Zoom Bounds
  const zoomTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const viewport = document.querySelector('.city-viewport-root');
      // Dispatch wheel event to zoom out
      viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 500, bubbles: true }));
      return { triggered: true };
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const zoomOutCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const hud = document.querySelector('.hud-district-sub')?.textContent;
      const cameraRig = document.querySelector('.city-camera-rig');
      return {
        hud,
        cameraTransform: cameraRig?.style?.transform
      };
    })()`,
    returnByValue: true
  });
  console.log('3. ZOOM OUT TEST RESULT:\n', JSON.stringify(zoomOutCheck.result.value, null, 2));

  // 5. Wait for welcome banner to fade after 2.5 seconds
  await new Promise(r => setTimeout(r, 2600));
  const postWelcomeCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const welcomeBanner = document.querySelector('.campus-welcome-banner');
      const isControlActive = document.querySelector('.city-viewport-root')?.classList.contains('control-active');
      return {
        welcomeBannerStillPresent: !!welcomeBanner,
        isControlActive
      };
    })()`,
    returnByValue: true
  });
  console.log('4. POST-WELCOME PASSIVE WINDOW CHECK:\n', JSON.stringify(postWelcomeCheck.result.value, null, 2));

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chromeProc.kill();
}
