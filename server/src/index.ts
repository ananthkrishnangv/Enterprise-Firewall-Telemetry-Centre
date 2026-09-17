import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { apiRouter } from './api/routes.js';
import { setupWebSocketServer } from './api/websocket.js';
import { SyslogCollector } from './collectors/syslog.collector.js';
import { FlowCollector } from './collectors/flow.collector.js';
import { snmpCollector } from './collectors/snmp.collector.js';
import { telemetrySimulator } from './collectors/telemetry.simulator.js';
import { speedTestCollector } from './collectors/speedtest.collector.js';
import { postgresService } from './storage/postgres.service.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PostgreSQL Database & Schema
postgresService.init().catch(() => {});

const uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());

// Configure 50MB body limit to smoothly support high-res images and base64 payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded logos and files statically
app.use('/uploads', express.static(uploadsDir));

// Health check endpoints for container and load balancers
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }));

// Mount API routes
app.use('/api', apiRouter);

// Production frontend static path
const candidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, './public'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist/public'),
  path.resolve(process.cwd(), 'public')
];

let staticDir: string | null = null;
for (const cand of candidates) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    staticDir = cand;
    break;
  }
}

if (staticDir) {
  console.log(`[Frontend] Serving UX4G Core Violet UI from: ${staticDir}`);
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(staticDir!, 'index.html'));
  });
}

const server = http.createServer(app);

// Setup WebSocket live push
setupWebSocketServer(server);

// Start HTTP API
server.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(`🇮🇳 UX4G Centralized Firewall Operations & Telemetry Platform`);
  console.log(`📡 HTTP & REST API:   http://localhost:${config.port}/api`);
  console.log(`⚡ WebSocket Stream:   ws://localhost:${config.port}/ws`);
  console.log(`🛡️  Live Gateway:      FortiGate (10.10.3.15 • SNMP Active)`);
  console.log(`🗄️  PostgreSQL DB:     ${postgresService.getConnectionDetails().host}:${postgresService.getConnectionDetails().port}/${postgresService.getConnectionDetails().database}`);
  console.log(`📁 File Storage:       Data: /app/data | Uploads: /app/uploads`);
  console.log(`⚡ Speed Test Engine:  15-minute automated live internet speed check`);
  console.log(`🎨 Theme:              UX4G Mandated Core Violet & Rainbow Data Flow`);
  console.log(`📜 License:            CSIR-SERC Free Community & Institutional License v1.0`);
  console.log(`❤️  Attribution:        Made by ICTD CSIR-SERC for CSIR with ❤️`);
  console.log(`================================================================`);
});

// Start UDP Collectors
const syslogCollector = new SyslogCollector(config.syslogPort);
syslogCollector.start();

const flowCollector = new FlowCollector(config.netflowPort);
flowCollector.start();

// Start SNMP Poller
snmpCollector.start();

// Start 15-minute Internet Speed Test Engine
speedTestCollector.start();

// Start Live Traffic Simulation if enabled
if (config.enableSimulation) {
  telemetrySimulator.start();
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down collectors and server...');
  syslogCollector.stop();
  flowCollector.stop();
  snmpCollector.stop();
  speedTestCollector.stop();
  telemetrySimulator.stop();
  server.close(() => {
    process.exit(0);
  });
});
