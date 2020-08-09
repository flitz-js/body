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
import { safeLoad as loadYaml, YAMLException } from 'js-yaml';
import { EntityTooLargeError, ParseError } from './errors';
import { readStream } from './streams';

/**
 * Options for 'body()' function.
 */
export interface BodyOptions {
  /**
   * Defines the maximum size of the body, in bytes.
   */
  max?: CanBeNil<number>;
  /**
   * A custom handler, to tell the client, that the body is too big.
   */
  onMaxReached?: CanBeNil<RequestHandler>;
}

/**
 * Body options with parse error handling.
 */
export interface BodyOptionsWithParseErrorHandling extends BodyOptions {
  /**
   * A custom parse error handler.
   */
  onParseFailed?: CanBeNil<ParseErrorHandler>;
}

/**
 * Options for 'form()' function.
 */
export interface FormOptions extends BodyOptions {
}

/**
 * Options for 'json()' function.
 */
export interface JsonOptions extends BodyOptionsWithParseErrorHandling {
}

/**
 * Handles a body parse error.
 * 
 * @param {ParseErrorHandlerContext} context The context.
 */
export type ParseErrorHandler = (context: ParseErrorHandlerContext) => Promise<any>;

/**
 * A context of a parse error handler.
 */
export interface ParseErrorHandlerContext {
  /**
   * The error.
   */
  error: ParseError;
  /**
   * The request context.
   */
  request: Request;
  /**
   * The response context.
   */
  response: Response;
}

/**
 * Options for 'string()' function.
 */
export interface StringOptions extends BodyOptions {
}

/**
 * Options for 'yaml()' function.
 */
export interface YamlOptions extends BodyOptionsWithParseErrorHandling {
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data to 'body' property
 * of request context.
 * 
 * @params {CanBeNil<BodyOptions>} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function body(options?: CanBeNil<BodyOptions>): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = await readStream(req, {
      max: options?.max
    });

    next();
  }, options?.onMaxReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as key / value pairs
 * to 'body' property of request context.
 * 
 * @params {CanBeNil<FormOptions>} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function form(options?: CanBeNil<FormOptions>): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = querystring.parse(
      (await readStream(req, {
        max: options?.max
      })).toString('ascii')
    );

    next();
  }, options?.onMaxReached);
}

function getParseErrorHandler(options: CanBeNil<BodyOptionsWithParseErrorHandling>): ParseErrorHandler {
  let onParseFailed = options?.onParseFailed;
  if (!onParseFailed) {
    onParseFailed = async (ctx) => {
      if (!ctx.response.headersSent) {
        ctx.response.writeHead(400);
      }

      ctx.response.end();
    };
  }

  return onParseFailed;
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as JSON object
 * to 'body' property of request context.
 * 
 * @params {CanBeNil<JsonOptions>} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function json(options?: CanBeNil<JsonOptions>): Middleware {
  const onParseFailed = getParseErrorHandler(options);

  return withEntityTooLarge(async (request, response, next) => {
    const data = await readStream(request, {
      max: options?.max
    });

    try {
      request.body = data.length ? JSON.parse(data.toString('utf8')) : null;

      next();
    } catch (e) {
      if (e instanceof SyntaxError) {
        await onParseFailed({ error: new ParseError(e), request, response });
      } else {
        throw e;
      }
    }
  }, options?.onMaxReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body and writes the data as string
 * to 'body' property of request context.
 * 
 * @params {CanBeNil<StringOptions>} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function string(options?: CanBeNil<StringOptions>): Middleware {
  return withEntityTooLarge(async (req, res, next) => {
    req.body = (await readStream(req, {
      max: options?.max
    })).toString('utf8');

    next();
  }, options?.onMaxReached);
}

/**
 * Creates a new middleware that reads the complete
 * request body as YAML document and writes the data as JSON object
 * to 'body' property of request context.
 * 
 * @params {CanBeNil<YamlOptions>} [options] Custom options.
 * 
 * @returns {Middleware} The new middleware.
 */
export function yaml(options?: CanBeNil<YamlOptions>): Middleware {
  const onParseFailed = getParseErrorHandler(options);

  return withEntityTooLarge(async (request, response, next) => {
    const data = await readStream(request, {
      max: options?.max
    });

    try {
      request.body = data.length ? loadYaml(data.toString('utf8')) : null;

      next();
    } catch (e) {
      if (e instanceof YAMLException) {
        await onParseFailed({ error: new ParseError(e), request, response });
      } else {
        throw e;
      }
    }
  }, options?.onMaxReached);
}

function withEntityTooLarge(
  action: (request: Request, response: Response, next: NextFunction) => Promise<void>,
  onMaxReached: CanBeNil<RequestHandler>
): Middleware {
  if (!onMaxReached) {
    // default handler
    onMaxReached = async (req, res) => {
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
        await onMaxReached!(req, res);
      } else {
        throw err;
      }
    }
  };
}