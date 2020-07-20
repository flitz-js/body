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

import querystring from 'querystring';
import { CanBeNil, Middleware, NextFunction, Request, RequestHandler, Response } from 'flitz';
import { EntityTooLargeError } from './errors';
import { readStream } from './streams';

/**
 * Options for 'body()' function.
 */
export interface BodyOptions {
  /**
   * Defines the maximum size of the body, in bytes.
   */
  maxLength?: CanBeNil<number>;
  /**
   * A custom handler, to tell the client, that the body is too big.
   */
  onMaxLengthReached?: CanBeNil<RequestHandler>;
}

/**
 * Options for 'form()' function.
 */
export interface FormOptions extends BodyOptions {
}

/**
 * Options for 'json()' function.
 */
export interface JsonOptions extends BodyOptions {
}

/**
 * Options for 'string()' function.
 */
export interface StringOptions extends BodyOptions {
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data to 'body' property
 * of request context.
 * 
 * @params {BodyOptions} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function body(options?: BodyOptions): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = await readStream(req, {
      maxLength: options?.maxLength
    });

    next();
  }, options?.onMaxLengthReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as key / value pairs
 * to 'body' property of request context.
 * 
 * @params {FormOptions} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function form(options?: FormOptions): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = querystring.parse(
      (await readStream(req, {
        maxLength: options?.maxLength
      })).toString('utf8')
    );

    next();
  }, options?.onMaxLengthReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as JSON object
 * to 'body' property of request context.
 * 
 * @params {JsonOptions} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function json(options?: JsonOptions): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    const data = await readStream(req, {
      maxLength: options?.maxLength
    });

    req.body = data.length ? JSON.parse(data.toString('utf8')) : null;

    next();
  }, options?.onMaxLengthReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as string
 * to 'body' property of request context.
 * 
 * @params {StringOptions} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function string(options?: StringOptions): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = (await readStream(req, {
      maxLength: options?.maxLength
    })).toString('utf8');

    next();
  }, options?.onMaxLengthReached);
}

function withEntityTooLarge(
  action: (request: Request, response: Response, next: NextFunction) => Promise<void>,
  onEntityTooLarge: CanBeNil<RequestHandler>
): Middleware {
  if (!onEntityTooLarge) {
    // default handler
    onEntityTooLarge = async (req, res) => {
      if (!res.headersSent) {
        res.writeHead(413);
      }

      res.end();
    };
  }

  return async (req, res, next) => {
    try {
      await action(req, res, next);
    } catch (err) {
      if (err instanceof EntityTooLargeError) {
        await onEntityTooLarge!(req, res);
      } else {
        throw err;
      }
    }
  };
}