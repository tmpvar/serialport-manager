var fs = require('fs'),
    serialport = require('serialport'),
    SerialPort = serialport.SerialPort,
    net = require('net'),
    ports = [], sps = {},
    async = require('async'),
    os = require('os'),
    clients = [];

var connect = function(port, fn) {

  if (sps[port.comName] || sps[port.comName] === false) {
    return fn();
  }

  ports.push(port);

  var sp = new SerialPort(port.comName);

  sp.writable = true;
  sp.end = sp.end || function() {
    sp.close();
    sp.emit('end');
  };

  sps[port.comName] = sp;

  sp.once('open', function() {
    port.signature = '';

    var signatureTimeout = null, lastData = 0;
    var handleSignature = function(data) {
      clearTimeout(signatureTimeout);
      signatureTimeout = setTimeout(function() {
        port.signature = port.signature.trim();
        sp.removeListener('data', handleSignature);
        fn && fn();
      }, 50);

      port.signature += data.toString();
    };

    sp.on('data', handleSignature);
  });

  // if the sp errors before opening just add it to the
  // known ports list.  Ignore it from now on.
  var removeSP = function() {
    ports = ports.filter(function(p) {
      if (sps[port.comName])
      return p.comName !== port.comName;
    });
    fn && fn();
  };

  sp.once('error', function() {
    removeSP();
    sps[port.comName] = false;
  });

  sp.on('close', function() {
    removeSP()
    delete sps[port.comName];
  });
};

var pollQueue = [];
function poll(fn) {
  pollQueue.push(fn);

  if (pollQueue.length > 1) {
    return;
  }

  serialport.list(function(err, list) {
    async.forEach(list, connect, function() {

      while(pollQueue.length > 0) {
        var cb = pollQueue.shift();
        typeof cb === 'function' && cb();
      }
    });
  });
};

poll();

net.createServer(function(conn) {
  var buffer = '';

  clients.push(conn);

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
          sps[first].setMaxListeners(clients.length*5);
          sps[first].pipe(conn);
          conn.pipe(sps[first]);
        } else {
          conn.destroy();
        }
      } else {
        conn.once('data', request);
      }
    });
  });
}).listen(54321);
