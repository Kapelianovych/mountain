import EventEmitter from 'events'
import net from 'net'
import tls from 'tls'
import { Duplex } from 'stream'
import { FileHandle } from 'fs'

declare module 'http2' {
  declare export var constants: {
    NGHTTP2_SESSION_SERVER: number,
    NGHTTP2_SESSION_CLIENT: number,
    HTTP2_HEADER_PATH: string,
    HTTP2_HEADER_STATUS: number,
  }

  declare export class Http2Stream extends Duplex {
    aborted: boolean;
    bufferSize: number;
    closed: boolean;
    destroyed: boolean;
    endAfterHeaders: boolean;
    id?: number;
    pending: boolean;
    rstCode: number;
    sentHeaders: Http2Headers;
    sentInfoHeaders: Http2Headers[];
    sentTrailers: Http2Headers;
    session: Http2Session;
    state: {
      localWindowSize: number,
      state: number,
      localClose: number,
      remoteClose: number,
      sumDependencyWeight: number,
      weight: number,
    };

    on(event: 'aborted', callback: () => void): void;
    on(event: 'close', callback: () => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'frameError', callback: (error: Error) => void): void;
    on(event: 'timeout', callback: () => void): void;
    on(event: 'wantTrailers', callback: () => void): void;
    close(code: number, callback?: () => void): void;
    priority(options: {
      exclusive?: boolean,
      parent: number,
      weight: number,
      silent: boolean,
    }): void;
    setTimeout(msecs: number, callback: () => void): void;
    sendTrailers(headers: Http2Headers): void;
  }

  declare type Http2SessionState = {
    effectiveLocalWindowSize: number,
    effectiveRecvDataLength: number,
    nextStreamID: number,
    localWindowSize: number,
    lastProcStreamID: number,
    remoteWindowSize: number,
    outboundQueueSize: number,
    deflateDynamicTableSize: number,
    inflateDynamicTableSize: number,
  }

  declare class Http2Session extends EventEmitter {
    alpnProtocol?: string;
    closed: boolean;
    connecting: boolean;
    destroyed: boolean;
    encrypted?: boolean;
    localSettings: Http2Settings;
    remoteSettings: Http2Settings;
    originSet?: string[];
    pendingSettingsAck: boolean;
    socket: tls.TLSSocket | net.Socket;
    state: Http2SessionState;
    type: constants.NGHTTP2_SESSION_SERVER | constants.NGHTTP2_SESSION_CLIENT;

    on(event: 'close', listener: () => void): void;
    on(
      event: 'connect',
      listener: (session: Http2Session, socket: net.Socket) => void
    ): void;
    on(event: 'error', listener: (error: Error) => void): void;
    on(
      event: 'frameError',
      listener: (type: number, code: number, id: number) => void
    ): void;
    on(
      event: 'goaway',
      listener: (
        errorCode: number,
        lastStreamID: number,
        opaqueData?: Buffer
      ) => void
    ): void;
    on(
      event: 'localSettings',
      listener: (settings: Http2Settings) => void
    ): void;
    on(
      event: 'remoteSettings',
      listener: (settings: Http2Settings) => void
    ): void;
    on(event: 'ping', listener: (payload: Buffer) => void): void;
    on(
      event: 'stream',
      listener: (
        stream: Http2Stream,
        headers: Http2Headers,
        flags: number,
        rawHeaders: string[]
      ) => void
    ): void;
    on(event: 'timeout', listener: () => void): void;

    close(callback?: () => void): void;
    destroy(error?: Error, code?: number): void;
    goaway(
      code?: number,
      lastStreamID?: number,
      opaqueData?: Buffer | TypedArray | DataView
    ): void;
    ping(
      payload?: Buffer | TypedArray | DataView,
      callback: (error: ?Error, duration: number, payload: Buffer) => void
    ): boolean;
    ref(): void;
    unref(): void;
    setTimeout(msecs: number, callback: () => void): void;
    settings(
      settings?: Http2Settings,
      callback?: (
        error: ?Error,
        settings: Http2Settings,
        duration: number
      ) => void
    ): void;
  }

  declare export type Http2Settings = {
    enablePush?: boolean,
  }

  declare export class ServerHttp2Session extends Http2Session {
    altsvc(
      alt: string,
      originOrStream: number | string | URL | { origin: string }
    ): void;
    origin(...arguments: (string | URL | { origin: string })[]): void;
  }

  declare export class ClientHttp2Session extends Http2Session {
    on(
      event: 'altsvc',
      callback: (alt: string, origin: string, streamId: number) => void
    ): void;
    on(event: 'origin', callback: (origins: string[]) => void): void;
    request(
      headers: Http2Headers,
      options?: {
        endStream?: boolean,
        exclusive?: boolean,
        parent?: number,
        weight?: number,
        waitForTrailers?: boolean,
      }
    ): ClientHttp2Stream;
  }

  declare export class ClientHttp2Stream extends Http2Stream {
    on(event: 'continue', callback: () => void): void;
    on(
      event: 'headers',
      callback: (headers: Http2Headers, flags: number) => void
    ): void;
    on(
      event: 'push',
      callback: (headers: Http2Headers, flags: number) => void
    ): void;
    on(
      event: 'response',
      callback: (headers: Http2Headers, flags: number) => void
    ): void;
    on(
      event: 'data',
      callback: (chunk: Buffer) => void // Need to be checked
    ): void;
    on(
      event: 'end',
      callback: () => void
    ): void;
  }

  declare export class ServerHttp2Stream extends Http2Stream {
    headersSent: Http2Headers;
    pushAllowed: boolean;

    pushStream(
      headers: OutgoingHttpHeaders,
      onPushCreated: (
        error: Error,
        pushStream: ServerHttp2Stream,
        headers: Http2Headers
      ) => void
    ): void;
    pushStream(
      headers: OutgoingHttpHeaders,
      options: {
        exclusive?: boolean,
        parent?: boolean,
      },
      onPushCreated: (
        error: Error,
        pushStream: ServerHttp2Stream,
        headers: Http2Headers
      ) => void
    ): void;

    respond(
      headers?: Http2Headers,
      options?: {
        endStream?: boolean,
        waitForTrailers?: boolean,
      }
    ): void;

    respondWithFD(
      fd: number | FileHandle,
      headers?: Http2Headers,
      options?: {
        statCheck?: (stat: any, headers: Http2Headers) => boolean,
        waitForTrailers?: boolean,
        offset?: number,
        length?: number,
      }
    ): void;

    respondWithFile(
      path: string | Buffer | URL,
      headers?: Http2Headers,
      options?: {
        onError?: (error: Error) => void,
        statCheck?: (stat: any, headers: Http2Headers) => boolean,
        waitForTrailers?: boolean,
        offset?: number,
        length?: number,
      }
    ): void;

    additionalHeaders(headers: Http2Headers): void;

    end(payload?: any): void;

    close(): void;
  }

  declare export type SecureServerOptions = {
    key: Buffer,
    cert: Buffer,
  }

  declare export type Http2Headers = {
    cookie?: string,
    'set-cookie'?: string[],
    ':status'?: string,
    ':path'?: string,
    ':method'?: string,
    ':authority'?: string,
    ':scheme'?: string,
    ':protocol'?: string,
    age?: string,
    authorization?: string,
    'access-control-allow-credentials'?: string,
    'access-control-max-age'?: string,
    'access-control-request-method'?: string,
    'content-encoding'?: string,
    'content-language'?: string,
    'content-length'?: string,
    'content-location'?: string,
    'content-md5'?: string,
    'content-range'?: string,
    'content-type'?: string,
    date?: string,
    dnt?: string,
    etag?: string,
    expires?: string,
    from?: string,
    'if-match'?: string,
    'if-modified-since'?: string,
    'if-none-match'?: string,
    'if-range'?: string,
    'if-unmodified-since'?: string,
    'last-modified'?: string,
    location?: string,
    'max-forwards'?: string,
    'proxy-authorization'?: string,
    range?: string,
    referer?: string,
    'retry-after'?: string,
    tk?: string,
    'upgrade-insecure-requests'?: string,
    'user-agent'?: string,
    'x-content-type-options'?: string,
    [key: string]: string,
  }

  declare export type OutgoingHttpHeaders = {
    ':status'?: string,
    ':path'?: string,
    ':method'?: string,
    ':authority'?: string,
    ':scheme'?: string,
    ':protocol'?: string,
    age?: string,
    authorization?: string,
    'access-control-allow-credentials'?: string,
    'access-control-max-age'?: string,
    'access-control-request-method'?: string,
    'content-encoding'?: string,
    'content-language'?: string,
    'content-length'?: string,
    'content-location'?: string,
    'content-md5'?: string,
    'content-range'?: string,
    'content-type'?: string,
    date?: string,
    dnt?: string,
    etag?: string,
    'set-cookie'?: string[],
    expires?: string,
    from?: string,
    'if-match'?: string,
    'if-modified-since'?: string,
    'if-none-match'?: string,
    'if-range'?: string,
    'if-unmodified-since'?: string,
    'last-modified'?: string,
    location?: string,
    'max-forwards'?: string,
    'proxy-authorization'?: string,
    range?: string,
    referer?: string,
    'retry-after'?: string,
    tk?: string,
    'upgrade-insecure-requests'?: string,
    'user-agent'?: string,
    'x-content-type-options'?: string,
    [key: string]: string,
  }

  declare export type IncomingHttpHeaders = {
    cookie: string,
    ':status': number,
    ':path': string,
    ':method': string,
    ':authority': string,
    ':scheme': string,
    ':protocol': string,
    age?: string,
    authorization?: string,
    'access-control-allow-credentials'?: string,
    'access-control-max-age'?: string,
    'access-control-request-method'?: string,
    'content-encoding': string,
    'content-language'?: string,
    'content-length': string,
    'content-location'?: string,
    'content-md5'?: string,
    'content-range'?: string,
    'content-type': string,
    date?: string,
    dnt?: string,
    etag?: string,
    'set-cookie'?: string[],
    expires?: string,
    from?: string,
    'if-match'?: string,
    'if-modified-since'?: string,
    'if-none-match'?: string,
    'if-range'?: string,
    'if-unmodified-since'?: string,
    'last-modified': string,
    location?: string,
    'max-forwards'?: string,
    'proxy-authorization'?: string,
    range?: string,
    referer?: string,
    'retry-after'?: string,
    tk?: string,
    'upgrade-insecure-requests'?: string,
    'user-agent': string,
    'x-content-type-options'?: string,
    [key: string]: string | string[],
  }

  declare export function createSecureServer(
    options,
    onRequestHandler
  ): tls.Server

  declare type ConnectOptions = {
    maxDeflateDynamicTableSize?: number,
    maxSessionMemory?: number,
    maxHeaderListPairs?: number,
    maxOutstandingPings?: number,
    maxReservedRemoteStreams?: number,
    maxSendHeaderBlockLength?: number,
    paddingStrategy?: number,
    peerMaxConcurrentStreams?: number,
    settings?: Http2Settings,
    createConnection?: (authority: URL, options: ConnectOptions) => Duplex
  }

  declare export function connect(
    authority: string | URL,
    options?: ConnectOptions,
    listener?: () => void
  ): ClientHttp2Session
}
