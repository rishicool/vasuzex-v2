/**
 * Post Model Tests
 * Tests for Post model class
 * 
 * Tests Cover:
 * - Model configuration
 * - Fillable fields
 * - Casts configuration
 * - Relationships (comments)
 * - Query scopes (published, draft, recent)
 * - Accessors (excerpt)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Post Model', () => {
  let Post;

  beforeEach(async () => {
    const module = await import('../../../../database/models/Post.js');
    Post = module.Post;
  });

  describe('Configuration', () => {
    it('should have correct table name', () => {
      expect(Post.tableName).toBe('posts');
    });

    it('should have correct primary key', () => {
      expect(Post.primaryKey).toBe('id');
    });

    it('should have timestamps enabled', () => {
      expect(Post.timestamps).toBe(true);
    });

    it('should have fillable fields defined', () => {
      expect(Post.fillable).toEqual([
        'title',
        'content',
        'author',
        'status',
        'published_at'
      ]);
    });

    it('should have casts defined', () => {
      expect(Post.casts).toEqual({
        published_at: 'datetime'
      });
    });
  });

  describe('Fillable Fields', () => {
    it('should include title field', () => {
      expect(Post.fillable).toContain('title');
    });

    it('should include content field', () => {
      expect(Post.fillable).toContain('content');
    });

    it('should include author field', () => {
      expect(Post.fillable).toContain('author');
    });

    it('should include status field', () => {
      expect(Post.fillable).toContain('status');
    });

    it('should include published_at field', () => {
      expect(Post.fillable).toContain('published_at');
    });

    it('should have exactly 5 fillable fields', () => {
      expect(Post.fillable.length).toBe(5);
    });
  });

  describe('Casts', () => {
    it('should cast published_at to datetime', () => {
      expect(Post.casts.published_at).toBe('datetime');
    });
  });

  describe('Relationships', () => {
    it('should have comments relationship method', () => {
      const post = new Post();
      expect(typeof post.comments).toBe('function');
    });
  });

  describe('Query Scopes', () => {
    it('should have scopePublished static method', () => {
      expect(typeof Post.scopePublished).toBe('function');
    });

    it('should have scopeDraft static method', () => {
      expect(typeof Post.scopeDraft).toBe('function');
    });

    it('should have scopeRecent static method', () => {
      expect(typeof Post.scopeRecent).toBe('function');
    });
  });

  describe('Accessors', () => {
    it('should have getExcerptAttribute method', () => {
      const post = new Post();
      expect(typeof post.getExcerptAttribute).toBe('function');
    });

    it('should return excerpt with ellipsis for long content', () => {
      const post = new Post();
      post.attributes = {
        content: 'A'.repeat(150) // 150 characters
      };

      const excerpt = post.getExcerptAttribute();
      
      expect(excerpt.length).toBe(103); // 100 chars + '...'
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('should return full content without ellipsis for short content', () => {
      const post = new Post();
      post.attributes = {
        content: 'Short content'
      };

      const excerpt = post.getExcerptAttribute();
      
      expect(excerpt).toBe('Short content');
      expect(excerpt.endsWith('...')).toBe(false);
    });

    it('should return exactly 100 characters plus ellipsis for long content', () => {
      const post = new Post();
      post.attributes = {
        content: 'A'.repeat(101)
      };

      const excerpt = post.getExcerptAttribute();
      
      expect(excerpt).toBe('A'.repeat(100) + '...');
    });

    it('should handle empty or null content', () => {
      const post = new Post();
      post.attributes = {};

      const excerpt = post.getExcerptAttribute();
      
      expect(excerpt).toBe('');
    });
  });

  describe('Model Instance', () => {
    it('should create instance with new keyword', () => {
      const post = new Post();
      
      expect(post).toBeInstanceOf(Post);
    });

    it('should have attributes property', () => {
      const post = new Post();
      
      expect(post.attributes).toBeDefined();
    });
  });

  describe('Status Management', () => {
    it('should support published status in fillable', () => {
      expect(Post.fillable).toContain('status');
    });

    it('should have scope for published posts', () => {
      expect(Post.scopePublished).toBeDefined();
    });

    it('should have scope for draft posts', () => {
      expect(Post.scopeDraft).toBeDefined();
    });
  });
});
