import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

import { ContentType } from '../../constants';

/**
 * Parses request with `application/x-www-form-urlencoded`.
 * @returns object with key/value pairs.
 */
export const urlencoded = async <T extends Record<string, string>>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Promise<T> =>
  new Promise<string>((resolve, reject) => {
    const contentTypeHeaderValue =
      headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

    const chunks: Array<string> = [];

    if (
      // Content-Type can contain charset field.
      !contentTypeHeaderValue.includes(ContentType.FORM_URLENCODED)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentType.FORM_URLENCODED}"`
        )
      );
    }

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  }).then((result) =>
    Array.from(new URLSearchParams(result).entries()).reduce(
      (params, [name, value]) => ({ ...params, [name]: value }),
      {} as T
    )
  );
