import { body, Body } from './plugins/body';
import {
  connect,
  constants,
  ClientHttp2Session,
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
  ClientSessionRequestOptions,
} from 'http2';

let client: ClientHttp2Session;

export function open(
  autority: string | URL,
  options?: SecureClientSessionOptions
): void {
  client = connect(autority, options);
}

interface Response {
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
  body: Body;
}

interface RequestOptions {
  headers?: OutgoingHttpHeaders;
  payload?: any;
  options?: ClientSessionRequestOptions;
}

export function request(
  path: string,
  options: RequestOptions = {}
): Promise<Response> {
  const stream = client
    .request(
      {
        [constants.HTTP2_HEADER_PATH]: path,
        [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
        ...options.headers,
      },
      options.options
    )
    .setEncoding('utf8');

  const response = new Promise<IncomingHttpHeaders & IncomingHttpStatusHeader>(
    (resolve) => stream.on('response', (headers) => resolve(headers))
  ).then((headers) => {
    return {
      headers,
      body: body(stream),
    };
  });

  stream.end(options.payload);

  return response;
}

export function close(callback?: VoidFunction): void {
  client.close(callback);
}
