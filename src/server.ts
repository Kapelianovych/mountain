import {
  ServerHttp2Stream,
  Http2SecureServer,
  createSecureServer,
  ServerHttp2Session,
  Http2ServerRequest,
  SecureServerOptions,
  IncomingHttpHeaders,
  Http2ServerResponse,
  IncomingHttpStatusHeader,
} from 'http2';
import type { Router } from './router';
import type { TLSSocket } from 'tls';

let serverInstance: Http2SecureServer;

const middlewares: Array<Middleware> = [];

export function init(options: SecureServerOptions): void {
  serverInstance = createSecureServer(options);
}

export type Middleware = (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  flags: number
) => void;

export function use(handler: Middleware | Router): void {
  typeof handler === 'function'
    ? middlewares.push(handler)
    : handler.middlewares.forEach((middleware) => middlewares.push(middleware));
}

export function listen(
  port: number = 3333,
  host: string = 'localhost',
  listeningListener: VoidFunction = () => {
    console.log(`Server started at ${host}:${port}`);
  }
): void {
  serverInstance
    .on('stream', (stream, headers, flags) => {
      middlewares.forEach((fn) => fn(stream, headers, flags));
    })
    .listen(port, host, listeningListener);
}

export function close(callback?: (error?: Error) => void): void {
  serverInstance.close(callback);
}

interface Http2ServerEventMap {
  sessionError: (error: Error) => void;
  stream: Middleware;
  timeout: VoidFunction;
  checkContinue: (
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ) => void;
  request: (request: Http2ServerRequest, response: Http2ServerResponse) => void;
  session: (session: ServerHttp2Session) => void;
  unknownProtocol: (socket: TLSSocket) => void;
}

export function on<T extends keyof Http2ServerEventMap>(
  event: T,
  listener: Http2ServerEventMap[T]
): void {
  serverInstance.on(event, listener);
}

export function timeout(ms: number, callback?: VoidFunction): void {
  serverInstance.setTimeout(ms, callback);
}
