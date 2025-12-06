/**
 * Tests for useValidationErrors hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidationErrors } from '../../hooks/useValidationErrors.js';

describe('useValidationErrors', () => {
  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useValidationErrors());

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors()).toBe(false);
  });

  it('should set and get field errors', () => {
    const { result } = renderHook(() => useValidationErrors());

    act(() => {
      result.current.setError('email', 'Invalid email address');
    });

    expect(result.current.getError('email')).toBe('Invalid email address');
    expect(result.current.hasError('email')).toBe(true);
    expect(result.current.hasErrors()).toBe(true);
  });

  it('should handle multiple errors', () => {
    const { result } = renderHook(() => useValidationErrors());

    act(() => {
      result.current.setError('email', 'Invalid email');
      result.current.setError('password', 'Password too short');
    });

    expect(result.current.getError('email')).toBe('Invalid email');
    expect(result.current.getError('password')).toBe('Password too short');
    expect(result.current.hasErrors()).toBe(true);
  });

  it('should clear specific field error', () => {
    const { result } = renderHook(() => useValidationErrors());

    act(() => {
      result.current.setError('email', 'Invalid email');
      result.current.setError('password', 'Password too short');
    });

    act(() => {
      result.current.clearError('email');
    });

    expect(result.current.hasError('email')).toBe(false);
    expect(result.current.hasError('password')).toBe(true);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useValidationErrors());

    act(() => {
      result.current.setError('email', 'Invalid email');
      result.current.setError('password', 'Password too short');
    });

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.hasErrors()).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('should handle validation error from API', () => {
    const { result } = renderHook(() => useValidationErrors());

    const mockError = {
      errors: {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is required'],
      },
    };

    act(() => {
      result.current.handleError(mockError);
    });

    expect(result.current.getError('email')).toBe('Email is required');
    expect(result.current.getError('password')).toBe('Password is required');
  });

  it('should handle non-validation error gracefully', () => {
    const { result } = renderHook(() => useValidationErrors());

    const mockError = new Error('Network error');

    act(() => {
      result.current.handleError(mockError);
    });

    // Should not crash, errors should remain empty
    expect(result.current.hasErrors()).toBe(false);
  });

  it('should set errors from object', () => {
    const { result } = renderHook(() => useValidationErrors());

    const errors = {
      email: 'Invalid email',
      password: 'Too short',
      username: 'Already taken',
    };

    act(() => {
      result.current.setErrors(errors);
    });

    expect(result.current.getError('email')).toBe('Invalid email');
    expect(result.current.getError('password')).toBe('Too short');
    expect(result.current.getError('username')).toBe('Already taken');
  });
});
