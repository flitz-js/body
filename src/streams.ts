// Copyright 2020-present Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { CanBeNil } from 'flitz';
import { EntityTooLargeError } from './errors';

/**
 * Options for 'readStream()' function.
 */
export interface ReadStreamOptions {
  /**
   * Defines the maximum size for the stream, in bytes.
   */
  max?: CanBeNil<number>;
}

/**
 * Reads all data from a stream.
 *
 * @param {NodeJS.ReadableStream} stream The source stream.
 * @param {CanBeNil<ReadStreamOptions>} [options] Custom options.
 * 
 * @returns {Promise<Buffer>} The promise with the read data.
 */
export function readStream(stream: NodeJS.ReadableStream, options?: CanBeNil<ReadStreamOptions>): Promise<Buffer> {
  const max = options?.max;
  if (max) {
    if (typeof max !== 'number') {
      throw new TypeError('options.max must be a number');
    }

    if (max < 0) {
      throw new TypeError('options.max must be a greater than or equal 0');
    }
  }

  let concatData: (data: Buffer, chunk: Buffer) => Buffer;
  if (max) {
    // with max length
    concatData = (d, c) => {
      if (d.length + c.length > max) {
        throw new EntityTooLargeError();
      }

      return Buffer.concat([d, c]);
    };
  } else {
    concatData = (d, c) => Buffer.concat([d, c]);
  }

  return new Promise((resolve, reject) => {
    stream.once('error', err => {
      reject(err);
    });

    let data = Buffer.alloc(0);

    stream.on('data', (chunk: Buffer) => {
      try {
        data = concatData(data, chunk);
      } catch (e) {
        reject(e);
      }
    });

    stream.once('end', () => {
      resolve(data);
    });
  });
}