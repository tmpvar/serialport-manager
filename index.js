var sproc = require('sproc'),
    defaults = require('defaults'),
    path = require('path'),
    split = require('split'),
    EventEmitter = require('events').EventEmitter,
    net = require('net'),
    log;

function Device(host, info) {
  this.host = host;
  this.port = info.port;
  this.info = info;
}

Device.prototype.connect = function(fn) {
  log && log('creating connection to', this.host, this.port);
  var client = net.createConnection({
    host: this.host,
    port: this.port
  });

  client.on('connect', function() {
    log && log('connected to', this.host, this.port);
    fn(null, client);
  });

  client.on('error', function(e) {
    log && log('error', e);
    fn(e);
  });
};


module.exports = function(options, fn) {
  if (!fn && typeof options === 'function') {
    fn = options;
    options = {};
  }

  defaults(options, {
    host: 'localhost',
    port: 4672,
    script: path.join(__dirname, 'daemon', 'main.js'),
    log: null
  });

  log = options.log;

  sproc(options, function(err, stream) {

    if (err) {
      return fn(err);
    }

    var ee = new EventEmitter();
    stream.pipe(split()).on('data', function(d) {
      ee.emit('device', new Device(options.host || localhost, JSON.parse(d)));
    });

    fn(null, ee);
  });
};
