import { constants } from 'http2';

import { controller, get, put } from '../src';

describe('controllers', () => {
  it('should create get route', () => {
    const route = get('/', () => {});

    expect(typeof route).toBe('object');
    expect(Object.keys(route).length).toBe(3);
    expect(route.path).toBe('^/$');
    expect(route.method).toBe(constants.HTTP2_METHOD_GET);
    expect(typeof route.handle).toBe('function');
  });

  it('controller should return array of routes with correct path', () => {
    const testController = controller('/test');
    const routes = testController(put('/ho', () => {}));

    expect(routes).toBeInstanceOf(Array);
    expect(routes[0].path).toMatch(/\/test\/ho/);
  });
});
