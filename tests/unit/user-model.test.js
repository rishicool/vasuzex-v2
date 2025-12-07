/**
 * Unit Tests for User Model
 * Tests findByEmail, findById static methods exist and have correct signature
 */

import { describe, it, expect } from '@jest/globals';
import { User } from '../../database/models/User.js';

describe('User Model - Unit Tests', () => {
  describe('Static Methods', () => {
    it('should have findByEmail method', () => {
      expect(typeof User.findByEmail).toBe('function');
    });

    it('should have findById method', () => {
      expect(typeof User.findById).toBe('function');
    });
    
    it('findByEmail should be async (returns Promise)', () => {
      // Don't await - just check it returns a Promise-like object
      // Call with mock data and catch any rejection
      expect(User.findByEmail.constructor.name).toBe('AsyncFunction');
    });
    
    it('findById should be async (returns Promise)', () => {
      expect(User.findById.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('Model Configuration', () => {
    it('should have correct table name', () => {
      expect(User.tableName).toBe('users');
    });

    it('should have correct primary key', () => {
      expect(User.primaryKey).toBe('id');
    });

    it('should have timestamps enabled', () => {
      expect(User.timestamps).toBe(true);
    });

    it('should have fillable fields defined', () => {
      expect(Array.isArray(User.fillable)).toBe(true);
      expect(User.fillable).toContain('name');
      expect(User.fillable).toContain('email');
    });

    it('should have hidden fields for password', () => {
      expect(Array.isArray(User.hidden)).toBe(true);
      expect(User.hidden).toContain('password');
    });
  });

  describe('Method Signatures', () => {
    it('findByEmail should accept email parameter', () => {
      // Just verify the method exists and has correct arity
      expect(User.findByEmail.length).toBe(1); // Takes 1 parameter
    });

    it('findById should accept id parameter', () => {
      expect(User.findById.length).toBe(1); // Takes 1 parameter
    });
  });
});
