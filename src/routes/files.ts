import { resolve } from 'path';

import { normalize } from '../utils';
import { get, Route } from '../route';
import { responseFor } from '../plugins/response';
import { accessRequest } from '../plugins/access';

const FILE_EXTENSION_REGEXP = /.+\.\w[\w\d]*$/;

/**
 * Serves static files from _dir_.
 * By default files are searched in current working directory.
 */
export const files = (dir: string = ''): Route =>
  get(normalize(String(FILE_EXTENSION_REGEXP)), (request) => {
    const path = accessRequest(request).path;

    responseFor(request).file(
      resolve(dir, path.startsWith('/') ? path.slice(1) : path)
    );
  });
