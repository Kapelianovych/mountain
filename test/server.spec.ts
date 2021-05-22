import { resolve } from 'path';
import { readFileSync } from 'fs';

import { server } from '../src';

describe('server', () => {
  const options = {
    key: readFileSync(resolve(__dirname, '../certs/key.pem')),
    cert: readFileSync(resolve(__dirname, '../certs/cert.pem')),
  };

  it('should create server instance', () => {
    expect(typeof server(options)).toBe('object');
  });

  it('should be callable', () => {
    expect(typeof server).toBe('function');
  });
});
