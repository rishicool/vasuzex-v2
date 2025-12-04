import Model from 'vasuzex/Database/Model';
import { Relations } from 'vasuzex/Database/Relations';
import { Comment } from './Comment.js';

export class Post extends Model {
  static tableName = 'posts';
  static primaryKey = 'id';
  static timestamps = true;
  static fillable = ['title', 'content', 'author', 'status', 'published_at'];
  static casts = {
    published_at: 'datetime'
  };

  /**
   * Get comments for this post
   */
  comments() {
    return Relations.hasMany(this, Comment, 'post_id', 'id');
  }

  /**
   * Scope: published posts
   */
  static scopePublished(query) {
    return query.where('status', 'published');
  }

  /**
   * Scope: draft posts
   */
  static scopeDraft(query) {
    return query.where('status', 'draft');
  }

  /**
   * Scope: recent posts
   */
  static scopeRecent(query, days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return query.where('created_at', '>=', date);
  }

  /**
   * Get excerpt (accessor)
   */
  getExcerptAttribute() {
    const content = this.getAttribute('content') || '';
    return content.substring(0, 100) + (content.length > 100 ? '...' : '');
  }
}
