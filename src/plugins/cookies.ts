import { isNothing } from '@fluss/core';

interface Attributes {
  Path?: string;
  Domain?: string;
  Secure?: boolean;
  Expires?: string;
  HttpOnly?: boolean;
  SameSite?: 'Strict' | 'Lax' | 'None';
  'Max-Age'?: number | string;
}

type Cookies = Attributes & { [key: string]: string | boolean };

const COOKIE_DELIMETER = '; ';

const defaultAttributes: Cookies = {
  Path: '/',
  SameSite: 'Strict',
  Secure: true,
  HttpOnly: true,
};

export function parse(data: string): Cookies {
  return data.split(COOKIE_DELIMETER).reduce((cookieObject, pair) => {
    const [key, value] = pair.split('=');
    cookieObject[decodeURIComponent(key)] = isNothing(value)
      ? true
      : decodeURIComponent(value);
    return cookieObject;
  }, {} as Cookies);
}

export function create(
  key: string,
  value: string,
  attributes: Cookies = {}
): string {
  return Object.entries({ ...defaultAttributes, ...attributes }).reduce(
    (data, [key, value]) => {
      return `${data}${COOKIE_DELIMETER}${encodeURIComponent(key)}${
        value === true ? '' : `=${encodeURIComponent(value)}`
      }`;
    },
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  );
}
