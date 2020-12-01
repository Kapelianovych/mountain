import type { Http2Stream } from 'http2';

/** Parses reauest body as `UTF8` string. */
export async function text(stream: Http2Stream): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const chunks: Array<string> = [];

    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('data', chunks.push.bind(chunks))
      .on('end', () => resolve(chunks.join('')));
  });
}
