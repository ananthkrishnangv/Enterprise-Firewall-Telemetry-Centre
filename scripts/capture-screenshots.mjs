import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('tmp/chrome-profile');
const PORT = 9222;

fs.mkdirSync(USER_DATA_DIR, { recursive: true });
fs.mkdirSync('docs/screenshots', { recursive: true });

console.log('Starting headless Chrome...');
const chromeProcess = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA_DIR}`,
  '--window-size=1920,1080',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
], { stdio: 'ignore' });

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

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
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  // First capture Login page (unauthenticated)
  console.log('Capturing login page...');
  await send('Page.navigate', { url: 'http://10.40.0.150/login' });
  await new Promise(r => setTimeout(r, 2000));
  let res = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('docs/screenshots/01_login.png', Buffer.from(res.data, 'base64'));

  // Capture First-Time Setup Wizard
  console.log('Capturing first-time setup wizard...');
  await send('Page.navigate', { url: 'http://10.40.0.150/wizard' });
  await new Promise(r => setTimeout(r, 2000));
  res = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('docs/screenshots/02_wizard.png', Buffer.from(res.data, 'base64'));

  // Authenticate as superadmin
  console.log('Authenticating as superadmin...');
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'superadmin', password: 'SuperAdmin@2026!' })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('nccc_auth_token', data.token);
          localStorage.setItem('nccc_auth_user', JSON.stringify(data.user));
        }
        return data;
      })()
    `,
    awaitPromise: true
  });

  const authenticatedPages = [
    { name: '03_dashboard', url: 'http://10.40.0.150/', waitMs: 4000 },
    { name: '04_bento_traffic', url: 'http://10.40.0.150/traffic', waitMs: 4000 },
    { name: '05_snmp_telemetry_center', url: 'http://10.40.0.150/devices', waitMs: 4000 },
    { name: '06_firewall_policies', url: 'http://10.40.0.150/policies', waitMs: 3000 },
    { name: '07_live_syslog_stream', url: 'http://10.40.0.150/logs', waitMs: 3000 },
    { name: '08_certin_compliance', url: 'http://10.40.0.150/compliance', waitMs: 3000 },
    { name: '09_user_management', url: 'http://10.40.0.150/users', waitMs: 3000 },
    { name: '10_settings_branding', url: 'http://10.40.0.150/settings', waitMs: 3000 }
  ];

  for (const p of authenticatedPages) {
    console.log(`Capturing ${p.name}...`);
    await send('Page.navigate', { url: p.url });
    await new Promise(r => setTimeout(r, p.waitMs));
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const targetFile = `docs/screenshots/${p.name}.png`;
    fs.writeFileSync(targetFile, Buffer.from(data, 'base64'));
    console.log(`Successfully captured ${targetFile}`);
  }

  ws.close();
} finally {
  chromeProcess.kill();
  console.log('Finished capturing all screenshots.');
}
