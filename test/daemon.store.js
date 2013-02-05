var test = require('tap').test,
    store = require('../daemon/store');

test('ensure get/set works', function(t) {

  store.set('test', 123);
  t.equal(store.get('test'), 123);
  t.end();
});

test('ensure toArray works', function(t) {

  store.set('test', 123);
  store.set('monkey', 321);

  var array = store.toArray();

  t.equal(array.length, 2);
  t.ok(array[0], 123);
  t.ok(array[0], 321);

  store.clear();
  t.eqaul(store.toArray().length, 0);

  t.end();
});