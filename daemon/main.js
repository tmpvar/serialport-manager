
var store = require('./store');

require('./poll');

var clients = 0;
module.exports = function(options, stream) {
  clients++;
  stream.on('end', function() {
    clients--;
    if (clients<=0) {
      process.exit(0);
    }
  });

  store.toArray().forEach(function(device) {
    stream.write(JSON.stringify(device) + '\n');
  });

  store.emitter.on('change', function(device) {
    console.log('CHANGE', device);
    stream.writable && stream.write(JSON.stringify(device) + '\n');
  });
};