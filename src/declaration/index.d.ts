import { TLSSocket } from 'tls';
import {
  Http2Stream,
  ServerHttp2Stream,
  Http2ServerRequest,
  ServerHttp2Session,
  IncomingHttpHeaders,
  SecureServerOptions,
  Http2ServerResponse,
  OutgoingHttpHeaders,
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
  ClientSessionRequestOptions,
} from 'http2';

export namespace server {
  /**
   * Initializes secure server.
   *
   * If _options.allowHttp1_: _true_ then also add listener
   * to `request` event.
   */
  function init(options: SecureServerOptions): void;

  /** Starts server. */
  function listen(
    port?: number,
    host?: string,
    listeningListener?: VoidFunction
  ): void;

  /** Closes server. */
  function close(callback?: (error?: Error) => void): void;

  type Middleware = (
    stream: ServerHttp2Stream,
    headers: IncomingHttpHeaders,
    flags: number
  ) => void;

  /**
   * Register handler for incoming requests.
   * Short version of `server.on('stream', handler)`.
   */
  function use(handler: Middleware): void;

  interface Http2ServerEventMap {
    sessionError: (error: Error) => void;
    stream: Middleware;
    timeout: VoidFunction;
    checkContinue: (
      request: Http2ServerRequest,
      response: Http2ServerResponse
    ) => void;
    request: (
      request: Http2ServerRequest,
      response: Http2ServerResponse
    ) => void;
    session: (session: ServerHttp2Session) => void;
    unknownProtocol: (socket: TLSSocket) => void;
  }

  /** Add listeners to server's events. */
  function on<T extends keyof Http2ServerEventMap>(
    event: T,
    listener: Http2ServerEventMap[T]
  ): void;

  /** Sets timeout for response. */
  function timeout(ms: number, callback?: VoidFunction): void;
}

export namespace client {
  /** Opens connection with remote peer. */
  function open(
    autority: string | URL,
    options?: SecureClientSessionOptions
  ): void;

  interface Response {
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
    body: Body;
  }

  interface RequestOptions {
    headers?: OutgoingHttpHeaders;
    payload?: any;
    options?: ClientSessionRequestOptions;
  }

  /**
   * Makes a request to remote peer.
   * By default it performs **GET** request to _path_ URL.
   */
  function request(path: string, options?: RequestOptions): Promise<Response>;

  /** Closes connection with remote peer. */
  function close(callback?: VoidFunction): void;
}

export namespace cookies {
  interface Attributes {
    Path?: string;
    Domain?: string;
    Secure?: boolean;
    Expires?: string;
    HttpOnly?: boolean;
    SameSite?: 'Strict' | 'Lax' | 'None';
    'Max-Age'?: number | string;
  }

  type Cookies = Attributes & { [key: string]: string | boolean };

  /** Parses cookies from headers to JavaScript object. */
  function parse(data: string): Cookies;

  /**
   * Creates cookie string from key/value pair
   * and optional _attributes_ object.
   */
  function create(key: string, value: string, attributes?: Attributes): string;
}

export namespace router {
  type RouterOptions = {
    prefix?: string;
  };

  interface Router {
    readonly routes: ReadonlyMap<string, (path: string) => server.Middleware>;

    head(path: string, handler: server.Middleware): this;

    options(path: string, handler: server.Middleware): this;

    get(path: string, handler: server.Middleware): this;

    post(path: string, handler: server.Middleware): this;

    put(path: string, handler: server.Middleware): this;

    delete(path: string, handler: server.Middleware): this;

    forEach(fn: typeof server.use): void;

    merge(
      routes: ReadonlyMap<string, (path: string) => server.Middleware>
    ): this;
  }

  /** Creates `Router` instance. */
  function create(options?: RouterOptions): Router;

  /** Holds parameters of current path. */
  const parameters: Readonly<RegExpMatchArray>;
}

/**
 * Serves static files from _dir_.
 * By default files are searched in current working directory.
 */
export function files(dir?: string): server.Middleware;

export interface Body {
  json<T>(): Promise<T>;
  raw(): Promise<string>;
}

/** Parses body from request or response stream. */
export function body(stream: Http2Stream): Body;

export namespace respond {
  /** Sends headers to client and ends response. */
  function headers(
    stream: ServerHttp2Stream,
    headers?: OutgoingHttpHeaders
  ): void;

  /**
   * Sends JSON to client and ends response.
   * By default `status` and `content-type` headers are set.
   * You can override headers by providing own key/value pairs.
   */
  function json(
    stream: ServerHttp2Stream,
    payload?: any,
    headers?: OutgoingHttpHeaders
  ): void;

  /**
   * Sends file to client and ends response.
   * By default `status`, `content-type` and `last-modified` headers are set
   * and depends on file stats.
   *
   * If file will not found, **404** response will be sent.
   */
  function file(
    stream: ServerHttp2Stream,
    path: string,
    headers?: OutgoingHttpHeaders
  ): void;
}
