import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--disable-gpu',
  '--window-size=1920,1080',
  'http://localhost:3001/',
]);

await new Promise((r) => setTimeout(r, 2000));

http.get('http://127.0.0.1:9225/json', (res) => {
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

    await send('Page.reload');
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll to 100%
    await evalExpr('window.scrollTo(0, document.documentElement.scrollHeight)');
    await new Promise((r) => setTimeout(r, 1200));

    const btnBefore = await evalExpr('!!document.querySelector(".enter-vcity-button")');
    console.log('Button exists before click:', btnBefore);

    const clickRes = await evalExpr(`(() => {
      const b = document.querySelector(".enter-vcity-button");
      if(b) {
        b.click();
        return true;
      }
      return false;
    })()`);
    console.log('Clicked:', clickRes);

    // Track state every 1.5s for 12 seconds
    for (let i = 1; i <= 8; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const status = await evalExpr(`(() => ({
        t: '${(i * 1.5).toFixed(1)}s',
        portal: !!document.querySelector(".portal-transition-layer"),
        cityEntry: !!document.querySelector(".city-entry-container"),
        cameraClass: document.querySelector(".entry-camera-rig")?.className,
        campusZone: !!document.querySelector(".campus-district-zone"),
        settled: !!document.querySelector(".camera-settled-isometric"),
        welcomeBanner: document.querySelector(".campus-welcome-banner")?.textContent?.trim(),
        welcomeFading: document.querySelector(".campus-welcome-banner")?.classList.contains("fading"),
        visitorControlActive: document.querySelector(".city-entry-viewport")?.classList.contains("visitor-control-active")
      }))()`);
      console.log(`Status at ${(i * 1.5).toFixed(1)}s:`, status);
    }

    proc.kill();
    process.exit(0);
  });
});
