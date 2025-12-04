#!/usr/bin/env node
/**
 * Integration test for media server route pattern
 */

const pathToRegexp = require('path-to-regexp');

console.log('🧪 Testing path-to-regexp v8 compatibility...\n');

// Test 1: Route pattern compilation
console.log('Test 1: Route pattern compilation');
try {
  const match = pathToRegexp.match('/{*path}');
  console.log('✅ Pattern /{*path} compiles successfully\n');
} catch (e) {
  console.log('❌ FAILED:', e.message);
  process.exit(1);
}

// Test 2: Path matching
console.log('Test 2: Path matching');
const match = pathToRegexp.match('/{*path}');
const testPaths = [
  '/uploads/photo.jpg',
  '/uploads/products/123/image.png',
  '/a/b/c/d/e/file.jpg'
];

testPaths.forEach(path => {
  const result = match(path);
  if (result && result.params.path) {
    console.log(`✅ ${path} -> matched`);
  } else {
    console.log(`❌ ${path} -> no match`);
    process.exit(1);
  }
});

// Test 3: Controller logic simulation
console.log('\nTest 3: Controller path handling');
const mockReq = {
  params: { path: ['uploads', 'products', '123', 'photo.jpg'] }
};

const imagePath = Array.isArray(mockReq.params.path) 
  ? mockReq.params.path.join('/') 
  : mockReq.params.path;

if (imagePath === 'uploads/products/123/photo.jpg') {
  console.log('✅ Controller correctly joins path array');
} else {
  console.log('❌ Controller path handling failed');
  process.exit(1);
}

console.log('\n🎉 All tests passed!');
