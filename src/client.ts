import { json, text, urlencoded, formData } from './plugins/body/body';
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
