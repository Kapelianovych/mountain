import { file } from '../plugins/respond';
import { resolve } from 'path';
import { constants } from 'http2';
import type { Middleware } from '../server';

export function files(dir: string = ''): Middleware {
  return (stream, headers) => {
    const path = headers[constants.HTTP2_HEADER_PATH] as string;

    if (/.+\.\w+$/.test(path)) {
      const absolutePath = resolve(
        process.cwd(),
        dir,
        path.startsWith('/') ? path.slice(1) : path
      );

      file(stream, absolutePath);
    }
  };
}
