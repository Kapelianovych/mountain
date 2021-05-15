import { Http2Stream } from 'http2';

/** Parses request body as `UTF8` string. */
export const text = async (stream: Http2Stream): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const chunks: Array<string> = [];

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  });
