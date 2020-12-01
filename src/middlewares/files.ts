import { file } from '../plugins/respond';
import { resolve } from 'path';
import { constants } from 'http2';
import type { Middleware } from '../types';

/**
 * Serves static files from _dir_.
 * By default files are searched in current working directory.
 */
export function files(dir: string = ''): Middleware {
  return (stream, headers) => {
    const path = headers[constants.HTTP2_HEADER_PATH] as string;
		const method = headers[constants.HTTP2_HEADER_METHOD] as string;

    if (/.+\.\w[\w\d]*$/.test(path) && method === constants.HTTP2_METHOD_GET) {
      const absolutePath = resolve(
        process.cwd(),
        dir,
        path.startsWith('/') ? path.slice(1) : path
      );

      file(stream, absolutePath);
    }
  };
}
