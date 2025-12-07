/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

import { BaseController } from './BaseController.js';
import { AuthService } from '../services/AuthService.js';
import { LoginRequest, RegisterRequest } from '../requests/AuthRequests.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req, res) => {
    try {
      // Validate request
      const { error, value } = RegisterRequest.validate(req.body);
      if (error) {
        return this.validationError(res, error.details);
      }

      // Register user
      const result = await this.authService.register(value);

      return this.success(res, result, 'Registration successful', 201);
    } catch (error) {
      console.error('Registration error:', error);
      return this.error(res, error.message, 400);
    }
  };

  /**
   * POST /api/auth/login
   * Login user
   */
  login = async (req, res) => {
    try {
      // Validate request
      const { error, value } = LoginRequest.validate(req.body);
      if (error) {
        return this.validationError(res, error.details);
      }

      // Login user
      const result = await this.authService.login(value.email, value.password);

      return this.success(res, result, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return this.unauthorized(res, error.message);
    }
  };

  /**
   * GET /api/auth/me
   * Get current user
   */
  me = async (req, res) => {
    try {
      const user = req.user; // Set by auth middleware

      return this.success(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Get user error:', error);
      return this.error(res, error.message);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user
   */
  logout = async (req, res) => {
    try {
      // In JWT, logout is handled client-side by removing the token
      // Here you can add token to blacklist if needed

      return this.success(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return this.error(res, error.message);
    }
  };
}
