/**
 * Task Model Tests
 * Tests for Task model class
 * 
 * Tests Cover:
 * - Model configuration
 * - Fillable fields
 * - Casts configuration
 * - Task-specific fields (priority, status, due dates)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Task Model', () => {
  let Task;

  beforeEach(async () => {
    const module = await import('../../../../database/models/Task.js');
    Task = module.Task;
  });

  describe('Configuration', () => {
    it('should have correct table name', () => {
      expect(Task.tableName).toBe('tasks');
    });

    it('should have correct primary key', () => {
      expect(Task.primaryKey).toBe('id');
    });

    it('should have timestamps enabled', () => {
      expect(Task.timestamps).toBe(true);
    });

    it('should have fillable fields defined', () => {
      expect(Task.fillable).toEqual([
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'completed_at'
      ]);
    });

    it('should have casts defined', () => {
      expect(Task.casts).toEqual({
        priority: 'int',
        due_date: 'datetime',
        completed_at: 'datetime'
      });
    });
  });

  describe('Fillable Fields', () => {
    it('should include title field', () => {
      expect(Task.fillable).toContain('title');
    });

    it('should include description field', () => {
      expect(Task.fillable).toContain('description');
    });

    it('should include priority field', () => {
      expect(Task.fillable).toContain('priority');
    });

    it('should include status field', () => {
      expect(Task.fillable).toContain('status');
    });

    it('should include due_date field', () => {
      expect(Task.fillable).toContain('due_date');
    });

    it('should include completed_at field', () => {
      expect(Task.fillable).toContain('completed_at');
    });

    it('should have exactly 6 fillable fields', () => {
      expect(Task.fillable.length).toBe(6);
    });
  });

  describe('Casts', () => {
    it('should cast priority to integer', () => {
      expect(Task.casts.priority).toBe('int');
    });

    it('should cast due_date to datetime', () => {
      expect(Task.casts.due_date).toBe('datetime');
    });

    it('should cast completed_at to datetime', () => {
      expect(Task.casts.completed_at).toBe('datetime');
    });

    it('should have exactly 3 casts defined', () => {
      expect(Object.keys(Task.casts).length).toBe(3);
    });
  });

  describe('Model Instance', () => {
    it('should create instance with new keyword', () => {
      const task = new Task();
      
      expect(task).toBeInstanceOf(Task);
    });

    it('should have attributes property', () => {
      const task = new Task();
      
      expect(task.attributes).toBeDefined();
    });
  });

  describe('Task Management Fields', () => {
    it('should have priority field for task prioritization', () => {
      expect(Task.fillable).toContain('priority');
      expect(Task.casts.priority).toBe('int');
    });

    it('should have status field for task state tracking', () => {
      expect(Task.fillable).toContain('status');
    });

    it('should have due_date field for deadline tracking', () => {
      expect(Task.fillable).toContain('due_date');
      expect(Task.casts.due_date).toBe('datetime');
    });

    it('should have completed_at field for completion tracking', () => {
      expect(Task.fillable).toContain('completed_at');
      expect(Task.casts.completed_at).toBe('datetime');
    });
  });

  describe('Date Fields', () => {
    it('should cast date fields to datetime', () => {
      const dateFields = ['due_date', 'completed_at'];
      
      dateFields.forEach(field => {
        expect(Task.casts[field]).toBe('datetime');
      });
    });

    it('should support task scheduling with due_date', () => {
      expect(Task.fillable).toContain('due_date');
    });

    it('should track completion time with completed_at', () => {
      expect(Task.fillable).toContain('completed_at');
    });
  });

  describe('Content Fields', () => {
    it('should have title for task identification', () => {
      expect(Task.fillable).toContain('title');
    });

    it('should have description for task details', () => {
      expect(Task.fillable).toContain('description');
    });
  });
});
