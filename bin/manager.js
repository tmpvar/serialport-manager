var fs = require('fs'),
    serialport = require('serialport'),
    SerialPort = serialport.SerialPort,
    net = require('net'),
    ports = {}, rawPorts = {},
    os = require('os');

var connect = function(port) {

  var sp = new SerialPort(port.comName);
  ports[port.comName] = port;
  ports[port.comName].sp = sp;

  sp.once('open', function() {
    var signature = '';

    var handleSignature = function(data) {
      signature += data.toString();
    }

    sp.on('data', handleSignature);
    setTimeout(function() {
      sp.removeListener('data', handleSignature);
      ports[port.comName].signature = signature.replace(/^[\r\n]*|[\r\n]*$/g,'').split('\n');
    }, 2000);
  });

  // if the sp errors before opening just add it to the
  // known ports list.  Ignore it from now on.
  sp.once('error', function() {
    delete ports[port.comName];
  });

  sp.on('close', function() {
    delete ports[port.comName];
  });
};


setTimeout(function poll() {
  serialport.list(function(err, list) {
    rawPorts = list;

    list.forEach(function(port) {
      if (!ports[port.comName]) {
        if (os.platform().toLowerCase().indexOf('win') < 0) {
          // Unix only
          fs.stat(port.comName, function(err, stat) {
            // ignore ports that do not exist on the filesystem
            if (err) {
              ports[port.comName] = true;
            } else {
              connect(port);
            }
          });
        } else {
          connect(port);
        }
      }
    });

    setTimeout(poll, 1000);
  });
});

net.createServer(function(conn) {
  var buffer = '';

  conn.write(JSON.stringify(rawPorts));

  conn.once('data', function request(d) {

    buffer+=d.toString();

    if (buffer.indexOf('\n') > -1) {
      var first = buffer.split('\n').shift();
      if (ports[first]) {
        ports[first].sp.pipe(conn);
        conn.pipe(ports[first].sp);
      }
    } else {
      conn.once('data', request);
    }
  });
}).listen(54321);