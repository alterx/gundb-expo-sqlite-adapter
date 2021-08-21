# GunDB Expo SQLite Adapter

This is an adapter that implements the RAD interface and writes to SQLite (expo-sqlite)

## Installing

Use `pnpm`, `npm` or `yarn` to install the dependencies:

```
$ npm i @altrx/gundb-expo-sqlite-adapter
```

### Basic Usage:

```jsx harmony
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

import Gun from 'gun';
import SEA from 'gun/sea';
import 'gun/lib/promise';
import 'gun/lib/radix';
import 'gun/lib/radisk';
import 'gun/lib/store';
import { makeStoreAdapter } from '@altrx/gundb-expo-sqlite-adapter';

makeStoreAdapter(Gun);
const gun = new Gun({
  localStorage: false,
  radisk: true,
  sqlite: {
    SQLite,
    databaseName: 'todo.db',
    onOpen: () => {},
    onError: (err) => {
      console.log('ERROR');
    },
    onReady: (err) => {
      console.log('READY');
    },
  },
});

const node = gun.get('hello');

export default function App() {
  const [name, setName] = useState('');

  useEffect(() => {
    node.once((data, key) => {
      let name = data?.name;
      setName(name);
    });

    async function doWork() {
      const workTest = await SEA.work('test', null, null, {
        name: 'SHA-256',
        encode: 'hex',
      });
      console.log(workTest);
      const pair = await SEA.pair();
      const other = await SEA.pair();
      const msg = await SEA.sign('I wrote this message! You did not.', pair);
      const test = await SEA.verify(msg, pair.pub); // message gets printed
      const test2 = await SEA.verify(msg, other.pub); // error
      console.log('No message', test2);
      console.log('Message', test);

      gun.on('auth', () => {
        console.log('authenticated with keypair');
      });

      const namespace = gun.user();
      namespace.auth(pair);
    }
    doWork();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Hello {name}</Text>

      <View style={styles.flexRow}>
        <TextInput
          value={name}
          onChangeText={(value) => setName(value)}
          style={styles.input}
        />
      </View>
      <Button
        title="Update"
        onPress={() => {
          node.put({ name });
          setName(name);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  input: {
    borderColor: '#4630eb',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
});
```

## License

Licensed under [MIT](https://github.com/alterx/gundb-expo-sqlite-adapter/blob/master/LICENSE.md).
