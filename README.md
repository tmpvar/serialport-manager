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

### How does it work

calling `spm` above performs the following actions:

* attempt connection to the serialport manager daemon
 * if the connection fails, spawn the daemon
  * reconnect
* on connection, wait for the device list
* parse the json device list
* call the function passed into `spm`
* identify what device you want to use by sending back the `commName`
* bind to data events or pipe somewhere

## Why?

I want plug and play serial devices. I also want them to be accessible by more than one program.

## License

MIT

