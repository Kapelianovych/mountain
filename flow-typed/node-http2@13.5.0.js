/* eslint-disable no-unused-vars */
// @flow

declare class Http2SecureServer {}

declare module 'http2' {
  declare export class ServerHttp2Stream {
    pushStream(
      headers: OutgoingHttpHeaders,
      onPushCreated: (
        error: Error,
        pushStream: ServerHttp2Stream,
        headers: OutgoingHttpHeaders
      ) => void
    ): void;

    respond(
      headers?: OutgoingHttpHeaders,
      options?: {
        endStream?: boolean,
      }
    ): void;

    respondWithFile(
      path: string,
      headers: OutgoingHttpHeaders,
      options?: {
        onError(error: Error): void,
      }
    ): void;

    additionalHeaders(headers: OutgoingHttpHeaders): void;

    end(payload?: any): void;

    close(): void;
  }

  declare export type SecureServerOptions = {
    key: Buffer,
    cert: Buffer,
  }

  declare export class ServerHttp2Session {}

  declare export type OutgoingHttpHeaders = {
    ':status'?: string,
    ':path'?: string,
    ':method'?: string,
    ':authority'?: string,
    ':scheme'?: string,
    ':protocol'?: string,
    age?: string,
    authorization?: string,
    'access-control-allow-credentials'?: string,
    'access-control-max-age'?: string,
    'access-control-request-method'?: string,
    'content-encoding'?: string,
    'content-language'?: string,
    'content-length'?: string,
    'content-location'?: string,
    'content-md5'?: string,
    'content-range'?: string,
    'content-type'?: string,
    date?: string,
    dnt?: string,
    etag?: string,
    'set-cookie'?: string[],
    expires?: string,
    from?: string,
    'if-match'?: string,
    'if-modified-since'?: string,
    'if-none-match'?: string,
    'if-range'?: string,
    'if-unmodified-since'?: string,
    'last-modified'?: string,
    location?: string,
    'max-forwards'?: string,
    'proxy-authorization'?: string,
    range?: string,
    referer?: string,
    'retry-after'?: string,
    tk?: string,
    'upgrade-insecure-requests'?: string,
    'user-agent'?: string,
    'x-content-type-options'?: string,
    [key: string]: string | string[],
  }

  declare export type IncomingHttpHeaders = {
    cookie: string,
    ':status': number,
    ':path': string,
    ':method': string,
    ':authority': string,
    ':scheme': string,
    ':protocol': string,
    age?: string,
    authorization?: string,
    'access-control-allow-credentials'?: string,
    'access-control-max-age'?: string,
    'access-control-request-method'?: string,
    'content-encoding': string,
    'content-language'?: string,
    'content-length': string,
    'content-location'?: string,
    'content-md5'?: string,
    'content-range'?: string,
    'content-type': string,
    date?: string,
    dnt?: string,
    etag?: string,
    'set-cookie'?: string[],
    expires?: string,
    from?: string,
    'if-match'?: string,
    'if-modified-since'?: string,
    'if-none-match'?: string,
    'if-range'?: string,
    'if-unmodified-since'?: string,
    'last-modified': string,
    location?: string,
    'max-forwards'?: string,
    'proxy-authorization'?: string,
    range?: string,
    referer?: string,
    'retry-after'?: string,
    tk?: string,
    'upgrade-insecure-requests'?: string,
    'user-agent': string,
    'x-content-type-options'?: string,
    [key: string]: string | string[],
  }

  declare export function createSecureServer(options, onRequestHandler): Http2SecureServer;
}
