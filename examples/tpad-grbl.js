var spm = require('../');

spm(function(err, manager) {
  var grblStream;
  manager.on('device', function(device) {

    if (device.info.signature.toLowerCase().indexOf('grbl') > -1) {

      device.connect(function(err, stream) {
        grblStream = stream;
        console.log(
          'connected to grbl version',
          device.info.signature.match(/ ([0-9]+\.[0-9\.a-z]+)/)[1]
        );

        if (err) {
          throw err;
        }

        stream.pipe(process.stdout);

        var timer = setInterval(function() {
          stream.write('?');
        }, 1000);

        stream.on('end', function() {
          clearInterval(timer);
        });
      });
    }

    if (device.info.signature.toLowerCase().indexOf('tpad') > -1) {
      var posX = 0, last = 0;
      device.connect(function(err, stream) {
        stream.on('data', function(d) {

          var parts = d.toString().split(',');
          var button = parseInt(parts[0], 10);
          var pressure = parseInt(parts[1], 10);
          if (button === 1 && pressure > 10000) {
            posX++;
          }

          if (button === 0 && pressure > 10000) {
            posX--;
          }

          if (grblStream && last !== posX) {
            grblStream.write('G1 X' + posX + ' F1000\n');
          }
        });
      });
    }

  });
});
