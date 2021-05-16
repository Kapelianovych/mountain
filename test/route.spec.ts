import { constants } from 'http2';

import { group, get, put, route, post } from '../src';

describe('routes', () => {
  it('route created by route function should be equal to its shorter equivalent', () => {
    const postRoute = route(
      constants.HTTP2_METHOD_POST,
      '/to',
      expect.any(Function)
    );
    const postRoute2 = post('/to', () => {});

    expect(postRoute2).toMatchObject(postRoute);
  });

  it('should create get route', () => {
    const route = get('/', () => {});

    expect(route).toMatchObject({
      path: '^/$',
      method: constants.HTTP2_METHOD_GET,
      handle: expect.any(Function),
    });
  });

  it('group should return array of routes with correct path', () => {
    const testGroup = group('/test');
    const routes = testGroup(put('/ho', () => {}));

    expect(routes).toBeInstanceOf(Array);
    expect(routes).toEqual([
      {
        method: constants.HTTP2_METHOD_PUT,
        path: '^/test/ho$',
        handle: expect.any(Function),
      },
    ]);
  });
});
