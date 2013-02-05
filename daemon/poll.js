var EventEmitter = require('events').EventEmitter,
    serialport = require('serialport'),
    registry = require('./registry'),
    poller = module.exports,
    async = require('async'),
    interval = 2000;

poller.interval = function(ms) {
  interval = ms;
  return poller;
};

poller.timer = setTimeout(function poll() {
  serialport.list(function(err, ports) {
    async.forEach(ports, registry.register, function() {
      console.log('poll complete')
      poller.timer = setTimeout(poll, interval)
    });
  });
}, interval);
