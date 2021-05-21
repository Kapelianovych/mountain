import {
  constants,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

export const createUrl = (
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): URL =>
  new URL(
    (headers.origin ??
      headers[constants.HTTP2_HEADER_SCHEME] +
        '://' +
        (headers[constants.HTTP2_HEADER_AUTHORITY] ??
          headers[constants.HTTP2_HEADER_HOST])) +
      headers[constants.HTTP2_HEADER_PATH]
  );

const removeTrailingSlash = (path: string) =>
  path.endsWith('/') ? path.slice(0, path.length - 1) : path;

const addLeadingSlash = (path: string) =>
  path.startsWith('/') ? path : '/' + path;

/**
 * Removes trailing slash character and adds
 * leading one.
 */
export const normalize = (path: string): string =>
  addLeadingSlash(removeTrailingSlash(path));

/** Adds RegExp's bounds to path. */
export const addBounds = (path: string): string => {
  let boundedPath = path.startsWith('^') ? path : `^${path}`;
  return boundedPath.endsWith('$') ? boundedPath : `${boundedPath}$`;
};
