var serialport = require('serialport'),
    serialpipe = require('./serialpipe'),
    store = require('./store'),
    async = require('async'),
    fs = require('fs'),
    poller = module.exports,
    interval = 1000;

poller.interval = function(ms) {
  interval = ms;
  return poller;
};

poller.timer = setTimeout(function poll() {
  serialport.list(function(err, ports) {
    async.forEach(ports, function(port, fn) {
      if (!store.has(port.serialNumber)) {
        if (process.platform !== 'win32') {
          // Ensure the thing we're trying to connect to
          // is infact a file
          fs.stat(port.comName, function(err) {
            if (err) {
              fn();
            } else {
              serialpipe(port, fn);
            }
          });
        } else {
          serialpipe(port, fn);
        }
      } else {
        fn();
      }

    }, function() {
      poller.timer = setTimeout(poll, interval)
    });
  });
}, interval);
