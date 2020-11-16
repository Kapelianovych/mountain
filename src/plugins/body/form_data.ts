import path from 'path';
import Busboy from 'busboy';
import { appendFileSync } from 'fs';
import { ContentTypeValue } from '../../constants';
import {
  constants,
  Http2Stream,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
} from 'http2';

type FileData = {
  mime: string;
  path: string;
  filename: string;
  encoding: string;
};

export interface FormDataDecoded {
  [index: string]: string | FileData;
}

interface FormDataOptions {
  directory?: string;
}

export async function formData<T extends FormDataDecoded>(
  stream: Http2Stream,
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader,
  options: FormDataOptions = {}
): Promise<T> {
  const contentTypeHeaderValue =
    headers[constants.HTTP2_HEADER_CONTENT_TYPE] ?? '';

  return new Promise<T>((resolve, reject) => {
    const formDataResponse = {} as FormDataDecoded;

    if (
      // Content-Type can contain charset and boundary fields.
      !contentTypeHeaderValue.includes(ContentTypeValue.MULTIPART_FORM_DATA)
    ) {
      reject(
        new Error(
          `Unexpected Content-Type - "${contentTypeHeaderValue}". Expected "${ContentTypeValue.MULTIPART_FORM_DATA}"`
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
}
