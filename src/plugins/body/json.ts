import { ContentTypeValue } from '../../constants';
import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

/** Parses request body as `JSON` format. */
export function json<T extends object>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Promise<T> {
  const contentTypeHeaderValue =
    headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

  return new Promise<string>((resolve, reject) => {
    const chunks: Array<string> = [];

    if (
      // Value of Content-Type header can contain charset field.
      !contentTypeHeaderValue.includes(ContentTypeValue.JSON)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentTypeValue.JSON}"`
        )
      );
    }

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  }).then<T>(JSON.parse);
}
