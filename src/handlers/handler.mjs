// @flow

import Route from './route.mjs'

import type { Http2Request, Http2Response } from '../server.mjs'

export default class Handler {
  /** @type {Route[]} */
  #routes

  constructor(routes: Route[]) {
    this.#routes = routes
  }

  set(): (request: Http2Request, response: Http2Response) => void {
    return (request: Http2Request, response: Http2Response) => {
      const path = request.headers[':path']
      const method = request.headers[':method']

      const route = this.#routes.find(r => {
        const pathRegExp =
          typeof r.path === 'string' ? new RegExp(`^${r.path}$`) : r.path

        return (
          pathRegExp.test(path) &&
          r.method.toLocaleLowerCase() === method.toLocaleLowerCase()
        )
      })

      if (route) {
        route.handle(request, response)
      } else {
        const notFoundRoute = this.#routes.find(route => route.isForNotFound)

        if (notFoundRoute) {
          notFoundRoute.handle(request, response)
        } else {
          console.warn(`No route that match specified path: ${path}`)
        }
      }
    }
  }
}
