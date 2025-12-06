/**
 * Filesystem Tests
 * Comprehensive tests for Laravel-inspired filesystem operations
 */

import { Filesystem } from '../../../framework/Filesystem/Filesystem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, '../../temp/filesystem-test');

describe('Filesystem', () => {
  let filesystem;
  let testFile;
  let testContent;

  beforeEach(() => {
    filesystem = new Filesystem();
    testFile = path.join(testDir, 'test.txt');
    testContent = 'Hello, Filesystem!';

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('File Existence', () => {
    test('exists() returns true for existing file', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.exists(testFile)).toBe(true);
    });

    test('exists() returns false for non-existing file', () => {
      expect(filesystem.exists(testFile)).toBe(false);
    });

    test('missing() returns true for non-existing file', () => {
      expect(filesystem.missing(testFile)).toBe(true);
    });

    test('missing() returns false for existing file', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.missing(testFile)).toBe(false);
    });

    test('isFile() returns true for files', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.isFile(testFile)).toBe(true);
    });

    test('isFile() returns false for directories', () => {
      expect(filesystem.isFile(testDir)).toBe(false);
    });

    test('isDirectory() returns true for directories', () => {
      expect(filesystem.isDirectory(testDir)).toBe(true);
    });

    test('isDirectory() returns false for files', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.isDirectory(testFile)).toBe(false);
    });
  });

  describe('Reading Files', () => {
    test('get() reads file contents', () => {
      fs.writeFileSync(testFile, testContent);
      const content = filesystem.get(testFile);
      expect(content).toBe(testContent);
    });

    test('get() throws error for non-existing file', () => {
      expect(() => filesystem.get(testFile)).toThrow('File does not exist');
    });

    test('get() returns null when throwError is false', () => {
      const result = filesystem.get(testFile, false);
      expect(result).toBeNull();
    });

    test('getJson() parses JSON file', () => {
      const jsonData = { key: 'value', number: 42 };
      fs.writeFileSync(testFile, JSON.stringify(jsonData));
      
      const result = filesystem.getJson(testFile);
      expect(result).toEqual(jsonData);
    });

    test('hash() returns MD5 hash of file', () => {
      fs.writeFileSync(testFile, testContent);
      const hash = filesystem.hash(testFile);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(32);
    });

    test('hash() returns consistent hash for same content', () => {
      fs.writeFileSync(testFile, testContent);
      const hash1 = filesystem.hash(testFile);
      const hash2 = filesystem.hash(testFile);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('Writing Files', () => {
    test('put() creates new file', () => {
      const result = filesystem.put(testFile, testContent);
      
      expect(result).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(testContent);
    });

    test('put() creates directory if missing', () => {
      const nestedFile = path.join(testDir, 'nested/deep/test.txt');
      filesystem.put(nestedFile, testContent);
      
      expect(fs.existsSync(nestedFile)).toBe(true);
    });

    test('put() overwrites existing file', () => {
      fs.writeFileSync(testFile, 'old content');
      filesystem.put(testFile, testContent);
      
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(testContent);
    });

    test('replace() writes atomically', () => {
      filesystem.replace(testFile, testContent);
      
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(testContent);
    });

    test('prepend() adds content to beginning', () => {
      fs.writeFileSync(testFile, 'existing');
      filesystem.prepend(testFile, 'new ');
      
      expect(fs.readFileSync(testFile, 'utf-8')).toBe('new existing');
    });

    test('prepend() creates file if missing', () => {
      filesystem.prepend(testFile, testContent);
      
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(testContent);
    });

    test('append() adds content to end', () => {
      fs.writeFileSync(testFile, 'existing');
      filesystem.append(testFile, ' new');
      
      expect(fs.readFileSync(testFile, 'utf-8')).toBe('existing new');
    });
  });

  describe('Deleting Files', () => {
    test('delete() removes single file', () => {
      fs.writeFileSync(testFile, testContent);
      const result = filesystem.delete(testFile);
      
      expect(result).toBe(true);
      expect(fs.existsSync(testFile)).toBe(false);
    });

    test('delete() removes multiple files', () => {
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');
      
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');
      
      const result = filesystem.delete([file1, file2]);
      
      expect(result).toBe(true);
      expect(fs.existsSync(file1)).toBe(false);
      expect(fs.existsSync(file2)).toBe(false);
    });

    test('delete() returns true even if file does not exist', () => {
      const result = filesystem.delete(testFile);
      expect(result).toBe(true);
    });
  });

  describe('Moving and Copying', () => {
    test('move() renames file', () => {
      const target = path.join(testDir, 'moved.txt');
      fs.writeFileSync(testFile, testContent);
      
      filesystem.move(testFile, target);
      
      expect(fs.existsSync(testFile)).toBe(false);
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.readFileSync(target, 'utf-8')).toBe(testContent);
    });

    test('copy() duplicates file', () => {
      const target = path.join(testDir, 'copied.txt');
      fs.writeFileSync(testFile, testContent);
      
      filesystem.copy(testFile, target);
      
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.readFileSync(target, 'utf-8')).toBe(testContent);
    });
  });

  describe('File Information', () => {
    test('name() returns filename without extension', () => {
      expect(filesystem.name('/path/to/file.txt')).toBe('file');
      expect(filesystem.name('document.pdf')).toBe('document');
    });

    test('basename() returns full filename', () => {
      expect(filesystem.basename('/path/to/file.txt')).toBe('file.txt');
      expect(filesystem.basename('document.pdf')).toBe('document.pdf');
    });

    test('dirname() returns directory path', () => {
      expect(filesystem.dirname('/path/to/file.txt')).toBe('/path/to');
    });

    test('extension() returns file extension', () => {
      expect(filesystem.extension('file.txt')).toBe('txt');
      expect(filesystem.extension('image.jpg')).toBe('jpg');
      expect(filesystem.extension('archive.tar.gz')).toBe('gz');
    });

    test('type() returns MIME type', () => {
      expect(filesystem.type('file.txt')).toBe('text/plain');
      expect(filesystem.type('image.jpg')).toBe('image/jpeg');
      expect(filesystem.type('image.png')).toBe('image/png');
      expect(filesystem.type('data.json')).toBe('application/json');
      expect(filesystem.type('unknown.xyz')).toBe('application/octet-stream');
    });

    test('size() returns file size in bytes', () => {
      fs.writeFileSync(testFile, testContent);
      const size = filesystem.size(testFile);
      
      expect(size).toBe(Buffer.byteLength(testContent));
    });

    test('lastModified() returns timestamp', () => {
      fs.writeFileSync(testFile, testContent);
      const timestamp = filesystem.lastModified(testFile);
      
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe('Permissions', () => {
    test('isReadable() returns true for readable files', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.isReadable(testFile)).toBe(true);
    });

    test('isWritable() returns true for writable files', () => {
      fs.writeFileSync(testFile, testContent);
      expect(filesystem.isWritable(testFile)).toBe(true);
    });

    test('chmod() changes file permissions', () => {
      fs.writeFileSync(testFile, testContent);
      const result = filesystem.chmod(testFile, 0o644);
      expect(result).toBe(true);
    });

    test('chmod() returns current mode when mode is null', () => {
      fs.writeFileSync(testFile, testContent);
      const mode = filesystem.chmod(testFile, null);
      expect(typeof mode).toBe('number');
    });
  });

  describe('Directory Operations', () => {
    test('makeDirectory() creates directory', () => {
      const newDir = path.join(testDir, 'newdir');
      filesystem.makeDirectory(newDir);
      
      expect(fs.existsSync(newDir)).toBe(true);
      expect(filesystem.isDirectory(newDir)).toBe(true);
    });

    test('makeDirectory() creates nested directories with recursive option', () => {
      const nestedDir = path.join(testDir, 'level1/level2/level3');
      filesystem.makeDirectory(nestedDir, 0o755, true);
      
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    test('files() returns files in directory', () => {
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1');
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content2');
      fs.mkdirSync(path.join(testDir, 'subdir'));
      
      const files = filesystem.files(testDir);
      
      expect(files).toHaveLength(2);
      expect(files.some(f => f.endsWith('file1.txt'))).toBe(true);
      expect(files.some(f => f.endsWith('file2.txt'))).toBe(true);
    });

    test('files() with recursive option', () => {
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1');
      const subdir = path.join(testDir, 'subdir');
      fs.mkdirSync(subdir);
      fs.writeFileSync(path.join(subdir, 'file2.txt'), 'content2');
      
      const files = filesystem.files(testDir, true);
      
      expect(files).toHaveLength(2);
    });

    test('allFiles() returns all files recursively', () => {
      fs.writeFileSync(path.join(testDir, 'root.txt'), 'root');
      const subdir = path.join(testDir, 'subdir');
      fs.mkdirSync(subdir);
      fs.writeFileSync(path.join(subdir, 'nested.txt'), 'nested');
      
      const files = filesystem.allFiles(testDir);
      
      expect(files).toHaveLength(2);
    });

    test('directories() returns subdirectories', () => {
      fs.mkdirSync(path.join(testDir, 'dir1'));
      fs.mkdirSync(path.join(testDir, 'dir2'));
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      
      const dirs = filesystem.directories(testDir);
      
      expect(dirs).toHaveLength(2);
    });

    test('copyDirectory() copies entire directory', () => {
      const source = path.join(testDir, 'source');
      const target = path.join(testDir, 'target');
      
      fs.mkdirSync(source);
      fs.writeFileSync(path.join(source, 'file.txt'), 'content');
      
      filesystem.copyDirectory(source, target);
      
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.existsSync(path.join(target, 'file.txt'))).toBe(true);
    });

    test('moveDirectory() moves directory', () => {
      const source = path.join(testDir, 'source');
      const target = path.join(testDir, 'target');
      
      fs.mkdirSync(source);
      fs.writeFileSync(path.join(source, 'file.txt'), 'content');
      
      filesystem.moveDirectory(source, target);
      
      expect(fs.existsSync(source)).toBe(false);
      expect(fs.existsSync(target)).toBe(true);
    });

    test('deleteDirectory() removes directory and contents', () => {
      const dir = path.join(testDir, 'todelete');
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'file.txt'), 'content');
      
      filesystem.deleteDirectory(dir);
      
      expect(fs.existsSync(dir)).toBe(false);
    });

    test('cleanDirectory() empties directory but preserves it', () => {
      const dir = path.join(testDir, 'toclean');
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'file.txt'), 'content');
      
      filesystem.cleanDirectory(dir);
      
      expect(fs.existsSync(dir)).toBe(true);
      expect(filesystem.files(dir)).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty file content', () => {
      filesystem.put(testFile, '');
      expect(filesystem.get(testFile)).toBe('');
    });

    test('handles large file content', () => {
      const largeContent = 'x'.repeat(1000000);
      filesystem.put(testFile, largeContent);
      expect(filesystem.get(testFile)).toBe(largeContent);
    });

    test('handles special characters in content', () => {
      const specialContent = '特殊文字 🎉 \n\t\r';
      filesystem.put(testFile, specialContent);
      expect(filesystem.get(testFile)).toBe(specialContent);
    });

    test('handles paths with spaces', () => {
      const spaceFile = path.join(testDir, 'file with spaces.txt');
      filesystem.put(spaceFile, testContent);
      expect(filesystem.exists(spaceFile)).toBe(true);
    });

    test('files() returns empty array for non-directory', () => {
      const files = filesystem.files(testFile);
      expect(files).toEqual([]);
    });

    test('directories() returns empty array for non-directory', () => {
      const dirs = filesystem.directories(testFile);
      expect(dirs).toEqual([]);
    });
  });
});
