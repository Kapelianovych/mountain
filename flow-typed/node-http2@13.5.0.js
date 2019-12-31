/* eslint-disable no-unused-vars */
// @flow

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
    cert: Buffer
  }

  declare export class ServerHttp2Session {}

  declare export type OutgoingHttpHeaders = {
    [key: string]: any,
  }

  declare export type IncomingHttpHeaders = {
    [key: string]: any,
  }
}
