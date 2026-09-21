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

const artifactDir = 'C:/Users/vansh/.gemini/antigravity-ide/brain/d6c17ee5-8aed-473e-a284-17ee25418485';

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

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Landing Page Untouched
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
  console.log('1. LANDING PAGE CHECK:', landingCheck.result.value);

  // 2. Click Skip Intro to enter V-City directly
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = document.querySelector('.cinematic-skip-button');
      if (skipBtn) skipBtn.click();
    })()`
  });

  // Wait 1.0s to capture Campus Spawn with welcome badge
  await new Promise(r => setTimeout(r, 1000));

  // Capture Campus Spawn
  const spawnScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-01-campus-spawn.png'), Buffer.from(spawnScreenshot.data, 'base64'));
  console.log('2. SAVED: phase5-01-campus-spawn.png');

  // Wait 2.2s for welcome banner to fade into settled visitor control
  await new Promise(r => setTimeout(r, 2200));

  // 3. Inspect Architectural Elements across the City
  const architecturalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bldgElements = Array.from(document.querySelectorAll('.bldg-3d-wrapper')).map(el => el.className);
      
      // Check Bank (ExpenseIQ)
      const bankColonnade = !!document.querySelector('.bank-colonnade-row');
      const bankVaultBase = !!document.querySelector('.bank-vault-foundation');
      const bankATM = !!document.querySelector('.bank-exterior-atm');
      const bankGuard = !!document.querySelector('.role-bank-guard');
      
      // Check Weather Station (Climora)
      const weatherRadar = !!document.querySelector('.weather-radar-dome');
      const weatherAnemometer = !!document.querySelector('.weather-anemometer-mast');
      const weatherLattice = !!document.querySelector('.weather-comms-lattice');
      
      // Check Research Lab (Quantum Knee)
      const labAirlock = !!document.querySelector('.lab-airlock-entrance');
      const labChamber = !!document.querySelector('.lab-diagnostic-viewchamber');
      const labResearchers = document.querySelectorAll('.role-researcher').length;
      
      // Check Hackathon Arena
      const arenaCanopy = !!document.querySelector('.arena-grand-canopy');
      const arenaRibbon = !!document.querySelector('.arena-display-ribbon');
      const arenaDome = !!document.querySelector('.arena-crown-dome');
      const arenaCrowd = document.querySelectorAll('.role-spectator').length;
      
      // Check NCC Cadet Training
      const nccParadeGround = !!document.querySelector('.ncc-parade-ground-attachment');
      const nccDrillLines = !!document.querySelector('.drill-lines-svg');
      const nccFloodlights = document.querySelectorAll('.parade-floodlight').length;
      const nccCadets = document.querySelectorAll('.role-cadet').length;
      
      // Check Academic Quad
      const acadCanopy = !!document.querySelector('.academic-canopy-portico');
      const acadClock = !!document.querySelector('.academic-clock-band');
      const acadSkylight = !!document.querySelector('.academic-atrium-skylight');
      
      // Check Active Construction (Development / Skills)
      const constSlabs = document.querySelectorAll('.slab-floor').length;
      const constCrane = !!document.querySelector('.tower-crane-3d-assembly');
      const constScaffold = !!document.querySelector('.scaffolding-netting-wrap');
      const constLights = document.querySelectorAll('.temporary-work-light').length;
      const constWorkers = document.querySelectorAll('.role-construction-worker').length;
      
      // Check Developer Facilities (LeetCode & GitHub)
      const commitMatrix = !!document.querySelector('.github-commit-matrix-facade');
      const commitCells = document.querySelectorAll('.commit-cell').length;
      const leetcodeTerminals = !!document.querySelector('.leetcode-terminal-facade');
      
      // Check ECHO Monolith
      const echoVoid = !!document.querySelector('.monolith-geometric-void');
      const echoPrismBeam = !!document.querySelector('.void-cyan-prism-beam');
      const echoChamfer = document.querySelectorAll('.monolith-chamfer-edge').length;
      
      // Check NO floating billboard cards or giant labels inside building wrappers
      const floatingLabels = Array.from(document.querySelectorAll('.bldg-3d-wrapper span, .bldg-3d-wrapper p, .bldg-3d-wrapper h1, .bldg-3d-wrapper h2, .bldg-3d-wrapper h3')).filter(el => {
        return !el.className && el.textContent.trim().length > 1;
      }).map(el => el.textContent);

      return {
        totalBuildings: bldgElements.length,
        bank: { bankColonnade, bankVaultBase, bankATM, bankGuard },
        weather: { weatherRadar, weatherAnemometer, weatherLattice },
        research: { labAirlock, labChamber, labResearchers },
        arena: { arenaCanopy, arenaRibbon, arenaDome, arenaCrowd },
        ncc: { nccParadeGround, nccDrillLines, nccFloodlights, nccCadets },
        academic: { acadCanopy, acadClock, acadSkylight },
        construction: { constSlabs, constCrane, constScaffold, constLights, constWorkers },
        devFacilities: { commitMatrix, commitCells, leetcodeTerminals },
        echo: { echoVoid, echoPrismBeam, echoChamfer },
        floatingLabelsFound: floatingLabels
      };
    })()`,
    returnByValue: true
  });
  console.log('3. ARCHITECTURAL IDENTITY CHECK:\n', JSON.stringify(architecturalCheck.result.value, null, 2));

  // 4. Capture City Overview (Full Diaroma Stage)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(0px, 0px, 0px) scale(0.92)';
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const overviewScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-02-city-overview.png'), Buffer.from(overviewScreenshot.data, 'base64'));
  console.log('4. SAVED: phase5-02-city-overview.png');

  // 5. Capture Tech District (Hajiri, Campus Core, ExpenseIQ Bank, Climora)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(320px, 0px, 0px) scale(1.45)';
      const target = document.querySelector('.bldg-bldg-tech-expenseiq');
      if (target) target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const techScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-03-tech-district.png'), Buffer.from(techScreenshot.data, 'base64'));
  console.log('5. SAVED: phase5-03-tech-district.png');

  // 6. Capture Research District (Quantum Knee Bio-Lab, Neural Core, Foundry)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(0px, 320px, 0px) scale(1.45)';
      const target = document.querySelector('.bldg-bldg-research-quantumknee');
      if (target) target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const researchScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-04-research-district.png'), Buffer.from(researchScreenshot.data, 'base64'));
  console.log('6. SAVED: phase5-04-research-district.png');

  // 7. Capture Arena District (Hackathon Arena Coliseum & NCC Cadet Parade Ground)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(-300px, 0px, 0px) scale(1.4)';
      const target = document.querySelector('.bldg-bldg-arena-hackathon');
      if (target) target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const arenaScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-05-arena-district.png'), Buffer.from(arenaScreenshot.data, 'base64'));
  console.log('7. SAVED: phase5-05-arena-district.png');

  // 8. Capture Campus District (Quad Hall, Construction Site, LeetCode, GitHub)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(0px, -240px, 0px) scale(1.45)';
      const target = document.querySelector('.bldg-bldg-campus-skills');
      if (target) target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const campusScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-06-campus-district.png'), Buffer.from(campusScreenshot.data, 'base64'));
  console.log('8. SAVED: phase5-06-campus-district.png');

  // 9. Capture ECHO Monolith (Center)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const plane = document.querySelector('.city-ground-plane');
      if (plane) plane.style.transform = 'translate3d(-35px, 35px, 0px) scale(1.65)';
      const target = document.querySelector('.bldg-bldg-echo-monolith');
      if (target) target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 700));
  const echoScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'phase5-07-echo.png'), Buffer.from(echoScreenshot.data, 'base64'));
  console.log('9. SAVED: phase5-07-echo.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chromeProc.kill();
}
