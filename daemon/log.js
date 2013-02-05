var fs = require('fs');

var stream = fs.createWriteStream('/Users/tmpvar/work/tmp/daemon.log');
module.exports = function() {
  var args = [];
  Array.prototype.push(args, arguments);
  stream.write(args.join(' '));
};