/**
 * JsonResource
 * Laravel-inspired API resource transformation
 */

export class JsonResource {
  constructor(resource) {
    this.resource = resource;
    this.additional = {};
    this.with = {};
  }

  /**
   * Static make method
   */
  static make(resource) {
    return new this(resource);
  }

  /**
   * Create resource collection
   */
  static collection(resources) {
    return new ResourceCollection(resources, this);
  }

  /**
   * Transform resource to array
   */
  toArray(request) {
    if (this.resource === null || this.resource === undefined) {
      return [];
    }

    if (Array.isArray(this.resource)) {
      return this.resource;
    }

    if (typeof this.resource.toArray === 'function') {
      return this.resource.toArray();
    }

    return { ...this.resource };
  }

  /**
   * Resolve resource
   */
  resolve(request = null) {
    const data = this.toArray(request);
    return this.filter(data);
  }

  /**
   * Filter null values
   */
  filter(data) {
    const filtered = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Add additional data
   */
  additional(data) {
    this.additional = { ...this.additional, ...data };
    return this;
  }

  /**
   * Get additional data
   */
  withAdditional(request) {
    return { ...this.with, ...this.additional };
  }

  /**
   * Convert to response
   */
  toResponse(request, response) {
    const data = this.resolve(request);
    const additional = this.withAdditional(request);

    const wrapped = this.constructor.wrap 
      ? { [this.constructor.wrap]: data, ...additional }
      : { ...data, ...additional };

    return response.json(wrapped);
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return JSON.stringify(this.resolve());
  }

  /**
   * Conditionally include attribute
   */
  when(condition, value, defaultValue = null) {
    if (condition) {
      return typeof value === 'function' ? value() : value;
    }

    return defaultValue;
  }

  /**
   * Merge when condition is true
   */
  mergeWhen(condition, value) {
    return condition ? (typeof value === 'function' ? value() : value) : {};
  }

  /**
   * Include attribute when loaded
   */
  whenLoaded(relationship, value = null, defaultValue = null) {
    if (!this.resource) {
      return defaultValue;
    }

    if (this.resource[relationship] !== undefined) {
      return value !== null ? value : this.resource[relationship];
    }

    return defaultValue;
  }

  /**
   * Set data wrapper
   */
  static wrap(wrapper) {
    this.wrapData = wrapper;
  }

  /**
   * Disable wrapping
   */
  static withoutWrapping() {
    this.wrapData = null;
  }
}

// Default wrapper
JsonResource.wrapData = 'data';

/**
 * Resource Collection
 */
export class ResourceCollection {
  constructor(resources, resourceClass) {
    this.resources = Array.isArray(resources) ? resources : [];
    this.resourceClass = resourceClass;
    this.additional = {};
  }

  /**
   * Transform collection to array
   */
  toArray(request) {
    return this.resources.map(resource => {
      const instance = new this.resourceClass(resource);
      return instance.toArray(request);
    });
  }

  /**
   * Resolve collection
   */
  resolve(request = null) {
    return this.toArray(request);
  }

  /**
   * Add additional data
   */
  additional(data) {
    this.additional = { ...this.additional, ...data };
    return this;
  }

  /**
   * Convert to response
   */
  toResponse(request, response) {
    const data = this.resolve(request);

    const wrapped = this.resourceClass.wrapData
      ? { [this.resourceClass.wrapData]: data, ...this.additional }
      : { ...data, ...this.additional };

    return response.json(wrapped);
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return JSON.stringify(this.resolve());
  }
}

export default JsonResource;
