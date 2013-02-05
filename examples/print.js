var spm = require('../');

spm(function(err, manager) {
  manager.on('device', function(device) {

    device.connect(function(err, stream) {

      stream.on('data', function(d) {
        console.log(d.toString());
      });

      var timer = setInterval(function() {
        console.log('write')
        stream.write('G1 X10\n');
        stream.write('G1 X0\n');
      }, 2000);

      setInterval(function() {
        stream.write('?');
      }, 100);

      stream.on('end', function() {
        clearInterval(timer);
      });
    });
  });
});
