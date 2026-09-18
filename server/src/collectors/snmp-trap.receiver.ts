import snmp from 'net-snmp';
import { telemetryStore } from '../storage/telemetry.store.js';

export class SnmpTrapReceiver {
  private receiver: any = null;
  private port: number = 162;

  public start() {
    try {
      const options = {
        port: this.port,
        disableAuthorization: true,
        transport: 'udp4'
      };

      this.receiver = snmp.createReceiver(options, (error: any, trap: any) => {
        if (error) {
          console.warn('[SNMP-Trap] Error decoding incoming trap:', error.message);
          return;
        }

        this.handleTrap(trap);
      });

      try {
        if (this.receiver && typeof this.receiver.addUser === 'function') {
          this.receiver.addUser({
            name: 'fortinet',
            level: snmp.SecurityLevel.noAuthNoPriv
          });
        }
      } catch (err: any) {}

      console.log(`[SNMP-Trap] UDP Trap listener active on port ${this.port} (Community: 'fortinet', SNMPv3: 'fortinet' noAuthNoPriv)`);
    } catch (err: any) {
      console.error(`[SNMP-Trap] Failed to bind SNMP trap receiver on port ${this.port}:`, err.message);
    }
  }

  private handleTrap(trap: any) {
    const senderIp = trap.rinfo?.address || '10.10.3.15';
    const pdu = trap.pdu;
    const varbinds = pdu?.varbinds || [];
    
    console.log(`[SNMP-Trap] Received trap from FortiGate ${senderIp} with ${varbinds.length} varbinds`);

    let trapOid = '';
    const detailsList: string[] = [];

    for (const vb of varbinds) {
      const oid = vb.oid;
      let val = vb.value;
      if (Buffer.isBuffer(val)) {
        val = val.toString('utf-8');
      }
      detailsList.push(`${oid}=${val}`);

      if (oid === '1.3.6.1.6.3.1.1.4.1.0') {
        trapOid = String(val);
      }
    }

    const title = `FortiGate SNMP Trap: ${trapOid ? trapOid.split('.').slice(-2).join('.') : 'Interface / Security Event'}`;
    const description = `Live trap received from ${senderIp}: ${detailsList.join('; ').slice(0, 240)}`;

    telemetryStore.addAlert({
      id: `snmp-trap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      firewallId: 'fw-fg-01',
      firewallName: `FortiGate-CSIR-SERC (${senderIp})`,
      severity: 'warning',
      title,
      description,
      category: 'snmp_threshold',
      acknowledged: false
    });
  }

  public stop() {
    if (this.receiver) {
      try {
        this.receiver.close();
      } catch {}
      this.receiver = null;
    }
  }
}

export const snmpTrapReceiver = new SnmpTrapReceiver();
