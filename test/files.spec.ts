import { constants } from 'http2';

import { files } from '../src';

describe('files', () => {
  it('should be callable', () => {
    expect(typeof files).toBe('function');
  });

  it('should return get route', () => {
    expect(files().method).toBe(constants.HTTP2_METHOD_GET);
  });
});
