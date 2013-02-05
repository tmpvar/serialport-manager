var net = require('net'),
    findPort = require('netutil').findFreePort,
    servers = {};

module.exports = function(device, registry, fn) {

  if (!servers[device.serialNumber]) {
    findPort(5000, 65000, 'localhost', function(err, port) {
      var server = net.createServer(function(conn) {

        servers[device.serialNumber].clients++;
        conn.on('close', function() {
          servers[device.serialNumber].clients--;
        });

        registry.get(device.serialNumber, function(e, sp) {
          if (e) {
            server.close();
            return;
          }

          conn.write('ready\n');

          sp.pipe(conn).pipe(sp, { end : false });
        });
      });

      servers[device.serialNumber] = { clients: 0 };

      server.on('close', function() {
        servers[device.serialNumber] = false;
      });

      server.listen(port, function(e) {
        fn(e, { port: port });
      });
    });
  }
};