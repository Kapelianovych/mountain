import { Socket } from 'net';
import { TLSSocket } from 'tls';
import {
  Http2Stream,
  Http2Session,
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
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
    flags: number
  ) => void;

  /** Register handler for incoming requests. */
  function use(handler: Middleware | router.Router): void;

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

  interface Body {
    text(): Promise<string>;
    json<T extends object>(): Promise<T>;
    urlencoded<T extends Record<string, string>>(): Promise<T>;
    formData<T extends body.FormDataDecoded>(): Promise<T>;
  }

  interface Response {
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
    body: Body;
  }

  interface RequestOptions<T> {
    headers?: OutgoingHttpHeaders;
    payload?: T;
    options?: ClientSessionRequestOptions;
  }

  /**
   * Makes a request to remote peer on opened connection.
   * By default it performs **GET** request to _path_ URL.
   */
  function request<T = any>(
    path: string,
    options?: RequestOptions<T>
  ): Promise<Response>;

  /** Closes connection with remote peer. */
  function close(callback?: VoidFunction): void;

  interface Http2SessionEventMap {
    close: VoidFunction;
    connect: (session: Http2Session, socket: Socket) => void;
    error: (error: Error) => void;
    frameError: (type: number, code: number, id: number) => void;
    goaway: (
      errorCode: number,
      lastStreamID: number,
      opaqueData: Buffer
    ) => void;
    localSettings: (settings: SecureClientSessionOptions) => void;
    remoteSettings: (settings: SecureClientSessionOptions) => void;
    ping: (payload: Buffer) => void;
    stream: (
      stream: Http2Stream,
      headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
      flags: number,
      rawHeaders: ReadonlyArray<string>
    ) => void;
    timeout: VoidFunction;
  }

  interface ClientHttp2SessionEventMap extends Http2SessionEventMap {
    altsvc: (alt: string, origin: string, streamId: number) => void;
    origin: (origins: Array<string>) => void;
  }

  function on<T extends keyof ClientHttp2SessionEventMap>(
    event: T,
    listener: ClientHttp2SessionEventMap[T]
  ): void;

  function timeout(ms: number, callback?: VoidFunction): void;

  function isClosed(): boolean;
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

    readonly middlewares: ReadonlyArray<server.Middleware>;

    head(path: string, handler: server.Middleware): this;

    options(path: string, handler: server.Middleware): this;

    get(path: string, handler: server.Middleware): this;

    post(path: string, handler: server.Middleware): this;

    put(path: string, handler: server.Middleware): this;

    delete(path: string, handler: server.Middleware): this;

    merge(router: Router): this;
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

export namespace body {
  /** Parses reauest body as `UTF8` string. */
  function text(stream: Http2Stream): Promise<string>;

  /** Parses request body as `JSON` format. */
  function json<T extends object>(
    stream: Http2Stream,
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader
  ): Promise<T>;

  /**
   * Parses request with `application/x-www-form-urlencoded`.
   * @returns object with key/value pairs.
   */
  function urlencoded<T extends Record<string, string>>(
    stream: Http2Stream,
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader
  ): Promise<T>;

  type FileData = {
    mime: string;
    path: string;
    filename: string;
    encoding: string;
  };

  interface FormDataDecoded {
    [index: string]: string | FileData;
  }

  interface FormDataOptions {
    directory?: string;
  }

  /**
   * Parses request with `multipart/form-data`.
   * All files will be written to disk in _current
   * working directory_. You can specify deeper path
   * by providing **options.directory** field.
   * @returns object with key/value pairs. Value can
   * be either text data or object with file stats.
   */
  function formData<T extends FormDataDecoded>(
    stream: Http2Stream,
    headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
    options?: FormDataOptions
  ): Promise<T>;
}

export namespace respond {
  /** Sends plain text to client. */
  function text(
    stream: ServerHttp2Stream,
    payload: string,
    headers?: OutgoingHttpHeaders
  ): void;

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
  function json<T extends object>(
    stream: ServerHttp2Stream,
    payload: T,
    headers?: OutgoingHttpHeaders
  ): void;

  /**
   * Sends file to client and ends response.
   * By default `status`, `content-type` and `last-modified` headers are set
   * and depends on file stats.
   *
   * @param path must be an absolute path to file.
   *
   * If file will not found, **404** response will be sent.
   */
  function file(
    stream: ServerHttp2Stream,
    path: string,
    headers?: OutgoingHttpHeaders
  ): void;
}
