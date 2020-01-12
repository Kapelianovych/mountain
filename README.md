# Mountain - HTTP/2-ready server and client (in future)

This library is written and designed as set of ES modules.

**HTTP/2** was introduced in NodeJS **8.4.0**.

In order to use this library, you must install Node **13.4.0** and above. Or NodeJS from **10** up to **13.4.0** version and provide _--experimental-modules_ flag.

```javascript
import { Server } from 'mountain'
```

It is wrapper under _HTTP/2_ module of `NodeJS`.

**HTTP/2** (originally named HTTP/2.0) is a major revision of the HTTP network protocol used by the World Wide Web. It was derived from the earlier experimental SPDY protocol, originally developed by Google. _HTTP/2_ was developed by the Hypertext Transfer Protocol working group _httpbis_ (where bis means "second") of the Internet Engineering Task Force. The _HTTP/2_ specification was published as RFC 7540 in May 2015.

The standardization effort was supported by Chrome, Opera, Firefox, Internet Explorer 11, Safari, Amazon Silk, and Edge browsers. Most major browsers had added _HTTP/2_ support by the end of 2015. And NodeJS did.

## API

### Server

As browsers support only encrypted _HTTP/2_ connection and this is desirable for all clients, so only secure server can be created. For this you must provide key and certificate.

```javascript
import { Server } from 'mountain'

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

It is licensed under [MIT-style license](LICENSE).
