import { readFileSync } from 'fs';

import { server } from '../src';

describe('server', () => {
  it('should create server instance', () => {
    expect(
      typeof server({
        // Certificates need to be present.
        key: readFileSync('certs/key.pem'),
        cert: readFileSync('certs/cert.pem'),
      })
    ).toBe('object');
  });
});
