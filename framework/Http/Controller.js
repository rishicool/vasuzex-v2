import { Request } from './Request.js';
import { Response } from './Response.js';

/**
 * Controller - Base controller class
 * Laravel-style controller with request/response helpers
 */
export class Controller {
  /**
   * Wrap Express req/res with framework classes
   */
  wrap(req, res) {
    return {
      request: new Request(req),
      response: new Response(res),
    };
  }

  /**
   * Send success response
   */
  success(res, data = null, message = 'Success', status = 200) {
    return new Response(res).success(data, message, status);
  }

  /**
   * Send error response
   */
  error(res, message = 'Error', status = 400, errors = null) {
    return new Response(res).error(message, status, errors);
  }

  /**
   * Send validation error response
   */
  validationError(res, errors, message = 'Validation Error') {
    return new Response(res).validationError(errors, message);
  }

  /**
   * Send not found response
   */
  notFound(res, message = 'Not Found') {
    return new Response(res).notFound(message);
  }

  /**
   * Send unauthorized response
   */
  unauthorized(res, message = 'Unauthorized') {
    return new Response(res).unauthorized(message);
  }
}

export default Controller;
