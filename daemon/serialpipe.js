var net = require('net'),
    serialport = require('./serialport'),
    store = require('./store'),
    findPort = require('netutil').findFreePort;

module.exports = function(info, fn) {
  store.set(info.serialNumber, false);

  serialport(info.comName, function(e, sp, signature) {
    if (e) {
      store.remove(info.serialNumber);
      return fn();
    }

    info.signature = signature;

    var server = net.createServer(function(conn) {
      conn.pipe(sp, { end : false }).pipe(conn);
    });

    sp.once('close', function() {
      console.log('REMOVE', info.serialNumber);
      store.remove(info.serialNumber);
      server.close();
    });

    findPort(5000, 65000, 'localhost', function(err, port) {
      if (err) {
        return fn(err);
      }

      info.port = port;
      console.log('ADD', info.serialNumber);
      store.set(info.serialNumber, info);
      fn();
      server.listen(port, fn);
    });

  });
};