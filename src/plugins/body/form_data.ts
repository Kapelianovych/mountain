import path from 'path';
import { appendFileSync } from 'fs';
import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

import Busboy from 'busboy';

import { ContentType } from '../../constants';
import { FormDataDecoded, FormDataOptions } from '../../types';

/**
 * Parses request with `multipart/form-data`.
 * All files will be written to disk in _current
 * working directory_. You can specify deeper path
 * by providing **options.directory** field.
 * @returns object with key/value pairs. Value can
 * be either text data or object with file stats.
 */
export const formData = <T extends FormDataDecoded>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  options: FormDataOptions = {}
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const contentTypeHeaderValue =
      headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

    const formDataResponse = {} as FormDataDecoded;

    if (
      // Content-Type can contain charset and boundary fields.
      !contentTypeHeaderValue.includes(ContentType.MULTIPART_FORM_DATA)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentType.MULTIPART_FORM_DATA}"`
        )
      );
    }

    try {
      stream.pipe(
        new Busboy({ headers })
          .on('file', (fieldname, file, filename, encoding, mime) => {
            const filePath = path.resolve(
              process.cwd(),
              options.directory ?? '',
              filename
            );

            file
              .on('data', (chunk: Buffer) => {
                // IMPROVEME: maybe can be improved for transfering
                // large data to any destination.
                appendFileSync(filePath, chunk);
              })
              .on('end', () => {
                formDataResponse[fieldname] = {
                  mime,
                  path: filePath,
                  filename,
                  encoding,
                };
              });
          })
          .on('field', (fieldname: string, value: string) => {
            formDataResponse[fieldname] = value;
          })
          .on('finish', () => {
            resolve(formDataResponse as T);
          })
      );
    } catch (error) {
      reject(error);
    }
  });
