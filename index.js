var child = require('child_process'),
    net = require('net'),
    path = require('path');

var connect = function(fn, options) {
  var client = net.createConnection({
    host : options.host || 'localhost',
    port : 54321,
  }, function() {
    fn(null, client);
  });

  client.on('error', function(err) {

    // daemon is not running
    if (err.code && err.code === 'ECONNREFUSED') {
      var proc = child.spawn('node', [path.join(__dirname, 'bin', 'manager.js')], {
        stdio: 'pipe',
        detached: true
      });

      proc.unref();
      connect(fn, options);
    } else {
      fn(err);
    }
  });
};

module.exports = function(fn, options) {
  options = options || {
    reconnect : true
  };

  connect(function handle(err, conn) {

    conn.once('close', function() {
      conn.destroy();
      if (options.reconnect) {
        connect(handle, options);
      }
    });

    var deviceString = ''
    conn.once('data', function catchDevice(d) {
      deviceString+=d.toString();

      if (deviceString.indexOf('\n') > -1) {
        fn(err, conn, JSON.parse(deviceString));
      } else {
        conn.once('data', catchDevice);
      }
    });

  }, options);
};
