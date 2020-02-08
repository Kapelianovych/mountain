// @flow

// $FlowFixMe
import http2 from 'http2'
import path from 'path'
import { Socket } from 'net'

import send, { sendError } from './send.mjs'
import { currentDirPath } from './helpers.mjs'

import type { SendOptions, Http2Error } from './send.mjs'
import type {
  ServerHttp2Stream,
  IncomingHttpHeaders,
  ServerHttp2Session,
} from 'http2'
// This is not prover type but maybe Http2Server inherits of them?
import type { Server as Http2SecureServer } from 'tls'

// Events of *Http2SecureServer* object.
type Http2SecureServerEventType =
  | 'checkContinue'
  | 'request'
  | 'session'
  | 'sessionError'
  | 'stream'
  | 'timeout'
  | 'unknownProtocol'

export type Http2Request = {
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders,
  flags: number,
  rawHeaders: string[],
}

export type Http2Response = {
  send: (options: SendOptions) => void,
  sendError: (error: Http2Error) => void,
}

type ServerOptions = {
  cert: Buffer,
  key: Buffer,
  rootDir: string | URL,
  timeout?: number,
}

/**
 * Yet another simple server.
 *
 * Works on top of **HTTP/2** protocol.
 * More about *HTTP/2* and how it works at [Google developers](https://developers.google.com/web/fundamentals/performance/http2).
 */
export default class Server {
  /**
   * Holds absolute path to project root folder.
   */
  +_rootProjectFolder: string

  /** @type {http2.Http2SecureServer} */
  +_server: Http2SecureServer

  /**
   * Creates instance of Server with specific options.
   * Only secure instance is possible to create, because *unencrypted HTTP/2* isn't recommended to use.
   * @param {string | URL} rootDir provides path to project root folder.
   * As the `url` need to be provided path to project root folder. This is can
   * be done by `import.meta.url`, that contains the absolute *file: URL* of
   * the module. By default project root is empty. You must provide it. Each
   * *Server* instance have their own project root path.
   *
   * Throws errors if `key`, `cert` or `rootDir` is not defined.
   */
  constructor(options: ServerOptions) {
    const { key, cert, rootDir, timeout = 120000 } = options

    if (!key) {
      throw new Error(
        'Secret key ("key" property of Server\'s constructor options object) must be defined!'
      )
    }
    if (!cert) {
      throw new Error(
        'Secret certificate ("cert" property of Server\'s constructor options object) must be defined!'
      )
    }
    if (!rootDir) {
      throw new Error(
        'Package root absolute path ("rootDir" property of Server\'s constructor options object) must be defined!'
      )
    }

    this._server = http2.createSecureServer({
      key,
      cert,
    })

    this._rootProjectFolder = currentDirPath(rootDir)

    if (timeout) {
      // $FlowFixMe
      this._server.setTimeout(timeout)
    }
  }

  /**
   * Add listener to server's events.
   */
  _on(eventType: Http2SecureServerEventType, listener: (...arguments) => void) {
    this._server.on(eventType, listener)
  }

  onRequest(
    fn: (request: Http2Request, response: Http2Response) => void
  ): void {
    const root = this._rootProjectFolder

    this._on('stream', (stream, headers, flags, rawHeaders) => {
      fn(
        {
          stream,
          headers,
          flags,
          rawHeaders,
        },
        {
          send(options) {
            const { type, data } = options
            if (type === 'file') {
              if (typeof data === 'string') {
                options.data = path.resolve(
                  root,
                  data.startsWith('/') ? data.slice(1) : data
                )
              }
            }
            send(stream, options)
          },
          sendError(error) {
            sendError(stream, error)
          },
        }
      )
    })
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
  setTimeout(milliseconds?: number = 120000, callback?: () => void): void {
    // $FlowFixMe
    this._server.setTimeout(milliseconds, callback)
  }

  /**
   * Start listen for connections.
   */
  listen(port: number, host?: string = 'localhost', listener?: () => void) {
    // $FlowFixMe
    this._server.listen(port, host, listener)
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
    this._server.close(callback)
  }
}
