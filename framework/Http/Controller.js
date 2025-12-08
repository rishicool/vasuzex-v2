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

  /**
   * Send created response (201)
   */
  created(res, data = null, message = 'Created successfully') {
    return new Response(res).created(data, message);
  }

  /**
   * Send bad request response (400)
   */
  badRequest(res, message = 'Bad request') {
    return new Response(res).error(message, 400);
  }

  /**
   * Send forbidden response (403)
   */
  forbidden(res, message = 'Forbidden') {
    return new Response(res).forbidden(message);
  }

  /**
   * Send server error response (500)
   */
  serverError(res, message = 'Internal Server Error') {
    return new Response(res).serverError(message);
  }

  /**
   * Send no content response (204)
   */
  noContent(res) {
    return new Response(res).noContent();
  }
}

export default Controller;
