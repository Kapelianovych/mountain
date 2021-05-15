# Mountain ⛰️ - HTTP/2-ready server and client

This library is written and designed as set of ES modules.

## Intentions

Why not? 🙃

## Prerequisites

**HTTP/2** was introduced in NodeJS **8.5.0**.

In order to use this library, you should Node at least **12.17.0** and above.

## Get started

It is wrapper under _HTTP/2_ module of `NodeJS`.

**HTTP/2** (originally named HTTP/2.0) is a major revision of the HTTP network protocol used by the World Wide Web. It was derived from the earlier experimental SPDY protocol, originally developed by Google. _HTTP/2_ was developed by the Hypertext Transfer Protocol working group _httpbis_ (where bis means "second") of the Internet Engineering Task Force. The _HTTP/2_ specification was published as RFC 7540 in May 2015.

The standardization effort was supported by Chrome, Opera, Firefox, Internet Explorer 11, Safari, Amazon Silk, and Edge browsers. Most major browsers had added _HTTP/2_ support by the end of 2015. And NodeJS did.

## API

### Server

As browsers support only encrypted _HTTP/2_ connection and this is desirable for all clients, so only secure server can be created. For this you must provide key and certificate.

```javascript
import { readFileSync } from 'fs';

import { server } from '@prostory/mountain';

const serverInstance = server({
  key: readFileSync('path/to/key.pem'),
  cert: readFileSync('path/to/cert.pem'),
});
```

Server instance has such public interface:

```ts
interface Server {
  /** Adds listeners to stream's events. */
  on: <T extends keyof Http2ServerEventMap>(
    event: T,
    listener: Http2ServerEventMap[T]
  ) => Server;
  /** Adds routes to server.  */
  use: (...routes: ReadonlyArray<Route>) => Server;
  /** Stops the server from establishing new sessions */
  close: (callback?: (error?: Error) => void) => Server;
  /** Starts the server listening to requests. */
  listen: (port?: number, host?: string, listerner?: VoidFunction) => Server;
}
```

To let server instance handle requests you should provide routes with `use` method.

```js
serverInstance.use(
  route1,
  route2,
  route3
  // and so on`
);
```

`Route` has such interface:

```ts
interface Route {
  readonly path: string;
  readonly method: string;
  handle: Handler;
}
```

To create a route use a `route` function.

```js
import { constants } from 'http2';

import { route } from '@prostory/mountain';

const mainRoute = route(
  constants.HTTP2_METHOD_GET,
  '/',
  (stream, headers, flags) => {
    /* ... */
  }
);
```

There is a bunch of predefined route functions for most popular methods: `get`, `put`, `post`, `head`, `del`(_delete_) and `options`.

```js
const updateRoute = put('/put', (stream, headers, flags) => {
  /* ... */
});
```

> _path_ parameter is converted to `RegExp` to match against path of incoming requests, so for declaring variable parts of URL use valid `RegExp` syntax.

To start listening to requests call `listen` function.

```js
// By default it will start server on localhost:3333
serverInstance.listen();
```

If you have many routes with same prefix, you can use `controller` function to group such routes.

```js
import { controller } from '@prostory/mountain';

const testController = controller('/test');

// It will attach prefix `/test` to each route.
const routes = testController(
  route1,
  route2,
  route3
  // and so on
);
```

There is a predefined route creator for handling static assets - `files` function. It takes name of the directory relative to current working directory into which server should search for files.

```js
serverInstance.use(files());
```

### Response

### Request

### Client

### Cookies

It is licensed under [MIT-style license](LICENSE).

With ❤️ to Mountain
