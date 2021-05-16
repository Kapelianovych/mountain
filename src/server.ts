import {
  constants,
  ServerHttp2Stream,
  Http2SecureServer,
  createSecureServer,
  IncomingHttpHeaders,
  SecureServerOptions,
  IncomingHttpStatusHeader,
} from 'http2';

import { Route } from './route';
import { responseFor } from './plugins/response';
import { accessRequest } from './plugins/access';
import { Http2ServerEventMap, Request } from './types';

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

const createRequest = (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  flags: number,
  parameters: ReadonlyArray<string>
): Request => ({ flags, stream, headers, parameters });

const app = (
  internalRoutes: ReadonlyArray<
    Pick<Route, 'method' | 'handle'> & { path: RegExp }
  >,
  serverInstance: Http2SecureServer
): Server => ({
  on: (event, listener) =>
    app(internalRoutes, serverInstance.on(event, listener)),
  use: (...routes: ReadonlyArray<Route>) =>
    app(
      internalRoutes.concat(
        routes.map(({ path, method, handle }) => ({
          path: new RegExp(path),
          method,
          handle,
        }))
      ),
      serverInstance
    ),
  listen: (
    port: number = 3333,
    host: string = 'localhost',
    listener?: VoidFunction
  ) =>
    app(
      internalRoutes,
      serverInstance
        .on(
          'stream',
          (
            stream: ServerHttp2Stream,
            headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
            flags: number
          ) => {
            const { path: requestPath, method: incomingMethod } = accessRequest(
              createRequest(stream, headers, flags, [])
            );

            const route = internalRoutes.find(
              ({ method, path }) =>
                method === incomingMethod && path.test(requestPath)
            );
            route !== undefined
              ? route.handle(
                  createRequest(
                    stream,
                    headers,
                    flags,
                    route.path.exec(requestPath)?.slice(1) ?? []
                  )
                )
              : responseFor(createRequest(stream, headers, flags, []))
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
    app(internalRoutes, serverInstance.close(callback)),
});

/**
 * Initializes secure server.
 *
 * If _options.allowHttp1_: _true_ then also add listener
 * to `request` event.
 */
export const server = (options: SecureServerOptions): Server =>
  app([], createSecureServer(options));
