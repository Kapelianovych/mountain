import { isNothing } from '@fluss/core';
import { json, text, urlencoded, formData } from './plugins/body/body';
import {
  connect,
  constants,
  ClientHttp2Stream,
  ClientHttp2Session,
  SecureClientSessionOptions,
} from 'http2';
import type {
  RequestOptions,
  FormDataDecoded,
  ClientHttp2Response,
  ClientHttp2SessionEventMap,
} from './types';

let client: ClientHttp2Session;

/** Opens connection with remote peer. */
export function open(
  autority: string | URL,
  options?: SecureClientSessionOptions
): void {
  client = connect(autority, options);
}

/**
 * Makes a request to remote peer on opened connection.
 * By default it performs **GET** request to _path_ URL.
 */
export async function request<T = any>(
  path: string,
  options: RequestOptions<T> = {}
): Promise<ClientHttp2Response> {
  return new Promise<ClientHttp2Response>((resolve, reject) => {
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

/** Closes connection with remote peer. */
export function close(callback?: VoidFunction): void {
  client.close(callback);
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
  /**
   * If client is undefined, it is the same as
   * connection is closed.
   */
  return isNothing(client) || client.closed;
}
