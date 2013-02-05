var sproc = require('sproc'),
    dnode = require('dnode')
    defaults = require('defaults'),
    path = require('path'),
    split = require('split'),
    EventEmitter = require('events').EventEmitter,
    net = require('net');

function Device(host, info) {
  this.host = host;
  this.port = info.port;
  this.info = info.info;
}

Device.prototype.connect = function(fn) {
  var client = net.createConnection({
    host: this.host,
    port: this.port
  });

  var s = '';
  client.once('data', function handshake(d) {
    s += d.toString();
    console.log('s', s)
    if (s.indexOf('ready\n') > -1) {
      fn(null, client);
    } else {
      client.once('data', handshake);
    }
  });

  client.on('error', function(e) {
    fn(e);
  });
};


module.exports = function(options, fn) {
  if (!fn && typeof options === 'function') {
    fn = options;
    options = {};
  }

  sproc(defaults(options, {
    host: 'localhost',
    port: 4672,
    script: path.join(__dirname, 'daemon', 'main.js'),
    log: console.log,
    keepProcessReference: true
  }), function(err, stream) {

    if (err) {
      return fn(err);
    }

    var ee = new EventEmitter();
    stream.pipe(split()).on('data', function(d) {
      ee.emit('device', new Device(options.host, JSON.parse(d)));
    });

    fn(null, ee);
  });
};
