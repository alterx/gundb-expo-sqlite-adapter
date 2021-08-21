function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var makeStoreAdapter = function makeStoreAdapter(Gun, autoInit) {
  if (autoInit === void 0) {
    autoInit = true;
  }

  var isInitialized = false;

  var Store = function Store(opt) {
    var db;
    var isReady = false;

    var sqlOpt = _extends({
      databaseName: 'gun.db',
      table: 'radata',
      onError: function onError() {},
      onOpen: function onOpen() {},
      onReady: function onReady() {},
      SQLite: null
    }, opt.sqlite);

    if (!sqlOpt.SQLite) {
      throw 'Please provide SQLite (expo-sqlite)';
    } // Acquire DB connection


    db = sqlOpt.SQLite.openDatabase(sqlOpt.databaseName);
    var tableName = sqlOpt.table; // Prepare the DB

    db.transaction(function (tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS " + tableName + " (key PRIMARY KEY, val)", []);
    }, sqlOpt.onError, function () {
      sqlOpt.onReady.call(null);
      isReady = true;
    });
    var store = {
      get: function get(key, done) {
        if (!isReady) {
          setTimeout(function () {
            return store.get(key, done);
          }, 9);
          return;
        }

        db.transaction(function (tx) {
          tx.executeSql("SELECT * FROM " + tableName + " WHERE key = ?", [key], function (tx, results) {
            var item = results.rows.item(0);
            done(null, (item == null ? void 0 : item.val) || '');
          }, function (tx, err) {
            return done(err || 5);
          });
        });
      },
      put: function put(key, data, done) {
        if (!isReady) {
          setTimeout(function () {
            return store.put(key, data, done);
          }, 1);
          return;
        }

        var inserts = [{
          sql: "INSERT OR REPLACE INTO " + tableName + " (key, val) VALUES (?,?)",
          vars: [key, data]
        }]; // Run transactions

        db.transaction(function (tx) {
          return inserts.forEach(function (row) {
            return tx.executeSql(row.sql, row.vars);
          });
        }, function (err) {
          return done(err || 'put.tx.error');
        }, function () {
          return done(null);
        });
      }
    };
    return store;
  };

  var init = function init() {
    if (isInitialized) {
      throw 'Already sqlite adapter initialized.';
    }

    try {
      Gun.on('create', function (root) {
        this.to.next(root);
        root.opt.store = root.opt.store || Store(root.opt);
        isInitialized = true;
      });
    } catch (e) {}
  };

  if (autoInit && !isInitialized) {
    init();
  }

  return {
    init: init
  };
};

export { makeStoreAdapter };
//# sourceMappingURL=gundb-expo-sqlite-adapter.module.js.map
