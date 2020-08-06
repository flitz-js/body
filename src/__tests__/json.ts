import request from 'supertest';
import { json, ParseErrorHandler } from '..';

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

it('should return 400 on invalid JSON', async () => {
  const app = global.createTestApp();

  app.post('/', json(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(400)
    .send('{ length: 999 ');
});

it('should return 406 by custom parse error handler on invalid JSON', async () => {
  const app = global.createTestApp();

  const onParseFailed: ParseErrorHandler = async (ctx) => {
    ctx.response.writeHead(406);
    ctx.response.end(JSON.stringify(
      ctx.error.innerError.name + ': ' + ctx.error.innerError.message
    ));
  };

  app.post('/', json({ onParseFailed }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(406)
    .send('{ length: 999 ');

  const message = JSON.parse(
    response.body.toString('utf8')
  );

  expect(typeof message).toBe('string');
  expect(message).toBe('SyntaxError: Unexpected token l in JSON at position 2');
});
