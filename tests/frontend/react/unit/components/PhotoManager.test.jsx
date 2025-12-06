/**
 * Tests for PhotoManager component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoManager } from '../../components/PhotoManager/PhotoManager.jsx';

describe('PhotoManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area', () => {
    render(<PhotoManager />);

    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const onChange = vi.fn();
    render(<PhotoManager onChange={onChange} />);

    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('should validate file types', async () => {
    render(<PhotoManager accept="image/jpeg,image/png" />);

    const invalidFile = new File(['doc'], 'document.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should validate max file size', async () => {
    render(<PhotoManager maxSize={1000} />); // 1KB

    const largeFile = new File([new ArrayBuffer(2000)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });
  });

  it('should enforce max photos limit', async () => {
    const onChange = vi.fn();
    render(<PhotoManager maxPhotos={2} onChange={onChange} />);

    const files = [
      new File(['1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['3'], 'photo3.jpg', { type: 'image/jpeg' }),
    ];

    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: files,
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/maximum.*2.*photos/i)).toBeInTheDocument();
    });
  });

  it('should display photo previews', async () => {
    const initialPhotos = [
      { id: 1, url: 'https://example.com/photo1.jpg', name: 'photo1.jpg' },
      { id: 2, url: 'https://example.com/photo2.jpg', name: 'photo2.jpg' },
    ];

    render(<PhotoManager value={initialPhotos} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/photo1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/photo2.jpg');
    });
  });

  it('should delete photo', async () => {
    const onChange = vi.fn();
    const initialPhotos = [
      { id: 1, url: 'https://example.com/photo1.jpg', name: 'photo1.jpg' },
      { id: 2, url: 'https://example.com/photo2.jpg', name: 'photo2.jpg' },
    ];

    render(<PhotoManager value={initialPhotos} onChange={onChange} />);

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith([initialPhotos[1]]);
  });

  it('should handle drag and drop', async () => {
    const onChange = vi.fn();
    render(<PhotoManager onChange={onChange} />);

    const dropzone = screen.getByText(/drag.*drop/i).closest('.photo-upload-area');
    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveClass('drag-over');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('should handle drag leave', () => {
    render(<PhotoManager />);

    const dropzone = screen.getByText(/drag.*drop/i).closest('.photo-upload-area');

    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveClass('drag-over');

    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveClass('drag-over');
  });

  it('should call custom upload handler', async () => {
    const customUpload = vi.fn().mockResolvedValue({
      id: 1,
      url: 'https://example.com/uploaded.jpg',
      name: 'uploaded.jpg',
    });

    const onChange = vi.fn();
    render(<PhotoManager onUpload={customUpload} onChange={onChange} />);

    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(customUpload).toHaveBeenCalledWith(file);
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('should show upload progress', async () => {
    const slowUpload = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ id: 1, url: 'test.jpg' }), 100))
    );

    render(<PhotoManager onUpload={slowUpload} />);

    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  it('should handle upload error', async () => {
    const failingUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));

    render(<PhotoManager onUpload={failingUpload} />);

    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it('should disable upload when disabled', () => {
    render(<PhotoManager disabled />);

    const input = screen.getByLabelText(/browse files/i);
    expect(input).toBeDisabled();
  });

  it('should show helper text', () => {
    render(<PhotoManager helperText="Upload up to 5MB" />);

    expect(screen.getByText('Upload up to 5MB')).toBeInTheDocument();
  });
});
