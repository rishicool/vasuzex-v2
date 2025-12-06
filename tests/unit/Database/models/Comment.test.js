/**
 * Comment Model Tests
 * Tests for Comment model class
 * 
 * Tests Cover:
 * - Model configuration
 * - Fillable fields
 * - Casts configuration
 * - Relationships (post)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Comment Model', () => {
  let Comment;

  beforeEach(async () => {
    const module = await import('../../../../database/models/Comment.js');
    Comment = module.Comment;
  });

  describe('Configuration', () => {
    it('should have correct table name', () => {
      expect(Comment.tableName).toBe('comments');
    });

    it('should have correct primary key', () => {
      expect(Comment.primaryKey).toBe('id');
    });

    it('should have timestamps enabled', () => {
      expect(Comment.timestamps).toBe(true);
    });

    it('should have fillable fields defined', () => {
      expect(Comment.fillable).toEqual([
        'post_id',
        'author',
        'content'
      ]);
    });

    it('should have casts defined', () => {
      expect(Comment.casts).toEqual({
        post_id: 'int'
      });
    });
  });

  describe('Fillable Fields', () => {
    it('should include post_id field', () => {
      expect(Comment.fillable).toContain('post_id');
    });

    it('should include author field', () => {
      expect(Comment.fillable).toContain('author');
    });

    it('should include content field', () => {
      expect(Comment.fillable).toContain('content');
    });

    it('should have exactly 3 fillable fields', () => {
      expect(Comment.fillable.length).toBe(3);
    });
  });

  describe('Casts', () => {
    it('should cast post_id to integer', () => {
      expect(Comment.casts.post_id).toBe('int');
    });

    it('should have exactly 1 cast defined', () => {
      expect(Object.keys(Comment.casts).length).toBe(1);
    });
  });

  describe('Relationships', () => {
    it('should have post relationship method', () => {
      const comment = new Comment();
      expect(typeof comment.post).toBe('function');
    });
  });

  describe('Model Instance', () => {
    it('should create instance with new keyword', () => {
      const comment = new Comment();
      
      expect(comment).toBeInstanceOf(Comment);
    });

    it('should have attributes property', () => {
      const comment = new Comment();
      
      expect(comment.attributes).toBeDefined();
    });
  });

  describe('Foreign Key', () => {
    it('should have post_id in fillable for relationship', () => {
      expect(Comment.fillable).toContain('post_id');
    });

    it('should cast post_id to integer for proper foreign key handling', () => {
      expect(Comment.casts.post_id).toBe('int');
    });
  });

  describe('Content Management', () => {
    it('should have author field for comment attribution', () => {
      expect(Comment.fillable).toContain('author');
    });

    it('should have content field for comment text', () => {
      expect(Comment.fillable).toContain('content');
    });
  });
});
