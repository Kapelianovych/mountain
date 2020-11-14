import { constants } from 'http2';
import type { Middleware } from './server';

type RouterOptions = {
  prefix?: string;
};

export let parameters: RegExpMatchArray = [];

class Router {
  #prefix: string = '';
  #routes: Map<string, (path: string) => Middleware> = new Map();

  constructor(options: RouterOptions = {}) {
    this.#prefix = options.prefix ?? '';
  }

  get routes(): ReadonlyMap<string, (path: string) => Middleware> {
    return this.#routes;
  }

  get middlewares(): ReadonlyArray<Middleware> {
    return Array.from(this.#routes.entries()).map(([path, getMiddlewareFor]) =>
      getMiddlewareFor(path)
    );
  }

  head(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_HEAD, path, handler);
  }

  options(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_OPTIONS, path, handler);
  }

  get(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_GET, path, handler);
  }

  post(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_POST, path, handler);
  }

  put(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_PUT, path, handler);
  }

  delete(path: string, handler: Middleware): this {
    return this._method(constants.HTTP2_METHOD_DELETE, path, handler);
  }

  merge(router: Router): this {
    router.routes.forEach((getMiddlewareFor, path) => {
      this.#routes.set(
        addBounds(this.#prefix + removeBounds(path)),
        getMiddlewareFor
      );
    });

    return this;
  }

  private _method(method: string, path: string, handler: Middleware): this {
    const fullPath = addBounds(
      this.#prefix + (path.endsWith('/') ? `${path}?` : path)
    );

    this.#routes.set(fullPath, (path: string) => (stream, headers, flags) => {
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

export function create(options: RouterOptions = {}): Router {
  return new Router(options);
}

function addBounds(path: string): string {
  return `^${path}$`;
}

function removeBounds(path: string): string {
  return path.slice(1, path.length - 1);
}
