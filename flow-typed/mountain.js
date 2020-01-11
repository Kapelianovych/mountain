// @flow

declare module 'mountain' {
  import type { Http2Headers, SecureServerOptions } from 'http2'

  declare export type SendOptions = {
    type: 'data' | 'file' | 'headers',
    data?: string | number[] | { [key: string]: any },
    headers?: Http2Headers,
  }

  declare export type Http2Error = {
    status: number,
    reason?: string,
    error?: Error,
  }

  declare type Http2SecureServerEventType =
    | 'checkContinue'
    | 'request'
    | 'session'
    | 'sessionError'
    | 'stream'
    | 'timeout'
    | 'unknownProtocol'

  declare type Http2Request = {
    stream: ServerHttp2Stream,
    headers: Http2Headers,
    flags: number,
    rawHeaders: string[],
  }

  declare type Http2Response = {
    send: (options: SendOptions) => void,
    sendError: (error: Http2Error) => void,
  }

  declare type ServerOptions = {
    rootDir: string | URL,
    timeout?: number,
  }

  declare type RouteOptions = {
    path: string | RegExp,
    method: string,
    notFound?: boolean,
    handle: (request: Http2Request, response: Http2Response) => void,
  }

  declare export class Route {
    constructor(options: RouteOptions): Route;

    get path(): string;
    get method(): string;
    get isForNotFound(): boolean;

    handle(request: Http2Request, response: Http2Response): void;
  }

  declare export class Handler {
    constructor(routes: Route[]): Handler;

    set(): (request: Http2Request, response: Http2Response) => void;
  }

  declare export class Server {
    constructor(certs: SecureServerOptions, options: ServerOptions): Server;

    onRequest(
      fn: (request: Http2Request, response: Http2Response) => void
    ): void;
    onSessionCreated(listener: (session: ServerHttp2Session) => void): void;
    onTimeout(listener: () => void): void;
    onUnknownProtocol(listener: (socket: Socket) => void): void;
    onError(listener: (error: Error) => void): void;
    setTimeout(milliseconds?: number, callback?: () => void): void;
    listen(port: number, host: ?string, listener?: () => void): void;
    close(callback?: () => void): void;
  }
}
