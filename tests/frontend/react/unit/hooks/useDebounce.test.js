/**
 * Tests for useDebounce hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce.js';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial value before delay
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'change1' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'change2' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'change3' });

    // Should still be initial because timer keeps resetting
    expect(result.current).toBe('initial');

    // Fast-forward full delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now should be the last value
    expect(result.current).toBe('change3');
  });

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test', 500));

    // Should not throw or cause memory leaks
    unmount();

    // Advance timers to ensure cleanup worked
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should handle multiple rerenders efficiently', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    const values = ['b', 'c', 'd', 'e', 'f'];
    
    values.forEach(value => {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(50);
      });
    });

    // Should still have initial value
    expect(result.current).toBe('a');

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have last value
    expect(result.current).toBe('f');
  });
});
