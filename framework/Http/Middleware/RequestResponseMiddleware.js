/**
 * Request/Response Middleware
 * Wraps Express req/res with Laravel-style Request/Response
 */

import { Request } from '../Request.js';
import { Response } from '../Response.js';

export function requestResponseMiddleware(req, res, next) {
  // Wrap request
  req.request = () => new Request(req);

  // Wrap response
  req.response = () => new Response(res);

  // Add Laravel-style helpers directly to res
  res.success = (data, message, status) => new Response(res).success(data, message, status);
  res.error = (message, errors, status) => new Response(res).error(message, errors, status);
  res.created = (data, message) => new Response(res).created(data, message);
  res.validationError = (errors, message) => new Response(res).validationError(errors, message);
  res.notFound = (message) => new Response(res).notFound(message);
  res.unauthorized = (message) => new Response(res).unauthorized(message);
  res.forbidden = (message) => new Response(res).forbidden(message);

  next();
}

export default requestResponseMiddleware;
