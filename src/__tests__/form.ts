import request from 'supertest';
import { form } from '..';

it('should parse request body to a key/value pair object', async () => {
  const app = global.createTestApp();

  app.post('/', form(), async (req, res) => {
    res.write(`typeof: ${typeof req.body} b=${req.body.b}; a=${req.body.a}`);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('a=5979&b=%C3%84%C3%B6%C3%9C');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeof: object b=ÄöÜ; a=5979');
});

it('should parse request body to a key/value pair and return 200 if max = 13 and body = 12', async () => {
  const app = global.createTestApp();

  app.post('/', form({ max: 13 }), async (req, res) => {
    res.write(`typeof: ${typeof req.body} b=${req.body.b}; a=${req.body.a}`);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('a=5979&b=abc');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeof: object b=abc; a=5979');
});

it('should parse request body to a key/value pair and return 200 if max = 12 and body = 12', async () => {
  const app = global.createTestApp();

  app.post('/', form({ max: 12 }), async (req, res) => {
    res.write(`typeof: ${typeof req.body} b=${req.body.b}; a=${req.body.a}`);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('a=5979&b=abc');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeof: object b=abc; a=5979');
});

it('should parse request body to a key/value pair and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', form({ max: 13 }), async (req, res) => {
    res.write('typeof: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send('a=5979&b=abcde');
});
