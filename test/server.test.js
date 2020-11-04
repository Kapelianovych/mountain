import { readFileSync } from 'fs';
import { constants } from 'http2';
import { server, cookies, router, respond, files } from '../build/index.js';

server.init({
  key: readFileSync('certs/localhost.key'),
  cert: readFileSync('certs/localhost.crt'),
});

server.use(files('test'));

router.create({
  prefix: '/api',
})
  .get('/', (stream) => {
    stream.respond({
      'Content-Type': 'text/html',
      'Set-Cookie': cookies.create('id', '5'),
    });
    stream.write('<script>console.log(document.cookie)</script>', 'utf8');
    stream.end()
  })
  .get('/ho', (stream) => {
    stream.end(stream.readable + '');
  })
  .post('/post', (stream) => {
    body(stream).json().then(console.log);
    stream.end();
  })
  .merge(
    router.create({ prefix: '/v' }).get('/', (stream) => {
      stream.end('from v');
    }).routes
  )
  .forEach(server.use);

server.listen(4000);

// client.open('https://google.com');

// client.request().then(data => console.log(data.headers))

// console.log('hello')

// client.request().then(data => console.log(data.headers))
