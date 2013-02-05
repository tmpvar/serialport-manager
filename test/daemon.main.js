var test = require('tap').test,
    main = require('../daemon/main'),
    store = require('../daemon/store');

test('daemon notifies client upon connection', function(t) {

  store.set('123123123', { commName : 'COM1' });
  store.set('123123124', { commName : 'COM2' });

  var writes = 0;

  var array = store.toArray();

  main({}, {
    write: function(d) {
      if (writes === 1) {
        t.end();
      }
      writes++;
    }
  });
});
