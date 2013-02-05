var SerialPort = require('serialport').SerialPort,
    serialpipe = require('./serialpipe'),
    signature = require('./signature'),
    defaults = require('defaults'),
    ee = module.exports = new (require('events').EventEmitter)();
    registry = {};


var get = module.exports.get = function(serialNumber, fn) {
console.log((new Error()).stack);
  if (registry[serialNumber]) {
    if (registry[serialNumber].sp) {
      fn(null, registry[serialNumber].sp);
    } else {
      var sp = registry[serialNumber].sp = new SerialPort(registry[serialNumber].info.comName);
      sp.writable = true;

      sp.on('close', function() {
        registry[serialNumber].sp = false;
      });

      var open = false;
      sp.on('open', function() {
        open = true;
        fn(null, registry[serialNumber].sp);
      });

      sp.on('error', function(e) {
        if (open || registry[serialNumber].info.signature) {
          registry[serialNumber].sp = false;
          fn();
        } else {
          fn(e);
        }
      });
    }
  } else {
    fn(new Error('not found'));
  }
};

module.exports.save = function(fn) {
  // TODO: save serialNumber / signature pairs
  fn();
};

module.exports.register = function(info, fn) {
  var now = Date.now();

  var serialNumber = info.serialNumber;

  if (!registry[serialNumber]) {
    registry[serialNumber] = {
      info : info
    };
  } else {
    registry[serialNumber].info.comName = info.comName;
  }

  if (!registry[serialNumber].sp) {
    console.log('create sp for', registry[serialNumber].info.comName);

    get(serialNumber, function(e, sp) {

      if (e) {
        return fn(e);
      }
      //if (!registry[serialNumber].info.signature) {

        signature(sp, function(e, sig) {
          fn(e);

          registry[serialNumber].info.signature = sig;

          serialpipe(registry[serialNumber].info, module.exports, function(e, serverInfo) {
            registry[serialNumber].port = serverInfo.port;
            ee.emit('device', registry[serialNumber]);
          });
        });

      // reconnection
      // } else {
      //   console.log('reconnect')
      //   serialpipe(registry[serialNumber].info, module.exports, function(e, serverInfo) {
      //     registry[serialNumber].port = serverInfo.port;
      //     ee.emit('device', registry[serialNumber]);
      //   });
      // }
    });
  } else {
    fn();
  }
};

module.exports.list = function() {
  var ret = [];
  Object.keys(registry).forEach(function(key) {
    var port = registry[key];
    if (port.signature) {
      ret.push(port);
    }
  });

  return ret;
};
