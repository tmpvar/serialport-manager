var SerialPort = require('serialport').SerialPort,
    serialpipe = require('./serialpipe'),
    signature = require('./signature'),
    ee = module.exports = new (require('events').EventEmitter)();
    registry = {};


module.exports.get = function(serialNumber, fn) {
  if (registry[serialNumber]) {
    if (registry[serialNumber].sp) {
      fn(null, registry[serialNumber].sp);
    } else {
      console.log('no serialport connection :(')
      // TODO: go get the sp if available
    }
  } else {
    fn(new Error('not found'));
  }
};

module.exports.save = function(fn) {
  // TODO: save serialNumber / signature pairs
  fn();
};

module.exports.register = function(info) {
  var now = Date.now();

  var serialNumber = info.serialNumber;

  if (!registry[serialNumber]) {
    registry[serialNumber] = {
      info : info
    };
  }

  if (!registry[serialNumber].sp) {
    var sp = registry[serialNumber].sp = new SerialPort(info.comName);
    sp.writable = true;

    if (!registry[serialNumber].info.signature) {

      signature(sp, function(e, sig) {
        if (e) {
          sp.close();
          return;
        }

        registry[serialNumber].info.signature = sig;

        serialpipe(registry[serialNumber].info, module.exports, function(e, serverInfo) {
          console.log(serverInfo)
          registry[serialNumber].port = serverInfo.port;
          ee.emit('device', registry[serialNumber]);
        });

      });
    }
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
