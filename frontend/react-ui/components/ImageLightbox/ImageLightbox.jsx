import React, { useEffect, useCallback } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * ImageLightbox Component
 * Reusable full-screen image viewer with navigation
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {Function} onClose - Callback when modal closes
 * @param {Array} images - Array of image objects [{url: string, alt?: string}]
 * @param {number} currentIndex - Currently displayed image index
 * @param {Function} onNavigate - Callback when navigating (prev/next)
 */
export const ImageLightbox = ({ isOpen, onClose, images = [], currentIndex = 0, onNavigate }) => {
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    },
    [isOpen, onClose, handlePrevious, handleNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <FaTimes size={32} />
      </button>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 z-10"
          aria-label="Previous image"
        >
          <FaChevronLeft size={24} />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-7xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
        />
        
        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Next Button */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 z-10"
          aria-label="Next image"
        >
          <FaChevronRight size={24} />
        </button>
      )}
    </div>
  );
};
