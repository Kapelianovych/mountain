import { existsSync } from 'fs';
import { constants, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2';

import mime from 'mime';

import { ContentType } from '../constants';

export interface Response {
  end: () => void;
  body: (text: string) => Response;
  json: (payload: object) => void;
  file: (path: string) => void;
  header: (name: string, value: string) => Response;
}

const createResponse = (
  stream: ServerHttp2Stream,
  headers: OutgoingHttpHeaders,
  body: ReadonlyArray<string>
): Response => ({
  header: (name, value) =>
    createResponse(stream, { ...headers, [name]: value }, body),

  body: (text) => createResponse(stream, headers, body.concat(text)),

  json: (payload) => {
    stream.respond({
      [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
      [constants.HTTP2_HEADER_CONTENT_TYPE]: ContentType.JSON,
      ...headers,
    });

    stream.end(JSON.stringify(payload));
  },

  file: (path) => {
    if (existsSync(path)) {
      stream.respondWithFile(
        path,
        {
          [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
          [constants.HTTP2_HEADER_CONTENT_TYPE]:
            mime.getType(path) ?? ContentType.TEXT,
          // The content-length header field will be automatically set.
          ...headers,
        },
        {
          statCheck(stat, headers) {
            headers[constants.HTTP2_HEADER_LAST_MODIFIED] =
              stat.mtime.toUTCString();
          },
        }
      );
    } else {
      stream.respond(
        {
          [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_NOT_FOUND,
        },
        { endStream: true }
      );
    }
  },

  end: () => {
    stream.respond({
      [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
      ...(body.length > 0
        ? { [constants.HTTP2_HEADER_CONTENT_TYPE]: ContentType.TEXT }
        : {}),
      ...headers,
    });
    body.forEach((text) => stream.write(text));
    stream.end();
  },
});

export const response = (stream: ServerHttp2Stream): Response =>
  createResponse(stream, {}, []);
