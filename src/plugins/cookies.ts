import type { Cookies } from '../types';

const COOKIE_DELIMETER = '; ';
const COOKIE_PAIR_DELIMETER = '=';

const defaultAttributes: Cookies = {
  Path: '/',
  SameSite: 'Strict',
  Secure: true,
  HttpOnly: true,
};

/** Parses cookies from headers to JavaScript object. */
export function parse(data: string): Cookies {
  return data.split(COOKIE_DELIMETER).reduce((cookieObject, pair) => {
    const [key, value] = pair.split(COOKIE_PAIR_DELIMETER);
    cookieObject[decodeURIComponent(key)] =
      value === undefined ? true : decodeURIComponent(value);
    return cookieObject;
  }, {} as Cookies);
}

/**
 * Creates cookie string from key/value pair
 * and optional _attributes_ object.
 */
export function create(
  key: string,
  value: string,
  attributes: Cookies = {}
): string {
  return Object.entries({ ...defaultAttributes, ...attributes }).reduce(
    (data, [key, value]) => {
      return `${data}${COOKIE_DELIMETER}${encodeURIComponent(key)}${
        value === true
          ? ''
          : `${COOKIE_PAIR_DELIMETER}${encodeURIComponent(value)}`
      }`;
    },
    `${encodeURIComponent(key)}${COOKIE_PAIR_DELIMETER}${encodeURIComponent(
      value
    )}`
  );
}
