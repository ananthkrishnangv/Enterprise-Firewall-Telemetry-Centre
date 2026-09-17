import { FirewallDevice, CanonicalRule, ConfigSnapshot, ComplianceAuditItem } from '../types/index.js';
import { persistence } from './persistence.js';

class MetadataStore {
  private devices: Map<string, FirewallDevice> = new Map();
  private rules: Map<string, CanonicalRule[]> = new Map(); // firewallId -> rules
  private configSnapshots: Map<string, ConfigSnapshot[]> = new Map(); // firewallId -> snapshots
  private complianceControls: ComplianceAuditItem[] = [];

  constructor() {
    this.initPrimaryFirewalls();
    this.initPrimaryRules();
    this.initPrimaryConfigSnapshots();
    this.initComplianceControls();
  }

  private initPrimaryFirewalls() {
    const defaultDevices: FirewallDevice[] = [
      // Live Connected Fortinet FortiGate Firewall (CSIR-SERC Chennai Gateway)
      {
        id: 'fw-fg-01',
        name: 'FortiGate-CSIR-SERC',
        vendor: 'fortinet',
        model: 'FortiGate 600F Enterprise NGFW',
        ipAddress: '10.10.3.15',
        version: 'FortiOS v7.4.12 build2902 (GA.M)',
        status: 'healthy',
        location: 'CSIR-SERC Datacenter (CHENNAI)',
        snmpEnabled: true,
        snmpCommunity: 'fortinet',
        snmpVersion: 'v2c',
        snmpPort: 161,
        snmpTimeout: 3000,
        snmpRetries: 2,
        snmpMetrics: {
          sysUpTime: 7399570,
          cpuUtilPercent: 1,
          memoryTotalBytes: 16300900000,
          memoryUsedBytes: 6357351000,
          memoryUtilPercent: 39.0,
          concurrentConnections: 5412,
          haState: 'standalone',
          vpnActiveTunnels: 12,
          interfaces: [
            { name: 'port1 (WAN Primary NKN)', operStatus: 'up', adminStatus: 'up', inBps: 84200000, outBps: 78900000, inErrors: 0, outErrors: 0, speedBps: 1000000000 },
            { name: 'port2 (SERC_Srv_access)', operStatus: 'up', adminStatus: 'up', inBps: 54500000, outBps: 41800000, inErrors: 0, outErrors: 0, speedBps: 1000000000 },
            { name: 'port3 (ICT_Lan_Access)', operStatus: 'up', adminStatus: 'up', inBps: 62000000, outBps: 91200000, inErrors: 0, outErrors: 0, speedBps: 1000000000 },
            { name: 'mgmt (OOB Management)', operStatus: 'up', adminStatus: 'up', inBps: 1200000, outBps: 840000, inErrors: 0, outErrors: 0, speedBps: 1000000000 },
          ],
          lastPolled: new Date().toISOString()
        },
        lastSeen: new Date().toISOString()
      }
    ];

    const loadedDevices = persistence.loadJSON<FirewallDevice[]>('devices.json', defaultDevices);
    for (const dev of loadedDevices) {
      this.devices.set(dev.id, dev);
    }
    persistence.saveJSON('devices.json', Array.from(this.devices.values()));
  }

  private initPrimaryRules() {
    // 1. Check Point Rules
    const cpRules: CanonicalRule[] = [
      {
        id: 'cpr-01',
        firewallId: 'fw-cp-01',
        nativeRuleId: '1',
        name: 'Stealth_Rule_Block_Direct_Mgmt',
        position: 1,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['Any'],
        destZones: ['Local_Gateway'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['192.168.10.1/32'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 14205,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['PCI-DSS:Req1.2', 'CIS:FW-2.1'],
      },
      {
        id: 'cpr-02',
        firewallId: 'fw-cp-01',
        nativeRuleId: '2',
        name: 'Admin_Subnet_HTTPS_SSH_Access',
        position: 2,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['SecOps_VLAN'],
        destZones: ['Local_Gateway'],
        sourceCidrs: ['192.168.100.0/24'],
        destCidrs: ['192.168.10.1/32'],
        protocols: ['TCP'],
        destPorts: ['443', '22'],
        applications: ['HTTPS', 'SSH'],
        users: ['SecOps_Admins'],
        hitCount: 5280,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 5,
        complianceTags: ['CIS:FW-2.2'],
      },
      {
        id: 'cpr-03',
        firewallId: 'fw-cp-01',
        nativeRuleId: '3',
        name: 'Corporate_Web_Browsing_Outbound',
        position: 3,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['Internal_LAN'],
        destZones: ['External_Internet'],
        sourceCidrs: ['10.10.0.0/16'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['TCP', 'UDP'],
        destPorts: ['80', '443', '53'],
        applications: ['Web-Browsing', 'SSL', 'DNS'],
        users: ['Domain_Users'],
        hitCount: 489201,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 10,
        complianceTags: ['PCI-DSS:Req1.3'],
      },
      {
        id: 'cpr-04',
        firewallId: 'fw-cp-01',
        nativeRuleId: '4',
        name: 'CRITICAL_RISK_Legacy_Database_AnyAny',
        position: 4,
        action: 'allow',
        enabled: true,
        logging: false, // Logging disabled!
        sourceZones: ['Any'],
        destZones: ['Database_DMZ'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['10.20.10.0/24'],
        protocols: ['TCP'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 204,
        lastHitAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
        unusedDays: 30,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: true,
        riskScore: 95,
        complianceTags: ['PCI-DSS:FAIL-1.3.1', 'CIS:CRITICAL-VIOLATION'],
      },
      {
        id: 'cpr-05',
        firewallId: 'fw-cp-01',
        nativeRuleId: '5',
        name: 'SHADOWED_Oracle_DB_Access',
        position: 5,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['Internal_LAN'],
        destZones: ['Database_DMZ'],
        sourceCidrs: ['10.10.0.0/16'],
        destCidrs: ['10.20.10.50/32'],
        protocols: ['TCP'],
        destPorts: ['1521'],
        applications: ['Oracle-SQL'],
        users: ['DBA_Group'],
        hitCount: 0,
        lastHitAt: undefined,
        unusedDays: 180,
        isShadowed: true,
        shadowedByRuleId: 'cpr-04',
        shadowedByRuleName: 'CRITICAL_RISK_Legacy_Database_AnyAny',
        isRedundant: false,
        isAnyAny: false,
        riskScore: 65,
        complianceTags: ['CIS:SHADOW-DETECTED'],
      },
      {
        id: 'cpr-06',
        firewallId: 'fw-cp-01',
        nativeRuleId: '999',
        name: 'Default_Cleanup_Drop_All',
        position: 999,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['Any'],
        destZones: ['Any'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 198240,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['PCI-DSS:Req1.2.1', 'CIS:DEFAULT-DENY'],
      }
    ];

    // 2. Palo Alto Networks Rules
    const paRules: CanonicalRule[] = [
      {
        id: 'par-01',
        firewallId: 'fw-pa-01',
        nativeRuleId: '101',
        name: 'Allow-Internet-HTTPS',
        position: 1,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['trust'],
        destZones: ['untrust'],
        sourceCidrs: ['10.10.0.0/16'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['TCP'],
        destPorts: ['443', '80'],
        applications: ['ssl', 'web-browsing', 'office365'],
        users: ['any'],
        hitCount: 842100,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 10,
        complianceTags: ['PCI-DSS:Req1.3'],
      },
      {
        id: 'par-02',
        firewallId: 'fw-pa-01',
        nativeRuleId: '102',
        name: 'Block-Threat-Tor-Exit-Nodes',
        position: 2,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['trust', 'dmz'],
        destZones: ['untrust'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['tor', 'tor-exit-node', 'i2p'],
        users: ['any'],
        hitCount: 4230,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:FW-THREAT-FEED'],
      },
      {
        id: 'par-03',
        firewallId: 'fw-pa-01',
        nativeRuleId: '103',
        name: 'Allow-DMZ-App-To-DB-Postgres',
        position: 3,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['dmz'],
        destZones: ['database'],
        sourceCidrs: ['10.20.10.0/24'],
        destCidrs: ['10.30.10.15/32'],
        protocols: ['TCP'],
        destPorts: ['5432'],
        applications: ['postgresql'],
        users: ['app_service_account'],
        hitCount: 142090,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 15,
        complianceTags: ['PCI-DSS:Req1.3.7'],
      },
      {
        id: 'par-04',
        firewallId: 'fw-pa-01',
        nativeRuleId: '999',
        name: 'interzone-default-deny',
        position: 999,
        action: 'deny',
        enabled: true,
        logging: true,
        sourceZones: ['any'],
        destZones: ['any'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['any'],
        hitCount: 312000,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:DEFAULT-DENY'],
      }
    ];

    // 3. Fortinet FortiGate Rules
    const fgRules: CanonicalRule[] = [
      {
        id: 'fgr-01',
        firewallId: 'fw-fg-01',
        nativeRuleId: '10',
        name: 'Policy_Default_WAN_Outbound',
        position: 1,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['port3_LAN'],
        destZones: ['port1_WAN'],
        sourceCidrs: ['10.30.0.0/16'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['TCP', 'UDP'],
        destPorts: ['80', '443', '53'],
        applications: ['HTTP', 'HTTPS', 'DNS'],
        users: ['Domain_Branch_Users'],
        hitCount: 318020,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 10,
        complianceTags: ['PCI-DSS:Req1.3'],
      },
      {
        id: 'fgr-02',
        firewallId: 'fw-fg-01',
        nativeRuleId: '11',
        name: 'Policy_Block_Malicious_Botnets',
        position: 2,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['port3_LAN'],
        destZones: ['port1_WAN'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['Botnet_C2'],
        users: ['ANY'],
        hitCount: 120,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:IPS-BOTNET-BLOCK'],
      },
      {
        id: 'fgr-03',
        firewallId: 'fw-fg-01',
        nativeRuleId: '999',
        name: 'Implicit_Deny_All',
        position: 999,
        action: 'deny',
        enabled: true,
        logging: true,
        sourceZones: ['any'],
        destZones: ['any'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 84120,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:DEFAULT-DENY'],
      }
    ];

    // 4. pfSense Netgate Rules
    const pfRules: CanonicalRule[] = [
      {
        id: 'pfr-01',
        firewallId: 'fw-pf-01',
        nativeRuleId: '1000000101',
        name: 'Anti-Lockout Rule (WebGUI)',
        position: 1,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['igc0_LAN'],
        destZones: ['This_Firewall'],
        sourceCidrs: ['192.168.40.0/24'],
        destCidrs: ['192.168.40.1/32'],
        protocols: ['TCP'],
        destPorts: ['443', '80'],
        applications: ['HTTPS'],
        users: ['pfSense_Admins'],
        hitCount: 1940,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 5,
        complianceTags: ['CIS:FW-ADMIN-ALLOW'],
      },
      {
        id: 'pfr-02',
        firewallId: 'fw-pf-01',
        nativeRuleId: '1000000102',
        name: 'Default allow LAN to any rule',
        position: 2,
        action: 'allow',
        enabled: true,
        logging: true,
        sourceZones: ['igc0_LAN'],
        destZones: ['WAN_Internet'],
        sourceCidrs: ['192.168.40.0/24'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 124500,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 25,
        complianceTags: ['PCI-DSS:Req1.3'],
      },
      {
        id: 'pfr-03',
        firewallId: 'fw-pf-01',
        nativeRuleId: '1000000103',
        name: 'Block Private Networks (RFC 1918 on WAN)',
        position: 3,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['ix0_WAN'],
        destZones: ['igc0_LAN'],
        sourceCidrs: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 3820,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:BOGON-BLOCK', 'PCI-DSS:Req1.2'],
      },
      {
        id: 'pfr-04',
        firewallId: 'fw-pf-01',
        nativeRuleId: '1000000999',
        name: 'Default Deny Rule (pf block in log all)',
        position: 999,
        action: 'drop',
        enabled: true,
        logging: true,
        sourceZones: ['any'],
        destZones: ['any'],
        sourceCidrs: ['0.0.0.0/0'],
        destCidrs: ['0.0.0.0/0'],
        protocols: ['ANY'],
        destPorts: ['ANY'],
        applications: ['ANY'],
        users: ['ANY'],
        hitCount: 42100,
        lastHitAt: new Date().toISOString(),
        unusedDays: 0,
        isShadowed: false,
        isRedundant: false,
        isAnyAny: false,
        riskScore: 0,
        complianceTags: ['CIS:DEFAULT-DENY'],
      }
    ];

    this.rules.set('fw-cp-01', cpRules);
    this.rules.set('fw-pa-01', paRules);
    this.rules.set('fw-fg-01', fgRules);
    this.rules.set('fw-pf-01', pfRules);
  }

  private initPrimaryConfigSnapshots() {
    // Check Point snapshots
    this.configSnapshots.set('fw-cp-01', [
      {
        id: 'snap-cp-01',
        firewallId: 'fw-cp-01',
        version: 'v4.1.0',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        author: 'admin_rachel (SecOps)',
        changeType: 'drift_detected',
        hash: 'e8f7a1c9b204e38d',
        ticketId: 'SEC-8921',
        rawConfig: `# Check Point Gaia OS Configuration Snapshot - v4.1.0
set hostname CheckPoint-Quantum-6600-HQ
set interface eth0 state on
set interface eth1 state on
set interface eth2 state on
set interface eth3 state on
rule 1: name "Stealth_Rule_Block_Direct_Mgmt" action drop logging enabled
rule 2: name "Admin_Subnet_HTTPS_SSH_Access" action accept src 192.168.100.0/24 dst 192.168.10.1/32 svc 443,22
rule 3: name "Corporate_Web_Browsing_Outbound" action accept src 10.10.0.0/16 dst any svc 80,443,53
rule 4: name "CRITICAL_RISK_Legacy_Database_AnyAny" action accept src any dst 10.20.10.0/24 svc any logging disabled
rule 5: name "SHADOWED_Oracle_DB_Access" action accept src 10.10.0.0/16 dst 10.20.10.50/32 svc 1521
rule 999: name "Default_Cleanup_Drop_All" action drop logging enabled`
      },
      {
        id: 'snap-cp-02',
        firewallId: 'fw-cp-01',
        version: 'v4.0.0',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        author: 'system_backup_job',
        changeType: 'scheduled',
        hash: 'b3c4d5e6f7089123',
        ticketId: 'CHG-10492',
        rawConfig: `# Check Point Gaia OS Configuration Snapshot - v4.0.0
set hostname CheckPoint-Quantum-6600-HQ
set interface eth0 state on
set interface eth1 state on
set interface eth2 state on
set interface eth3 state on
rule 1: name "Stealth_Rule_Block_Direct_Mgmt" action drop logging enabled
rule 2: name "Admin_Subnet_HTTPS_SSH_Access" action accept src 192.168.100.0/24 dst 192.168.10.1/32 svc 443,22
rule 3: name "Corporate_Web_Browsing_Outbound" action accept src 10.10.0.0/16 dst any svc 80,443,53
rule 999: name "Default_Cleanup_Drop_All" action drop logging enabled`
      }
    ]);

    // Palo Alto snapshots
    this.configSnapshots.set('fw-pa-01', [
      {
        id: 'snap-pa-01',
        firewallId: 'fw-pa-01',
        version: 'v11.1.2.r2',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        author: 'netadmin_carlos',
        changeType: 'manual',
        hash: 'fa20938471bd89e2',
        ticketId: 'CHG-8914',
        rawConfig: `<config version="11.1.0">
  <devices>
    <entry name="localhost.localdomain">
      <network>
        <interface><ethernet><entry name="ethernet1/1"><layer3/></entry></ethernet></interface>
      </network>
      <rulebase>
        <security>
          <rules>
            <entry name="Allow-Internet-HTTPS"><action>allow</action><application><member>ssl</member></application></entry>
            <entry name="Block-Threat-Tor-Exit-Nodes"><action>drop</action></entry>
          </rules>
        </security>
      </rulebase>
    </entry>
  </devices>
</config>`
      }
    ]);

    // FortiGate snapshots
    this.configSnapshots.set('fw-fg-01', [
      {
        id: 'snap-fg-01',
        firewallId: 'fw-fg-01',
        version: 'v7.4.4.b1',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        author: 'fortimanager_push',
        changeType: 'scheduled',
        hash: '8f7e6d5c4b3a2109',
        ticketId: 'CHG-8902',
        rawConfig: `# FortiOS Config Snapshot - FortiGate-600F-Core
config firewall policy
    edit 10
        set name "Policy_Default_WAN_Outbound"
        set srcintf "port3_LAN"
        set dstintf "port1_WAN"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 11
        set name "Policy_Block_Malicious_Botnets"
        set action deny
    next
end`
      }
    ]);

    // pfSense snapshots
    this.configSnapshots.set('fw-pf-01', [
      {
        id: 'snap-pf-01',
        firewallId: 'fw-pf-01',
        version: '24.03.p1',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        author: 'pfsense_webgui_admin',
        changeType: 'manual',
        hash: '4a3b2c1d0e9f8a7b',
        ticketId: 'CHG-8877',
        rawConfig: `<?xml version="1.0"?>
<pfsense>
  <version>24.5</version>
  <theme>pfsense_ng</theme>
  <sysctl>
    <item><tunable>net.inet.ip.fastforwarding</tunable><value>1</value></item>
  </sysctl>
  <filter>
    <rule><type>pass</type><interface>lan</interface><descr>Default allow LAN to any rule</descr></rule>
    <rule><type>block</type><interface>wan</interface><descr>Block Private Networks</descr></rule>
  </filter>
</pfsense>`
      }
    ]);
  }

  private initComplianceControls() {
    this.complianceControls = [
      {
        id: 'pci-1',
        framework: 'PCI-DSS',
        controlCode: 'Req 1.2.1',
        title: 'Restrict inbound and outbound traffic to necessary business protocols only',
        description: 'Ensure firewall rulebase explicitly denies all untrusted traffic by default and permits only authorized connections.',
        status: 'pass',
        scoreImpact: 15,
        evidence: 'Default drop/deny cleanup rules active on Check Point (cpr-06), Palo Alto (par-04), FortiGate (fgr-03), and pfSense (pfr-04).',
        remediation: 'None required.',
        affectedRules: ['cpr-06', 'par-04', 'fgr-03', 'pfr-04']
      },
      {
        id: 'pci-2',
        framework: 'PCI-DSS',
        controlCode: 'Req 1.3.1',
        title: 'Prohibit direct public inbound access to database environment',
        description: 'Direct connections from the Internet (0.0.0.0/0) to cardholder data/database subnets must be strictly prevented.',
        status: 'fail',
        scoreImpact: -25,
        evidence: 'Check Point Rule 4 allows ANY source IP (0.0.0.0/0) into Database_DMZ subnet (10.20.10.0/24).',
        remediation: 'Remove Rule 4 or restrict source to application tier servers only with specific port 1521/5432.',
        affectedRules: ['cpr-04']
      },
      {
        id: 'pci-3',
        framework: 'PCI-DSS',
        controlCode: 'Req 10.2.1',
        title: 'Implement automated audit trails for all security rule events and access',
        description: 'Logging must be enabled on all active firewall allow and drop rules for continuous auditability.',
        status: 'fail',
        scoreImpact: -15,
        evidence: 'Rule 4 has logging disabled.',
        remediation: 'Enable session logging on Check Point Rule 4.',
        affectedRules: ['cpr-04']
      },
      {
        id: 'cis-1',
        framework: 'CIS',
        controlCode: 'CIS-FW 3.4',
        title: 'Eliminate shadowed and unreachable rules from firewall configuration',
        description: 'Shadowed rules increase processing overhead and create administrative confusion during incident response.',
        status: 'warning',
        scoreImpact: -10,
        evidence: 'Check Point Rule 5 (SHADOWED_Oracle_DB_Access) is 100% shadowed by Rule 4.',
        remediation: 'Delete Rule 5 or move it before Rule 4 in the execution order.',
        affectedRules: ['cpr-05']
      },
      {
        id: 'cis-2',
        framework: 'CIS',
        controlCode: 'CIS-FW 2.1',
        title: 'Block Unrouteable and Bogon Addresses at the Perimeter',
        description: 'RFC 1918 and unassigned address space arriving on external interfaces must be dropped.',
        status: 'pass',
        scoreImpact: 10,
        evidence: 'pfSense rule 1000000103 actively drops RFC 1918 bogons on ix0 WAN.',
        remediation: 'Maintain bogon filter list update schedule.',
        affectedRules: ['pfr-03']
      },
      {
        id: 'certin-1',
        framework: 'CERT-In',
        controlCode: 'Dir-2022.4',
        title: 'Mandatory 180-Day Firewall Audit Log Retention within Indian Jurisdiction',
        description: 'Under CERT-In Cyber Security Directions (Section 70B), all perimeter firewalls must maintain rolling logs for at least 180 days.',
        status: 'pass',
        scoreImpact: 25,
        evidence: 'Centralized ClickHouse/On-Prem storage configured with 180-day partition retention policy.',
        remediation: 'Maintain current storage tier capacity.',
        affectedRules: ['cpr-01', 'par-01', 'fgr-01', 'pfr-01']
      },
      {
        id: 'certin-2',
        framework: 'CERT-In',
        controlCode: 'Dir-2022.6',
        title: 'Reporting of Unauthorized Perimeter Access & C2 Activity within 6 Hours',
        description: 'Instances of port scanning, botnet beaconing, and malicious intrusion attempts must be categorized and recorded for CERT-In incident reporting.',
        status: 'pass',
        scoreImpact: 20,
        evidence: 'Check Point Anti-Bot & Palo Alto Threat log automated triggers integrated to alert queue.',
        remediation: 'Verify notification webhook endpoints to SOC.',
        affectedRules: ['cpr-01', 'par-02', 'fgr-02']
      },
      {
        id: 'certin-3',
        framework: 'CERT-In',
        controlCode: 'Dir-2022.3',
        title: 'NTP Synchronization with National Physical Laboratory (NPL) Atomic Clocks',
        description: 'System clocks across all perimeter firewalls must be strictly synchronized to NPL or NIC Indian standard time servers.',
        status: 'pass',
        scoreImpact: 15,
        evidence: 'NTP synchronized to ntp.nic.in (Stratum 1) with jitter < 1ms across all 4 primary gateways.',
        remediation: 'None required.',
        affectedRules: ['cpr-01', 'par-01', 'fgr-01', 'pfr-01']
      },
      {
        id: 'iso-1',
        framework: 'ISO-27001',
        controlCode: 'A.13.1.2',
        title: 'Network Segregation & Perimeter Controls',
        description: 'Networks must be segmented into perimeter zones based on asset classification and data criticality.',
        status: 'pass',
        scoreImpact: 20,
        evidence: 'DMZ, Core LAN, SecOps VLAN, and WAN zones segregated across all 4 primary firewalls.',
        remediation: 'Maintain current zoning architecture.',
        affectedRules: ['cpr-01', 'par-01', 'fgr-01', 'pfr-01']
      }
    ];
  }

  public getDevices(): FirewallDevice[] {
    return Array.from(this.devices.values());
  }

  public getActiveLiveDevice(): FirewallDevice | undefined {
    // Return first device that is healthy and has live SNMP metrics
    for (const dev of this.devices.values()) {
      if (dev.status === 'healthy' && dev.snmpMetrics && dev.snmpMetrics.interfaces && dev.snmpMetrics.interfaces.length > 0) {
        return dev;
      }
    }
    // Fallback to first configured device if any
    return Array.from(this.devices.values())[0];
  }

  public getDeviceById(id: string): FirewallDevice | undefined {
    return this.devices.get(id);
  }

  public addDevice(dev: FirewallDevice): FirewallDevice {
    this.devices.set(dev.id, dev);
    persistence.saveJSON('devices.json', Array.from(this.devices.values()));
    return dev;
  }

  public updateDevice(id: string, updates: Partial<FirewallDevice>): FirewallDevice | null {
    const existing = this.devices.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, lastSeen: new Date().toISOString() };
    this.devices.set(id, updated);
    persistence.saveJSON('devices.json', Array.from(this.devices.values()));
    return updated;
  }

  public deleteDevice(id: string): boolean {
    const res = this.devices.delete(id);
    if (res) {
      persistence.saveJSON('devices.json', Array.from(this.devices.values()));
    }
    return res;
  }

  public updateDeviceSNMP(id: string, metrics: any) {
    const dev = this.devices.get(id);
    if (dev) {
      dev.snmpMetrics = metrics;
      dev.lastSeen = new Date().toISOString();
      persistence.saveJSON('devices.json', Array.from(this.devices.values()));
    }
  }

  public getRules(firewallId: string): CanonicalRule[] {
    return this.rules.get(firewallId) || [];
  }

  public getSnapshots(firewallId: string): ConfigSnapshot[] {
    return this.configSnapshots.get(firewallId) || [];
  }

  public getComplianceControls(): ComplianceAuditItem[] {
    return this.complianceControls;
  }
}

export const metadataStore = new MetadataStore();
(globalThis as any).metadataStoreHolder = { metadataStore };
