import mime from 'mime';
import { existsSync } from 'fs';
import { ContentTypeValue } from '../constants';
import { constants, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2';

export function headers(
  stream: ServerHttp2Stream,
  headers: OutgoingHttpHeaders = {}
): void {
  stream.respond(headers, { endStream: true });
}

export function text(
  stream: ServerHttp2Stream,
  payload: string,
  headers: OutgoingHttpHeaders = {}
): void {
  stream.respond({
    [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
    [constants.HTTP2_HEADER_CONTENT_TYPE]: ContentTypeValue.TEXT,
    ...headers,
  });
  stream.end(payload);
}

export function json<T extends object>(
  stream: ServerHttp2Stream,
  payload: T,
  headers: OutgoingHttpHeaders = {}
): void {
  stream.respond({
    [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
    [constants.HTTP2_HEADER_CONTENT_TYPE]: ContentTypeValue.JSON,
    ...headers,
  });

  stream.end(JSON.stringify(payload));
}

export function file(
  stream: ServerHttp2Stream,
  path: string,
  headers?: OutgoingHttpHeaders
): void {
  if (existsSync(path)) {
    stream.respondWithFile(
      path,
      {
        [constants.HTTP2_HEADER_STATUS]: constants.HTTP_STATUS_OK,
        [constants.HTTP2_HEADER_CONTENT_TYPE]:
          mime.getType(path) ?? ContentTypeValue.TEXT,
        // The content-length header field will be automatically set.
        ...headers,
      },
      {
        statCheck(stat, headers) {
          headers[
            constants.HTTP2_HEADER_LAST_MODIFIED
          ] = stat.mtime.toUTCString();
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
}