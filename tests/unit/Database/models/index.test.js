/**
 * Database Models Index Tests
 * Tests for database/models package exports
 * 
 * Tests Cover:
 * - Model exports availability
 * - Named exports structure
 * - Model class verification
 */

import { describe, it, expect } from '@jest/globals';

describe('Database Models Index', () => {
  let models;

  beforeAll(async () => {
    models = await import('../../../../database/models/index.js');
  });

  describe('Exports', () => {
    it('should export Post model', () => {
      expect(models.Post).toBeDefined();
      expect(typeof models.Post).toBe('function');
    });

    it('should export Comment model', () => {
      expect(models.Comment).toBeDefined();
      expect(typeof models.Comment).toBe('function');
    });

    it('should export Task model', () => {
      expect(models.Task).toBeDefined();
      expect(typeof models.Task).toBe('function');
    });

    it('should export User model', () => {
      expect(models.User).toBeDefined();
      expect(typeof models.User).toBe('function');
    });

    it('should have all expected models', () => {
      const expectedModels = ['Post', 'Comment', 'Task', 'User'];
      const exportedModels = Object.keys(models);
      
      expectedModels.forEach(modelName => {
        expect(exportedModels).toContain(modelName);
      });
    });

    it('should export exactly 4 models', () => {
      const exportedModels = Object.keys(models);
      expect(exportedModels.length).toBe(4);
    });
  });

  describe('Model Classes', () => {
    it('should have User class with proper structure', () => {
      const { User } = models;
      
      expect(User.tableName).toBe('users');
      expect(User.primaryKey).toBe('id');
      expect(User.timestamps).toBe(true);
      expect(User.softDeletes).toBe(true);
    });

    it('should have Post class with proper structure', () => {
      const { Post } = models;
      
      expect(Post.tableName).toBe('posts');
      expect(Post.primaryKey).toBe('id');
      expect(Post.timestamps).toBe(true);
    });

    it('should have Comment class with proper structure', () => {
      const { Comment } = models;
      
      expect(Comment.tableName).toBe('comments');
      expect(Comment.primaryKey).toBe('id');
      expect(Comment.timestamps).toBe(true);
    });

    it('should have Task class with proper structure', () => {
      const { Task } = models;
      
      expect(Task.tableName).toBe('tasks');
      expect(Task.primaryKey).toBe('id');
      expect(Task.timestamps).toBe(true);
    });
  });
});
