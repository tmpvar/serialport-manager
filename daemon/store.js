var ee = new (require('events').EventEmitter)(),
    storage = {};

module.exports = {
  emitter : ee,
  get : function(key) {
    return (storage[key]) ? storage[key].value : null;
  },
  set : function(key, value) {
    storage[key] = {
      value : value,
      time : Date.now()
    };

    value.serialNumber && ee.emit('change', value);
  },
  has : function(key) {
    return typeof storage[key] !== 'undefined';
  },
  remove : function(key) {
    if (storage[key]) {
      delete storage[key];
    }
  },
  toArray : function() {
    var ret = [];
    Object.keys(storage).forEach(function(key) {
      ret.push(storage[key].value);
    });
    return ret;
  },
  clear : function() {
    storage = {};
  }
};
