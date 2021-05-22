# Mountain ⛰️ - HTTP/2-ready server and client

This library is written and designed as set of ES modules.

## Intentions

Why not? 🙃

## Prerequisites

**HTTP/2** was introduced in NodeJS **8.5.0**.

In order to use this library, you should have Node version at least **12.17.0** and above.

## Get started

It is wrapper under _HTTP/2_ module of `NodeJS`.

**HTTP/2** (originally named HTTP/2.0) is a major revision of the HTTP network protocol used by the World Wide Web. It was derived from the earlier experimental SPDY protocol, originally developed by Google. _HTTP/2_ was developed by the Hypertext Transfer Protocol working group _httpbis_ (where bis means "second") of the Internet Engineering Task Force. The _HTTP/2_ specification was published as RFC 7540 in May 2015.

The standardization effort was supported by Chrome, Opera, Firefox, Internet Explorer 11, Safari, Amazon Silk, and Edge browsers. Most major browsers had added _HTTP/2_ support by the end of 2015. And NodeJS did.

## API

### Server

As browsers support only encrypted _HTTP/2_ connection and this is desirable for all clients, so only secure server can be created. For this you must provide key and certificate.

```js
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
  handle: RequestHandler;
}
```

where `RequestHandler` is a function 👇

```ts
type RequestHandler = (request: Request) => void;
```

Where `Request` is an object with a few properties:

```ts
interface Context {
  readonly flags: number;
  readonly stream: Http2Stream;
  readonly headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
}

interface Request extends Context {
  readonly stream: ServerHttp2Stream;
  /** Holds values of capturing groups of path. */
  readonly parameters: ReadonlyArray<string>;
}
```

To create a route use a `route` function.

```js
import { constants } from 'http2';

import { route } from '@prostory/mountain';

const mainRoute = route(constants.HTTP2_METHOD_GET, '/', (request) => {
  /* ... */
});
```

There is a bunch of predefined route functions for most popular methods: `get`, `put`, `post`, `head`, `del`(_delete_) and `options`.

```js
const updateRoute = put('/put', (request) => {
  /* ... */
});
```

> _path_ parameter is converted to `RegExp` to match against path of incoming requests, so for declaring variable parts of URL use valid `RegExp` syntax.

```js
get('/article/\\d+', (request) => {
  /* ... */
});
```

And if you want to receive some values from path, then declare capturing groups and its value will be in _parameters_ property of `Request` object.

```js
get('/article/(\\d+)', (request) => {
  // accessRequest is a helper that simplify getting headers and body from
  // request through its methods.
  const [id] = accessRequest(request).parameters; // or just request.parameters
  /* ... */
});
```

`accessRequest` function returns `RequestAccessor`:

```ts
interface Accessor {
  body: GetBodyFunction;
  header: GetHeaderFunction;
}

interface RequestAccessor extends Accessor {
  readonly url: URL;
  readonly method: string;
  readonly parameters: ReadonlyArray<string>;
}
```

To start listening to incoming requests call `listen` function.

```js
// By default it will start server on localhost:3333
serverInstance.listen();
```

If you have many routes with same prefix, you can use `group` function to gather such routes.

```js
import { group } from '@prostory/mountain';

const testGroup = group('/test');

// It will attach prefix `/test` to each route.
const routes = testGroup(
  route1,
  route2,
  route3
  // and so on
);
```

There is a predefined route creator for handling static assets - `files` function. It takes name of the directory relative to current working directory into which server should search for files.

```js
// Now all requests to static assets will be catched and handled.
serverInstance.use(files());
```

To respond to incoming request use `responseFor` function:

```ts
function responseFor(request: Request): ResponseBuilder;
```

It creates `ResponseBuilder` that allows you simply creating a response.

```ts
interface ResponseBuilder {
  /** Sends response to client. */
  end: () => void;
  /** Define chunks of body to be sent to client. */
  body: (chunk: string) => ResponseBuilder;
  /** Sends JSON to client. */
  json: (payload: object) => void;
  /**
   * Sends file to client. _path_ should be an
   * absolute path to file.
   */
  file: (path: string) => void;
  /** Define a header for response. */
  header: (name: string, value: string) => ResponseBuilder;
}
```

To send response to client you should always call `end` method at the end. Otherwise, client will not receive any response. `json` and `file` automatically close response.

```js
import { constants } from 'http2';

// ...

responseFor(request)
  // By default, status is **200**, if you do not provide any.
  .header(constants.HTTP2_HEADER_STATUS, String(200))
  // Body will be sent to client as stream of chunks,
  // so you can divide you data as much as you want.
  .body('Hello')
  .body('world!')
  .end();
```

#### Cookies

For easier creating of cookies there is a `cookies` object. It has two methods: `parse` and `create`:

```ts
function parse(data: string): Cookies;

// Can create only one key/value pair per one method application.
function create(key: string, value: string, attributes: Cookies = {}): string;
```

`Cookies` is an object with a key/value pairs and [cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).

To add multiple cookies to response just call `header` method many times with new created cookie.

```ts
responseFor(request)
  .header('set-cookie', create(pid, 'asldkfjlsjdflaskjdflkajfd'))
  .header('set-cookie', create(name, 'Ben'))
  .end();
```

### Client

`client` function is use to create `Client`:

```ts
function client(
  authority: string | URL,
  options?: SecureClientSessionOptions
): Client;
```

Where `Client` is:

```ts
interface Client {
  readonly closed: boolean;

  body: (chunk: string) => Client;
  header: (name: string, value: string) => Client;

  /** Removes headers and body from previous request. */
  fresh: () => Client;
  /**
   * Makes a request to remote peer on opened connection.
   * By default it performs **GET** request to _path_ URL.
   */
  request: (
    path: string,
    options?: ClientSessionRequestOptions
  ) => Promise<Response>;
  /** Closes connection with remote peer. */
  close: (callback?: VoidFunction) => void;
  on: <T extends keyof ClientHttp2SessionEventMap>(
    event: T,
    listener: ClientHttp2SessionEventMap[T]
  ) => Client;
}
```

Client establishes connection with remote peer (usually server). The same client can make multiple requests to remote peer. In order to do that after every request you should re`fresh` client.

```ts
import { constants } from 'http2';
import { client } from '@prostory/mountain';

const articleClient = client('...');

const result1: Promise<Response> = articleClient
  .header(constants.HTTP2_HEADER_METHOD, constants.HTTP2_METHOD_GET)
  .request('/article/1');

const result2: Promise<Response> = articleClient
  .fresh()
  .header(constants.HTTP2_HEADER_METHOD, constants.HTTP2_METHOD_PUT)
  .body('some text')
  .request('/put/article');
```

Client receives response from remote peer as an object:

```ts
interface Response extends Context {
  readonly stream: ClientHttp2Stream;
}
```

The same as `accessRequest` there is `accessResponse` function that helps to get information from response.

```ts
interface Accessor {
  body: GetBodyFunction;
  header: GetHeaderFunction;
}

interface ResponseAccessor extends Accessor {}

function accessResponse(context: Response): ResponseAccessor;
```

> Do not forget to close client at the end of work.

## Word from author

Have fun ✌️
