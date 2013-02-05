var EventEmitter = require('events').EventEmitter,
    serialport = require('serialport'),
    registry = require('./registry'),
    poller = module.exports,
    interval = 1000;

poller.interval = function(ms) {
  interval = ms;
  return poller;
};

poller.timer = setTimeout(function poll() {
  serialport.list(function(err, ports) {
    ports.forEach(function(port) {
      registry.register(port);
    });
    poller.timer = setTimeout(poll, poller.interval)
  });
}, interval);
