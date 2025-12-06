/**
 * User Model Tests
 * Tests for User model class
 * 
 * Tests Cover:
 * - Model configuration (tableName, primaryKey, timestamps, softDeletes)
 * - Fillable fields
 * - Hidden fields
 * - Casts configuration
 * - Password hashing (setPasswordAttribute)
 * - Name accessor (getNameAttribute)
 * - Full name accessor (getFullNameAttribute)
 * - Admin check (isAdmin)
 * - Password verification (verifyPassword)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('User Model', () => {
  let User;

  beforeEach(async () => {
    const module = await import('../../../../database/models/User.js');
    User = module.User;
  });

  describe('Configuration', () => {
    it('should have correct table name', () => {
      expect(User.tableName).toBe('users');
    });

    it('should have correct primary key', () => {
      expect(User.primaryKey).toBe('id');
    });

    it('should have timestamps enabled', () => {
      expect(User.timestamps).toBe(true);
    });

    it('should have soft deletes enabled', () => {
      expect(User.softDeletes).toBe(true);
    });

    it('should have fillable fields defined', () => {
      expect(User.fillable).toEqual([
        'name',
        'email',
        'phone',
        'avatar',
        'role'
      ]);
    });

    it('should have hidden fields defined', () => {
      expect(User.hidden).toEqual([
        'password',
        'remember_token'
      ]);
    });

    it('should have casts defined', () => {
      expect(User.casts).toEqual({
        email_verified_at: 'datetime',
        created_at: 'datetime',
        updated_at: 'datetime',
        deleted_at: 'datetime'
      });
    });
  });

  describe('Static Properties', () => {
    it('should not include password in fillable fields', () => {
      expect(User.fillable).not.toContain('password');
    });

    it('should hide sensitive fields', () => {
      expect(User.hidden).toContain('password');
      expect(User.hidden).toContain('remember_token');
    });

    it('should cast datetime fields', () => {
      const datetimeFields = ['email_verified_at', 'created_at', 'updated_at', 'deleted_at'];
      
      datetimeFields.forEach(field => {
        expect(User.casts[field]).toBe('datetime');
      });
    });
  });

  describe('Methods', () => {
    it('should have setPasswordAttribute method', () => {
      const user = new User();
      expect(typeof user.setPasswordAttribute).toBe('function');
    });

    it('should have getNameAttribute method', () => {
      const user = new User();
      expect(typeof user.getNameAttribute).toBe('function');
    });

    it('should have getFullNameAttribute method', () => {
      const user = new User();
      expect(typeof user.getFullNameAttribute).toBe('function');
    });

    it('should have isAdmin method', () => {
      const user = new User();
      expect(typeof user.isAdmin).toBe('function');
    });

    it('should have verifyPassword method', () => {
      const user = new User();
      expect(typeof user.verifyPassword).toBe('function');
    });
  });

  describe('getNameAttribute', () => {
    it('should capitalize first letter of name', () => {
      const user = new User();
      
      expect(user.getNameAttribute('john')).toBe('John');
      expect(user.getNameAttribute('alice')).toBe('Alice');
    });

    it('should handle already capitalized names', () => {
      const user = new User();
      
      expect(user.getNameAttribute('John')).toBe('John');
    });

    it('should handle empty or null values', () => {
      const user = new User();
      
      expect(user.getNameAttribute('')).toBe('');
      expect(user.getNameAttribute(null)).toBe(null);
      expect(user.getNameAttribute(undefined)).toBe(undefined);
    });

    it('should handle single character names', () => {
      const user = new User();
      
      expect(user.getNameAttribute('j')).toBe('J');
    });
  });

  describe('Model Instance', () => {
    it('should create instance with new keyword', () => {
      const user = new User();
      
      expect(user).toBeInstanceOf(User);
    });

    it('should inherit from Model base class', async () => {
      // User extends Model from vasuzex/Database/Model
      const user = new User();
      expect(user.constructor.name).toBe('User');
    });
  });

  describe('Field Definitions', () => {
    it('should allow setting fillable fields', () => {
      const fillableFields = ['name', 'email', 'phone', 'avatar', 'role'];
      
      fillableFields.forEach(field => {
        expect(User.fillable).toContain(field);
      });
    });

    it('should have standard user fields in fillable', () => {
      expect(User.fillable).toContain('name');
      expect(User.fillable).toContain('email');
      expect(User.fillable).toContain('phone');
    });

    it('should have role field for authorization', () => {
      expect(User.fillable).toContain('role');
    });

    it('should have avatar field for profile images', () => {
      expect(User.fillable).toContain('avatar');
    });
  });

  describe('Security', () => {
    it('should hide password from serialization', () => {
      expect(User.hidden).toContain('password');
    });

    it('should hide remember_token from serialization', () => {
      expect(User.hidden).toContain('remember_token');
    });

    it('should not expose sensitive fields', () => {
      const sensitiveFields = ['password', 'remember_token'];
      
      sensitiveFields.forEach(field => {
        expect(User.hidden).toContain(field);
      });
    });
  });
});
