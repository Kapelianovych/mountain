import { ContentTypeValue } from '../../constants';
import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

export function json<T extends object>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    const chunks: Array<string> = [];

    if (
      headers[constants.HTTP2_HEADER_CONTENT_TYPE] !== ContentTypeValue.JSON
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${
            headers[constants.HTTP2_HEADER_CONTENT_TYPE]
          }". Expected "${ContentTypeValue.JSON}"`
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
