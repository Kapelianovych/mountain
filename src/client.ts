import {
  connect,
  constants,
  ClientHttp2Stream,
  ClientHttp2Session,
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
  ClientSessionRequestOptions,
} from 'http2';

import { Http2SessionEventMap } from './types';

export interface ClientHttp2SessionEventMap extends Http2SessionEventMap {
  altsvc: (alt: string, origin: string, streamId: number) => void;
  origin: (origins: Array<string>) => void;
}

export interface ClientHttp2Response {
  flags: number;
  stream: ClientHttp2Stream;
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
}

export interface Client {
  readonly closed: boolean;

  body: (chunk: string) => Client;
  header: (name: string, value: string) => Client;
  /**
   * Makes a request to remote peer on opened connection.
   * By default it performs **GET** request to _path_ URL.
   */
  request: (
    path: string,
    options?: ClientSessionRequestOptions
  ) => Promise<ClientHttp2Response>;
  /** Closes connection with remote peer. */
  close: (callback?: VoidFunction) => void;
  on: <T extends keyof ClientHttp2SessionEventMap>(
    event: T,
    listener: ClientHttp2SessionEventMap[T]
  ) => Client;
}

const createClient = (
  instance: ClientHttp2Session,
  headers: OutgoingHttpHeaders,
  payload: ReadonlyArray<string>
): Client => ({
  get closed(): boolean {
    return instance.closed;
  },

  on: (event, listener) =>
    createClient(instance.on(event, listener), headers, payload),

  header: (name, value) =>
    createClient(instance, { ...headers, [name]: value }, payload),

  body: (chunk) => createClient(instance, headers, payload.concat(chunk)),

  request: (path, options) =>
    new Promise<ClientHttp2Response>((resolve, reject) => {
      const stream: ClientHttp2Stream = instance
        .request(
          {
            [constants.HTTP2_HEADER_PATH]: path,
            [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
            ...headers,
          },
          options
        )
        .on('response', (headers, flags) =>
          resolve({
            flags,
            stream,
            headers,
          })
        )
        .on('error', reject);

      payload.forEach((chunk) => stream.write(chunk));
      stream.end();
    }),

  close: (callback) => instance.close(callback),
});

export const client = (
  autority: string | URL,
  options?: SecureClientSessionOptions
): Client => createClient(connect(autority, options), {}, []);
