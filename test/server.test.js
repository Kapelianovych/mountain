import { createWriteStream, open, readFileSync, writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { constants } from 'http2';
import { resolve } from 'path';
import {
  server,
  cookies,
  router,
  respond,
  files,
  body,
  client,
} from '../build/index.js';

server.init({
  key: readFileSync('certs/localhost.key'),
  cert: readFileSync('certs/localhost.crt'),
});

router
  .create()
  .get('/', (stream) => {
    respond.file(stream, resolve(process.cwd(), 'test', 'index.html'));
  })
  .post('/ho', async (stream, headers) => {
    const data = await body.urlencoded(stream, headers);
    console.log(data);

    //writeFileSync(resolve(process.cwd(), 'test', avatar.filename), avatar.data)

    respond.headers(stream, {
      [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
    });
  })
  .forEach(server.use);

server.listen(4000);

// client.open('https://google.com');
// client.request('/').then((response) => console.log(response.headers))
