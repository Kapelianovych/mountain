import { parse } from 'querystring';
import { ContentTypeValue } from '../../constants';
import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

/**
 * Parses request with `application/x-www-form-urlencoded`.
 * @returns object with key/value pairs.
 */
export async function urlencoded<T extends Record<string, string>>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Promise<T> {
  const contentTypeHeaderValue =
    headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

  return new Promise<string>((resolve, reject) => {
    const chunks: Array<string> = [];

    if (
      // Content-Type can contain charset field.
      !contentTypeHeaderValue.includes(ContentTypeValue.FORM_URLENCODED)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentTypeValue.FORM_URLENCODED}"`
        )
      );
    }

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  }).then((result) => ({ ...parse(result) } as T));
}
