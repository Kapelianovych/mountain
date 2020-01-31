// @flow

import { connect, type Http2Headers, type Http2Settings } from 'http2'

export type ClientOptions = {
  url: string,
  maxSessionMemory?: number,
  settings?: Http2Settings
}

type ClientEventType = 'altsvc' | 'origin'

/** Not suitable for production yet! */
export default class Client {
  /** @type {ClientHttp2Session} */
  #client

  constructor(options: ClientOptions) {
    const { url, maxSessionMemory = 10, settings } = options

    this.#client = connect(url, {
      maxSessionMemory,
      settings
    })
  }

  /**
   * Add listener to client's events.
   */
  _on(eventType: ClientEventType, listener: (...arguments) => void): void {
    this.#client.on(eventType, listener)
  }

  onAltsvc(listener: (alt: string, origin: string, streamId: number) => void): void {
    this._on('altsvc', listener)
  }

  onOrigin(listener: (origins: string[]) => void): void {
    this._on('origin', listener)
  }

  request(headers: Http2Headers, options: {}): void {
}
}
