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

const makeStoreAdapter = (Gun, autoInit = true) => {
  let isInitialized = false;

  const Store = opt => {
    let db;
    let isReady = false;

    const sqlOpt = _extends({
      databaseName: 'gun.db',
      table: 'radata',
      onError: () => {},
      onOpen: () => {},
      onReady: () => {},
      SQLite: null
    }, opt.sqlite);

    if (!sqlOpt.SQLite) {
      throw 'Please provide SQLite (expo-sqlite)';
    } // Acquire DB connection


    db = sqlOpt.SQLite.openDatabase(sqlOpt.databaseName);
    const tableName = sqlOpt.table; // Prepare the DB

    db.transaction(tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (key PRIMARY KEY, val)`, []);
    }, sqlOpt.onError, () => {
      sqlOpt.onReady.call(null);
      isReady = true;
    });
    const store = {
      get: (key, done) => {
        if (!isReady) {
          setTimeout(() => store.get(key, done), 9);
          return;
        }

        db.transaction(tx => {
          tx.executeSql(`SELECT * FROM ${tableName} WHERE key = ?`, [key], (tx, results) => {
            const item = results.rows.item(0);
            done(null, (item == null ? void 0 : item.val) || '');
          }, (tx, err) => done(err || 5));
        });
      },
      put: (key, data, done) => {
        if (!isReady) {
          setTimeout(() => store.put(key, data, done), 1);
          return;
        }

        const inserts = [{
          sql: `INSERT OR REPLACE INTO ${tableName} (key, val) VALUES (?,?)`,
          vars: [key, data]
        }]; // Run transactions

        db.transaction(tx => inserts.forEach(row => tx.executeSql(row.sql, row.vars)), err => done(err || 'put.tx.error'), () => done(null));
      }
    };
    return store;
  };

  const init = () => {
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
    init
  };
};

export { makeStoreAdapter };
//# sourceMappingURL=gundb-expo-sqlite-adapter.modern.js.map
