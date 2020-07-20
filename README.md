[![npm](https://img.shields.io/npm/v/@flitz/body.svg)](https://www.npmjs.com/package/@flitz/body) [![supported flitz version](https://img.shields.io/static/v1?label=flitz&message=0.8.0%2B&color=blue)](https://github.com/flitz-js/flitz) [![last build](https://img.shields.io/github/workflow/status/flitz-js/body/Publish)](https://github.com/flitz-js/body/actions?query=workflow%3APublish)

# @flitz/body

> A body parser and handler middleware for [flitz](https://github.com/flitz-js/flitz).

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
    res.write('Your body as string: ' + (body as Buffer).toString('utf8'));
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

    res.write('Your body as JSON string: ' + JSON.stringify(body, null, 2));
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
    const body = req.body as string;

    res.write('Your body as UTF-8 string: ' + body);
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
