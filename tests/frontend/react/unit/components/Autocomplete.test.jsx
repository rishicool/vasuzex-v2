/**
 * Tests for Autocomplete component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Autocomplete } from '../../components/Autocomplete/Autocomplete.jsx';

describe('Autocomplete', () => {
  const mockOptions = [
    { id: 1, label: 'Apple', value: 'apple' },
    { id: 2, label: 'Banana', value: 'banana' },
    { id: 3, label: 'Cherry', value: 'cherry' },
    { id: 4, label: 'Date', value: 'date' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input field', () => {
    render(<Autocomplete options={mockOptions} placeholder="Search..." />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should show options when typing', async () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });
  });

  it('should filter options based on input', async () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'app' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });
  });

  it('should select option on click', async () => {
    const onChange = vi.fn();
    render(<Autocomplete options={mockOptions} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apple'));

    expect(onChange).toHaveBeenCalledWith(mockOptions[0]);
    expect(input.value).toBe('Apple');
  });

  it('should navigate options with keyboard', async () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Second option should be highlighted
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveClass('highlighted');
  });

  it('should select option with Enter key', async () => {
    const onChange = vi.fn();
    render(<Autocomplete options={mockOptions} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should close dropdown with Escape key', async () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should handle async options', async () => {
    const asyncFetch = vi.fn().mockResolvedValue([
      { id: 5, label: 'Async Option 1', value: 'async1' },
      { id: 6, label: 'Async Option 2', value: 'async2' },
    ]);

    render(<Autocomplete fetchOptions={asyncFetch} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'async' } });

    await waitFor(() => {
      expect(asyncFetch).toHaveBeenCalledWith('async');
      expect(screen.getByText('Async Option 1')).toBeInTheDocument();
      expect(screen.getByText('Async Option 2')).toBeInTheDocument();
    });
  });

  it('should show loading state during async fetch', async () => {
    const asyncFetch = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<Autocomplete fetchOptions={asyncFetch} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should show no results message', async () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('should clear selection', async () => {
    const onChange = vi.fn();
    render(<Autocomplete options={mockOptions} onChange={onChange} clearable />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'app' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apple'));
    
    const clearButton = screen.getByLabelText('Clear');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(input.value).toBe('');
  });

  it('should debounce async requests', async () => {
    const asyncFetch = vi.fn().mockResolvedValue([]);

    render(<Autocomplete fetchOptions={asyncFetch} debounceMs={300} />);

    const input = screen.getByRole('combobox');
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });

    // Should only call once after debounce
    await waitFor(() => {
      expect(asyncFetch).toHaveBeenCalledTimes(1);
      expect(asyncFetch).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
  });

  it('should render custom option template', async () => {
    const customRenderOption = (option) => (
      <div className="custom-option">
        <strong>{option.label}</strong>
      </div>
    );

    render(
      <Autocomplete
        options={mockOptions}
        renderOption={customRenderOption}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      const customOptions = screen.getAllByRole('option');
      expect(customOptions[0].querySelector('strong')).toHaveTextContent('Apple');
    });
  });

  it('should handle disabled state', () => {
    render(<Autocomplete options={mockOptions} disabled />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });
});
