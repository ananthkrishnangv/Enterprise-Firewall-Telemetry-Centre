import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const USER_DATA_DIR = path.resolve('tmp/chrome-login-test');
const PORT = 9224;

fs.mkdirSync(USER_DATA_DIR, { recursive: true });

const edge = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA_DIR}`,
  '--window-size=1920,1080',
  'about:blank'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://10.40.0.150/login' });
  await new Promise(r => setTimeout(r, 3500));
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('docs/screenshots/01_login.png', Buffer.from(data, 'base64'));
  console.log('Successfully captured docs/screenshots/01_login.png');
} finally {
  edge.kill();
}
