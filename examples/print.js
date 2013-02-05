var spm = require('../');

spm(function(err, manager) {
  manager.on('device', function(device) {
   console.log('Found', device.info.signature);
  });
});
