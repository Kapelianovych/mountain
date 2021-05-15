/**
 * Removes trailing slash character and adds
 * leading one.
 */
export const normalize = (path: string): string =>
  path.startsWith('/')
    ? path.endsWith('/')
      ? path.slice(0, path.length - 1)
      : path
    : '/' + path;

/** Adds RegExp's bounds to string. */
export const addBounds = (path: string): string => {
  let boundedPath = path.startsWith('^') ? path : `^${path}`;
  return boundedPath.endsWith('$') ? boundedPath : `${boundedPath}$`;
};
