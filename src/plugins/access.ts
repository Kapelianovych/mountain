import { constants } from 'http2';

import { formData, json, text, urlencoded } from './body';
import {
  Context,
  Request,
  Response,
  FormDataDecoded,
  FormDataOptions,
} from '../types';

export enum BodyType {
  TEXT = 'text',
  JSON = 'json',
  FORM_DATA = 'form-data',
  URLENCODED = 'urlencoded',
}

export interface GetHeaderFunction {
  (name: ':path'): string;
  (name: ':method'): string;
  (name: ':scheme'): string;
  (name: ':protocol'): string;
  (name: ':authority'): string;
  (name: string): string | undefined;

  <T>(name: ':path', transformer: (value: string) => T): T;
  <T>(name: ':method', transformer: (value: string) => T): T;
  <T>(name: ':scheme', transformer: (value: string) => T): T;
  <T>(name: ':protocol', transformer: (value: string) => T): T;
  <T>(name: ':authority', transformer: (value: string) => T): T;
  <T>(name: string, transformer: (value: string | undefined) => T): T;
}

export interface GetBodyFunction {
  (): Promise<void>;
  (type: BodyType.TEXT): Promise<string>;
  <T extends object>(type: BodyType.JSON): Promise<T>;
  <T extends FormDataDecoded>(
    type: BodyType.FORM_DATA,
    options?: FormDataOptions
  ): Promise<T>;
  <T extends Record<string, string>>(type: BodyType.URLENCODED): Promise<T>;
}

export interface Accessor {
  body: GetBodyFunction;
  header: GetHeaderFunction;
}

export interface RequestAccessor extends Accessor {
  readonly path: string;
  readonly method: string;
  readonly parameters: ReadonlyArray<string>;
}

export interface ResponseAccessor extends Accessor {}

const access = (context: Context): Accessor => ({
  header: (name: string, transformer = (value: any) => value) =>
    transformer(context.headers[name]),
  body: ((type: BodyType, options?: FormDataDecoded) => {
    switch (type) {
      case 'text':
        return text(context.stream);
      case 'json':
        return json(context.stream, context.headers);
      case 'form-data':
        return formData(context.stream, context.headers, options);
      case 'urlencoded':
        return urlencoded(context.stream, context.headers);
      default:
        return Promise.resolve();
    }
  }) as GetBodyFunction,
});

export const accessRequest = (context: Request): RequestAccessor => ({
  ...access(context),
  path: context.headers[constants.HTTP2_HEADER_PATH] as string,
  method: context.headers[constants.HTTP2_HEADER_METHOD] as string,
  parameters: context.parameters,
});

export const accessResponse = (context: Response): ResponseAccessor => ({
  ...access(context),
});
