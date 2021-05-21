import { constants } from 'http2';

import { RequestHandler } from './types';
import { normalize, addBounds } from './utils/url';

export interface Route {
  readonly path: string;
  readonly method: string;
  handle: RequestHandler;
}

export const route = (
  method: string,
  path: string,
  handler: RequestHandler
): Route => ({
  method,
  path: addBounds(path),
  handle: handler,
});

export const del = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_DELETE, path, handler);
export const put = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_PUT, path, handler);
export const get = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_GET, path, handler);
export const head = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_HEAD, path, handler);
export const post = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_POST, path, handler);
export const patch = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_PATCH, path, handler);
export const options = (path: string, handler: RequestHandler): Route =>
  route(constants.HTTP2_METHOD_OPTIONS, path, handler);

export const group =
  (prefix: string = '') =>
  (...locals: ReadonlyArray<Route>): ReadonlyArray<Route> =>
    locals.map(({ method, path, handle }) => ({
      method,
      handle,
      path:
        '^' +
        normalize(prefix) +
        normalize(path.startsWith('^') ? path.slice(1) : path),
    }));
