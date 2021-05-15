import { constants } from 'http2';

import { Handler } from './types';
import { addBounds, normalize } from './utils';

export interface Route {
  readonly path: string;
  readonly method: string;
  handle: Handler;
}

export const route = (
  method: string,
  path: string,
  handler: Handler
): Route => ({
  method,
  path: addBounds(path),
  handle: handler,
});

export const del = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_DELETE, path, handler);
export const put = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_PUT, path, handler);
export const get = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_GET, path, handler);
export const head = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_HEAD, path, handler);
export const post = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_POST, path, handler);
export const options = (path: string, handler: Handler): Route =>
  route(constants.HTTP2_METHOD_OPTIONS, path, handler);

export const controller =
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
