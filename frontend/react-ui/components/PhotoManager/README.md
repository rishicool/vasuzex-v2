# PhotoManager Component

Reusable photo management component for all vasuzex-based applications.

## Features

- **Two Variants**: Basic and Enhanced
- **Drag & Drop**: Reorder photos by dragging
- **Bulk Operations**: Select multiple photos and delete them together
- **Upload Progress**: Real-time upload tracking
- **Custom Components**: Override default UI components
- **Responsive Grid**: Configurable grid layouts
- **Type Safety**: PropTypes validation

## Installation

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable react-dropzone
```

## Basic Usage

Simple photo manager with upload and delete:

```jsx
import { PhotoManager } from 'vasuzex/react';

function MyComponent() {
  const [photos, setPhotos] = useState([]);
  
  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={async (file) => {
        // Upload file and return URL
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch('/api/upload', { 
          method: 'POST', 
          body: formData 
        });
        const data = await res.json();
        return data.url;
      }}
      maxPhotos={10}
    />
  );
}
```

## Enhanced Usage

Advanced photo manager with DnD, bulk operations, and custom components:

```jsx
import { PhotoManager } from 'vasuzex/react';
import { useStorePhotos } from './hooks/useStorePhotos';
import { PhotoCard, UploadDropZone, UploadProgressCard } from './components';
import { TrashBinIcon } from './icons';

function StorePhotosTab({ storeId }) {
  const photosHook = useStorePhotos(storeId);
  
  return (
    <PhotoManager
      variant="enhanced"
      entityId={storeId}
      photosHook={photosHook}
      title="Store Photos"
      description="Upload and manage store photos. Drag to reorder display priority."
      emptyStateText="Upload your first store photo"
      maxFiles={20}
      gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      components={{
        UploadDropZone,
        PhotoCard,
        UploadProgressCard,
        TrashIcon: TrashBinIcon,
      }}
    />
  );
}
```

## Custom Photos Hook

The enhanced variant requires a custom hook that provides photo management functions:

```jsx
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../config/api';

export function useStorePhotos(storeId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/stores/${storeId}/photos`);
      setPhotos(response.data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Upload photo
  const uploadPhoto = async (file, type = 'gallery') => {
    const uploadId = `${Date.now()}-${file.name}`;
    
    setUploadingFiles((prev) => [
      ...prev,
      {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading',
      },
    ]);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('type', type);

      const response = await apiClient.post(
        `/api/stores/${storeId}/photos`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadId ? { ...f, progress: percentCompleted } : f
              )
            );
          },
        }
      );

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadId ? { ...f, status: 'completed' } : f
        )
      );

      await fetchPhotos();
      
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      }, 2000);

      return response.data.data;
    } catch (err) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadId ? { ...f, status: 'error' } : f
        )
      );
      throw err;
    }
  };

  // Delete photo
  const deletePhoto = async (photoId) => {
    try {
      await apiClient.delete(`/api/stores/${storeId}/photos/${photoId}`);
      await fetchPhotos();
    } catch (err) {
      console.error('Failed to delete photo:', err);
      throw err;
    }
  };

  // Bulk delete
  const bulkDeletePhotos = async (photoIds) => {
    try {
      await apiClient.post(`/api/stores/${storeId}/photos/bulk-delete`, {
        photoIds,
      });
      await fetchPhotos();
      setSelectedPhotos([]);
    } catch (err) {
      console.error('Failed to bulk delete photos:', err);
      throw err;
    }
  };

  // Reorder photos
  const reorderPhotos = async (photoIds) => {
    try {
      await apiClient.post(`/api/stores/${storeId}/photos/reorder`, {
        photoIds,
      });
      await fetchPhotos();
    } catch (err) {
      console.error('Failed to reorder photos:', err);
      throw err;
    }
  };

  // Set primary photo
  const setPrimaryPhoto = async (photoId) => {
    try {
      await apiClient.post(`/api/stores/${storeId}/photos/${photoId}/set-primary`);
      await fetchPhotos();
    } catch (err) {
      console.error('Failed to set primary photo:', err);
      throw err;
    }
  };

  // Fetch photos on mount
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    error,
    uploadingFiles,
    selectedPhotos,
    setSelectedPhotos,
    uploadPhoto,
    deletePhoto,
    bulkDeletePhotos,
    reorderPhotos,
    setPrimaryPhoto,
    refetch: fetchPhotos,
  };
}
```

## Custom Components

### PhotoCard

```jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function PhotoCard({ 
  photo, 
  isSelected, 
  onSelect, 
  onDelete,
  TrashIcon 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Your photo card UI */}
    </div>
  );
}
```

### UploadDropZone

```jsx
import { useDropzone } from 'react-dropzone';

export function UploadDropZone({ onDrop, maxFiles, UploadIcon }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {/* Your dropzone UI */}
    </div>
  );
}
```

### UploadProgressCard

```jsx
export function UploadProgressCard({ file }) {
  return (
    <div>
      <div>{file.name}</div>
      <div>Progress: {file.progress}%</div>
      <div>Status: {file.status}</div>
    </div>
  );
}
```

## Props

### Basic Variant

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'basic' \| 'enhanced'` | `'basic'` | Component variant |
| photos | `Array` | `[]` | Initial photos (URLs or objects) |
| onPhotosChange | `Function` | - | Callback when photos change |
| onUpload | `Function` | - | Custom upload handler |
| maxPhotos | `Number` | `10` | Maximum number of photos |
| maxFileSize | `Number` | `5242880` | Max file size (bytes) |
| acceptedTypes | `Array<string>` | Image types | Accepted MIME types |
| multiple | `Boolean` | `true` | Allow multiple uploads |
| className | `String` | `''` | Additional CSS classes |
| disabled | `Boolean` | `false` | Disable uploads |

### Enhanced Variant

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'enhanced'` | - | Must be 'enhanced' |
| entityId | `String \| Number` | - | Entity ID (required) |
| photosHook | `Object` | - | Custom photos hook (required) |
| title | `String` | - | Section title |
| description | `String` | - | Section description |
| emptyStateText | `String` | - | Empty state message |
| maxFiles | `Number` | `10` | Maximum files allowed |
| gridCols | `String` | - | Tailwind grid columns class |
| components | `Object` | - | Custom components |

### Components Object

```typescript
{
  UploadDropZone?: Component,
  PhotoCard?: Component,
  UploadProgressCard?: Component,
  TrashIcon?: Component,
}
```

## Use Cases

### Admin App - Store Photos
```jsx
<PhotoManager variant="enhanced" entityId={storeId} photosHook={useStorePhotos(storeId)} />
```

### Business App - Business Profile Photos
```jsx
<PhotoManager variant="enhanced" entityId={businessId} photosHook={useBusinessPhotos(businessId)} />
```

### Customer App - Product Photos (if needed)
```jsx
<PhotoManager variant="enhanced" entityId={productId} photosHook={useProductPhotos(productId)} />
```

### Registration - Business Registration Photos
```jsx
<PhotoManager variant="enhanced" entityId={registrationId} photosHook={useRegistrationPhotos(registrationId)} />
```

## Backend Requirements

The enhanced variant expects these API endpoints:

```
GET    /api/{entity}/{id}/photos           - List photos
POST   /api/{entity}/{id}/photos           - Upload photo
DELETE /api/{entity}/{id}/photos/{photoId} - Delete photo
POST   /api/{entity}/{id}/photos/bulk-delete - Bulk delete
POST   /api/{entity}/{id}/photos/reorder   - Reorder photos
POST   /api/{entity}/{id}/photos/{photoId}/set-primary - Set primary
```

## Database Schema

```sql
CREATE TABLE entity_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'gallery',
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_entity_photos_entity ON entity_photos(entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_entity_photos_order ON entity_photos(entity_id, display_order) WHERE deleted_at IS NULL;
```

## License

MIT
