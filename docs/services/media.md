# Media Service

Image processing, optimization, and CDN delivery.

## Features

- 🖼️ **Image Processing** - Resize, crop, rotate, filters
- 🚀 **CDN Integration** - Cloudflare, AWS CloudFront, Fastly
- 💾 **Smart Caching** - Browser, CDN, and server caching
- 📐 **On-Demand Resizing** - Generate sizes dynamically
- 🎨 **Format Conversion** - WebP, AVIF, JPEG, PNG
- ⚡ **Lazy Loading** - Blur placeholders

## Quick Start

```javascript
import { Media } from '@vasuzex/framework';

// Process image
const processed = await Media.process('/uploads/photo.jpg', {
  width: 800,
  height: 600,
  fit: 'cover',
  quality: 85,
  format: 'webp'
});

// Get CDN URL
const url = Media.url(processed.path);

// Get responsive URLs
const srcset = Media.srcset('/uploads/photo.jpg', [400, 800, 1200]);
```

## Configuration

**File:** `config/media.cjs`

```javascript
module.exports = {
  // Image processing
  processing: {
    driver: 'sharp', // sharp or jimp
    quality: {
      jpeg: 85,
      webp: 80,
      avif: 75,
      png: 90
    },
    formats: ['webp', 'jpeg', 'png', 'avif'],
    defaultFormat: 'webp',
    maxSize: 5 * 1024 * 1024, // 5MB
    maxDimension: 4096
  },

  // CDN configuration
  cdn: {
    enabled: env('CDN_ENABLED', false),
    provider: env('CDN_PROVIDER', 'cloudflare'),
    
    cloudflare: {
      domain: env('CLOUDFLARE_CDN_DOMAIN'),
      zoneId: env('CLOUDFLARE_ZONE_ID'),
      apiToken: env('CLOUDFLARE_API_TOKEN'),
      variants: {
        thumbnail: 'width=200,height=200,fit=cover',
        medium: 'width=800,quality=85',
        large: 'width=1200,quality=85'
      }
    },

    cloudfront: {
      domain: env('CLOUDFRONT_DOMAIN'),
      distributionId: env('CLOUDFRONT_DISTRIBUTION_ID'),
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY')
    },

    fastly: {
      domain: env('FASTLY_DOMAIN'),
      serviceId: env('FASTLY_SERVICE_ID'),
      apiKey: env('FASTLY_API_KEY')
    }
  },

  // Caching
  cache: {
    enabled: true,
    driver: 'file',
    path: 'storage/media/cache',
    ttl: 86400 * 30, // 30 days
    browserCache: 31536000 // 1 year
  },

  // Storage
  storage: {
    disk: 'public',
    path: 'uploads',
    url: env('APP_URL') + '/uploads'
  },

  // Responsive images
  responsive: {
    breakpoints: [320, 640, 768, 1024, 1280, 1920],
    defaultSizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },

  // Optimization
  optimization: {
    stripMetadata: true,
    progressive: true,
    mozjpeg: true,
    oxipng: true
  }
};
```

## Image Processing

### Basic Operations

```javascript
// Resize
const resized = await Media.process('/uploads/photo.jpg', {
  width: 800,
  height: 600
});

// Crop
const cropped = await Media.process('/uploads/photo.jpg', {
  width: 400,
  height: 400,
  fit: 'cover', // cover, contain, fill, inside, outside
  position: 'center' // center, top, bottom, left, right
});

// Rotate
const rotated = await Media.process('/uploads/photo.jpg', {
  rotate: 90
});

// Format conversion
const webp = await Media.process('/uploads/photo.jpg', {
  format: 'webp',
  quality: 80
});

// Blur (placeholder)
const blurred = await Media.process('/uploads/photo.jpg', {
  blur: 10,
  width: 20
});
```

### Advanced Processing

```javascript
// Filters
const filtered = await Media.process('/uploads/photo.jpg', {
  grayscale: true,
  brightness: 1.2,
  contrast: 1.1,
  saturation: 1.3
});

// Watermark
const watermarked = await Media.process('/uploads/photo.jpg', {
  watermark: {
    image: '/assets/watermark.png',
    position: 'bottom-right',
    opacity: 0.5,
    margin: 10
  }
});

// Multiple operations
const processed = await Media.process('/uploads/photo.jpg', {
  width: 1200,
  height: 800,
  fit: 'cover',
  format: 'webp',
  quality: 85,
  sharpen: true,
  stripMetadata: true
});
```

## CDN Integration

### Cloudflare Images

```javascript
// Upload to Cloudflare
const uploaded = await Media.cdn('cloudflare').upload('/uploads/photo.jpg', {
  requireSignedURLs: false,
  metadata: { alt: 'Product photo' }
});

// Get variant URLs
const thumbnail = Media.cdn('cloudflare').variant(uploaded.id, 'thumbnail');
const medium = Media.cdn('cloudflare').variant(uploaded.id, 'medium');

// Custom transformations
const url = Media.cdn('cloudflare').transform(uploaded.id, {
  width: 800,
  height: 600,
  fit: 'cover',
  format: 'webp'
});
```

### CloudFront

```javascript
// CloudFront URL with signed URL
const url = Media.cdn('cloudfront').signUrl('/uploads/photo.jpg', {
  expires: 3600 // 1 hour
});

// Invalidate cache
await Media.cdn('cloudfront').invalidate(['/uploads/photo.jpg']);
```

## Real-World Examples

### 1. Product Images

```javascript
// Upload product image
router.post('/products/:id/images', upload.single('image'), async (req, res) => {
  const product = await Product.find(req.params.id);
  
  // Generate multiple sizes
  const sizes = {
    thumbnail: { width: 200, height: 200, fit: 'cover' },
    medium: { width: 800, height: 800, fit: 'inside' },
    large: { width: 1200, height: 1200, fit: 'inside' }
  };
  
  const images = {};
  for (const [name, options] of Object.entries(sizes)) {
    const processed = await Media.process(req.file.path, {
      ...options,
      format: 'webp',
      quality: 85
    });
    images[name] = processed.path;
  }
  
  await product.update({ images });
  
  res.json({ images });
});
```

### 2. Responsive Images

```javascript
// Generate srcset
router.get('/api/images/:id/srcset', async (req, res) => {
  const image = await Image.find(req.params.id);
  
  const srcset = await Media.srcset(image.path, [400, 800, 1200, 1600]);
  
  res.json({
    src: Media.url(image.path),
    srcset,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  });
});

// Frontend usage
<img
  src={image.src}
  srcset={image.srcset}
  sizes={image.sizes}
  alt="Product"
  loading="lazy"
/>
```

### 3. Blur Placeholders

```javascript
// Generate blur placeholder
async function generatePlaceholder(imagePath) {
  const blurred = await Media.process(imagePath, {
    width: 20,
    blur: 10,
    format: 'jpeg',
    quality: 50
  });
  
  // Convert to base64
  const buffer = await fs.readFile(blurred.path);
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

// Usage
const placeholder = await generatePlaceholder('/uploads/photo.jpg');

<img
  src={placeholder}
  data-src={Media.url('/uploads/photo.jpg')}
  class="lazy"
/>
```

### 4. Image Optimization Pipeline

```javascript
async function optimizeUpload(file) {
  // 1. Process and optimize
  const optimized = await Media.process(file.path, {
    format: 'webp',
    quality: 85,
    stripMetadata: true,
    progressive: true
  });
  
  // 2. Generate responsive sizes
  const sizes = await Media.generateSizes(optimized.path, {
    breakpoints: [320, 640, 768, 1024, 1280, 1920],
    format: 'webp'
  });
  
  // 3. Upload to CDN
  if (config.cdn.enabled) {
    await Media.cdn().upload(optimized.path);
  }
  
  // 4. Clean up original
  await fs.unlink(file.path);
  
  return {
    original: optimized.path,
    sizes,
    cdn: config.cdn.enabled
  };
}
```

### 5. Dynamic Image Proxy

```javascript
// On-demand image resizing
router.get('/img/:transformations/:path(*)', async (req, res) => {
  const { transformations, path } = req.params;
  
  // Parse transformations: w_800,h_600,q_85,f_webp
  const options = parseTransformations(transformations);
  
  // Check cache
  const cacheKey = `${path}?${transformations}`;
  let cached = await Cache.get(cacheKey);
  
  if (!cached) {
    // Process image
    const processed = await Media.process(path, options);
    cached = processed.path;
    await Cache.put(cacheKey, cached, 86400);
  }
  
  // Set cache headers
  res.set({
    'Cache-Control': 'public, max-age=31536000',
    'Content-Type': 'image/' + options.format
  });
  
  res.sendFile(cached);
});

// Usage: /img/w_800,h_600,q_85,f_webp/uploads/photo.jpg
```

### 6. Image Upload with Validation

```javascript
router.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  
  // Validate
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large' });
  }
  
  // Get dimensions
  const metadata = await Media.getMetadata(file.path);
  if (metadata.width > 4096 || metadata.height > 4096) {
    return res.status(400).json({ error: 'Image too large' });
  }
  
  // Optimize
  const optimized = await Media.process(file.path, {
    format: 'webp',
    quality: 85,
    stripMetadata: true
  });
  
  res.json({
    path: optimized.path,
    url: Media.url(optimized.path),
    width: optimized.width,
    height: optimized.height,
    size: optimized.size
  });
});
```

## Testing

```bash
# Run media tests
pnpm test tests/unit/Media/
```

**Coverage:** 18/18 tests passing ✅

## API Reference

### Media Facade

```javascript
// Processing
await Media.process(path, options)
await Media.getMetadata(path)

// CDN
Media.cdn(provider = null)
Media.url(path)
Media.srcset(path, widths)

// Sizes
await Media.generateSizes(path, options)
```

### Processing Options

```javascript
{
  width: 800,
  height: 600,
  fit: 'cover', // cover, contain, fill, inside, outside
  position: 'center',
  format: 'webp', // webp, jpeg, png, avif
  quality: 85,
  rotate: 90,
  flip: true,
  flop: true,
  blur: 10,
  sharpen: true,
  grayscale: true,
  brightness: 1.2,
  contrast: 1.1,
  saturation: 1.3,
  stripMetadata: true,
  progressive: true
}
```

## Environment Variables

```env
# CDN
CDN_ENABLED=true
CDN_PROVIDER=cloudflare

# Cloudflare
CLOUDFLARE_CDN_DOMAIN=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=

# CloudFront
CLOUDFRONT_DOMAIN=
CLOUDFRONT_DISTRIBUTION_ID=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Performance Tips

1. **Use WebP format** - 30% smaller than JPEG
2. **Enable CDN caching** - Offload bandwidth
3. **Generate sizes at upload** - Not on-demand
4. **Strip metadata** - Reduce file size
5. **Use blur placeholders** - Better UX

## See Also

- [File Upload](/docs/services/upload.md)
- [Storage](/docs/features/storage.md)
- [CDN Setup](/docs/deployment/cdn.md)
