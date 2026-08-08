const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveTxt('cluster0.73cthwc.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('TXT Error:', err);
  } else {
    console.log('Resolved TXT:', addresses);
  }
});
