import { addBounds, createUrl, normalize } from '../src/utils/url';

describe('createUrl', () => {
  it('should create a valid URL', () => {
    const scheme = 'https';
    const domain = 'example.com';
    const path = '/foo';
    const search = '?baz=bar';
    const fragment = '#foo';

    const url = createUrl({
      ':scheme': scheme,
      ':authority': domain,
      ':path': path + search + fragment,
    });

    expect(url.protocol).toBe(scheme + ':');
    expect(url.hostname).toBe(domain);
    expect(url.pathname).toBe(path);
    expect(url.search).toBe(search);
    expect(url.hash).toBe(fragment);
  });

  it('should add leading slash to path and remove trailing one', () => {
    expect(normalize('foo/')).toBe('/foo');
  });

  it('should not change path if it has leading slash and does not have trailing one', () => {
    expect(normalize('/foo')).toBe('/foo');
  });

  it('should remove trailing slash if it exists', () => {
    expect(normalize('/foo/')).toBe('/foo');
  });

  it('should add bounds to path if there are not exist', () => {
    expect(addBounds('/foo')).toBe('^/foo$');
  });

  it('should not change path if it has bounds already', () => {
    expect(addBounds('^/foo$')).toBe('^/foo$');
  });

  it('should not touch start bound and should add trailing bound', () => {
    expect(addBounds('^/foo')).toBe('^/foo$');
  });

  it('should not touch trailing bound and should add leading bound', () => {
    expect(addBounds('/foo$')).toBe('^/foo$');
  });
});
