import type { Socket } from 'net';
import type { TLSSocket } from 'tls';
import type {
  Http2Stream,
  Http2Session,
  ServerHttp2Stream,
  Http2ServerRequest,
  ServerHttp2Session,
  IncomingHttpHeaders,
  Http2ServerResponse,
  OutgoingHttpHeaders,
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
  ClientSessionRequestOptions,
} from 'http2';

export type RouterOptions = {
  prefix?: string;
};

export type Middleware = (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  flags: number
) => void;

export interface Http2ServerEventMap {
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

export interface Http2SessionEventMap {
  close: VoidFunction;
  connect: (session: Http2Session, socket: Socket) => void;
  error: (error: Error) => void;
  frameError: (type: number, code: number, id: number) => void;
  goaway: (errorCode: number, lastStreamID: number, opaqueData: Buffer) => void;
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

export interface ClientHttp2SessionEventMap extends Http2SessionEventMap {
  altsvc: (alt: string, origin: string, streamId: number) => void;
  origin: (origins: Array<string>) => void;
}

export interface ClientHttp2ResponseBody {
  text(): Promise<string>;
  json<T extends object>(): Promise<T>;
  urlencoded<T extends Record<string, string>>(): Promise<T>;
  formData<T extends FormDataDecoded>(): Promise<T>;
}

export interface ClientHttp2Response {
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
  body: ClientHttp2ResponseBody;
}

export interface RequestOptions<T> {
  headers?: OutgoingHttpHeaders;
  payload?: T;
  options?: ClientSessionRequestOptions;
}

export interface Attributes {
  Path?: string;
  Domain?: string;
  Secure?: boolean;
  Expires?: string;
  HttpOnly?: boolean;
  SameSite?: 'Strict' | 'Lax' | 'None';
  'Max-Age'?: number | string;
}

export type Cookies = Attributes & { [key: string]: string | boolean };

export type FileData = {
  mime: string;
  path: string;
  filename: string;
  encoding: string;
};

export interface FormDataDecoded {
  [index: string]: string | FileData;
}

export interface FormDataOptions {
  directory?: string;
}
