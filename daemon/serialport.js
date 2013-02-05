var SerialPort = require('serialport').SerialPort;

var signature = function(sp, fn) {
  // collect the device signature
  var start = null, sig = '', timer;
  var handleSignature = function(data) {
    if (data) {
      sig += data.toString() || '';
    }

    clearTimeout(timer);

    if (start === null && data) {
      start = Date.now();
    } else if (Date.now() - start > 100) {
      sp.removeListener('data', handleSignature);
      return fn(null, sig.trim());
    }
    timer = setTimeout(handleSignature, 100);
  };

  sp.on('data', handleSignature);
};


module.exports = function(comName, fn) {
  var sp = new SerialPort(comName);
  sp.writable = true;

  var open = false;
  sp.on('open', function() {
    open = true;
    signature(sp, function(e, sig) {
      fn(e, sp, sig);
    });
  });

  sp.once('error', function(e) {
    console.log('ERROR', e, comName);
    if (!open) {
      fn(e);
    }
  });
};
