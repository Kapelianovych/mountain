// @flow

import { connect, type Http2Headers } from 'http2'

export type ClientOptions = {
  url: string
}

/** Not suitable for production yet! */
export default class Client {
  #client

  constructor(options: ClientOptions) {
    const { url } = options

    this.#client = connect(url)
  }

  request(headers: Http2Headers): void {

  }
}
