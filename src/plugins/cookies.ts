export interface Attributes {
  readonly Path?: string;
  readonly Domain?: string;
  readonly Secure?: boolean;
  readonly Expires?: string;
  readonly HttpOnly?: boolean;
  readonly SameSite?: 'Strict' | 'Lax' | 'None';
  readonly 'Max-Age'?: number | string;
}

export type Cookies = Attributes & { [key: string]: string | boolean };

const COOKIE_DELIMETER = '; ';
const COOKIE_PAIR_DELIMETER = '=';

const defaultAttributes: Cookies = {
  Path: '/',
  Secure: true,
  HttpOnly: true,
  SameSite: 'Strict',
};

/** Parses cookies from headers to JavaScript object. */
export const parse = (data: string): Cookies =>
  data.split(COOKIE_DELIMETER).reduce((cookieObject, pair) => {
    const [key, value] = pair.split(COOKIE_PAIR_DELIMETER);
    cookieObject[decodeURIComponent(key)] =
      value === undefined ? true : decodeURIComponent(value);
    return cookieObject;
  }, {} as Cookies);

/**
 * Creates cookie string from key/value pair
 * and optional _attributes_ object.
 *
 * By default, `Path` attribute is set to **\/** URL.
 * That means all requests to server will include that cookie.
 * It is recommended to set `Path` attribute manually.
 *
 * Also by default `Secure`, `HttpOnly` and `SameSite=Strict`
 * attributes are defined.
 */
export const create = (
  key: string,
  value: string,
  attributes: Cookies = {}
): string =>
  Object.entries({ ...defaultAttributes, ...attributes }).reduce(
    (data, [key, value]) =>
      `${data}${COOKIE_DELIMETER}${encodeURIComponent(key)}${
        value === true
          ? ''
          : `${COOKIE_PAIR_DELIMETER}${encodeURIComponent(value)}`
      }`,
    `${encodeURIComponent(key)}${COOKIE_PAIR_DELIMETER}${encodeURIComponent(
      value
    )}`
  );
