import request from 'supertest';
import { string } from '..';

it('should parse request body to a String', async () => {
  const app = global.createTestApp();

  app.post('/', string(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('0123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: string 10');
});

it('should parse request body to a String and return 200 if max = 10 and body = 9', async () => {
  const app = global.createTestApp();

  app.post('/', string({ max: 10 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: string 9');
});

it('should parse request body to a String and return 200 if max = 10 and body = 10', async () => {
  const app = global.createTestApp();

  app.post('/', string({ max: 10 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send('0123456789');

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: string 10');
});

it('should parse request body to a String and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', string({ max: 9 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send('0123456789');
});
