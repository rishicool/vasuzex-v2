/**
 * Enhanced Photo Manager with DnD, Bulk Operations, and Custom Components
 * 
 * Production-ready photo management component with:
 * - Drag & drop upload
 * - Sortable photos (drag to reorder)
 * - Bulk selection and delete
 * - Custom component support
 * - Upload progress tracking
 * - Responsive grid layout
 * 
 * @module components/PhotoManager/EnhancedPhotoManager
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

/**
 * Enhanced Photo Manager Component
 * 
 * @param {Object} props
 * @param {string} props.entityId - Entity ID (store, product, etc.)
 * @param {Object} props.photosHook - Hook with photos management functions
 * @param {string} [props.title="Photos"] - Section title
 * @param {string} [props.description] - Section description
 * @param {string} [props.emptyStateText="No photos uploaded yet"] - Empty state message
 * @param {number} [props.maxFiles=20] - Maximum number of photos allowed
 * @param {string} [props.gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"] - Grid columns CSS
 * @param {Object} props.components - Custom components (UploadDropZone, PhotoCard, etc.)
 * 
 * @example
 * <EnhancedPhotoManager
 *   entityId={storeId}
 *   photosHook={useStorePhotos(storeId)}
 *   title="Store Photos"
 *   maxFiles={20}
 *   components={{
 *     UploadDropZone,
 *     PhotoCard,
 *     UploadProgressCard,
 *     TrashIcon,
 *   }}
 * />
 */
export function EnhancedPhotoManager({
  entityId,
  photosHook,
  title = "Photos",
  description,
  emptyStateText = "No photos uploaded yet",
  maxFiles = 20,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  components = {},
  dropzoneProps = {},
}) {
  const {
    photos = [],
    uploadingFiles = [],
    loading = false,
    fetchPhotos,
    uploadPhotos,
    deletePhoto,
    deleteMultiplePhotos,
    reorderPhotos,
  } = photosHook;

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [sortedPhotos, setSortedPhotos] = useState([]);

  // Extract custom components
  const UploadDropZone = components.UploadDropZone;
  const PhotoCard = components.PhotoCard;
  const UploadProgressCard = components.UploadProgressCard;
  const TrashIcon = components.TrashIcon;

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch photos on mount
  useEffect(() => {
    if (entityId && fetchPhotos) {
      fetchPhotos();
    }
  }, [entityId, fetchPhotos]);

  // Update sorted photos when photos change
  useEffect(() => {
    setSortedPhotos(photos);
  }, [photos]);

  // Handle file selection
  const handleFilesSelected = async (files) => {
    if (uploadPhotos) {
      await uploadPhotos(files);
    }
  };

  // Handle photo selection toggle
  const handlePhotoSelect = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId],
    );
  };

  // Handle single photo delete
  const handlePhotoDelete = async (photoId) => {
    if (deletePhoto && confirm("Delete this photo?")) {
      await deletePhoto(photoId);
      setSelectedPhotos((prev) => prev.filter((id) => id !== photoId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (
      selectedPhotos.length > 0 &&
      deleteMultiplePhotos &&
      confirm(`Delete ${selectedPhotos.length} selected photo(s)?`)
    ) {
      await deleteMultiplePhotos(selectedPhotos);
      setSelectedPhotos([]);
    }
  };

  // Handle drag end - reorder photos
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sortedPhotos.findIndex((p) => p.id === active.id);
      const newIndex = sortedPhotos.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(sortedPhotos, oldIndex, newIndex);
      setSortedPhotos(newOrder);

      // Update backend
      if (reorderPhotos) {
        await reorderPhotos(newOrder);
      }
    }
  };

  // Select all photos
  const handleSelectAll = () => {
    if (selectedPhotos.length === sortedPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(sortedPhotos.map((p) => p.id));
    }
  };

  const canUpload = sortedPhotos.length < maxFiles;
  const hasSelection = selectedPhotos.length > 0;

  return (
    <div className="vasuzex-enhanced-photo-manager space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPhotos.length} selected
            </span>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900/30
                         transition-colors duration-200"
            >
              {TrashIcon && <TrashIcon className="w-4 h-4 inline mr-1" />}
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Upload Drop Zone */}
      {canUpload && UploadDropZone && (
        <UploadDropZone
          onFilesSelected={handleFilesSelected}
          disabled={loading}
          maxFiles={maxFiles - sortedPhotos.length}
          maxSize={dropzoneProps.maxSize || maxFileSize}
          {...dropzoneProps}
        />
      )}

      {/* Info Bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          {sortedPhotos.length} / {maxFiles} photos
        </div>

        {sortedPhotos.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
          >
            {selectedPhotos.length === sortedPhotos.length ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Uploading Files Progress */}
      {uploadingFiles.length > 0 && UploadProgressCard && (
        <div className={`grid ${gridCols} gap-4`}>
          {uploadingFiles.map((file) => (
            <UploadProgressCard key={file.id} file={file} />
          ))}
        </div>
      )}

      {/* Photos Grid with DnD */}
      {sortedPhotos.length > 0 && PhotoCard && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedPhotos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className={`grid ${gridCols} gap-4`}>
              {sortedPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={{ ...photo, order: index }}
                  isSelected={selectedPhotos.includes(photo.id)}
                  onSelect={handlePhotoSelect}
                  onDelete={handlePhotoDelete}
                  disabled={loading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Empty State */}
      {sortedPhotos.length === 0 && uploadingFiles.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>{emptyStateText}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && sortedPhotos.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading photos...</p>
        </div>
      )}
    </div>
  );
}

EnhancedPhotoManager.propTypes = {
  /** Entity ID (store, product, etc.) */
  entityId: PropTypes.string.isRequired,
  /** Photos hook with management functions */
  photosHook: PropTypes.shape({
    photos: PropTypes.array,
    uploadingFiles: PropTypes.array,
    loading: PropTypes.bool,
    fetchPhotos: PropTypes.func,
    uploadPhotos: PropTypes.func,
    deletePhoto: PropTypes.func,
    deleteMultiplePhotos: PropTypes.func,
    reorderPhotos: PropTypes.func,
  }).isRequired,
  /** Section title */
  title: PropTypes.string,
  /** Section description */
  description: PropTypes.string,
  /** Empty state message */
  emptyStateText: PropTypes.string,
  /** Maximum number of photos */
  maxFiles: PropTypes.number,
  /** Maximum file size in bytes (default 5MB) */
  maxFileSize: PropTypes.number,
  /** Grid columns CSS classes */
  gridCols: PropTypes.string,
  /** Custom components */
  components: PropTypes.shape({
    UploadDropZone: PropTypes.elementType,
    PhotoCard: PropTypes.elementType,
    UploadProgressCard: PropTypes.elementType,
    TrashIcon: PropTypes.elementType,
  }),
  /** Additional props to pass to UploadDropZone */
  dropzoneProps: PropTypes.object,
};

export default EnhancedPhotoManager;
