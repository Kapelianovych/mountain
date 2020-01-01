// @flow

import type { Http2Request, Http2Response } from '../server.mjs'

type RouteOptions = {
  path: string | RegExp,
  method: string,
  notFound?: boolean,
  handle: (request: Http2Request, response: Http2Response) => void,
}

export default class Route {
  /** @type {RouteOptions} */
  #options

  constructor(options: RouteOptions) {
    this.#options = options
  }

  get path() {
    return this.#options.path
  }

  get method() {
    return this.#options.method
  }

  get isForNotFound() {
    return this.#options.notFound || false
  }

  handle(request: Http2Request, response: Http2Response): void {
    this.#options.handle(request, response)
  }
}
