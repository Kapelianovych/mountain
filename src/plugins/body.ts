import { Http2Stream } from 'http2';

export interface Body {
  json<T>(): Promise<T>;
  raw(): Promise<string>;
}

export function body(stream: Http2Stream): Body {
  const rawBody = new Promise<string>((resolve) => {
    const chunks: Array<string> = [];

    stream
      .setEncoding('utf8')
      .on('data', (chunk: string) => chunks.push(chunk));

    stream.on('end', () => resolve(chunks.join('')));
  });

  return {
    json() {
      return rawBody.then(JSON.parse);
    },
    raw() {
      return rawBody;
    },
  };
}
