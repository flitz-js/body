import request from 'supertest';
import { ParseErrorHandler, yaml } from '..';

it('should parse YAML request body to a JSON object', async () => {
  const app = global.createTestApp();

  app.post('/', yaml(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send("length: 666\n");

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 666');
});

it('should parse YAML request body to a JSON object and return 200 if max = 13 and body = 12', async () => {
  const app = global.createTestApp();

  app.post('/', yaml({ max: 13 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send("length: 777\n");

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 777');
});

it('should parse YAML request body to a JSON object and return 200 if max = 13 and body = 13', async () => {
  const app = global.createTestApp();

  app.post('/', yaml({ max: 13 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  const response = await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(200)
    .send("length: 7777\n");

  expect(Buffer.isBuffer(response.body)).toBe(true);
  expect(response.body.toString('utf8')).toBe('typeöf: object 7777');
});

it('should parse YAML request body to a JSON object and return 413 if body is bigger than max', async () => {
  const app = global.createTestApp();

  app.post('/', yaml({ max: 11 }), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(413)
    .send("length: 888\n");
});

it('should return 400 on invalid YAML', async () => {
  const app = global.createTestApp();

  app.post('/', yaml(), async (req, res) => {
    //            👇 this is no typo 😉
    res.write('typeöf: ' + (typeof req.body) + ' ' + req.body.length);
    res.end();
  });

  await request(app)
    .post('/')
    .parse(global.parseBody)
    .expect(400)
    .send('"length.: ab"c ');
});

it('should return 406 by custom parse error handler on invalid YAML', async () => {
  const app = global.createTestApp();

  const onParseFailed: ParseErrorHandler = async (ctx) => {
    ctx.response.writeHead(406);
    ctx.response.end(JSON.stringify(
      ctx.error.innerError.name + ': ' + ctx.error.innerError.message
    ));
  };

  app.post('/', yaml({ onParseFailed }), async (req, res) => {
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
  expect(message).toBe('YAMLException: unexpected end of the stream within a flow collection at line 2, column 1:\n    \n    ^');
});
