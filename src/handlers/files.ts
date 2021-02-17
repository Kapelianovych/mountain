import { file } from '../plugins/respond';
import { resolve } from 'path';
import { constants } from 'http2';
import type { Handler } from '../types';

const FILE_EXTENSION_REGEXP = /.+\.\w[\w\d]*$/;

/**
 * Serves static files from _dir_.
 * By default files are searched in current working directory.
 */
export function files(dir: string = ''): Handler {
  return (stream, headers) => {
    const path = headers[constants.HTTP2_HEADER_PATH] as string;
    const method = headers[constants.HTTP2_HEADER_METHOD] as string;

    if (
      FILE_EXTENSION_REGEXP.test(path) &&
      method === constants.HTTP2_METHOD_GET
    ) {
      const absolutePath = resolve(
        process.cwd(),
        dir,
        path.startsWith('/') ? path.slice(1) : path
      );

      file(stream, absolutePath);
    }
  };
}
