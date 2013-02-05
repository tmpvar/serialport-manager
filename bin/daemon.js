#!/usr/bin/env node

var daemon = require('../daemon/main'),
    net = require('net');

var server = net.createServer(function(conn) {

daemon({
  log: console.log
}, conn);

}).listen(4672);

