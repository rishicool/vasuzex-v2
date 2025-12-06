/**
 * Tests for useLocalStorage hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

// Mock the storage object
vi.mock('@vasuzex/client/Storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { storage } from '@vasuzex/client/Storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with value from storage', () => {
    storage.get.mockReturnValue('stored value');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(storage.get).toHaveBeenCalledWith('test-key');
    expect(result.current[0]).toBe('stored value');
  });

  it('should use initial value when storage is empty', () => {
    storage.get.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('should update value and storage', () => {
    storage.get.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(storage.set).toHaveBeenCalledWith('test-key', 'new value');
    expect(result.current[0]).toBe('new value');
  });

  it('should handle functional updates', () => {
    storage.get.mockReturnValue(5);

    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(storage.set).toHaveBeenCalledWith('counter', 6);
    expect(result.current[0]).toBe(6);
  });

  it('should remove value from storage', () => {
    storage.get.mockReturnValue('value');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(storage.remove).toHaveBeenCalledWith('test-key');
    expect(result.current[0]).toBe('default');
  });

  it('should handle storage errors gracefully', () => {
    storage.get.mockImplementation(() => {
      throw new Error('Storage error');
    });

    // Should not throw, should use initial value
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('should handle set errors gracefully', () => {
    storage.get.mockReturnValue(null);
    storage.set.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Should not throw
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
  });

  it('should handle complex objects', () => {
    const complexObject = { user: { name: 'John', age: 30 }, settings: { theme: 'dark' } };
    storage.get.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('user-data', complexObject));

    act(() => {
      result.current[1]({ ...complexObject, settings: { theme: 'light' } });
    });

    expect(storage.set).toHaveBeenCalled();
  });
});
