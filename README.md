[![npm](https://img.shields.io/npm/v/@flitz/body.svg)](https://www.npmjs.com/package/@flitz/body) [![supported flitz version](https://img.shields.io/static/v1?label=flitz&message=0.14.0%2B&color=blue)](https://github.com/flitz-js/flitz) [![last build](https://img.shields.io/github/workflow/status/flitz-js/body/Publish)](https://github.com/flitz-js/body/actions?query=workflow%3APublish) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/flitz-js/body/pulls)

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

  //             👇👇👇
  app.post('/', [ body() ], async (req, res) => {
    res.write('Your body as string from buffer: ' + req.body.toString());
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

  //             👇👇👇
  app.post('/', [ body() ], async (req, res) => {
    res.write('Your body as string from buffer: ' + req.body.toString());
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

  //             👇👇👇
  app.post('/', [ json() ], async (req, res) => {
    res.write('Your body as JSON object: ' + JSON.stringify(req.body, null, 2));
    res.end();
  });

  await app.listen(3000);
};

run();
```

### Form

```typescript
import flitz from 'flitz';
import { form } from '@flitz/body';

const run = async () => {
  const app = flitz();

  //             👇👇👇
  app.post('/', [ form() ], async (req, res) => {
    res.write('Your body as key / value pair object: ' + JSON.stringify(req.body, null, 2));
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

  //              👇👇👇
  app.post('/', [ string() ], async (req, res) => {
    res.write('Your body as UTF-8 string: ' + req.body);
    res.end();
  });

  await app.listen(3000);
};

run();
```

## Maximum size

```typescript
//                    👇👇👇 (128 MB)
app.post('/', [ body({ max: 128 * 1024 * 1024 }) ], async (req, res) => {
  // your code here
});
```

## TypeScript

TypeScript is optionally supported. The module contains its own [definition files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

## License

MIT © [Marcel Kloubert](https://github.com/mkloubert)
