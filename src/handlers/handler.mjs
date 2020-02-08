// @flow

import { sendError } from '../send.mjs'

import type { Http2Request, Http2Response } from '../server.mjs'
import type Route from './route.mjs'

export default class Handler {
  +_routes: Route[]

  constructor(routes: Route[]) {
    this._routes = routes
  }

  set(): (request: Http2Request, response: Http2Response) => void {
    return (request: Http2Request, response: Http2Response) => {
      const path = request.headers[':path']
      const method = request.headers[':method']

      const route = this._routes.find(r => {
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
        const notFoundRoute = this._routes.find(route => route.isForNotFound)

        if (notFoundRoute) {
          notFoundRoute.handle(request, response)
        } else {
          sendError(request.stream, {
            status: 404,
            reason: `No route that match specified path: ${path}`
          })
        }
      }
    }
  }
}
