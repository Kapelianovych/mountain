import { json, text, urlencoded, formData } from './plugins/body/body';
import {
  connect,
  constants,
  Http2Stream,
  Http2Session,
  ClientHttp2Stream,
  ClientHttp2Session,
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
  ClientSessionRequestOptions,
} from 'http2';
import type { Socket } from 'net';
import type { FormDataDecoded } from './plugins/body/form_data';

let client: ClientHttp2Session;

export function open(
  autority: string | URL,
  options?: SecureClientSessionOptions
): void {
  client = connect(autority, options);
}

interface Body {
  text(): Promise<string>;
  json<T extends object>(): Promise<T>;
  urlencoded<T extends Record<string, string>>(): Promise<T>;
  formData<T extends FormDataDecoded>(): Promise<T>;
}

interface Response {
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
  body: Body;
}

interface RequestOptions<T> {
  headers?: OutgoingHttpHeaders;
  payload?: T;
  options?: ClientSessionRequestOptions;
}

export async function request<T = any>(
  path: string,
  options: RequestOptions<T> = {}
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const stream: ClientHttp2Stream = client
      .request(
        {
          [constants.HTTP2_HEADER_PATH]: path,
          [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
          ...options.headers,
        },
        options.options
      )
      .on('response', (headers) =>
        resolve({
          headers,
          body: {
            text(): Promise<string> {
              return text(stream);
            },
            json<T extends object>(): Promise<T> {
              return json<T>(stream, headers);
            },
            urlencoded<T extends Record<string, string>>(): Promise<T> {
              return urlencoded<T>(stream, headers);
            },
            formData<T extends FormDataDecoded>(): Promise<T> {
              return formData<T>(stream, headers);
            },
          },
        })
      )
      .on('error', reject);

    stream.end(options.payload);
  });
}

export function close(callback?: VoidFunction): void {
  client.close(callback);
}

interface Http2SessionEventMap {
  close: VoidFunction;
  connect: (session: Http2Session, socket: Socket) => void;
  error: (error: Error) => void;
  frameError: (type: number, code: number, id: number) => void;
  goaway: (errorCode: number, lastStreamID: number, opaqueData: Buffer) => void;
  localSettings: (settings: SecureClientSessionOptions) => void;
  remoteSettings: (settings: SecureClientSessionOptions) => void;
  ping: (payload: Buffer) => void;
  stream: (
    stream: Http2Stream,
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
    flags: number,
    rawHeaders: ReadonlyArray<string>
  ) => void;
  timeout: VoidFunction;
}

interface ClientHttp2SessionEventMap extends Http2SessionEventMap {
  altsvc: (alt: string, origin: string, streamId: number) => void;
  origin: (origins: Array<string>) => void;
}

export function on<T extends keyof ClientHttp2SessionEventMap>(
  event: T,
  listener: ClientHttp2SessionEventMap[T]
): void {
  client.on(event, listener);
}

export function timeout(ms: number, callback?: VoidFunction): void {
  client.setTimeout(ms, callback);
}

export function isClosed(): boolean {
  return client.closed;
}
