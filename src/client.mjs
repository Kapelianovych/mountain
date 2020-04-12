// @flow

import { connect } from 'http2'

import type { Http2Headers, Http2Settings, ClientHttp2Session } from 'http2'

export type ClientOptions = {
  url: string,
  maxSessionMemory?: number,
  settings?: Http2Settings,
}

type RequestOptions = {
  onResponse?: (headers: Http2Headers) => void,
  onData?: (chunk: Buffer) => void,
  onEnd?: () => void,
  endStream?: boolean,
  exclusive?: boolean,
  parent?: number,
  weight?: number,
  waitForTrailers?: boolean,
}

type ClientEventType = 'altsvc' | 'origin'

/**
 * Client for HTTP/2. Experimental.
 */
export class Client {
  _client: ClientHttp2Session

  constructor(options: ClientOptions) {
    const { url, maxSessionMemory = 10, settings } = options

    this._client = connect(url, {
      maxSessionMemory,
      settings,
    })
  }

  /**
   * Add listener to client's events.
   */
  _on(eventType: ClientEventType, listener: (...arguments) => void): void {
    this._client.on(eventType, listener)
  }

  onAltsvc(
    listener: (alt: string, origin: string, streamId: number) => void
  ): void {
    this._on('altsvc', listener)
  }

  onOrigin(listener: (origins: string[]) => void): void {
    this._on('origin', listener)
  }

  request(headers: Http2Headers, options: RequestOptions): void {
    const { endStream, exclusive = false, parent, weight, waitForTrailers = false } = options

    const request = this._client.request(headers, {
      endStream,
      exclusive,
      parent,
      weight,
      waitForTrailers,
    })

    if (options.onResponse) {
      request.on('response', options.onResponse)
    }
    if (options.onData) {
      request.on('data', options.onData)
    }
    if (options.onEnd) {
      request.on('end', options.onEnd)
    }
  }

  /** Closes the client. */
  close(callback?: () => void): void {
    this._client.close(callback)
  }
}
