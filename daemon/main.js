var poll = require('./poll').interval(1000),
    fs = require('fs'),
    log = require('./log'),
    registry = require('./registry'),
    serialpipe = require('./serialpipe'),
    clients = [];

registry.on('device', function(device) {
  var json = JSON.stringify({
    info: device.info,
    port: device.port
  }) + '\n';

  clients.forEach(function(client) {
    client.write(json);
  });
});


var closeTimer;
module.exports = function(options, stream) {
  clients.push(stream);

  clearTimeout(closeTimer);

  stream.on('end', function() {
    clients = clients.filter(function(client) {
      return client !== stream;
    });

    if (clients.length === 0) {
      registry.save(function() {
        process.exit();
      });
    }
  });

  registry.list().forEach(function(device) {
    stream.write(JSON.stringify(device) + '\n');
  });
};
