import {
  Http2SecureServer,
  createSecureServer,
  SecureServerOptions,
} from 'http2';
import type { Router } from './router';
import type { Http2ServerEventMap, Handler } from './types';

let serverInstance: Http2SecureServer;

const handlers: Array<Handler> = [];

/**
 * Initializes secure server.
 *
 * If _options.allowHttp1_: _true_ then also add listener
 * to `request` event.
 */
export function init(options: SecureServerOptions): void {
  serverInstance = createSecureServer(options);
}

/** Registers handlers for incoming requests. */
export function use(handler: Handler | Router): void {
  typeof handler === 'function'
    ? handlers.push(handler)
    : handler.handlers.forEach((fn) => handlers.push(fn));
}

/** Starts server. */
export function listen(
  port: number = 3333,
  host: string = 'localhost',
  listeningListener: VoidFunction = () => {
    console.log(`Server started at ${host}:${port}`);
  }
): void {
  serverInstance
    .on('stream', (stream, headers, flags) => {
      // We can call multiple handlers per one request
      // to make unrelated jobs, but only one handler
      // must send reponse to client.
      handlers.forEach((fn) => fn(stream, headers, flags));
    })
    .listen(port, host, listeningListener);
}

/** Closes server. */
export function close(callback?: (error?: Error) => void): void {
  serverInstance.close(callback);
}

/** Add listeners to server's events. */
export function on<T extends keyof Http2ServerEventMap>(
  event: T,
  listener: Http2ServerEventMap[T]
): void {
  serverInstance.on(event, listener);
}

/** Sets timeout for response. */
export function timeout(ms: number, callback?: VoidFunction): void {
  serverInstance.setTimeout(ms, callback);
}
