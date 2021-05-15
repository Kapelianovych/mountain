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
  IncomingHttpStatusHeader,
  SecureClientSessionOptions,
} from 'http2';

export type Handler = (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  flags: number
) => void;

export interface Http2ServerEventMap {
  sessionError: (error: Error) => void;
  stream: Handler;
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

export type FileData = {
  readonly mime: string;
  readonly path: string;
  readonly filename: string;
  readonly encoding: string;
};

export interface FormDataDecoded {
  [index: string]: string | FileData;
}

export interface FormDataOptions {
  readonly directory?: string;
}
