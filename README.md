# serialport-manager

Manage transient serialport connections.

## Install

`npm install serialport-manager`

## Use

```javascript

var spm = require('serialport-manager');

spm(function(err, connection, deviceList) {
  connection.write(deviceList[0].comName + '\n');
  connection.pipe(process.stdout);
});

```

