// @flow

import type { Http2Request, Http2Response } from '../server.mjs'

type RouteOptions = {
  path: string | RegExp,
  method: string,
  notFound?: boolean,
  handle: (request: Http2Request, response: Http2Response) => void,
}

export default class Route {
  +_options: RouteOptions

  constructor(options: RouteOptions) {
    this._options = options
  }

  get path() {
    return this._options.path
  }

  get method() {
    return this._options.method
  }

  get isForNotFound() {
    return this._options.notFound || false
  }

  handle(request: Http2Request, response: Http2Response): void {
    this._options.handle(request, response)
  }
}
