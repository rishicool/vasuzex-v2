/**
 * Tests for useApiClient hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApiClient } from '../../hooks/useApiClient.js';
import { ApiClientProvider } from '../../providers/ApiClientProvider.jsx';

describe('useApiClient', () => {
  it('should throw error when used outside ApiClientProvider', () => {
    expect(() => {
      renderHook(() => useApiClient());
    }).toThrow('useApiClient must be used within ApiClientProvider');
  });

  it('should return API client when used within provider', () => {
    const wrapper = ({ children }) => (
      <ApiClientProvider baseURL="https://api.test.com">
        {children}
      </ApiClientProvider>
    );

    const { result } = renderHook(() => useApiClient(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('post');
    expect(result.current).toHaveProperty('put');
    expect(result.current).toHaveProperty('patch');
    expect(result.current).toHaveProperty('delete');
  });

  it('should return the same client instance on re-render', () => {
    const wrapper = ({ children }) => (
      <ApiClientProvider baseURL="https://api.test.com">
        {children}
      </ApiClientProvider>
    );

    const { result, rerender } = renderHook(() => useApiClient(), { wrapper });
    const firstClient = result.current;

    rerender();

    expect(result.current).toBe(firstClient);
  });
});
