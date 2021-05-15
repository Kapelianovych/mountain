import { resolve } from 'path';

import { request } from '../plugins/request';
import { response } from '../plugins/response';
import { normalize } from '../utils';
import { get, Route } from '../controllers';

const FILE_EXTENSION_REGEXP = /.+\.\w[\w\d]*$/;

/**
 * Serves static files from _dir_.
 * By default files are searched in current working directory.
 */
export const files = (dir: string = ''): Route =>
  get(normalize(String(FILE_EXTENSION_REGEXP)), (stream, headers) => {
    const path = request(stream, headers).path;

    response(stream).file(
      resolve(dir, path.startsWith('/') ? path.slice(1) : path)
    );
  });
