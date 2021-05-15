import {
  constants,
  ServerHttp2Stream,
  Http2SecureServer,
  createSecureServer,
  IncomingHttpHeaders,
  SecureServerOptions,
} from 'http2';

import { Route } from './controllers';
import { request } from './plugins/request';
import { response } from './plugins/response';
import { Http2ServerEventMap } from './types';

export interface Server {
  /** Adds listeners to stream's events. */
  on: <T extends keyof Http2ServerEventMap>(
    event: T,
    listener: Http2ServerEventMap[T]
  ) => Server;
  /** Adds routes to server.  */
  use: (...routes: ReadonlyArray<Route>) => Server;
  /** Stops the server from establishing new sessions */
  close: (callback?: (error?: Error) => void) => Server;
  /** Starts the server listening to requests. */
  listen: (port?: number, host?: string, listerner?: VoidFunction) => Server;
}

const app = (
  routes: ReadonlyArray<Route>,
  serverInstance: Http2SecureServer
): Server => ({
  on: (event, listener) => app(routes, serverInstance.on(event, listener)),
  use: (...routes: ReadonlyArray<Route>) =>
    app(routes.concat(routes), serverInstance),
  listen: (
    port: number = 3333,
    host: string = 'localhost',
    listener?: VoidFunction
  ) =>
    app(
      routes,
      serverInstance
        .on(
          'stream',
          (
            stream: ServerHttp2Stream,
            headers: IncomingHttpHeaders,
            flags: number
          ) => {
            const requestPath = request(stream, headers).path;
            const incomingMethod = request(stream, headers).method;

            const handler = routes.find(
              ({ method, path }) =>
                method === incomingMethod && new RegExp(path).test(requestPath)
            );
            handler !== undefined
              ? handler.handle(stream, headers, flags)
              : response(stream)
                  .header(
                    constants.HTTP2_HEADER_STATUS,
                    String(constants.HTTP_STATUS_NOT_FOUND)
                  )
                  .end();
          }
        )
        .listen(port, host, listener)
    ),
  close: (callback?: (error?: Error) => void) =>
    app(routes, serverInstance.close(callback)),
});

/**
 * Initializes secure server.
 *
 * If _options.allowHttp1_: _true_ then also add listener
 * to `request` event.
 */
export const server = (options: SecureServerOptions): Server =>
  app([], createSecureServer(options));
