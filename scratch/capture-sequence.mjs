import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  '--window-size=1920,1080',
  'http://localhost:3001/',
]);

await new Promise((r) => setTimeout(r, 2000));

http.get('http://127.0.0.1:9227/json', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', async () => {
    const tabs = JSON.parse(d);
    const targetTab = tabs.find((t) => t.url.includes('3001')) || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    const send = (m, p = {}) =>
      new Promise((r) => {
        const i = id++;
        const h = (e) => {
          const res = JSON.parse(e.data);
          if (res.id === i) {
            ws.removeEventListener('message', h);
            r(res.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
      });

    const evalExpr = async (expr) =>
      (
        await send('Runtime.evaluate', {
          expression: expr,
          returnByValue: true,
          awaitPromise: true,
        })
      )?.result?.value;

    const snap = async (name) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`scratch/${name}`, Buffer.from(res.data, 'base64'));
      console.log(`Saved scratch/${name}`);
    };

    await send('Page.reload');
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll to 100%
    await evalExpr('window.scrollTo(0, document.documentElement.scrollHeight)');
    await new Promise((r) => setTimeout(r, 1000));
    await snap('phase3-step1-landing-monitor.png');

    // Click Enter
    await evalExpr('document.querySelector(".enter-vcity-button")?.click()');

    // Turbulence & Flicker (t = 600ms)
    await new Promise((r) => setTimeout(r, 600));
    await snap('phase3-step2-room-turbulence.png');

    // Monitor Bloom Surge & Escalation (t = 1200ms)
    await new Promise((r) => setTimeout(r, 600));
    await snap('phase3-step3-monitor-bloom.png');

    // Whiteout Expansion (t = 2000ms)
    await new Promise((r) => setTimeout(r, 800));
    await snap('phase3-step4-whiteout-expansion.png');

    // Typewriter Message in Progress (t = 3400ms)
    await new Promise((r) => setTimeout(r, 1400));
    await snap('phase3-step5-typewriter-message.png');

    // High Altitude City Establishing Shot (t = 6200ms)
    await new Promise((r) => setTimeout(r, 2800));
    await snap('phase3-step6-vcity-aerial-overview.png');

    // Flyover Descent toward Campus (t = 8200ms)
    await new Promise((r) => setTimeout(r, 2000));
    await snap('phase3-step7-campus-flyover-descent.png');

    // Settled at Campus Spawn with Sector 00 Badge (t = 10600ms)
    await new Promise((r) => setTimeout(r, 2400));
    await snap('phase3-step8-campus-spawn-settled.png');

    // Control Handoff Active (t = 13200ms)
    await new Promise((r) => setTimeout(r, 2600));
    await snap('phase3-step9-visitor-control-active.png');

    proc.kill();
    process.exit(0);
  });
});
