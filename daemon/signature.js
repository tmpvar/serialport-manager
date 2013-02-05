module.exports = function(sp, fn) {
  // collect the device signature
  var start = null, sig = '', timer;
  var handleSignature = function(data) {
    if (data) {
      sig += data.toString() || '';
    }

    clearTimeout(timer);

    if (start === null && data) {
      start = Date.now();
    } else if (Date.now() - start > 100) {
      sp.removeListener('data', handleSignature);
      fn(null, sig.trim());
    } else if (data) {
      timer = setTimeout(handleSignature, 100);
    }
  };

  sp.on('data', handleSignature);
  sp.once('error', function(e) {
    fn(e);
  });
};
