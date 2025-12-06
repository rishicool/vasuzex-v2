/**
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
