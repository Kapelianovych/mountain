import {
  constants,
  ServerHttp2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

import { FormDataDecoded, FormDataOptions } from '../types';
import { formData, json, text, urlencoded } from './body';

export enum BodyType {
  TEXT = 'text',
  JSON = 'json',
  FORM_DATA = 'form-data',
  URLENCODED = 'urlencoded',
}

export interface Body {
  (): Promise<void>;
  (type: BodyType.TEXT): Promise<string>;
  <T extends object>(type: BodyType.JSON): Promise<T>;
  <T extends FormDataDecoded>(
    type: BodyType.FORM_DATA,
    options?: FormDataOptions
  ): Promise<T>;
  <T extends Record<string, string>>(type: BodyType.URLENCODED): Promise<T>;
}

export interface Request {
  readonly path: string;
  readonly method: string;

  body: Body;
}

export const request = (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
): Request => ({
  path: headers[constants.HTTP2_HEADER_STATUS] as string,
  method: headers[constants.HTTP2_HEADER_METHOD] as string,

  body: ((type: BodyType, options?: FormDataDecoded) => {
    switch (type) {
      case 'text':
        return text(stream);
      case 'json':
        return json(stream, headers);
      case 'form-data':
        return formData(stream, headers, options);
      case 'urlencoded':
        return urlencoded(stream, headers);
      default:
        return Promise.resolve();
    }
  }) as Body,
});
