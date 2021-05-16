import { existsSync } from 'fs';
import { constants, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2';

import mime from 'mime';

import { Request } from '../types';
import { ContentType } from '../constants';

export interface ResponseBuilder {
  /** Sends response to client. */
  end: () => void;
  /** Define chunks of body to be sent to client. */
  body: (chunk: string) => ResponseBuilder;
  /** Sends JSON to client. */
  json: (payload: object) => void;
  /**
   * Sends file to client. _path_ should be an
   * absolute path to file.
   */
  file: (path: string) => void;
  /** Define a header for response. */
  header: (name: string, value: string) => ResponseBuilder;
}

const createResponse = (
  stream: ServerHttp2Stream,
  headers: OutgoingHttpHeaders,
  body: ReadonlyArray<string>
): ResponseBuilder => ({
  header: (name, value) =>
    createResponse(stream, { ...headers, [name]: value }, body),

  body: (chunk) => createResponse(stream, headers, body.concat(chunk)),

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
    body.forEach((chunk) => stream.write(chunk));
    stream.end();
  },
});

export const responseFor = ({ stream }: Request): ResponseBuilder =>
  createResponse(stream, {}, []);
