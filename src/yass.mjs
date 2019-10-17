import http2 from 'http2'
import path from 'path'

import send, { sendError } from './send.mjs'
import { currentDirPath } from './helpers.mjs'

/**
 * Events of *Http2SecureServer* object.
 * @typedef { 'checkContinue'|'request'|'session'|'sessionError'|'stream'|'timeout'|'unknownProtocol' } Http2SecureServerEventType
 */

/**
 * Yet another simple server.
 *
 * Works on top of **HTTP/2** protocol.
 *
 * All paths in HTML, CSS must start from project root.
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
   * @param {http2.SecureServerOptions} options
   * @param {String|URL} rootUrl path to project root folder.
   * As the `url` need to be provided path to project root folder. This is can
   * be done by `import.meta.url`, that contains the absolute *file: URL* of
   * the module. By default project root is empty. You must provide it. Each
   * *Yass* instance have their own project root path.
   */
  constructor(options, rootUrl) {
    this.#server = http2.createSecureServer(options)
    this.#rootProjectFolder = currentDirPath(rootUrl)
  }

  /**
   * Add listener to server's events.
   * @param {Http2SecureServerEventType} eventType
   * @param {(...args) => void} listener
   */
  _on(eventType, listener) {
    this.#server.on(eventType, listener)
  }

  /**
   * Listens on new stream in current session is created.
   * @param {(stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders, flags: number, rawHeaders: string[]) => void} listener
   */
  onStream(listener) {
    this._on('stream', listener)
  }

  /**
   * Listens on new session establishes.
   * @param {(session: http2.ServerHttp2Session) => void} listener
   */
  onSessionCreated(listener) {
    this._on('session', listener)
  }

  /**
   * Listens on *timeout* event if there is no activity on the **Http2Session** after the configured number of milliseconds.
   * @param {() => void} listener
   */
  onTimeout(listener) {
    this._on('timeout', listener)
  }

  /**
   * Listens on *unknownProtocol* event that is emitted when a connecting client fails to negotiate an allowed protocol (i.e. HTTP/2 or HTTP/1.1).
   * @param {(socket: import('net').Socket) => void} listener
   */
  onUnknownProtocol(listener) {
    this._on('unknownProtocol', listener)
  }

  /**
   * Listens on errors that has been arisen in current session.
   * @param {(error: Error) => void} listener
   */
  onError(listener) {
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
   * @param {Number} [milliseconds=120000] default is 120000 (2 minutes).
   * @param {() => void} [callback]
   */
  setTimeout(milliseconds = 120000, callback) {
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
  send(stream, options) {
    const { type, data } = options
    if (type === 'file') {
      if (typeof data === 'string') {
        options.data = path.resolve(this.#rootProjectFolder, data.slice(1))
      }
    }
    send(stream, options)
  }

  /**
   * Sends error to client and close stream.
   * @param {import('http2').ServerHttp2Stream} stream
   * @param {{ status: Number, reason?: String, error?: Error }} error
   */
  sendError(stream, error) {
    sendError(stream, error)
  }

  /**
   * Start listen for connections.
   * @param {Number} port
   * @param {String} [host] defaults to *localhost*.
   * @param {() => void} [listener]
   */
  listen(port, host = 'localhost', listener) {
    this.#server.listen(
      port,
      host,
      listener
    )
  }

  /**
   * Stops the server from establishing new sessions. This does not prevent new
   * request streams from being created due to the persistent nature of HTTP/2
   * sessions.
   *
   * If `callback` is provided, it is not invoked until all active sessions have
   * been closed, although the server has already stopped allowing new
   * sessions. See [tls.Server.close()](https://nodejs.org/dist/latest-v12.x/docs/api/tls.html#tls_server_close_callback) for more details.
   * @param {() => void} [callback]
   */
  close(callback) {
    this.#server.close(callback)
  }
}
