declare module '@prostory/mountain' {
  import type { Http2Headers, SecureServerOptions } from 'http2'

  declare type SendOptions = {
    type: 'data' | 'file' | 'headers',
    data?: string | number[] | { [key: string]: any },
    headers?: Http2Headers,
  }

  declare type Http2Error = {
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
    cert: Buffer,
    key: Buffer,
    timeout?: number,
    parallel?: boolean,
    threads?: number,
  }

  declare type Route = {
    path: string | RegExp,
    method: string,
    notFound?: boolean,
    handle: (request: Http2Request, response: Http2Response) => void,
  }

  declare type ClientOptions = {
    url: string,
    maxSessionMemory?: number,
    settings?: Http2Settings,
  }

  declare type RequestOptions = {
    onResponse?: (headers: Http2Headers) => void,
    onData?: (chunk: Buffer) => void,
    onEnd?: () => void,
    endStream?: boolean,
    exclusive?: boolean,
    parent?: number,
    weight?: number,
    waitForTrailers?: boolean,
  }

  declare export class Router {
    constructor(routes: Route[]): Router;

    set(): (request: Http2Request, response: Http2Response) => void;
  }

  declare export class Server {
    constructor(options: ServerOptions): Server;

    onRequest(
      fn: (request: Http2Request, response: Http2Response) => void
    ): void;
    onSessionCreated(listener: (session: ServerHttp2Session) => void): void;
    onTimeout(listener: () => void): void;
    onUnknownProtocol(listener: (socket: Socket) => void): void;
    onError(listener: (error: Error) => void): void;
    listen(port: number, host: ?string, listener?: () => void): void;
    close(callback?: () => void): void;
  }

  declare export class Client {
    constructor(options: ClientOptions): Client;

    onAltsvc(
      listener: (alt: string, origin: string, streamId: number) => void
    ): void;
    onOrigin(listener: (origins: string[]) => void): void;
    request(headers: Http2Headers, options: RequestOptions): void;
    close(callback?: () => void): void;
  }
}
