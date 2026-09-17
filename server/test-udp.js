import dgram from 'node:dgram';

const client = dgram.createSocket('udp4');

const checkpointMsg = Buffer.from(
  'product=VPN-1 & FireWall-1; action=drop; service=443; proto=tcp; src=10.10.40.99; dst=198.51.100.244; rule_name=Stealth_Rule_Block_Direct_Mgmt; user=intruder_scan; threat_name=Manual_Port_Scan_Detected;'
);

const pfsenseMsg = Buffer.from(
  'filterlog: 4,,,1000000103,ix0,match,block,in,4,0x0,,64,0,0,DF,6,tcp,44,10.0.0.99,192.168.40.1,61234,80,0,S,987654,,1024,,'
);

client.send(checkpointMsg, 1514, '127.0.0.1', (err) => {
  if (err) console.error('Error sending Check Point test syslog:', err);
  else console.log('Successfully sent Check Point test syslog packet to port 1514');

  client.send(pfsenseMsg, 1514, '127.0.0.1', (err2) => {
    if (err2) console.error('Error sending pfSense test syslog:', err2);
    else console.log('Successfully sent pfSense test syslog packet to port 1514');
    client.close();
  });
});
