# Upload Service

Laravel-style file upload service for Node.js with multiple storage drivers, validation, security scanning, and image processing.

## Features

- **Multiple Storage Drivers**: Local, Amazon S3, DigitalOcean Spaces
- **File Validation**: Size, type, extension, MIME type, dimensions
- **Security Scanning**: Magic byte validation, malware detection, dangerous file blocking
- **Image Processing**: Resize, crop, compress, format conversion, thumbnails, watermarks
- **Facade Support**: Laravel-style static access
- **Type Safety**: Full TypeScript definitions
- **Production Ready**: Battle-tested patterns from Laravel

## Installation

```bash
npm install sharp @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Optional Dependencies

```bash
# For virus scanning
npm install clamscan

# For video processing
npm install fluent-ffmpeg
```

## Configuration

Configure upload settings in `config/upload.cjs`:

```javascript
module.exports = {
  default: 'local',

  disks: {
    local: {
      driver: 'local',
      root: './storage/uploads',
      url: '/storage/uploads',
    },

    s3: {
      driver: 's3',
      region: 'us-east-1',
      bucket: 'my-bucket',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
    },

    spaces: {
      driver: 'spaces',
      region: 'nyc3',
      bucket: 'my-space',
      key: process.env.DO_SPACES_KEY,
      secret: process.env.DO_SPACES_SECRET,
      cdn: 'https://my-space.nyc3.cdn.digitaloceanspaces.com',
    },
  },

  validation: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [],
    blockedExtensions: ['.exe', '.php', '.sh'],
  },

  security: {
    scan: true,
    validate_signatures: true,
  },

  processing: {
    quality: 80,
    autoOrient: true,
    thumbnails: [
      { width: 200, height: 200, suffix: '_thumb' },
      { width: 400, height: 400, suffix: '_medium' },
    ],
  },
};
```

## Environment Variables

```bash
# Default disk
UPLOAD_DISK=local

# Local disk
UPLOAD_LOCAL_ROOT=./storage/uploads
UPLOAD_LOCAL_URL=/storage/uploads

# AWS S3
AWS_REGION=us-east-1
AWS_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DigitalOcean Spaces
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=my-space
DO_SPACES_KEY=your-key
DO_SPACES_SECRET=your-secret
DO_SPACES_CDN=https://my-space.nyc3.cdn.digitaloceanspaces.com

# Validation
UPLOAD_MAX_SIZE=10485760
UPLOAD_IMAGE_MAX_SIZE=5242880

# Security
UPLOAD_SECURITY_SCAN=true
UPLOAD_SECURITY_VALIDATE_SIGNATURES=true
```

## Basic Usage

### Upload File

```javascript
import { Upload } from 'vasuzex';

// Upload single file
const result = await Upload.upload(file, {
  disk: 'local',
  path: 'uploads/images',
});

console.log(result.path); // uploads/images/1234567890-abc123.jpg
console.log(result.url); // /storage/uploads/images/1234567890-abc123.jpg
console.log(result.size); // 123456
```

### Upload with Validation

```javascript
const result = await Upload.upload(file, {
  disk: 's3',
  path: 'products',
  validate: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    dimensions: {
      minWidth: 800,
      minHeight: 600,
      maxWidth: 4000,
      maxHeight: 4000,
    },
  },
});
```

### Upload with Image Processing

```javascript
const result = await Upload.upload(file, {
  disk: 'spaces',
  path: 'products',
  process: {
    resize: {
      width: 1200,
      height: 900,
      fit: 'cover',
    },
    format: 'webp',
    quality: 85,
    thumbnails: [
      { width: 200, height: 200, suffix: '_thumb' },
      { width: 400, height: 400, suffix: '_medium' },
      { width: 800, height: 800, suffix: '_large' },
    ],
  },
});

console.log(result.thumbnails);
// [
//   { path: 'products/1234_thumb.webp', url: '...' },
//   { path: 'products/1234_medium.webp', url: '...' },
//   { path: 'products/1234_large.webp', url: '...' }
// ]
```

### Upload Multiple Files

```javascript
const results = await Upload.uploadMultiple(files, {
  disk: 'local',
  path: 'gallery',
  validate: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
  },
});

console.log(results.results); // Array of upload results
console.log(results.errors); // Array of errors (if any)
console.log(results.success); // true if all succeeded
```

### Delete File

```javascript
await Upload.delete('uploads/images/old-image.jpg');

// Delete from specific disk
await Upload.delete('products/image.jpg', 's3');

// Delete multiple files
const result = await Upload.deleteMultiple([
  'uploads/image1.jpg',
  'uploads/image2.jpg',
]);
```

### Get File URL

```javascript
const url = Upload.url('uploads/images/photo.jpg');
// /storage/uploads/images/photo.jpg

// Get URL from specific disk
const s3Url = Upload.disk('s3').url('products/item.jpg');
// https://my-bucket.s3.amazonaws.com/products/item.jpg

// Get CDN URL (DigitalOcean Spaces)
const cdnUrl = Upload.disk('spaces').url('images/photo.jpg');
// https://my-space.nyc3.cdn.digitaloceanspaces.com/images/photo.jpg
```

### Check if File Exists

```javascript
const exists = await Upload.exists('uploads/images/photo.jpg');

if (exists) {
  console.log('File exists');
}
```

### Get File Metadata

```javascript
const metadata = await Upload.getMetadata('uploads/images/photo.jpg');

console.log(metadata);
// {
//   path: 'uploads/images/photo.jpg',
//   size: 123456,
//   lastModified: Date,
//   contentType: 'image/jpeg'
// }
```

### Download File

```javascript
const buffer = await Upload.download('uploads/documents/report.pdf');

// Use buffer as needed
res.send(buffer);
```

### Copy/Move Files

```javascript
// Copy file
await Upload.copy(
  'uploads/original.jpg',
  'uploads/backup/copy.jpg'
);

// Move file
await Upload.move(
  'uploads/temp/file.jpg',
  'uploads/permanent/file.jpg'
);
```

## Using Different Disks

### Local Disk

```javascript
const result = await Upload.disk('local').upload(file, {
  path: 'uploads/images',
});
```

### Amazon S3

```javascript
const result = await Upload.disk('s3').upload(file, {
  path: 'products',
});

// Get signed URL (temporary access)
const signedUrl = await Upload.disk('s3').getSignedUrl(
  'products/image.jpg',
  3600 // 1 hour
);
```

### DigitalOcean Spaces

```javascript
const result = await Upload.disk('spaces').upload(file, {
  path: 'images',
});

// Get CDN URL
const cdnUrl = Upload.disk('spaces').cdnUrl('images/photo.jpg');

// Get direct URL (non-CDN)
const directUrl = Upload.disk('spaces').directUrl('images/photo.jpg');
```

## Validation

### Preset Rules

```javascript
import { FileValidator } from 'vasuzex';

// Use preset for images
await Upload.upload(file, {
  validate: FileValidator.presets.image,
});

// Available presets:
// - FileValidator.presets.image
// - FileValidator.presets.avatar
// - FileValidator.presets.document
// - FileValidator.presets.video
// - FileValidator.presets.audio
```

### Custom Validation

```javascript
await Upload.upload(file, {
  validate: {
    maxSize: 10 * 1024 * 1024,
    minSize: 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    blockedExtensions: ['.exe', '.php'],
    dimensions: {
      minWidth: 100,
      maxWidth: 4000,
      minHeight: 100,
      maxHeight: 4000,
      aspectRatio: 16/9,
      aspectRatioTolerance: 0.1,
    },
    customValidator: async (fileData) => {
      if (fileData.size > 1000000) {
        throw new Error('File too large for custom check');
      }
    },
  },
});
```

## Image Processing

### Resize

```javascript
await Upload.upload(file, {
  process: {
    resize: {
      width: 800,
      height: 600,
      fit: 'cover', // cover, contain, fill, inside, outside
      position: 'center', // center, top, bottom, left, right
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  },
});
```

### Crop

```javascript
await Upload.upload(file, {
  process: {
    crop: {
      x: 100,
      y: 100,
      width: 500,
      height: 500,
    },
  },
});
```

### Format Conversion

```javascript
await Upload.upload(file, {
  process: {
    format: 'webp',
    quality: 85,
  },
});

// Supported formats: jpeg, png, webp, avif, tiff, gif
```

### Thumbnails

```javascript
await Upload.upload(file, {
  process: {
    thumbnails: [
      {
        width: 150,
        height: 150,
        suffix: '_small',
        fit: 'cover',
      },
      {
        width: 300,
        height: 300,
        suffix: '_medium',
        fit: 'cover',
        format: 'webp',
        quality: 80,
      },
      {
        width: 600,
        height: 600,
        suffix: '_large',
      },
    ],
  },
});
```

### Watermark

```javascript
await Upload.upload(file, {
  process: {
    watermark: {
      image: './assets/watermark.png', // or buffer
      position: 'bottom-right', // top-left, center, etc.
      opacity: 0.5,
      padding: 10,
      width: 200, // resize watermark
    },
  },
});
```

### Advanced Processing

```javascript
await Upload.upload(file, {
  process: {
    resize: { width: 1200, height: 900 },
    sharpen: true,
    blur: 5,
    grayscale: true,
    autoOrient: true,
    format: 'webp',
    quality: 85,
  },
});
```

### Image Optimization

```javascript
import { ImageProcessor } from 'vasuzex';

const processor = new ImageProcessor(app);

// Optimize image (maintains format)
const optimized = await processor.optimize(buffer, {
  quality: 80,
  progressive: true,
  compressionLevel: 9, // PNG only
});

// Convert to WebP
const webp = await processor.toWebP(buffer, 85);

// Get image info
const info = await processor.getInfo(buffer);
console.log(info);
// { format: 'jpeg', width: 1920, height: 1080, ... }
```

## Security

### File Signature Validation

Upload service automatically validates file signatures (magic bytes) to ensure file extension matches actual content:

```javascript
// This will fail if you rename .exe to .jpg
await Upload.upload(file, {
  scan: true, // enabled by default
});
```

### Dangerous File Blocking

Automatically blocks dangerous file types:

```javascript
// Blocked extensions:
// .exe, .dll, .bat, .cmd, .php, .sh, .asp, .jsp, etc.
```

### Virus Scanning (Optional)

Integrate with ClamAV for virus scanning:

```javascript
// config/upload.cjs
module.exports = {
  security: {
    scan: true,
    custom_scanner: {
      type: 'clamav',
      host: 'localhost',
      port: 3310,
      timeout: 60000,
    },
  },
};
```

### Sanitize Filenames

```javascript
import { SecurityScanner } from 'vasuzex';

const scanner = new SecurityScanner(app);

// Remove path traversal, null bytes, control characters
const safe = scanner.sanitizeFilename('../../../etc/passwd');
// 'etcpasswd'
```

## Working with Multer

Upload service works seamlessly with Multer:

```javascript
import multer from 'multer';
import { Upload } from 'vasuzex';

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  const result = await Upload.upload(req.file, {
    disk: 's3',
    path: 'uploads',
    validate: {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png'],
    },
  });

  res.json(result);
});
```

## Working with Base64

```javascript
// Upload base64 string
const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

const result = await Upload.upload(base64, {
  disk: 'local',
  path: 'uploads/images',
});
```

## Working with Buffers

```javascript
const fs = require('fs');
const buffer = await fs.promises.readFile('./image.jpg');

const result = await Upload.upload(buffer, {
  disk: 's3',
  path: 'uploads',
  filename: 'custom-name.jpg',
});
```

## Error Handling

```javascript
import { ValidationError, SecurityError } from 'vasuzex';

try {
  await Upload.upload(file, {
    validate: { maxSize: 1024 * 1024 },
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.errors);
    // ['File size exceeds maximum allowed size of 1 MB']
  }

  if (error instanceof SecurityError) {
    console.log('Security scan failed:', error.errors);
    // ['Virus detected: EICAR-Test-File']
  }
}
```

## Advanced Usage

### Custom Driver

```javascript
import { UploadManager } from 'vasuzex';

class CustomDriver {
  async upload(buffer, filepath, options) {
    // Your custom upload logic
    return { path, url, size };
  }

  async delete(filepath) {
    // Your delete logic
  }

  // Implement other methods...
}

const uploadManager = app.make('upload');
uploadManager.extend('custom', (app, config) => {
  return new CustomDriver(config);
});

// Use custom driver
await Upload.disk('custom').upload(file);
```

### Programmatic Usage

```javascript
import { UploadManager } from 'vasuzex';

const uploadManager = new UploadManager(app);

// Upload to default disk
const result = await uploadManager.upload(file, {
  path: 'uploads',
});

// Upload to specific disk
const s3Result = await uploadManager.disk('s3').upload(file, {
  path: 'products',
});

// Get available disks
const disks = uploadManager.availableDisks();
console.log(disks); // ['local', 's3', 'spaces']
```

## Best Practices

### 1. Use Appropriate Validation

```javascript
// For user avatars
await Upload.upload(file, {
  validate: FileValidator.presets.avatar,
  process: {
    resize: { width: 400, height: 400, fit: 'cover' },
    format: 'webp',
    quality: 85,
  },
});

// For product images
await Upload.upload(file, {
  validate: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { minWidth: 800, minHeight: 800 },
  },
  process: {
    resize: { width: 1200, height: 1200 },
    thumbnails: [
      { width: 200, height: 200, suffix: '_thumb' },
      { width: 600, height: 600, suffix: '_medium' },
    ],
  },
});
```

### 2. Use CDN for Production

```javascript
// config/upload.cjs
module.exports = {
  cdn: {
    enabled: true,
    url: 'https://cdn.example.com',
  },
};
```

### 3. Organize Files by Type

```javascript
const paths = {
  avatars: 'uploads/avatars',
  products: 'uploads/products',
  documents: 'uploads/documents',
};

await Upload.upload(file, {
  path: paths.avatars,
});
```

### 4. Clean Up Temp Files

```javascript
// Delete old files in temp directory
const tempFiles = await Upload.disk('local').listFiles('uploads/temp');

for (const file of tempFiles) {
  const metadata = await Upload.getMetadata(file.path);
  const age = Date.now() - metadata.lastModified.getTime();
  
  if (age > 24 * 60 * 60 * 1000) { // 24 hours
    await Upload.delete(file.path);
  }
}
```

### 5. Use Signed URLs for Private Files

```javascript
// Upload private file
await Upload.disk('s3').upload(file, {
  path: 'private/documents',
  visibility: 'private',
});

// Get temporary signed URL
const signedUrl = await Upload.disk('s3').getSignedUrl(
  'private/documents/file.pdf',
  3600 // Valid for 1 hour
);
```

## Performance Optimization

### 1. Process Images Asynchronously

```javascript
import { Queue } from 'vasuzex';

// Queue image processing
await Queue.push('process-image', {
  path: uploadResult.path,
  sizes: [200, 400, 800],
});

// In queue job
class ProcessImageJob {
  async handle(data) {
    const buffer = await Upload.download(data.path);
    
    for (const size of data.sizes) {
      await Upload.upload(buffer, {
        process: {
          resize: { width: size, height: size },
        },
        filename: `${data.path}_${size}`,
      });
    }
  }
}
```

### 2. Use Streaming for Large Files

```javascript
// For very large files, consider streaming
const driver = Upload.disk('s3');
const stream = createReadStream('./large-video.mp4');

// Implement streaming in custom driver
```

### 3. Batch Operations

```javascript
// Upload multiple files in parallel
const files = [file1, file2, file3];
const promises = files.map(file => 
  Upload.upload(file, { path: 'batch' })
);

const results = await Promise.all(promises);
```

## Testing

### Using Log Driver

```javascript
// config/upload.cjs (test environment)
module.exports = {
  default: 'test',

  disks: {
    test: {
      driver: 'local',
      root: './storage/test-uploads',
    },
  },
};

// In tests
import { Upload } from 'vasuzex';

test('upload file', async () => {
  const file = createMockFile();
  const result = await Upload.upload(file, {
    disk: 'test',
    path: 'uploads',
  });

  expect(result.path).toBeDefined();
  expect(result.url).toBeDefined();
});

// Cleanup after tests
afterAll(async () => {
  const files = await Upload.disk('test').listFiles('uploads');
  await Upload.deleteMultiple(files.map(f => f.path), 'test');
});
```

## Troubleshooting

### Sharp Installation Issues

```bash
# Rebuild sharp for your platform
npm rebuild sharp

# Or install with specific version
npm install sharp@latest
```

### AWS SDK Issues

```bash
# Install required AWS SDK packages
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Permission Errors (Local Disk)

```bash
# Ensure storage directory has write permissions
chmod -R 775 storage/uploads
```

### Large File Uploads

```javascript
// Increase max file size in config
module.exports = {
  validation: {
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

// Also configure Express body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
```

## API Reference

### UploadManager

- `upload(file, options)` - Upload single file
- `uploadMultiple(files, options)` - Upload multiple files
- `delete(path, disk?)` - Delete file
- `deleteMultiple(paths, disk?)` - Delete multiple files
- `exists(path, disk?)` - Check if file exists
- `url(path, disk?)` - Get file URL
- `getMetadata(path, disk?)` - Get file metadata
- `download(path, disk?)` - Download file as buffer
- `copy(from, to, disk?)` - Copy file
- `move(from, to, disk?)` - Move file
- `disk(name?)` - Get disk instance
- `availableDisks()` - Get available disk names
- `extend(driver, creator)` - Register custom driver

### FileValidator

- `validate(fileData, rules)` - Validate file
- `presets.image` - Image validation preset
- `presets.avatar` - Avatar validation preset
- `presets.document` - Document validation preset
- `presets.video` - Video validation preset
- `presets.audio` - Audio validation preset

### ImageProcessor

- `process(buffer, options)` - Process image
- `optimize(buffer, options)` - Optimize image
- `toWebP(buffer, quality)` - Convert to WebP
- `getInfo(buffer)` - Get image information

### SecurityScanner

- `scan(fileData)` - Scan file for threats
- `sanitizeFilename(filename)` - Sanitize filename

## License

MIT
