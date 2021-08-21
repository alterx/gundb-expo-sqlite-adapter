export type SQLiteOptions = {
  SQLite;
  databaseName: string;
  table: string;
  onError: Function;
  onReady: Function;
  onOpen: Function;
};

export interface GunOptions
  extends Partial<{
    file: string;
    web: any;
    s3: {
      key: any;
      secret: any;
      bucket: any;
    };
    sqlite: SQLiteOptions;
    peers: string[] | Record<string, {}>;
    radisk: boolean;
    localStorage: boolean;
    uuid(): string;
    [key: string]: any;
  }> {}

export const makeStoreAdapter = (Gun, autoInit = true) => {
  let isInitialized = false;
  const Store = (opt: GunOptions) => {
    let db;
    let isReady = false;

    const sqlOpt: SQLiteOptions = {
      databaseName: 'gun.db',
      table: 'radata',
      onError: () => {},
      onOpen: () => {},
      onReady: () => {},
      SQLite: null,
      ...opt.sqlite,
    };

    if (!sqlOpt.SQLite) {
      throw 'Please provide SQLite (expo-sqlite)';
    }

    // Acquire DB connection
    db = sqlOpt.SQLite.openDatabase(sqlOpt.databaseName);
    const tableName = sqlOpt.table;

    // Prepare the DB
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${tableName} (key PRIMARY KEY, val)`,
          []
        );
      },
      sqlOpt.onError,
      () => {
        sqlOpt.onReady.call(null);
        isReady = true;
      }
    );

    const store = {
      get: (key, done) => {
        if (!isReady) {
          setTimeout(() => store.get(key, done), 9);
          return;
        }

        db.transaction((tx) => {
          tx.executeSql(
            `SELECT * FROM ${tableName} WHERE key = ?`,
            [key],
            (tx, results) => {
              const item = results.rows.item(0);
              done(null, item?.val || '');
            },
            (tx, err) => done(err || 5)
          );
        });
      },

      put: (key, data, done) => {
        if (!isReady) {
          setTimeout(() => store.put(key, data, done), 1);
          return;
        }

        const inserts = [
          {
            sql: `INSERT OR REPLACE INTO ${tableName} (key, val) VALUES (?,?)`,
            vars: [key, data],
          },
        ];

        // Run transactions
        db.transaction(
          (tx) => inserts.forEach((row) => tx.executeSql(row.sql, row.vars)),
          (err) => done(err || 'put.tx.error'),
          () => done(null)
        );
      },
    };

    return store;
  };

  const init = () => {
    if (isInitialized) {
      throw 'Already sqlite adapter initialized.';
    }

    try {
      Gun.on('create', function (this: typeof Gun, root) {
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
    init,
  };
};
