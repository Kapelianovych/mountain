// @flow

import { createSecureServer } from 'http2'
import { Socket } from 'net'
import cluster from 'cluster'
import os from 'os'

import send, { sendError } from './send.mjs'

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
  timeout?: number,
  parallel?: boolean,
  threads?: number,
}

type ServerListenersMap = Map<string, (...args: any[]) => void>

/**
 * Yet another simple server.
 *
 * Works on top of **HTTP/2** protocol.
 * More about *HTTP/2* and how it works at [Google developers](https://developers.google.com/web/fundamentals/performance/http2).
 */
export class Server {
  _server: Http2SecureServer
  _listeners: ServerListenersMap
  _options: ServerOptions

  /**
   * Creates instance of Server with specific options.
   * Only secure instance is possible to create, because *unencrypted HTTP/2* isn't recommended to use.
   * Throws errors if `key` or `cert` is not defined.
   */
  constructor(options: ServerOptions) {
    if (!options.key) {
      throw new Error(
        'Secret key ("key" property of Server\'s constructor options object) must be defined!'
      )
    }
    if (!options.cert) {
      throw new Error(
        'Secret certificate ("cert" property of Server\'s constructor options object) must be defined!'
      )
    }

    this._options = options
    this._listeners = new Map()
  }

  /**
   * Add listener to server's events.
   */
  _on(eventType: Http2SecureServerEventType, listener: (...arguments) => void) {
    this._listeners.set(eventType, listener)
  }

  onRequest(
    fn: (request: Http2Request, response: Http2Response) => void
  ): void {
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
                options.data = data
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
   * Start listening for connections.
   * Forks processes if [Server] is configured on parallel work.
   */
  listen(port: number, host?: string = 'localhost', listener?: () => void) {
    let { parallel, threads = os.cpus().length - 1 } = this._options

    /** Reason: do not overload CPU. */
    if (threads > os.cpus().length - 1) {
      threads = os.cpus().length - 1
    }

    if (parallel) {
      if (cluster.isMaster) {
        for (let i = 0; i < threads; i++) {
          cluster.fork()
        }

        cluster.on(
          'exit',
          (worker: cluster$Worker, code: number, signal: string) => {
            console.error(
              `Worker "${worker.id}" died with code "${code}". Signal: "${signal}"`
            )

            const newWorker = cluster.fork()
            console.log(
              `New worker with id "${newWorker.id}" has been started.`
            )
          }
        )
      } else {
        cluster.worker.on('disconnect', () => {
          console.error(
            `Worker with id "${cluster.worker.id}" has been disconnected.`
          )
        })
        cluster.worker.on('error', (error: Error) => {
          console.error(`Date: ${new Date().toUTCString()}.
          Error is occured in worker with id "${cluster.worker.id}".
          Error: ${error.toString()}`)
          process.exit(1)
        })

        this._server = startServer({
          options: this._options,
          listeners: this._listeners,
          port,
          host,
          listener,
        })
      }
    } else {
      this._server = startServer({
        options: this._options,
        listeners: this._listeners,
        port,
        host,
        listener,
      })
    }
  }

  close(callback?: () => void): void {
    this._server.close(callback)
  }
}

function startServer({
  options,
  listeners,
  port,
  host,
  listener,
}: {
  options: ServerOptions,
  listeners: ServerListenersMap,
  port: number,
  host: string,
  listener?: () => void,
}) {
  const { key, cert, timeout } = options

  const server = createSecureServer({
    key,
    cert,
  })

  server.setTimeout(timeout)
  for (const [event, listener] of listeners.entries()) {
    server.on(event, listener)
  }

  server.listen(port, host, listener)

  return server
}
