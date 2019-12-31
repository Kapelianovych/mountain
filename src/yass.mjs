// @flow

// $FlowFixMe
import http2 from 'http2'
import path from 'path'
import { Socket } from 'net'

import send, { sendError } from './send.mjs'
import { currentDirPath } from './helpers.mjs'

import type { SendOptions, Http2Error } from './send.mjs'
import type {
  SecureServerOptions,
  ServerHttp2Stream,
  IncomingHttpHeaders,
  ServerHttp2Session,
} from 'http2'

// Events of *Http2SecureServer* object.
type Http2SecureServerEventType =
  | 'checkContinue'
  | 'request'
  | 'session'
  | 'sessionError'
  | 'stream'
  | 'timeout'
  | 'unknownProtocol'

/**
 * Yet another simple server.
 *
 * Works on top of **HTTP/2** protocol.
 * More about *HTTP/2* and how it works at [Google developers](https://developers.google.com/web/fundamentals/performance/http2).
 */
export default class Yass {
  /**
   * Holds absolute path to project root folder.
   */
  #rootProjectFolder = ''

  /** @type {http2.Http2SecureServer} */
  #server

  /**
   * Creates instance of Yass with specific options.
   * Only secure instance is possible to create, because *unencrypted HTTP/2* isn't recommended to use.
   * @param {string | URL} rootUrl path to project root folder.
   * As the `url` need to be provided path to project root folder. This is can
   * be done by `import.meta.url`, that contains the absolute *file: URL* of
   * the module. By default project root is empty. You must provide it. Each
   * *Yass* instance have their own project root path.
   */
  constructor(options: SecureServerOptions, rootUrl: string | URL) {
    this.#server = http2.createSecureServer(options)
    this.#rootProjectFolder = currentDirPath(rootUrl)
  }

  /**
   * Add listener to server's events.
   */
  _on(eventType: Http2SecureServerEventType, listener: (...arguments) => void) {
    this.#server.on(eventType, listener)
  }

  /**
   * Listens on new stream in current session is created.
   */
  onStream(
    listener: (
      stream: ServerHttp2Stream,
      headers: IncomingHttpHeaders,
      flags: number,
      rawHeaders: string[]
    ) => void
  ) {
    this._on('stream', listener)
  }

  /**
   * Listens on new session establishes.
   */
  onSessionCreated(listener: (session: ServerHttp2Session) => void) {
    this._on('session', listener)
  }

  /**
   * Listens on *timeout* event if there is no activity on the **Http2Session** after the configured number of milliseconds.
   */
  onTimeout(listener: () => void) {
    this._on('timeout', listener)
  }

  /**
   * Listens on *unknownProtocol* event that is emitted when a connecting client fails to negotiate an allowed protocol (i.e. HTTP/2 or HTTP/1.1).
   */
  onUnknownProtocol(listener: (socket: Socket) => void) {
    this._on('unknownProtocol', listener)
  }

  /**
   * Listens on errors that has been arisen in current session.
   */
  onError(listener: (error: Error) => void) {
    this._on('sessionError', listener)
  }

  /**
   * Used to set the timeout value for http2 secure server requests, and sets a
   * callback function that is called when there is no activity on the server
   * after `milliseconds`.
   *
   * The given callback is registered as a listener on the *timeout* event.
   *
   * In case of no `callback` function were assigned, a new
   * **ERR_INVALID_CALLBACK** error will be thrown.
   */
  setTimeout(milliseconds?: number = 120000, callback?: () => void) {
    this.#server.setTimeout(milliseconds, callback)
  }

  /**
   * Sends data to client over stream.
   * @param {import('http2').ServerHttp2Stream} stream - stream that transfer response to client.
   * @param {Object} options - object that contains data that need to be sent to client.
   * @param {'data'|'file'|'headers'} options.type - type of data that need to be sent. If value is `data` or `file` *options.data* need to be provided. Otherwise *options.header* must be present.
   * @param {String|Number[]|{ [key: string]: object }} [options.data] - data that need to be sent over network. For *file* type it needs to be the path to the file or directory (type `String`) from project root. For *headers* type it need to be `null` or `undefined`. For *data* type it expects to be array of octets or object, or string.
   * @param {import('http2').OutgoingHttpHeaders} [options.headers] - headers that will be set to response.
   */
  send(stream: ServerHttp2Stream, options: SendOptions) {
    const { type, data } = options
    if (type === 'file') {
      if (typeof data === 'string') {
        options.data = path.resolve(
          this.#rootProjectFolder,
          data.startsWith('/') ? data.slice(1) : data
        )
      }
    }
    send(stream, options)
  }

  /**
   * Sends error to client and close stream.
   */
  sendError(stream: ServerHttp2Stream, error: Http2Error) {
    sendError(stream, error)
  }

  /**
   * Start listen for connections.
   */
  listen(port: number, host?: string = 'localhost', listener?: () => void) {
    this.#server.listen(port, host, listener)
  }

  /**
   * Stops the server from establishing new sessions. This does not prevent new
   * request streams from being created due to the persistent nature of HTTP/2
   * sessions.
   *
   * If `callback` is provided, it is not invoked until all active sessions have
   * been closed, although the server has already stopped allowing new
   * sessions. See [tls.Server.close()](https://nodejs.org/dist/latest-v12.x/docs/api/tls.html#tls_server_close_callback) for more details.
   */
  close(callback?: () => void) {
    this.#server.close(callback)
  }
}
