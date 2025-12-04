/**
 * Upload Service Examples
 * 
 * Comprehensive examples demonstrating all Upload service features.
 * 
 * Run: node examples/upload-example.js
 */

import { Upload, FileValidator } from 'vasuzex';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Mock application for examples
const app = {
  config: (key, defaultValue) => {
    const config = {
      'upload.default': 'local',
      'upload.disks': {
        local: {
          driver: 'local',
          root: './storage/uploads',
          url: '/storage/uploads',
          visibility: 'public',
        },
        s3: {
          driver: 's3',
          region: 'us-east-1',
          bucket: 'my-bucket',
          key: process.env.AWS_ACCESS_KEY_ID,
          secret: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
      'upload.security.scan': true,
      'upload.security.validate_signatures': true,
    };

    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value?.[k];
    }
    return value !== undefined ? value : defaultValue;
  },
  singleton: () => {},
  make: () => {},
};

console.log('📤 Upload Service Examples\n');

// Example 1: Basic File Upload
async function example1() {
  console.log('1️⃣  Basic File Upload');
  console.log('─'.repeat(50));

  try {
    // Mock file object (like from multer)
    const file = {
      buffer: Buffer.from('fake image data'),
      size: 1024,
      mimetype: 'image/jpeg',
      originalname: 'photo.jpg',
    };

    const result = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/images',
    });

    console.log('✅ Upload successful:');
    console.log('   Path:', result.path);
    console.log('   URL:', result.url);
    console.log('   Size:', result.size);
    console.log('   Disk:', result.disk);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 2: Upload with Validation
async function example2() {
  console.log('2️⃣  Upload with Validation');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('image data'),
      size: 2048,
      mimetype: 'image/jpeg',
      originalname: 'avatar.jpg',
    };

    const result = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/avatars',
      validate: {
        maxSize: 5 * 1024 * 1024, // 5MB
        minSize: 1024, // 1KB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
        dimensions: {
          minWidth: 100,
          maxWidth: 2000,
          minHeight: 100,
          maxHeight: 2000,
        },
      },
    });

    console.log('✅ Validation passed:');
    console.log('   Path:', result.path);
    console.log('   Size:', result.size, 'bytes');
  } catch (error) {
    console.log('❌ Validation failed:', error.errors);
  }

  console.log();
}

// Example 3: Upload with Preset Validation
async function example3() {
  console.log('3️⃣  Upload with Preset Validation');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('avatar image'),
      size: 1536,
      mimetype: 'image/png',
      originalname: 'user-avatar.png',
    };

    // Use built-in avatar preset
    const result = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/avatars',
      validate: FileValidator.presets.avatar,
    });

    console.log('✅ Avatar uploaded:');
    console.log('   Using preset: FileValidator.presets.avatar');
    console.log('   Max size: 2MB');
    console.log('   Allowed types: JPEG, PNG');
    console.log('   Min dimensions: 100x100');
    console.log('   Max dimensions: 2000x2000');
    console.log();
    console.log('   Available presets:');
    console.log('   - FileValidator.presets.image');
    console.log('   - FileValidator.presets.avatar');
    console.log('   - FileValidator.presets.document');
    console.log('   - FileValidator.presets.video');
    console.log('   - FileValidator.presets.audio');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 4: Upload with Image Processing
async function example4() {
  console.log('4️⃣  Upload with Image Processing');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('large image data'),
      size: 3072,
      mimetype: 'image/jpeg',
      originalname: 'product.jpg',
    };

    const result = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/products',
      process: {
        resize: {
          width: 1200,
          height: 900,
          fit: 'cover',
          position: 'center',
        },
        format: 'webp',
        quality: 85,
        autoOrient: true,
      },
    });

    console.log('✅ Image processed:');
    console.log('   Resized: 1200x900');
    console.log('   Format: WebP');
    console.log('   Quality: 85%');
    console.log('   Auto-oriented: Yes');
    console.log('   Path:', result.path);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 5: Upload with Thumbnails
async function example5() {
  console.log('5️⃣  Upload with Thumbnails');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('product image'),
      size: 4096,
      mimetype: 'image/jpeg',
      originalname: 'product-main.jpg',
    };

    const result = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/products',
      process: {
        resize: { width: 1200, height: 1200 },
        format: 'webp',
        quality: 85,
        thumbnails: [
          { width: 150, height: 150, suffix: '_thumb', fit: 'cover' },
          { width: 400, height: 400, suffix: '_medium', fit: 'cover' },
          { width: 800, height: 800, suffix: '_large', fit: 'cover' },
        ],
      },
    });

    console.log('✅ Image uploaded with thumbnails:');
    console.log('   Main:', result.path);
    console.log('   Thumbnails:');
    result.thumbnails.forEach((thumb) => {
      console.log('   -', thumb.path);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 6: Upload Multiple Files
async function example6() {
  console.log('6️⃣  Upload Multiple Files');
  console.log('─'.repeat(50));

  try {
    const files = [
      {
        buffer: Buffer.from('image 1'),
        size: 1024,
        mimetype: 'image/jpeg',
        originalname: 'photo1.jpg',
      },
      {
        buffer: Buffer.from('image 2'),
        size: 2048,
        mimetype: 'image/png',
        originalname: 'photo2.png',
      },
      {
        buffer: Buffer.from('image 3'),
        size: 1536,
        mimetype: 'image/webp',
        originalname: 'photo3.webp',
      },
    ];

    const results = await Upload.uploadMultiple(files, {
      disk: 'local',
      path: 'uploads/gallery',
      validate: {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
    });

    console.log('✅ Multiple uploads:');
    console.log('   Total files:', files.length);
    console.log('   Successful:', results.results.length);
    console.log('   Failed:', results.errors.length);
    console.log('   Success:', results.success ? 'Yes' : 'No');
    console.log();
    console.log('   Uploaded files:');
    results.results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.path}`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 7: Upload Base64 Image
async function example7() {
  console.log('7️⃣  Upload Base64 Image');
  console.log('─'.repeat(50));

  try {
    // Mock base64 string
    const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2w==';

    const result = await Upload.upload(base64, {
      disk: 'local',
      path: 'uploads/base64',
    });

    console.log('✅ Base64 uploaded:');
    console.log('   Input: data:image/jpeg;base64,...');
    console.log('   Path:', result.path);
    console.log('   URL:', result.url);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 8: File Operations (Delete, Exists, Metadata)
async function example8() {
  console.log('8️⃣  File Operations');
  console.log('─'.repeat(50));

  try {
    // Upload a file first
    const file = {
      buffer: Buffer.from('temp file'),
      size: 512,
      mimetype: 'text/plain',
      originalname: 'temp.txt',
    };

    const uploaded = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/temp',
      filename: 'operations-test.txt',
    });

    console.log('📁 File uploaded:', uploaded.path);

    // Check if exists
    const exists = await Upload.exists(uploaded.path);
    console.log('✅ File exists:', exists);

    // Get metadata
    const metadata = await Upload.getMetadata(uploaded.path);
    console.log('📊 Metadata:', {
      size: metadata.size,
      lastModified: metadata.lastModified,
    });

    // Get URL
    const url = Upload.url(uploaded.path);
    console.log('🔗 URL:', url);

    // Delete file
    const deleted = await Upload.delete(uploaded.path);
    console.log('🗑️  Deleted:', deleted);

    // Check again
    const existsAfter = await Upload.exists(uploaded.path);
    console.log('❌ File exists after delete:', existsAfter);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 9: Using Different Disks
async function example9() {
  console.log('9️⃣  Using Different Disks');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('multi-disk file'),
      size: 1024,
      mimetype: 'image/jpeg',
      originalname: 'disk-test.jpg',
    };

    // Upload to local disk
    const localResult = await Upload.disk('local').upload(file, {
      path: 'uploads/local',
    });
    console.log('💾 Local disk:', localResult.path);

    // Upload to S3 (if configured)
    if (process.env.AWS_ACCESS_KEY_ID) {
      const s3Result = await Upload.disk('s3').upload(file, {
        path: 'uploads/s3',
      });
      console.log('☁️  S3 disk:', s3Result.path);
    } else {
      console.log('⚠️  S3 not configured (set AWS_ACCESS_KEY_ID)');
    }

    // Get available disks
    const disks = Upload.availableDisks();
    console.log('📀 Available disks:', disks.join(', '));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 10: Copy and Move Files
async function example10() {
  console.log('🔟 Copy and Move Files');
  console.log('─'.repeat(50));

  try {
    // Upload original file
    const file = {
      buffer: Buffer.from('original file'),
      size: 768,
      mimetype: 'text/plain',
      originalname: 'original.txt',
    };

    const original = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/original',
      filename: 'source.txt',
    });

    console.log('📄 Original file:', original.path);

    // Copy file
    await Upload.copy(
      original.path,
      'uploads/backup/copy.txt',
      'local'
    );
    console.log('📋 Copied to: uploads/backup/copy.txt');

    // Move file
    await Upload.move(
      original.path,
      'uploads/moved/file.txt',
      'local'
    );
    console.log('📦 Moved to: uploads/moved/file.txt');

    // Verify original is gone
    const originalExists = await Upload.exists(original.path);
    console.log('❌ Original exists:', originalExists);

    // Verify moved file exists
    const movedExists = await Upload.exists('uploads/moved/file.txt');
    console.log('✅ Moved file exists:', movedExists);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 11: Custom Filename Generation
async function example11() {
  console.log('1️⃣1️⃣  Custom Filename Generation');
  console.log('─'.repeat(50));

  try {
    const file = {
      buffer: Buffer.from('custom name file'),
      size: 512,
      mimetype: 'image/jpeg',
      originalname: 'photo.jpg',
    };

    // Auto-generated filename
    const auto = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/auto',
    });
    console.log('🤖 Auto-generated:', auto.path);

    // Custom filename
    const custom = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/custom',
      filename: 'my-custom-name.jpg',
    });
    console.log('✏️  Custom name:', custom.path);

    // Timestamp-based
    const timestamp = Date.now();
    const timestamped = await Upload.upload(file, {
      disk: 'local',
      path: 'uploads/timestamped',
      filename: `photo-${timestamp}.jpg`,
    });
    console.log('⏰ Timestamped:', timestamped.path);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Example 12: Security Features
async function example12() {
  console.log('1️⃣2️⃣  Security Features');
  console.log('─'.repeat(50));

  try {
    console.log('🔒 Security scanning enabled:');
    console.log('   ✅ File signature validation (magic bytes)');
    console.log('   ✅ Dangerous extension blocking');
    console.log('   ✅ Executable content detection');
    console.log('   ✅ Size bomb protection');
    console.log();

    // Test dangerous file
    const dangerousFile = {
      buffer: Buffer.from('fake executable'),
      size: 512,
      mimetype: 'application/x-msdownload',
      originalname: 'virus.exe',
    };

    console.log('🦠 Attempting to upload .exe file...');

    try {
      await Upload.upload(dangerousFile, {
        disk: 'local',
        path: 'uploads/test',
        scan: true,
      });
      console.log('⚠️  File was uploaded (unexpected)');
    } catch (error) {
      console.log('✅ Upload blocked:', error.message);
    }

    console.log();

    // Test file with mismatched signature
    console.log('📝 Testing signature validation...');
    const mismatchedFile = {
      buffer: Buffer.from('not really a JPEG'),
      size: 512,
      mimetype: 'text/plain',
      originalname: 'fake.jpg',
    };

    try {
      await Upload.upload(mismatchedFile, {
        disk: 'local',
        path: 'uploads/test',
        scan: true,
      });
      console.log('⚠️  Mismatch not detected');
    } catch (error) {
      console.log('✅ Signature mismatch detected');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();
}

// Run all examples
async function runAllExamples() {
  console.log('═'.repeat(50));
  console.log('  UPLOAD SERVICE - COMPREHENSIVE EXAMPLES');
  console.log('═'.repeat(50));
  console.log();

  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  await example7();
  await example8();
  await example9();
  await example10();
  await example11();
  await example12();

  console.log('═'.repeat(50));
  console.log('✅ All examples completed!');
  console.log('═'.repeat(50));
}

// Run examples
runAllExamples().catch(console.error);
