/**
 * API Templates
 * Templates for API-specific files (controllers, models, routes, etc.)
 */

/**
 * Generate BaseController
 */
export function generateBaseControllerTemplate() {
  return `/**
 * Base Controller
 * Extends framework Controller with app-specific helpers
 */

import { Controller } from 'vasuzex';

export class BaseController extends Controller {
  /**
   * Paginate response helper
   */
  paginate(res, data, total, page = 1, perPage = 15) {
    const lastPage = Math.ceil(total / perPage);
    return this.success(res, {
      items: data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        hasMore: page < lastPage,
      },
    });
  }
}
`;
}

/**
 * Generate AuthController
 */
export function generateAuthControllerTemplate() {
  return `/**
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
`;
}

/**
 * Generate User model
 */
export function generateUserModelTemplate() {
  return `/**
 * User Model
 * Can extend centralized models or create app-specific models
 */

import { Model } from 'guruorm';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await this.query().where('email', email).first();
  }
}
`;
}

/**
 * Generate AuthService
 */
export function generateAuthServiceTemplate() {
  return `/**
 * Authentication Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Import from centralized models (5 levels up: services→src→api→{name}→apps→root)
import { User } from '../../../../../database/models/User.js';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data) {
    // Check if user already exists
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return {
      user,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
`;
}

/**
 * Generate auth middleware
 */
export function generateAuthMiddlewareTemplate() {
  return `/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */

import { AuthService } from '../services/AuthService.js';
// Import from centralized models (5 levels up: middleware→src→api→{name}→apps→root)
import { User } from '../../../../../database/models/User.js';

export async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password
    delete user.password;

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
}
`;
}

/**
 * Generate error handler middleware
 */
export function generateErrorHandlerTemplate() {
  return `/**
 * Global Error Handlers
 */

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
}

/**
 * Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.APP_ENV === 'development' && { stack: err.stack }),
  });
}
`;
}

/**
 * Generate AuthRequests validators
 */
export function generateAuthRequestsTemplate() {
  return `/**
 * Authentication Request Validators
 */

import Joi from 'joi';

export const RegisterRequest = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const LoginRequest = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
`;
}

/**
 * Generate auth routes
 */
export function generateAuthRoutesTemplate() {
  return `/**
 * Authentication Routes
 */

import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

export const authRoutes = router;
`;
}

/**
 * Generate routes/index.js
 */
export function generateRoutesIndexTemplate() {
  return `/**
 * Route Registry
 * Central place to register all routes
 */

import { authRoutes } from './auth.routes.js';
import postRoutes from './post.routes.js';

/**
 * Health check route (can be used separately)
 */
export const healthRoutes = (req, res) => {
  res.json({
    success: true,
    service: process.env.APP_NAME,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get all routes with their base paths
 * @returns {Array} Array of route definitions
 */
export function getAllRoutes() {
  return [
    { path: '/health', handler: healthRoutes },
    { path: '/api/auth', router: authRoutes },
    { path: '/api/posts', router: postRoutes },
    // Add more routes here as your app grows
    // { path: '/api/users', router: userRoutes },
  ];
}
`;
}

/**
 * Generate PostController
 */
export function generatePostControllerTemplate() {
  return `/**
 * Post Controller
 * Handles blog post CRUD operations
 */

import { BaseController } from './BaseController.js';
import { Post } from '../../../../../database/models/Post.js';
import { Comment } from '../../../../../database/models/Comment.js';

export class PostController extends BaseController {
  /**
   * Get all posts with pagination
   */
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 15;
      const offset = (page - 1) * perPage;

      const posts = await Post.query()
        .select(['id', 'title', 'slug', 'excerpt', 'created_at', 'updated_at'])
        .orderBy('created_at', 'DESC')
        .limit(perPage)
        .offset(offset);

      const total = await Post.query().count();

      return this.paginate(res, posts, total[0].count, page, perPage);
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }

  /**
   * Get single post by slug
   */
  async show(req, res) {
    try {
      const { slug } = req.params;

      const post = await Post.query()
        .where('slug', slug)
        .first();

      if (!post) {
        return this.error(res, 'Post not found', 404);
      }

      // Get comments for this post
      const comments = await Comment.query()
        .where('post_id', post.id)
        .orderBy('created_at', 'DESC');

      return this.success(res, {
        ...post,
        comments
      });
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }

  /**
   * Create new post
   */
  async store(req, res) {
    try {
      const { title, content, excerpt } = req.body;

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const post = await Post.create({
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
      });

      return this.success(res, post, 201);
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }

  /**
   * Update post
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, content, excerpt } = req.body;

      const post = await Post.query()
        .where('id', id)
        .first();

      if (!post) {
        return this.error(res, 'Post not found', 404);
      }

      // Update slug if title changed
      const updateData = { content, excerpt };
      if (title && title !== post.title) {
        updateData.title = title;
        updateData.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      await Post.query()
        .where('id', id)
        .update(updateData);

      const updatedPost = await Post.query()
        .where('id', id)
        .first();

      return this.success(res, updatedPost);
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }

  /**
   * Delete post
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.query()
        .where('id', id)
        .first();

      if (!post) {
        return this.error(res, 'Post not found', 404);
      }

      // Delete associated comments first
      await Comment.query()
        .where('post_id', id)
        .delete();

      // Delete post
      await Post.query()
        .where('id', id)
        .delete();

      return this.success(res, { message: 'Post deleted successfully' });
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }
}
`;
}

/**
 * Generate CommentController
 */
export function generateCommentControllerTemplate() {
  return `/**
 * Comment Controller
 * Handles comment operations
 */

import { BaseController } from './BaseController.js';
import { Comment } from '../../../../../database/models/Comment.js';
import { Post } from '../../../../../database/models/Post.js';

export class CommentController extends BaseController {
  /**
   * Add comment to post
   */
  async store(req, res) {
    try {
      const { post_id, author, content } = req.body;

      // Verify post exists
      const post = await Post.query()
        .where('id', post_id)
        .first();

      if (!post) {
        return this.error(res, 'Post not found', 404);
      }

      const comment = await Comment.create({
        post_id,
        author,
        content,
      });

      return this.success(res, comment, 201);
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }

  /**
   * Delete comment
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.query()
        .where('id', id)
        .first();

      if (!comment) {
        return this.error(res, 'Comment not found', 404);
      }

      await Comment.query()
        .where('id', id)
        .delete();

      return this.success(res, { message: 'Comment deleted successfully' });
    } catch (error) {
      return this.error(res, error.message, 500);
    }
  }
}
`;
}

/**
 * Generate Post routes
 */
export function generatePostRoutesTemplate() {
  return `/**
 * Post Routes
 * API routes for blog posts
 */

import express from 'express';
import { PostController } from '../controllers/PostController.js';
import { CommentController } from '../controllers/CommentController.js';

const router = express.Router();
const postController = new PostController();
const commentController = new CommentController();

// Post routes
router.get('/', (req, res) => postController.index(req, res));
router.get('/:slug', (req, res) => postController.show(req, res));
router.post('/', (req, res) => postController.store(req, res));
router.put('/:id', (req, res) => postController.update(req, res));
router.delete('/:id', (req, res) => postController.destroy(req, res));

// Comment routes
router.post('/comments', (req, res) => commentController.store(req, res));
router.delete('/comments/:id', (req, res) => commentController.destroy(req, res));

export default router;
`;
}
