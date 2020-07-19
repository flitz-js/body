[![npm](https://img.shields.io/npm/v/@flitz/body.svg)](https://www.npmjs.com/package/@flitz/body)

# @flitz/body

A body parser and handler middleware for [flitz](https://github.com/flitz-js/flitz).

## Install

Run

```bash
npm install --save @flitz/body
```

from the folder, where your `package.json` is stored.

## Usage

```javascript
const flitz = require('flitz');
const body = require('@flitz/body');

const run = async () => {
  const app = flitz();

  app.post('/', { use: [ body() ] }, async (req, res) => {
    res.write('Your body as string: ' + req.body.toString('utf8'));
    res.end();
  });

  await app.listen(3000);
};

run();
```

Or the TypeScript way:

```typescript
import flitz from 'flitz';
import { body } from '@flitz/body';

const run = async () => {
  const app = flitz();

  app.post('/', { use: [ body() ] }, async (req, res) => {
    const body = req.body as Buffer;

    res.write('Your body as string: ' + body.toString('utf8'));
    res.end();
  });

  await app.listen(3000);
};

run();
```

### JSON

```typescript
import flitz from 'flitz';
import { json } from '@flitz/body';

const run = async () => {
  const app = flitz();

  app.post('/', { use: [ json() ] }, async (req, res) => {
    const body = req.body as any;

    res.write('Your body as JSON string: ' + JSON.stringify(req.body, null, 2));
    res.end();
  });

  await app.listen(3000);
};

run();
```

### String

```typescript
import flitz from 'flitz';
import { string } from '@flitz/body';

const run = async () => {
  const app = flitz();

  app.post('/', { use: [ string() ] }, async (req, res) => {
    const body = req.body as any;

    res.write('Your body as UTF-8 string: ' + req.body);
    res.end();
  });

  await app.listen(3000);
};

run();
```

## TypeScript

TypeScript is optionally supported. The module contains its own [definition files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

## License

MIT © [Marcel Kloubert](https://github.com/mkloubert)
