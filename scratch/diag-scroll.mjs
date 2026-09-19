import { spawn } from 'child_process';
import http from 'http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--disable-gpu',
  '--window-size=1920,1080',
  'http://localhost:3001/',
]);

await new Promise((r) => setTimeout(r, 2000));

http.get('http://127.0.0.1:9226/json', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', async () => {
    const tabs = JSON.parse(d);
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
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

    const diag1 = await evalExpr(`(() => ({
      scrollY: window.scrollY,
      docH: document.documentElement.scrollHeight,
      winH: window.innerHeight,
      hasContainer: !!document.querySelector('.cinematic-experience-container')
    }))()`);
    console.log('Diag before scroll:', diag1);

    await evalExpr(`(() => {
      window.scrollTo({ top: 99999, behavior: 'instant' });
    })()`);
    await new Promise((r) => setTimeout(r, 800));

    const diag2 = await evalExpr(`(() => ({
      scrollY: window.scrollY,
      pctText: document.querySelector('.scroll-progress-pct')?.textContent,
      hasMonitor: !!document.querySelector('.terminal-monitor-chassis'),
      hasButton: !!document.querySelector('.enter-vcity-button')
    }))()`);
    console.log('Diag after scroll:', diag2);

    proc.kill();
    process.exit(0);
  });
});
