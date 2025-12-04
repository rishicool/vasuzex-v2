/**
 * Generator Command
 * Base class for code generation commands
 */

import Command from './Command.js';
import fs from 'fs';
import path from 'path';

export class GeneratorCommand extends Command {
  constructor() {
    super();
    this.type = 'File';
  }

  /**
   * Get stub file content
   */
  getStub() {
    throw new Error('getStub() must be implemented');
  }

  /**
   * Get destination file path
   */
  getPath(name) {
    throw new Error('getPath() must be implemented');
  }

  /**
   * Build the class with the given name
   */
  buildClass(name) {
    let stub = fs.readFileSync(this.getStub(), 'utf-8');

    return this.replaceNamespace(stub, name)
      .replace(/\{\{class\}\}/g, this.getClassName(name))
      .replace(/\{\{name\}\}/g, name);
  }

  /**
   * Replace namespace in stub
   */
  replaceNamespace(stub, name) {
    const namespace = this.getNamespace(name);
    return stub.replace(/\{\{namespace\}\}/g, namespace);
  }

  /**
   * Get namespace from name
   */
  getNamespace(name) {
    const parts = name.split('/');
    parts.pop(); // Remove class name
    return parts.join('/');
  }

  /**
   * Get class name from name
   */
  getClassName(name) {
    const parts = name.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Create directory if not exists
   */
  makeDirectory(filePath) {
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Check if file already exists
   */
  alreadyExists(path) {
    return fs.existsSync(path);
  }

  /**
   * Execute the command
   */
  async handle() {
    const name = this.argument(0) || this.argument('name');

    if (!name) {
      this.error('Name argument is required');
      return 1;
    }

    const filePath = this.getPath(name);

    if (this.alreadyExists(filePath) && !this.option('force')) {
      this.error(`${this.type} already exists!`);
      return 1;
    }

    this.makeDirectory(filePath);

    const content = this.buildClass(name);
    fs.writeFileSync(filePath, content);

    this.info(`${this.type} created successfully.`);
    this.line(`  ${filePath}`);

    return 0;
  }
}

export default GeneratorCommand;
