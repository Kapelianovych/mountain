import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

import { ContentType } from '../../constants';

/** Parses request body as `JSON` format. */
export const json = async <T extends object>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Promise<T> =>
  new Promise<string>((resolve, reject) => {
    const contentTypeHeaderValue =
      headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

    const chunks: Array<string> = [];

    if (
      // Value of Content-Type header can contain charset field.
      !contentTypeHeaderValue.includes(ContentType.JSON)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentType.JSON}"`
        )
      );
    }

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  }).then<T>(JSON.parse);
