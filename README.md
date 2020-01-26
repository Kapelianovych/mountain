# Mountain - HTTP/2-ready server and client (in future)

This library is written and designed as set of ES modules.

**HTTP/2** was introduced in NodeJS **8.4.0**.

In order to use this library, you must install Node **13.4.0** and above. Or NodeJS from **10** up to **13.4.0** version and provide _--experimental-modules_ flag.

```javascript
import { Server } from '@prostory/mountain'
```

It is wrapper under _HTTP/2_ module of `NodeJS`.

**HTTP/2** (originally named HTTP/2.0) is a major revision of the HTTP network protocol used by the World Wide Web. It was derived from the earlier experimental SPDY protocol, originally developed by Google. _HTTP/2_ was developed by the Hypertext Transfer Protocol working group _httpbis_ (where bis means "second") of the Internet Engineering Task Force. The _HTTP/2_ specification was published as RFC 7540 in May 2015.

The standardization effort was supported by Chrome, Opera, Firefox, Internet Explorer 11, Safari, Amazon Silk, and Edge browsers. Most major browsers had added _HTTP/2_ support by the end of 2015. And NodeJS did.

## API

### Server

As browsers support only encrypted _HTTP/2_ connection and this is desirable for all clients, so only secure server can be created. For this you must provide key and certificate.

```javascript
import { Server } from '@prostory/mountain'

const server = new Server(
  {
    key: 'path/to/key.pem',
    cert: 'path/to/cert.pem',
  },
  {
    rootDir: import.meta.url, // This parameter defines package root. In this example current directory in which this file is located is used as root folder.
    timeout: 1000 // optional: defines timeout that server will before ending connection.
  }
)
```

Methods of the instance of _Server_ class:

- `onRequest`:

  ```javascript
  // onRequest is the main method.
  server.onRequest((request: Http2Request, response: Http2Response) => {
    const path = request.headers[':path']
    // some other code here
  })
  ```

  > Type **Http2Request** contains `headers` object, `stream`, `flags` and `rawHeaders`.

  Usually you will not need `stream`, `flags` and `rawHeaders` properties.

  > Type **Http2Response** contains `send` and `sendError` methods.

  - `sendError` sends error object to the client:

    ```javascript
    server.onRequest((request: Http2Request, response: Http2Response) => {
        const { sendError } = response

        sendError({
          status: 500,
          reason: 'Some meaningful reason', // optional
          error: Error // optional: raw Error object.
        })
      })
    ```

  - `send` send data (*file*, *binary* data or *headers*) to client:
    Method accept object that must have **type** property that may have one of three
    values - `'data' | 'file' | 'headers'`.

    If **type** is `headers`, then you must provide second property *headers*:

    ```javascript
    server.onRequest((request: Http2Request, response: Http2Response) => {
        const { send } = response

        send({
          type: 'headers',
          headers: {
            ':status': 200
          }
        })
      })
    ```

    If **type** is `data`, then you must provide second property *data*:

    ```javascript
    server.onRequest((request: Http2Request, response: Http2Response) => {
        const { send } = response

        send({
          type: 'data',
          data: /* array of octets, object or string */
          }
        })
      })
    ```

    If **type** is `file`, then you must provide second property *data*, that contains path to file or dir.
    If *data* contains path to dir, then all files of this directory will be sent to client:

    ```javascript
    server.onRequest((request: Http2Request, response: Http2Response) => {
        const { send } = response

        send({
          type: 'file',
          data: '/static'
        })
      })
    ```

- `onSessionCreated`:

  Listens to new sessions establishes.

  ```javascript
    server.onSessionCreated((session: ServerHttp2Session) => {
      // Do some useful work
    })
  ```

- `onTimeout`:

  Listens on *timeout* event if there is no activity on the **Http2Session** after the configured number of milliseconds.

  ```javascript
    server.onTimeout(() => {
      // Do some useful work
    })
  ```

- `onUnknownProtocol`:

  Listens on *unknownProtocol* event that is emitted when a connecting client fails to negotiate an allowed 
  protocol (i.e. HTTP/2 or HTTP/1.1).

  ```javascript
    server.onUnknownProtocol((socket: Socket) => {
      // Do some useful work
    })
  ```

- `onError`:

  Listens on errors that has been arisen in current session.

  ```javascript
    server.onError((error: Error) => {
      // Do some useful work
    })
  ```

- `setTimeout`:

  Used to set the timeout value for http2 secure server requests, and sets a
  callback function that is called when there is no activity on the server
  after `milliseconds`.

  ```javascript
    server.setTimeout(
      milliseconds?: number = 120000,
      callback?: () => void
    )
  ```

- `listen`:

  Start listening for requests.

  ```javascript
    server.listen(
      port: number, host: ?string = 'localhost', listener?: () => void
    )
  ```

- `close`:

   Stops the server from establishing new sessions. This does not prevent new
   request streams from being created due to the persistent nature of HTTP/2
   sessions.
  
   If `callback` is provided, it is not invoked until all active sessions have
   been closed, although the server has already stopped allowing new
   sessions. See [tls.Server.close()](https://nodejs.org/dist/latest-v12.x/docs/api/tls.html#tls_server_close_callback) for more details.

  ```javascript
    server.close(callback?: () => void)
  ```

### Route

You can handle all requests in one function that passed to `onRequest` method or split it by **:path**
and **:method**.

In order to create handler for specific path and method, create instance of `Route` class with
needed properties:

```javascript
const route = new Route({
  path: string | RegExp,
  method: string,
  notFound?: boolean,
  handle: (request: Http2Request, response: Http2Response) => void,
})
```

*notFound* must be provided only in **one!** route. It will be used if request can't be handled by the server.
If route with this property is absent, 404 error will be sent to client.

*handle* method contains code that handle specific request and returns response.

### Handler

If you will have many `Route`s, then it may need to be into one representation.
This is why `Handler` come. Instance of this class will contains routes and when request is received, it will
search for proper `Route` instance and executes `Route`s `handler` method.

```javascript
const route = new Route({
  path: '/',
  method: 'get',
  handle(request, response) {},
})

const route2 = new Route({
  path: '/about',
  method: 'get',
  handle(request, response) {},
})

server.onRequest(
  new Handler([
    route,
    route2
  ]).set()
)
```

It has `set` method that return function that need to be placed to `server.onRequest` method.

It is licensed under [MIT-style license](LICENSE).
