import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  syslogPort: parseInt(process.env.SYSLOG_PORT || '1514', 10),
  netflowPort: parseInt(process.env.NETFLOW_PORT || '2055', 10),
  snmpPollIntervalSec: parseInt(process.env.SNMP_POLL_INTERVAL || '15', 10),
  enableSimulation: process.env.ENABLE_SIMULATION !== 'false',
  maxTelemetryRingSize: 10000,
  maxLogRingSize: 5000,
};
