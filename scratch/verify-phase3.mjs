import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:3001/';

// Start Chrome headless with remote debugging
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
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
  const tabs = await getJSON('http://127.0.0.1:9223/json');
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

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(`scratch/${filename}`, buffer);
    console.log(`[SCREENSHOT] Saved scratch/${filename}`);
  }

  console.log('=== STARTING PHASE 3 VERIFICATION ===');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1500));

  // TEST 1: Initial landing state
  const initialLanding = await evaluate(`(() => {
    return {
      mode: document.querySelector('.cinematic-experience-container') ? 'landing' : 'unknown',
      author: document.querySelector('.terminal-author-name')?.textContent,
      enterBtn: !!document.querySelector('.enter-vcity-button')
    };
  })()`);
  console.log('1. Initial Landing:', initialLanding);

  // TEST 2: Scroll to 100%
  await evaluate(`(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  const scrolledState = await evaluate(`(() => {
    return {
      scrollY: window.scrollY,
      pct: document.querySelector('.scroll-progress-pct')?.textContent,
      monitorVisible: !!document.querySelector('.terminal-monitor-chassis'),
      enterBtnText: document.querySelector('.enter-vcity-button')?.textContent?.trim()
    };
  })()`);
  console.log('2. Scrolled to 100%:', scrolledState);
  await captureScreenshot('phase3-01-landing-100.png');

  // TEST 3: Click ENTER -> Observe Transition Progression
  console.log('3. Triggering ENTER click...');
  await evaluate(`(() => {
    const btn = document.querySelector('.enter-vcity-button');
    if (btn) btn.click();
  })()`);

  // Observe micro-pause (~150ms after click)
  await new Promise((r) => setTimeout(r, 150));
  const microPauseState = await evaluate(`(() => {
    return {
      isMicroPause: document.querySelector('.state-micro-pause') !== null,
      monitorStillMounted: document.querySelector('.terminal-monitor-chassis') !== null,
      portalLayer: document.querySelector('.portal-transition-layer') !== null
    };
  })()`);
  console.log('3a. Micro Pause State:', microPauseState);

  // Observe turbulence (~500ms after click)
  await new Promise((r) => setTimeout(r, 380));
  const turbulenceState = await evaluate(`(() => {
    return {
      isTurbulent: document.querySelector('.state-turbulence') !== null,
      hasDarkenMask: document.querySelector('.room-darken-mask') !== null,
      hasLightFlicker: document.querySelector('.light-flicker-pulse') !== null,
      hasMonitorBloom: document.querySelector('.monitor-bloom-surge') !== null
    };
  })()`);
  console.log('3b. Turbulence State:', turbulenceState);
  await captureScreenshot('phase3-02-turbulence.png');

  // Observe escalation / whiteout expansion (~1800ms)
  await new Promise((r) => setTimeout(r, 1200));
  const whiteoutState = await evaluate(`(() => {
    return {
      hasWhiteoutCover: document.querySelector('.whiteout-screen-cover.visible') !== null,
      hasLightExpansion: document.querySelector('.whiteout-light-expansion') !== null
    };
  })()`);
  console.log('3c. Whiteout State:', whiteoutState);
  await captureScreenshot('phase3-03-whiteout.png');

  // Observe typewriter message (~3200ms)
  await new Promise((r) => setTimeout(r, 1400));
  const typewriterState = await evaluate(`(() => {
    const textEl = document.querySelector('.cinematic-typewriter-text');
    return {
      text: textEl?.textContent?.replace('|', '')?.trim(),
      hasCursor: document.querySelector('.cinematic-cursor') !== null,
      cardAroundIt: document.querySelector('.typewriter-card, .typewriter-hud') !== null
    };
  })()`);
  console.log('3d. Typewriter State:', typewriterState);
  await captureScreenshot('phase3-04-typewriter.png');

  // Wait for typewriter completion and city reveal
  console.log('Waiting for typewriter to finish and city reveal...');
  await new Promise((r) => setTimeout(r, 2200));

  const cityRevealState = await evaluate(`(() => {
    const rig = document.querySelector('.entry-camera-rig');
    return {
      cameraClass: rig?.className,
      hasCampusDistrict: document.querySelector('.campus-district-zone') !== null,
      hasSpawnNexus: document.querySelector('.campus-spawn-nexus') !== null,
      hasCurvedRoad: document.querySelector('.curved-avenue-svg') !== null,
      hasSkyline: document.querySelector('.distant-city-skyline') !== null
    };
  })()`);
  console.log('3e. City Aerial Reveal / Flyover State:', cityRevealState);
  await captureScreenshot('phase3-05-city-aerial.png');

  // Wait for camera descent and settled state
  console.log('Waiting for camera to descend and settle at Campus spawn...');
  await new Promise((r) => setTimeout(r, 2600));

  const settledState = await evaluate(`(() => {
    const rig = document.querySelector('.entry-camera-rig');
    const welcome = document.querySelector('.campus-welcome-banner');
    return {
      cameraClass: rig?.className,
      isSettled: rig?.classList.contains('camera-settled-isometric'),
      welcomeBannerVisible: welcome !== null,
      welcomeText: welcome?.textContent?.trim(),
      visitorControlHud: document.querySelector('.visitor-control-hud') !== null
    };
  })()`);
  console.log('3f. Settled Campus State:', settledState);
  await captureScreenshot('phase3-06-campus-settled.png');

  // Test mouse move / click in settled state
  await evaluate(`(() => {
    const vp = document.querySelector('.city-entry-viewport');
    if (vp) {
      vp.dispatchEvent(new MouseEvent('mousemove', { clientX: 1200, clientY: 700 }));
      vp.dispatchEvent(new MouseEvent('click', { clientX: 960, clientY: 540 }));
    }
  })()`);
  await new Promise((r) => setTimeout(r, 300));

  const clickBeaconState = await evaluate(`(() => {
    return {
      beaconCount: document.querySelectorAll('.visitor-click-beacon').length
    };
  })()`);
  console.log('3g. Visitor Interactive Feedback:', clickBeaconState);

  // TEST 4: Keyboard ENTER on landing
  console.log('4. Testing Keyboard ENTER activation...');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1200));
  await evaluate(`(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  })()`);
  await new Promise((r) => setTimeout(r, 600));
  await evaluate(`(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  })()`);
  await new Promise((r) => setTimeout(r, 500));
  const keyboardEnterState = await evaluate(`(() => {
    return {
      portalTransitionTriggered: document.querySelector('.portal-transition-layer') !== null
    };
  })()`);
  console.log('4. Keyboard ENTER Result:', keyboardEnterState);

  // TEST 5: SKIP INTRO button
  console.log('5. Testing SKIP INTRO button...');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1200));
  await evaluate(`(() => {
    const skipBtn = document.querySelector('.cinematic-skip-button');
    if (skipBtn) skipBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 600));
  const skipIntroState = await evaluate(`(() => {
    return {
      cityEntryRendered: document.querySelector('.city-entry-container') !== null,
      isSettled: document.querySelector('.camera-settled-isometric') !== null
    };
  })()`);
  console.log('5. SKIP INTRO Result:', skipIntroState);

  // TEST 6: Reverse scroll test
  console.log('6. Testing Reverse Scroll...');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1200));
  await evaluate(`(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  })()`);
  await new Promise((r) => setTimeout(r, 500));
  await evaluate(`(() => {
    window.scrollTo(0, 0);
  })()`);
  await new Promise((r) => setTimeout(r, 600));
  const reverseScrollState = await evaluate(`(() => {
    return {
      scrollY: window.scrollY,
      pct: document.querySelector('.scroll-progress-pct')?.textContent
    };
  })()`);
  console.log('6. Reverse Scroll Result:', reverseScrollState);

  // TEST 7: Viewport tests (1920x1080, 1440x900, 1366x768)
  console.log('7. Testing Responsive Viewports...');
  for (const [w, h] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 300));
    const vpTest = await evaluate(`(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      return {
        viewport: '${w}x${h}',
        hasHorizontalOverflow: scrollW > docW,
        clientWidth: docW,
        scrollWidth: scrollW
      };
    })()`);
    console.log(`   Viewport ${w}x${h}:`, vpTest);
  }

  // TEST 8: Prefers-reduced-motion
  console.log('8. Testing prefers-reduced-motion...');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1200));
  await evaluate(`(() => {
    const btn = document.querySelector('.enter-vcity-button');
    if (btn) btn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));
  const reducedMotionState = await evaluate(`(() => {
    return {
      typewriterActive: document.querySelector('.cinematic-typewriter-text') !== null,
      noExtremeShake: document.querySelector('.state-escalating') === null
    };
  })()`);
  console.log('8. Reduced Motion Result:', reducedMotionState);

  console.log('=== ALL PHASE 3 TESTS COMPLETED ===');
} catch (err) {
  console.error('Verification Error:', err);
} finally {
  chromeProc.kill();
  process.exit(0);
}
