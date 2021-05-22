import { cookies } from '../src';

describe('cookies', () => {
  it('should be callable', () => {
    expect(typeof cookies.create).toBe('function');
    expect(typeof cookies.parse).toBe('function');
  });

  it('should create strict cookie by default', () => {
    const cookie = cookies.create('id', '1');

    expect(cookie).toMatch(/id=1/);
    expect(cookie).toMatch(/SameSite=Strict/);
    // Path is encoded.
    expect(cookie).toMatch(/Path=%2F/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/HttpOnly/);
  });

  it('should just add boolean attribute without value', () => {
    const cookie = cookies.create('id', '1', { foo: true });

    expect(cookie).toMatch(/foo(?!=true)/);
  });

  it('should add attribute with its value', () => {
    const cookie = cookies.create('id', '1', { foo: 'baz' });

    expect(cookie).toMatch(/foo=baz/);
  });

  it('should parse cookie', () => {
    const cookie =
      'id=a3fWa; Expires=Thu, 21 Oct 2021 07:28:00 GMT; Secure; HttpOnly';

    const parsedCookie = cookies.parse(cookie);

    expect(parsedCookie).toEqual({
      id: 'a3fWa',
      Secure: true,
      HttpOnly: true,
      Expires: 'Thu, 21 Oct 2021 07:28:00 GMT',
    });
  });
});
