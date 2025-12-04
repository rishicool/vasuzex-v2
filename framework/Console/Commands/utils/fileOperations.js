/**
 * File Operation Utilities
 * Reusable functions for file/directory operations
 */

import { mkdir, writeFile, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Create directory recursively
 */
export async function createDirectory(path) {
  await mkdir(path, { recursive: true });
}

/**
 * Create multiple directories at once
 */
export async function createDirectories(basePath, paths) {
  for (const path of paths) {
    await createDirectory(join(basePath, path));
  }
}

/**
 * Write file with content
 */
export async function writeFileContent(filePath, content) {
  await writeFile(filePath, content);
}

/**
 * Read JSON file
 */
export async function readJsonFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write JSON file with formatting
 */
export async function writeJsonFile(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Check if path exists
 */
export function pathExists(path) {
  return existsSync(path);
}

/**
 * Delete directory recursively
 */
export async function deleteDirectory(path) {
  await rm(path, { recursive: true, force: true });
}

/**
 * Get project root path
 */
export function getProjectRoot() {
  return process.cwd();
}

/**
 * Get app directory path
 */
export function getAppPath(appName, appType = null) {
  const basePath = join(getProjectRoot(), 'apps', appName);
  return appType ? join(basePath, appType) : basePath;
}
