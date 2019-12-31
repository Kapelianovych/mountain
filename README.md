# Yass - HTTP/2-ready server

This library is written and designed as set of ES modules.

In order to use this library, you must install Node **13.4.0** and above. Or NodeJS from **10** up to **13.4.0** version and provide _--experimental-modules_ flag.

```javascript
import Yass from 'yass'
```

It is wrapper under _HTTP/2_ module of `NodeJS`.

**HTTP/2** (originally named HTTP/2.0) is a major revision of the HTTP network protocol used by the World Wide Web. It was derived from the earlier experimental SPDY protocol, originally developed by Google. _HTTP/2_ was developed by the Hypertext Transfer Protocol working group _httpbis_ (where bis means "second") of the Internet Engineering Task Force. The _HTTP/2_ specification was published as RFC 7540 in May 2015.

The standardization effort was supported by Chrome, Opera, Firefox, Internet Explorer 11, Safari, Amazon Silk, and Edge browsers. Most major browsers had added _HTTP/2_ support by the end of 2015. And NodeJS did.

## API

As browsers support only encrypted _HTTP/2_ connection and this is desirable for all clients, so only secure server can be created. For this you must provide key and certificate.

```javascript
import Yass from 'yass'

const server = new Yass(
  {
    key: 'path/to/key.pem',
    cert: 'path/to/cert.pem',
  },
  import.meta.url
) // Second parameter defines package root. In this example current directory is used as root folder.
```

Methods of the instance of _Yass_ class:

- `onStream` with four parameters: _stream_ - Duplex stream that opened when connection is established, _headers_ - compressed headers of each request, _flags_ and _rawHeaders_.

  ```javascript
  // onStream is the main method. All information comes from `stream` and writes to it.
  server.onStream((stream, headers, flags, rawHeaders) => {
    const path = headers[':path']
    // some other code here
  })
  ```

- `send` sends response to `stream` (parameter above). Takes 3 parameters:
  1. _stream_ by which response will be sent to client.
  2. _options_ - object that contains:
     _type_ field for clarifying what kind of data will be sent (may be **data**, **file** or **headers**).
     _data_ -

It is licensed under [MIT-style license](LICENSE).
