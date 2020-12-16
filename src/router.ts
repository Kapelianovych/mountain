import { constants } from 'http2';
import type { Handler, RouterOptions } from './types';

/** Holds parameters of current path. */
export let parameters: RegExpMatchArray = [];

class Router {
  private readonly _prefix: string = '';
  private readonly _routes: Map<string, (path: string) => Handler> = new Map();

  constructor(options: RouterOptions = {}) {
    this._prefix = options.prefix ?? '';
  }

  get routes(): ReadonlyMap<string, (path: string) => Handler> {
    return this._routes;
  }

  get handlers(): ReadonlyArray<Handler> {
    return Array.from(this._routes).map(([path, getHandlerFor]) =>
      getHandlerFor(path)
    );
  }

  head(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_HEAD, path, handler);
  }

  options(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_OPTIONS, path, handler);
  }

  get(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_GET, path, handler);
  }

  post(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_POST, path, handler);
  }

  put(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_PUT, path, handler);
  }

  delete(path: string, handler: Handler): this {
    return this._method(constants.HTTP2_METHOD_DELETE, path, handler);
  }

  merge(router: Router): this {
    router.routes.forEach((getHandlerFor, path) => {
      this._routes.set(
        addBounds(this._prefix + removeBounds(path)),
        getHandlerFor
      );
    });

    return this;
  }

  private _method(method: string, path: string, handler: Handler): this {
    const unboundedPath = removeBounds(path);
    const fullPath = addBounds(
      this._prefix +
        (unboundedPath.endsWith('/') ? `${unboundedPath}?` : unboundedPath)
    );

    this._routes.set(fullPath, (path: string) => (stream, headers, flags) => {
      const requestMethod = headers[constants.HTTP2_HEADER_METHOD] as string;
      const requestPath = headers[constants.HTTP2_HEADER_PATH] as string;

      if (requestMethod === method && new RegExp(path).test(requestPath)) {
        parameters = requestPath.match(path) ?? [];
        handler(stream, headers, flags);
      }
    });

    return this;
  }
}

export type { Router };

/** Creates `Router` instance. */
export function create(options: RouterOptions = {}): Router {
  return new Router(options);
}

function addBounds(path: string): string {
  let boundedPath = path.startsWith('^') ? path : `^${path}`;
  return boundedPath.endsWith('$') ? boundedPath : `${boundedPath}$`;
}

function removeBounds(path: string): string {
  let unboundedPath = path.startsWith('^') ? path.slice(1) : path;
  return unboundedPath.endsWith('$')
    ? unboundedPath.slice(0, unboundedPath.length - 1)
    : unboundedPath;
}
