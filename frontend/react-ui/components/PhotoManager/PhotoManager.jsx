/**
 * PhotoManager Component
 * 
 * A component for managing photo uploads with preview, delete, and drag-and-drop.
 * 
 * @module components/PhotoManager
 */

import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { EnhancedPhotoManager } from './EnhancedPhotoManager.jsx';

/**
 * Photo upload and management component
 * 
 * @param {Object} props
 * @param {string} [props.variant='basic'] - 'basic' or 'enhanced' for advanced features
 * @param {Array<string|Object>} [props.photos=[]] - Initial photos (URLs or objects)
 * @param {Function} props.onPhotosChange - Callback when photos change
 * @param {Function} [props.onUpload] - Custom upload handler
 * @param {number} [props.maxPhotos=10] - Maximum number of photos
 * @param {number} [props.maxFileSize=5242880] - Max file size in bytes (default 5MB)
 * @param {Array<string>} [props.acceptedTypes] - Accepted MIME types
 * @param {boolean} [props.multiple=true] - Allow multiple uploads
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disable uploads
 * @param {Function} [props.getPhotoUrl] - Get URL from photo object
 * 
 * Enhanced variant props:
 * @param {string|number} props.entityId - Entity ID (for enhanced variant)
 * @param {Object} props.photosHook - Custom photos hook (for enhanced variant)
 * @param {string} [props.title] - Title for enhanced variant
 * @param {string} [props.description] - Description for enhanced variant
 * @param {Object} [props.components] - Custom components for enhanced variant
 * 
 * @example
 * <PhotoManager
 *   photos={photos}
 *   onPhotosChange={setPhotos}
 *   onUpload={async (file) => {
 *     const formData = new FormData();
 *     formData.append('photo', file);
 *     const res = await fetch('/api/upload', { method: 'POST', body: formData });
 *     const data = await res.json();
 *     return data.url;
 *   }}
 *   maxPhotos={5}
 * />
 */
export function PhotoManager({
  variant = 'basic',
  photos = [],
  onPhotosChange,
  onUpload,
  maxPhotos = 10,
  maxFileSize = 5242880, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple = true,
  className = '',
  disabled = false,
  getPhotoUrl = (photo) => typeof photo === 'string' ? photo : photo.url,
  ...enhancedProps
}) {
  // If enhanced variant requested, use EnhancedPhotoManager
  if (variant === 'enhanced') {
    return <EnhancedPhotoManager maxFiles={maxPhotos} {...enhancedProps} />;
  }
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  /**
   * Validate file
   */
  const validateFile = useCallback((file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} not accepted. Allowed: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      const sizeMB = (maxFileSize / 1024 / 1024).toFixed(1);
      return `File size exceeds ${sizeMB}MB limit`;
    }
    
    return null;
  }, [acceptedTypes, maxFileSize]);
  
  /**
   * Handle file upload
   */
  const handleFiles = useCallback(async (files) => {
    setError(null);
    
    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
    
    const filesToUpload = multiple 
      ? Array.from(files).slice(0, maxPhotos - photos.length)
      : [files[0]];
    
    // Validate all files first
    for (const file of filesToUpload) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
    }
    
    setUploading(true);
    
    try {
      const newPhotos = [];
      
      for (const file of filesToUpload) {
        if (onUpload) {
          // Custom upload handler
          const result = await onUpload(file);
          newPhotos.push(result);
        } else {
          // Create local preview URL
          const url = URL.createObjectURL(file);
          newPhotos.push({ url, file, local: true });
        }
      }
      
      onPhotosChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [photos, maxPhotos, multiple, validateFile, onUpload, onPhotosChange]);
  
  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  /**
   * Handle photo delete
   */
  const handleDelete = (index) => {
    const photo = photos[index];
    
    // Revoke object URL if it's a local preview
    if (typeof photo === 'object' && photo.local && photo.url) {
      URL.revokeObjectURL(photo.url);
    }
    
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };
  
  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  const canUpload = !disabled && photos.length < maxPhotos;
  
  return (
    <div className={`vasuzex-photo-manager ${className} ${disabled ? 'disabled' : ''}`}>
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`vasuzex-photo-upload ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
          aria-label="Upload photos"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
          
          <div className="vasuzex-photo-upload-content">
            {uploading ? (
              <>
                <div className="spinner"></div>
                <p>Uploading...</p>
              </>
            ) : (
              <>
                <span className="vasuzex-photo-upload-icon">📷</span>
                <p className="vasuzex-photo-upload-text">
                  Drop photos here or click to browse
                </p>
                <p className="vasuzex-photo-upload-hint">
                  {photos.length}/{maxPhotos} photos • Max {(maxFileSize / 1024 / 1024).toFixed(1)}MB each
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="vasuzex-photo-error" role="alert">
          <span className="vasuzex-photo-error-icon">⚠</span>
          {error}
        </div>
      )}
      
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="vasuzex-photo-grid">
          {photos.map((photo, index) => {
            const url = getPhotoUrl(photo);
            
            return (
              <div key={index} className="vasuzex-photo-item">
                <img 
                  src={url} 
                  alt={`Photo ${index + 1}`}
                  className="vasuzex-photo-image"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="vasuzex-photo-delete"
                  aria-label={`Delete photo ${index + 1}`}
                  title="Delete photo"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Empty State */}
      {photos.length === 0 && !canUpload && (
        <div className="vasuzex-photo-empty">
          <p>No photos uploaded</p>
        </div>
      )}
    </div>
  );
}

PhotoManager.propTypes = {
  /** Current photos (array of URLs or objects with url property) */
  photos: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        url: PropTypes.string.isRequired,
        name: PropTypes.string,
      }),
    ])
  ),
  /** Component variant - 'basic' for simple manager, 'enhanced' for advanced features */
  variant: PropTypes.oneOf(['basic', 'enhanced']),
  /** Callback when photos change */
  onPhotosChange: PropTypes.func,
  /** Alternative prop name for onChange */
  onChange: PropTypes.func,
  /** Alternative prop name for photos */
  value: PropTypes.array,
  /** Custom upload handler (receives File, should return uploaded photo object) */
  onUpload: PropTypes.func,
  /** Maximum number of photos allowed */
  maxPhotos: PropTypes.number,
  /** Maximum file size in bytes */
  maxFileSize: PropTypes.number,
  /** Accepted file MIME types */
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  /** Alternative prop for acceptedTypes */
  accept: PropTypes.string,
  /** Allow multiple file selection */
  multiple: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Disable file input */
  disabled: PropTypes.bool,
  /** Function to extract photo URL from photo object */
  getPhotoUrl: PropTypes.func,
  /** Helper text displayed below upload area */
  helperText: PropTypes.string,
  // Enhanced variant props
  /** Entity ID (required for enhanced variant) */
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Photos hook with photos, loading, error, upload, etc. (required for enhanced variant) */
  photosHook: PropTypes.object,
  /** Title for enhanced variant */
  title: PropTypes.string,
  /** Description for enhanced variant */
  description: PropTypes.string,
  /** Custom components for enhanced variant */
  components: PropTypes.object,
  /** Grid columns class for enhanced variant */
  gridCols: PropTypes.string,
  /** Empty state text for enhanced variant */
  emptyStateText: PropTypes.string,
  /** Max files for enhanced variant */
  maxFiles: PropTypes.number,
};

PhotoManager.defaultProps = {
  photos: [],
  onPhotosChange: () => {},
  maxPhotos: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple: true,
  disabled: false,
  className: '',
  getPhotoUrl: (photo) => (typeof photo === 'string' ? photo : photo.url || ''),
};

export default PhotoManager;
