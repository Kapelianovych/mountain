# 0.4.0

- Rename `Router.set` method to `Router.deliver`.
- Rewrite internal behavior of `Router`.

## 0.3.0

- Remove `setTimeout` method from `Server` instance. Use `timeout` parameter in `Server`'s constructor.
- Add **parallel** and **threads** parameters to `Server`'s constructor.
- Refactor `Server` class to work in cluster mode.
- Make `onResponse`, `onData` and `onEnd` callbacks of `Client.request` method optional.

## 0.2.0

- Remove `rootDir` parameter from `Server` constructor.
- Remove `Route` class - it is now plain object that was passed to `Route` constructor.
- Rename `Handler` to `Router`.
- Temporary rid of *push* ability of `HTTP/2` server.
- Fix error when file was not found on server. It caused closing connection before.
- Library now export `Client`.

## 0.1.5

- Minify distribution code.
- Make small internal changes that do not touch API.

## 0.1.4

- Merge parameters of `Server` constructor.
- Correct types.
- Add **gulp** build system.

## 0.1.3

- Write README. 

## 0.1.2

- Write `Router` and `Route`.

## 0.1.1

- Add LICENSE.

## 0.1.0

- Creates main classes.