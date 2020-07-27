import request from 'supertest';
import { json } from '..';

it('should parse request body to a JSON object', async () => {
  const app = global.createTestApp();

  app.post('/', json(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send({ length: 666 });

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 666');
});

it('should parse request body to a JSON object and return 200 if max = 15 and body = 14', async () => {
  const app = global.createTestApp();

  app.post('/', json({ max: 15 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send(JSON.stringify({ length: 777 }));

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 777');
});

it('should parse request body to a JSON object and return 200 if max = 15 and body = 15', async () => {
  const app = global.createTestApp();

  app.post('/', json({ max: 15 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send(JSON.stringify({ length: 7777 }));

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 7777');
});

it('should parse request body to a JSON object and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', json({ max: 13 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send(JSON.stringify({ length: 888 }));
});
