import { client } from '../src';

describe('client', () => {
  it('should be callable', () => {
    expect(typeof client).toBe('function');
  });

  it('should throws with invalid authority', () => {
    expect(client).toThrow();
  });

  it('should return an object', () => {
    expect(typeof client('https://google.com')).toBe('object');
  });
});
