/**
 * Mock Factories for Testing
 */

export class MockFile {
  static create(options = {}) {
    return {
      fieldname: options.fieldname || 'file',
      originalname: options.originalname || 'test.jpg',
      encoding: options.encoding || '7bit',
      mimetype: options.mimetype || 'image/jpeg',
      buffer: options.buffer || Buffer.from('fake image data'),
      size: options.size || 1024,
      ...options,
    };
  }

  static image(options = {}) {
    return this.create({
      originalname: 'image.jpg',
      mimetype: 'image/jpeg',
      ...options,
    });
  }

  static pdf(options = {}) {
    return this.create({
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      ...options,
    });
  }

  static large(options = {}) {
    return this.create({
      size: 10 * 1024 * 1024, // 10MB
      ...options,
    });
  }
}

export class MockRequest {
  static create(options = {}) {
    return {
      method: options.method || 'GET',
      url: options.url || '/',
      headers: options.headers || {},
      body: options.body || {},
      query: options.query || {},
      params: options.params || {},
      file: options.file || null,
      files: options.files || [],
      ip: options.ip || '127.0.0.1',
      user: options.user || null,
      ...options,
    };
  }
}

export class MockResponse {
  static create() {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
      send(data) {
        this.body = data;
        return this;
      },
      setHeader(key, value) {
        this.headers[key] = value;
        return this;
      },
      end() {
        return this;
      },
    };
    return res;
  }
}

export class MockApplication {
  constructor() {
    this.bindings = new Map();
    this.singletons = new Map();
  }

  bind(abstract, concrete) {
    this.bindings.set(abstract, concrete);
  }

  singleton(abstract, concrete) {
    this.singletons.set(abstract, concrete);
  }

  make(abstract) {
    if (this.singletons.has(abstract)) {
      const binding = this.singletons.get(abstract);
      return typeof binding === 'function' ? binding(this) : binding;
    }

    if (this.bindings.has(abstract)) {
      const binding = this.bindings.get(abstract);
      return typeof binding === 'function' ? binding(this) : binding;
    }

    throw new Error(`No binding found for ${abstract}`);
  }

  config(key, defaultValue = null) {
    return defaultValue;
  }
}

export class MockSMSProvider {
  constructor() {
    this.sent = [];
  }

  async send(to, message, options = {}) {
    this.sent.push({ to, message, options, timestamp: new Date() });
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  getSentMessages() {
    return this.sent;
  }

  clear() {
    this.sent = [];
  }
}

export class MockStorageDriver {
  constructor() {
    this.files = new Map();
  }

  async put(path, contents) {
    this.files.set(path, contents);
    return path;
  }

  async get(path) {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return this.files.get(path);
  }

  async exists(path) {
    return this.files.has(path);
  }

  async delete(path) {
    return this.files.delete(path);
  }

  async url(path) {
    return `https://mock-storage.com/${path}`;
  }

  clear() {
    this.files.clear();
  }
}

export default {
  MockFile,
  MockRequest,
  MockResponse,
  MockApplication,
  MockSMSProvider,
  MockStorageDriver,
};
