/**
 * Tests for useAppConfig hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppConfig } from '../../hooks/useAppConfig.js';
import { AppConfigProvider } from '../../providers/AppConfigProvider.jsx';

// Mock the loadAppConfig function
vi.mock('@vasuzex/client/Config', () => ({
  loadAppConfig: vi.fn(),
}));

import { loadAppConfig } from '@vasuzex/client/Config';

describe('useAppConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside AppConfigProvider', () => {
    expect(() => {
      renderHook(() => useAppConfig());
    }).toThrow('useAppConfig must be used within AppConfigProvider');
  });

  it('should return loading state initially', () => {
    loadAppConfig.mockReturnValue(new Promise(() => {})); // Never resolves

    const wrapper = ({ children }) => (
      <AppConfigProvider>{children}</AppConfigProvider>
    );

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.config).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load config successfully', async () => {
    const mockConfig = {
      app: { name: 'Test App', url: 'https://test.com' },
      api: { baseURL: 'https://api.test.com' },
    };

    loadAppConfig.mockResolvedValue(mockConfig);

    const wrapper = ({ children }) => (
      <AppConfigProvider>{children}</AppConfigProvider>
    );

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('should handle config loading error', async () => {
    const mockError = new Error('Failed to load config');
    loadAppConfig.mockRejectedValue(mockError);

    const wrapper = ({ children }) => (
      <AppConfigProvider>{children}</AppConfigProvider>
    );

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it('should provide reload function', async () => {
    const mockConfig = { app: { name: 'Test' } };
    loadAppConfig.mockResolvedValue(mockConfig);

    const wrapper = ({ children }) => (
      <AppConfigProvider>{children}</AppConfigProvider>
    );

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.reload).toBe('function');
  });
});
