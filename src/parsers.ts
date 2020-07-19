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

import { Middleware } from 'flitz';
import { readStream } from './streams';

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data to 'body' property
 * of request context.
 * 
 * @returns {Middleware} The new middleware.
 */
export function body(): Middleware {
  return async (req, res, next) => {
    req.body = await readStream(req);

    next();
  };
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as JSON objct
 * to 'body' property of request context.
 * 
 * @returns {Middleware} The new middleware.
 */
export function json(): Middleware {
  return async (req, res, next) => {
    const data = await readStream(req);

    req.body = data.length ? JSON.parse(data.toString('utf8')) : null;

    next();
  };
}
