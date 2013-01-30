var child = require('child_process'),
    net = require('net'),
    path = require('path');

var connect = function(fn, options) {
  var client = net.createConnection({
    host : options.host || 'localhost',
    port : 54321,
  }, function() {
    fn(null, client);
    client.resume();
  });

  client.pause();

  client.on('error', function(err) {

    // daemon is not running
    if (err.code && err.code === 'ECONNREFUSED') {
      var proc = child.spawn('node', [path.join(__dirname, 'bin', 'manager.js')], {
        stdio: 'pipe',
        detached: true
      });

      proc.unref();
      setTimeout(function() {
        connect(fn, options);
      }, 100);

    } else {
      fn(e);
    }
  });
};

module.exports = function(fn, options) {
  options = options || {};

  connect(function handle(err, conn) {
    conn.pipe(process.stdout);
    conn.once('close', function() {
      console.log('CLOSED\n\n\n\n')
      conn.destroy();
      if (options.reconnect) {
        connect(handle, options);
      }
    });

    var deviceString = ''
    conn.once('data', function catchDevice(d) {
      deviceString+=d.toString();

      if (deviceString.indexOf('\n') > -1) {
        console.log('CALLING FNn\n\n\n\n\n')
        fn(err, conn, JSON.parse(deviceString));
      } else {
        conn.once('data', catchDevice);
      }
    });

  }, options);
};
