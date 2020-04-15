// @flow

import { sendError } from './send.mjs'

import type { Http2Request, Http2Response } from './server.mjs'

type Route = {|
  path: string | RegExp,
  method: string,
  notFound?: boolean,
  handle: (request: Http2Request, response: Http2Response) => void,
|}

export class Router {
  // Map<method, routes[]>
  _routes: Map<string, Route[]>
  _notFound: Route | void

  constructor(routes: Route[]) {
    this._routes = new Map()
    this._notFound = routes.find((route) => route.notFound)

    const routesWithoutNotFound = routes.filter((routes) => !routes.notFound)
    routesWithoutNotFound.forEach((route) => {
      const routesGroup = this._routes.get(route.method.toLowerCase())
      if (routesGroup) {
        routesGroup.push(route)
      } else {
        this._routes.set(route.method.toLowerCase(), [route])
      }
    })
  }

  deliver(): (request: Http2Request, response: Http2Response) => void {
    return (request: Http2Request, response: Http2Response) => {
      const path = request.headers[':path']
      const method = request.headers[':method']

      const routesGroup = this._routes.get(method.toLowerCase())

      if (routesGroup) {
        let neededRoute: Route | null = null

        for (const route of routesGroup) {
          const pathRegExp = new RegExp(
            typeof route.path === 'string'
              ? new RegExp(`^${route.path}$`)
              : route.path
          )
          if (
            pathRegExp.test(path) &&
            route.method.toLowerCase() === method.toLowerCase()
          ) {
            neededRoute = route
          }
        }

        if (neededRoute) {
          neededRoute.handle(request, response)
        } else {
          if (this._notFound) {
            this._notFound.handle(request, response)
          } else {
            sendError(request.stream, {
              status: 404,
              reason: `No route that match specified path: ${path}`,
            })
          }
        }
      } else {
        if (this._notFound) {
          this._notFound.handle(request, response)
        } else {
          sendError(request.stream, {
            status: 404,
            reason: `No route that match path "${path}" and method "${method}".`,
          })
        }
      }
    }
  }
}
