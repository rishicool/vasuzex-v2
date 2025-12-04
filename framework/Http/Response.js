/**
 * Response - Enhanced Express Response
 * Laravel-like response helper methods
 */
export class Response {
  constructor(res) {
    this.res = res;
  }

  /**
   * Send JSON response
   */
  json(data, status = 200) {
    return this.res.status(status).json(data);
  }

  /**
   * Send success response
   */
  success(data = null, message = 'Success', status = 200) {
    return this.json({
      success: true,
      message,
      data,
    }, status);
  }

  /**
   * Send error response
   */
  error(message = 'Error', status = 400, errors = null) {
    return this.json({
      success: false,
      message,
      errors,
    }, status);
  }

  /**
   * Send created response (201)
   */
  created(data = null, message = 'Created') {
    return this.success(data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  noContent() {
    return this.res.status(204).send();
  }

  /**
   * Send not found response (404)
   */
  notFound(message = 'Not Found') {
    return this.error(message, 404);
  }

  /**
   * Send unauthorized response (401)
   */
  unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  /**
   * Send validation error response (422)
   */
  validationError(errors, message = 'Validation Error') {
    return this.error(message, 422, errors);
  }

  /**
   * Send server error response (500)
   */
  serverError(message = 'Internal Server Error') {
    return this.error(message, 500);
  }

  /**
   * Set response status
   */
  status(code) {
    this.res.status(code);
    return this;
  }

  /**
   * Set response header
   */
  header(key, value) {
    this.res.setHeader(key, value);
    return this;
  }

  /**
   * Send redirect response
   */
  redirect(url, status = 302) {
    this.res.redirect(status, url);
  }

  /**
   * Get underlying Express response
   */
  getResponse() {
    return this.res;
  }
}

export default Response;
