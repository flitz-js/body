import request from 'supertest';
import { EntityTooLargeError, readStream } from '..';

it('should read request as Buffer', async () => {
  const app = global.createTestApp();

  app.post('/', async (req, res) => {
    const body = await readStream(req);

    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(body) + ' ' + body.length);
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

it('should read request as Buffer and return 200 if max = 10 and body = 9', async () => {
  const app = global.createTestApp();

  app.post('/', async (req, res) => {
    const body = await readStream(req, { max: 10 });

    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(body) + ' ' + body.length);
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

it('should read request as Buffer and return 200 if max = 10 and body = 10', async () => {
  const app = global.createTestApp();

  app.post('/', async (req, res) => {
    const body = await readStream(req, { max: 10 });

    //            👇 this is no typo 😉
    res.write('is büffer: ' + Buffer.isBuffer(body) + ' ' + body.length);
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

it('should read request as Buffer and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', async (req, res) => {
    try {
      const body = await readStream(req, { max: 9 });

      //            👇 this is no typo 😉
      res.write('is büffer: ' + Buffer.isBuffer(body) + ' ' + body.length);
    } catch (e) {
      if (e instanceof EntityTooLargeError) {
        res.writeHead(413);
      } else {
        res.writeHead(500);
      }
    }

    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send('0123456789');
});
