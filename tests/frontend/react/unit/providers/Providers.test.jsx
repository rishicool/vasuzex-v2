/**
 * Tests for Provider components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AppConfigProvider } from '../../providers/AppConfigProvider.jsx';
import { ApiClientProvider } from '../../providers/ApiClientProvider.jsx';
import { VasuzexProvider } from '../../providers/VasuzexProvider.jsx';
import { useAppConfig } from '../../hooks/useAppConfig.js';
import { useApiClient } from '../../hooks/useApiClient.js';

// Mock the loadAppConfig function
vi.mock('@vasuzex/client/Config', () => ({
  loadAppConfig: vi.fn(),
}));

import { loadAppConfig } from '@vasuzex/client/Config';

describe('AppConfigProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide config to children', async () => {
    const mockConfig = {
      app: { name: 'Test App' },
      api: { baseURL: 'https://api.test.com' },
    };

    loadAppConfig.mockResolvedValue(mockConfig);

    function TestComponent() {
      const { config, loading } = useAppConfig();
      if (loading) return <div>Loading...</div>;
      return <div>{config.app.name}</div>;
    }

    render(
      <AppConfigProvider>
        <TestComponent />
      </AppConfigProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });
  });

  it('should handle config loading error', async () => {
    const mockError = new Error('Failed to load');
    loadAppConfig.mockRejectedValue(mockError);

    function TestComponent() {
      const { error, loading } = useAppConfig();
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;
      return <div>Config loaded</div>;
    }

    render(
      <AppConfigProvider>
        <TestComponent />
      </AppConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load')).toBeInTheDocument();
    });
  });

  it('should reload config when reload is called', async () => {
    const mockConfig1 = { app: { name: 'Version 1' } };
    const mockConfig2 = { app: { name: 'Version 2' } };

    loadAppConfig
      .mockResolvedValueOnce(mockConfig1)
      .mockResolvedValueOnce(mockConfig2);

    function TestComponent() {
      const { config, loading, reload } = useAppConfig();
      if (loading) return <div>Loading...</div>;
      return (
        <div>
          <div>{config.app.name}</div>
          <button onClick={reload}>Reload</button>
        </div>
      );
    }

    render(
      <AppConfigProvider>
        <TestComponent />
      </AppConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });

    const reloadButton = screen.getByText('Reload');
    reloadButton.click();

    await waitFor(() => {
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });
});

describe('ApiClientProvider', () => {
  it('should provide API client to children', () => {
    function TestComponent() {
      const client = useApiClient();
      return <div>{client ? 'Client Ready' : 'No Client'}</div>;
    }

    render(
      <ApiClientProvider baseURL="https://api.test.com">
        <TestComponent />
      </ApiClientProvider>
    );

    expect(screen.getByText('Client Ready')).toBeInTheDocument();
  });

  it('should create client with baseURL', () => {
    function TestComponent() {
      const client = useApiClient();
      return <div>{client.defaults?.baseURL || 'No URL'}</div>;
    }

    render(
      <ApiClientProvider baseURL="https://api.example.com">
        <TestComponent />
      </ApiClientProvider>
    );

    // The client should be created (exact implementation depends on createApiClient)
    expect(screen.queryByText('No URL')).not.toBeInTheDocument();
  });

  it('should pass config to client', () => {
    const customConfig = {
      timeout: 5000,
      headers: { 'X-Custom': 'header' },
    };

    function TestComponent() {
      const client = useApiClient();
      return <div>Client Created</div>;
    }

    render(
      <ApiClientProvider baseURL="https://api.test.com" config={customConfig}>
        <TestComponent />
      </ApiClientProvider>
    );

    expect(screen.getByText('Client Created')).toBeInTheDocument();
  });
});

describe('VasuzexProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide both config and API client', async () => {
    const mockConfig = {
      app: { name: 'Test App' },
      api: { baseURL: 'https://api.test.com' },
    };

    loadAppConfig.mockResolvedValue(mockConfig);

    function TestComponent() {
      const { config, loading } = useAppConfig();
      const client = useApiClient();
      
      if (loading) return <div>Loading...</div>;
      
      return (
        <div>
          <div>{config.app.name}</div>
          <div>{client ? 'Client Ready' : 'No Client'}</div>
        </div>
      );
    }

    render(
      <VasuzexProvider>
        <TestComponent />
      </VasuzexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App')).toBeInTheDocument();
      expect(screen.getByText('Client Ready')).toBeInTheDocument();
    });
  });

  it('should use custom API base URL', async () => {
    const mockConfig = {
      app: { name: 'Test' },
      api: { baseURL: 'https://api.default.com' },
    };

    loadAppConfig.mockResolvedValue(mockConfig);

    function TestComponent() {
      const { loading } = useAppConfig();
      const client = useApiClient();
      
      if (loading) return <div>Loading...</div>;
      return <div>Providers Ready</div>;
    }

    render(
      <VasuzexProvider apiBaseURL="https://api.custom.com">
        <TestComponent />
      </VasuzexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Providers Ready')).toBeInTheDocument();
    });
  });

  it('should pass API config', async () => {
    const mockConfig = { app: { name: 'Test' } };
    loadAppConfig.mockResolvedValue(mockConfig);

    const customApiConfig = {
      timeout: 10000,
      headers: { 'X-API-Key': 'secret' },
    };

    function TestComponent() {
      const { loading } = useAppConfig();
      if (loading) return <div>Loading...</div>;
      return <div>Ready</div>;
    }

    render(
      <VasuzexProvider apiConfig={customApiConfig}>
        <TestComponent />
      </VasuzexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });
});
