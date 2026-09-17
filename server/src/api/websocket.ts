import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { telemetryStore } from '../storage/telemetry.store.js';

export function setupWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    // Send initial greeting
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Centralized Firewall Operations Telemetry Stream',
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn(`[WebSocket] Client error: ${err.message}`);
      clients.delete(ws);
    });
  });

  // Broadcast new logs
  telemetryStore.onLog((log) => {
    const msg = JSON.stringify({ type: 'log', data: log });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  // Broadcast new flows
  telemetryStore.onFlow((flow) => {
    const msg = JSON.stringify({ type: 'flow', data: flow });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  // Broadcast new alerts
  telemetryStore.onAlert((alert) => {
    const msg = JSON.stringify({ type: 'alert', data: alert });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  console.log('[WebSocket] Real-time telemetry streaming server mounted on /ws');
  return wss;
}
