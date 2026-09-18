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
    { name: '04b_unapproved_apps', url: 'http://10.40.0.150/unapproved-apps', waitMs: 4000 },
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

    // If capturing unapproved apps, also capture scrolled table and modal dossier
    if (p.name === '04b_unapproved_apps') {
      console.log('Capturing 04c_unapproved_violations_table (Table View)...');
      await send('Runtime.evaluate', {
        expression: `
          const m = document.querySelector('main');
          if (m) m.scrollBy({ top: 620, behavior: 'instant' });
        `
      });
      await new Promise(r => setTimeout(r, 1200));
      const resTable = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/04c_unapproved_violations_table.png', Buffer.from(resTable.data, 'base64'));
      console.log('Successfully captured docs/screenshots/04c_unapproved_violations_table.png');

      console.log('Capturing 04d_device_forensic_dossier (Forensic Modal)...');
      await send('Runtime.evaluate', {
        expression: `
          const m = document.querySelector('main');
          if (m) m.scrollTo({ top: 0, behavior: 'instant' });
          const dossierBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dossier'));
          if (dossierBtn) dossierBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1500));
      const resModal = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/04d_device_forensic_dossier.png', Buffer.from(resModal.data, 'base64'));
      console.log('Successfully captured docs/screenshots/04d_device_forensic_dossier.png');

      // Close modal before proceeding
      await send('Runtime.evaluate', {
        expression: `
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close'));
          if (closeBtn) closeBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 500));
    }

    // If capturing SNMP Telemetry Center, capture full matrix view, VLANs filter, and deep drilldown modal
    if (p.name === '05_snmp_telemetry_center') {
      console.log('Capturing 05_all_interfaces_matrix (Scrolled Matrix Table)...');
      await send('Runtime.evaluate', {
        expression: `
          const m = document.querySelector('main');
          if (m) m.scrollBy({ top: 920, behavior: 'instant' });
        `
      });
      await new Promise(r => setTimeout(r, 1200));
      const resMatrix = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/05_all_interfaces_matrix.png', Buffer.from(resMatrix.data, 'base64'));
      console.log('Successfully captured docs/screenshots/05_all_interfaces_matrix.png');

      console.log('Capturing 05b_snmp_vlans_filter (VLANs Tab)...');
      await send('Runtime.evaluate', {
        expression: `
          const vlanBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('VLANs'));
          if (vlanBtn) vlanBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1200));
      const resVlans = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/05b_snmp_vlans_filter.png', Buffer.from(resVlans.data, 'base64'));
      console.log('Successfully captured docs/screenshots/05b_snmp_vlans_filter.png');

      console.log('Capturing 05c_interface_drilldown_modal (Interface Dossier)...');
      await send('Runtime.evaluate', {
        expression: `
          const inspectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Inspect'));
          if (inspectBtn) inspectBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 2000));
      const resModal = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/05c_interface_drilldown_modal.png', Buffer.from(resModal.data, 'base64'));
      console.log('Successfully captured docs/screenshots/05c_interface_drilldown_modal.png');

      // Close modal before proceeding
      await send('Runtime.evaluate', {
        expression: `
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Inspector') || b.textContent.includes('Close'));
          if (closeBtn) closeBtn.click();
          const m = document.querySelector('main');
          if (m) m.scrollTo({ top: 0, behavior: 'instant' });
        `
      });
      await new Promise(r => setTimeout(r, 500));
    }

    // If capturing logs, capture analytics matrix, log explorer, and 172.17.0.0/16 filtered view
    if (p.name === '07_live_syslog_stream') {
      console.log('Capturing 07a_vlan_subnet_matrix (VLAN & Subnet Breakdown)...');
      await send('Runtime.evaluate', {
        expression: `
          const m = document.querySelector('main');
          if (m) m.scrollBy({ top: 580, behavior: 'instant' });
        `
      });
      await new Promise(r => setTimeout(r, 1200));
      const resVlanMatrix = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/07a_vlan_subnet_matrix.png', Buffer.from(resVlanMatrix.data, 'base64'));
      console.log('Successfully captured docs/screenshots/07a_vlan_subnet_matrix.png');

      console.log('Capturing 07b_traffic_log_explorer (Explorer Tab)...');
      await send('Runtime.evaluate', {
        expression: `
          const m = document.querySelector('main');
          if (m) m.scrollTo({ top: 0, behavior: 'instant' });
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Log Explorer'));
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 2000));
      const resExplorer = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/07b_traffic_log_explorer.png', Buffer.from(resExplorer.data, 'base64'));
      console.log('Successfully captured docs/screenshots/07b_traffic_log_explorer.png');

      console.log('Capturing 07c_vlan_172_17_filtered (172.17.0.0/16 Departmental Filter)...');
      await send('Runtime.evaluate', {
        expression: `
          const selects = Array.from(document.querySelectorAll('select'));
          const segmentSelect = selects.find(s => Array.from(s.options).some(o => o.value === '172.17.0.0/16'));
          if (segmentSelect) {
            segmentSelect.value = '172.17.0.0/16';
            segmentSelect.dispatchEvent(new Event('change'));
          }
        `
      });
      await new Promise(r => setTimeout(r, 2000));
      const resFiltered = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('docs/screenshots/07c_vlan_172_17_filtered.png', Buffer.from(resFiltered.data, 'base64'));
      console.log('Successfully captured docs/screenshots/07c_vlan_172_17_filtered.png');
    }
  }

  ws.close();
} finally {
  chromeProcess.kill();
  console.log('Finished capturing all screenshots.');
}
