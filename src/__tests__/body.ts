import request from 'supertest';
import { body } from '..';

it('should parse request body to a Buffer', async () => {
  const app = global.createTestApp();

  app.post('/', body(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('0123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('is büffer: true 10');
});

it('should parse request body to a Buffer and return 200 if max = 10 and body = 9', async () => {
  const app = global.createTestApp();

  app.post('/', body({ max: 10 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('is büffer: true 9');
});

it('should parse request body to a Buffer and return 200 if max = 10 and body = 10', async () => {
  const app = global.createTestApp();

  app.post('/', body({ max: 10 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('0123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('is büffer: true 10');
});

it('should parse request body to a Buffer and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', body({ max: 9 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send('0123456789');
});
