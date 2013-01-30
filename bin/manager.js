var fs = require('fs'),
    serialport = require('serialport'),
    SerialPort = serialport.SerialPort,
    net = require('net'),
    ports, sps = {},
    async = require('async'),
    os = require('os'),
    clients = [];

var connect = function(port, fn) {

  if (sps[port.comName] || sps[port.comName] === false) {
    return fn();
  }

  var sp = new SerialPort(port.comName);

  sp.writable = true;
  sp.end = sp.end || function() {};
  sps[port.comName] = sp;

  sp.once('open', function() {
    port.signature = '';

    var signatureTimeout = null, lastData = 0;
    var handleSignature = function(data) {
      clearTimeout(signatureTimeout);
      signatureTimeout = setTimeout(function() {
        sp.removeListener('data', handleSignature);
        fn && fn();
      }, 100);

      port.signature += data.toString();
    };

    sp.on('data', handleSignature);
  });

  // if the sp errors before opening just add it to the
  // known ports list.  Ignore it from now on.
  var removeSP = function() {
    sps[port.comName] = false;
    fn && fn();
  };

  sp.once('error', removeSP);
  sp.on('close', removeSP);
};

function poll(fn) {
  serialport.list(function(err, list) {
    ports = list;
    async.forEach(list, connect, function() {
      fn && fn();
    });
  });
};

net.createServer(function(conn) {
  var buffer = '';

  conn.once('close', function() {
    clients = clients.filter(function(client) {
      return client!==conn;
    });

    // automatically shut down when there
    // are no clients interested in our
    // services
    !clients.length && process.exit();
  });


  poll(function() {

    // tell the client what sps are available
    conn.write(JSON.stringify(ports.filter(function(p) {
      return !!sps[p.comName];
    })) + '\n');

    // collect the comName from the client
    conn.once('data', function request(d) {

      buffer+=d.toString();

      if (buffer.indexOf('\n') > -1) {
        var first = buffer.split('\n').shift();

        if (sps[first]) {
          sps[first].pipe(conn);
          conn.setEncoding('ascii');
          conn.pipe(sps[first]);
        }
      } else {
        conn.once('data', request);
      }
    });
  });
}).listen(54321);
