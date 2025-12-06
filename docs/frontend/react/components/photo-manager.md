# PhotoManager Component

A comprehensive photo upload and management component with drag-and-drop, preview, cropping, and multi-file support.

## Features

- ✅ Drag & drop upload
- ✅ Multiple file selection
- ✅ Image preview with thumbnails
- ✅ File size and type validation
- ✅ Upload progress tracking
- ✅ Photo reordering (drag to reorder)
- ✅ Delete photos
- ✅ Maximum file limit
- ✅ Fully accessible
- ✅ Responsive design

## Installation

```bash
npm install @vasuzex/react
```

## Basic Usage

```jsx
import { PhotoManager } from '@vasuzex/react/components/PhotoManager';

function MyComponent() {
  const [photos, setPhotos] = useState([]);

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      maxPhotos={5}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `photos` | `Array` | `[]` | Array of photo objects |
| `onPhotosChange` | `Function` | - | Callback when photos change |
| `maxPhotos` | `number` | `10` | Maximum number of photos |
| `maxFileSize` | `number` | `5242880` | Max file size (bytes, default 5MB) |
| `acceptedTypes` | `string[]` | `['image/jpeg', 'image/png', 'image/webp']` | Accepted MIME types |
| `onUpload` | `Function` | - | Upload handler |
| `uploadUrl` | `string` | - | Server upload endpoint |
| `disabled` | `boolean` | `false` | Disable uploads |
| `className` | `string` | `''` | CSS class |

## Photo Object Structure

```typescript
interface Photo {
  id: string | number;
  url: string;           // Photo URL
  file?: File;          // Original file (for new uploads)
  name?: string;        // File name
  size?: number;        // File size in bytes
  uploading?: boolean;  // Upload in progress
  progress?: number;    // Upload progress (0-100)
  error?: string;       // Error message
}
```

## Examples

### Basic Photo Upload

```jsx
import { PhotoManager } from '@vasuzex/react/components/PhotoManager';

function Gallery() {
  const [photos, setPhotos] = useState([
    { id: 1, url: '/images/photo1.jpg' },
    { id: 2, url: '/images/photo2.jpg' },
  ]);

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      maxPhotos={10}
    />
  );
}
```

### With Custom Upload Handler

```jsx
function UploadGallery() {
  const [photos, setPhotos] = useState([]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.url; // Return uploaded photo URL
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={handleUpload}
      maxPhotos={5}
    />
  );
}
```

### With Upload Progress

```jsx
function ProgressUpload() {
  const [photos, setPhotos] = useState([]);

  const handleUpload = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('photo', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.response);
          resolve(data.url);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={handleUpload}
    />
  );
}
```

### With Server Upload URL

```jsx
<PhotoManager
  photos={photos}
  onPhotosChange={setPhotos}
  uploadUrl="/api/photos/upload"
  maxPhotos={8}
/>
```

### Custom File Validation

```jsx
function ValidatedUpload() {
  const [photos, setPhotos] = useState([]);

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      maxFileSize={10 * 1024 * 1024} // 10MB
      acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
      maxPhotos={20}
    />
  );
}
```

### Handling Upload Errors

```jsx
function ErrorHandling() {
  const [photos, setPhotos] = useState([]);

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      return data.url;
    } catch (error) {
      // PhotoManager will display error in UI
      throw error;
    }
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={handleUpload}
    />
  );
}
```

### Photo Reordering

Photos can be reordered by dragging thumbnails:

```jsx
function ReorderableGallery() {
  const [photos, setPhotos] = useState([
    { id: 1, url: '/photo1.jpg' },
    { id: 2, url: '/photo2.jpg' },
    { id: 3, url: '/photo3.jpg' },
  ]);

  // Photos are automatically reordered when user drags
  const handleChange = (newPhotos) => {
    setPhotos(newPhotos);
    // Save new order to server
    savePhotoOrder(newPhotos.map(p => p.id));
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={handleChange}
    />
  );
}
```

## Event Handlers

| Event | Parameters | Description |
|-------|-----------|-------------|
| `onPhotosChange` | `(photos: Photo[])` | Photos array changed |
| `onUpload` | `(file: File, onProgress?: Function)` | Custom upload handler |
| `onDelete` | `(photo: Photo)` | Photo deleted |
| `onError` | `(error: string, photo?: Photo)` | Upload/validation error |

## Keyboard Navigation

- `Tab` - Navigate between photos and upload button
- `Enter/Space` - Select photo or trigger upload
- `Delete/Backspace` - Delete focused photo
- `Arrow Keys` - Navigate between photo thumbnails

## Accessibility

- `role="img"` for photo previews
- `aria-label` on upload button
- `aria-live` region for upload status
- Keyboard navigation support
- Screen reader announcements
- Focus management

## Styling

### CSS Classes

```css
.vasuzex-photo-manager { }
.vasuzex-photo-manager-upload { }
.vasuzex-photo-manager-upload.dragging { }
.vasuzex-photo-manager-upload-input { }
.vasuzex-photo-manager-upload-button { }
.vasuzex-photo-manager-photos { }
.vasuzex-photo-manager-photo { }
.vasuzex-photo-manager-photo-preview { }
.vasuzex-photo-manager-photo-delete { }
.vasuzex-photo-manager-photo-progress { }
.vasuzex-photo-manager-photo-error { }
.vasuzex-photo-manager-limit { }
```

### Custom Styling

```jsx
<PhotoManager
  className="custom-gallery"
  style={{
    '--upload-border': '#ccc',
    '--upload-bg': '#f9f9f9',
    '--photo-size': '120px',
    '--photo-gap': '16px',
  }}
  photos={photos}
  onPhotosChange={setPhotos}
/>
```

## Advanced Features

### Image Optimization

```jsx
const handleUpload = async (file) => {
  // Client-side resize before upload
  const resized = await resizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  });

  const formData = new FormData();
  formData.append('photo', resized);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  return res.json();
};
```

### Photo Metadata

```jsx
const [photos, setPhotos] = useState([
  {
    id: 1,
    url: '/photo1.jpg',
    caption: 'Beautiful sunset',
    tags: ['nature', 'sunset'],
    uploadedAt: '2024-12-06',
  },
]);

// Add metadata when uploading
const handleUpload = async (file) => {
  const url = await uploadFile(file);
  return {
    id: Date.now(),
    url,
    caption: '',
    tags: [],
    uploadedAt: new Date().toISOString(),
  };
};
```

### Bulk Upload

```jsx
function BulkUpload() {
  const handleBulkUpload = async (files) => {
    const uploads = files.map(file => 
      uploadFile(file).catch(err => ({ error: err.message }))
    );
    
    const results = await Promise.all(uploads);
    
    const newPhotos = results
      .filter(r => !r.error)
      .map((url, i) => ({
        id: Date.now() + i,
        url,
      }));
    
    setPhotos([...photos, ...newPhotos]);
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={handleBulkUpload}
      maxPhotos={50}
    />
  );
}
```

## Integration Examples

### With Forms

```jsx
import { FormField, FormGroup } from '@vasuzex/react/components/Forms';
import { PhotoManager } from '@vasuzex/react/components/PhotoManager';

function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photos: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        name="name"
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <FormGroup legend="Product Photos">
        <PhotoManager
          photos={formData.photos}
          onPhotosChange={(photos) => setFormData({ ...formData, photos })}
          maxPhotos={5}
        />
      </FormGroup>
      
      <button type="submit">Create Product</button>
    </form>
  );
}
```

## TypeScript

```typescript
import { PhotoManager, Photo } from '@vasuzex/react/components/PhotoManager';

interface ProductPhoto extends Photo {
  caption?: string;
  isPrimary?: boolean;
}

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<ProductPhoto[]>([]);

  const handleUpload = async (file: File): Promise<string> => {
    // Upload implementation
    return '/uploaded/photo.jpg';
  };

  return (
    <PhotoManager
      photos={photos}
      onPhotosChange={setPhotos}
      onUpload={handleUpload}
      maxPhotos={10}
    />
  );
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires browser support for:
- File API
- Drag and Drop API
- FormData
- Promises

## See Also

- [FormField Component](../Forms)
- [Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
