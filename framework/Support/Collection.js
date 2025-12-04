/**
 * Collection
 * Laravel-inspired collection for array operations
 */

export class Collection {
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Get all items
   */
  all() {
    return this.items;
  }

  /**
   * Get first item
   */
  first(callback = null, defaultValue = null) {
    if (!callback) {
      return this.items[0] ?? defaultValue;
    }

    for (const item of this.items) {
      if (callback(item)) {
        return item;
      }
    }

    return defaultValue;
  }

  /**
   * Get last item
   */
  last(callback = null, defaultValue = null) {
    if (!callback) {
      return this.items[this.items.length - 1] ?? defaultValue;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      if (callback(this.items[i])) {
        return this.items[i];
      }
    }

    return defaultValue;
  }

  /**
   * Map over items
   */
  map(callback) {
    return new Collection(this.items.map(callback));
  }

  /**
   * Filter items
   */
  filter(callback) {
    return new Collection(this.items.filter(callback));
  }

  /**
   * Reduce items
   */
  reduce(callback, initial) {
    return this.items.reduce(callback, initial);
  }

  /**
   * Check if item exists
   */
  contains(value) {
    return this.items.includes(value);
  }

  /**
   * Count items
   */
  count() {
    return this.items.length;
  }

  /**
   * Check if empty
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Check if not empty
   */
  isNotEmpty() {
    return this.items.length > 0;
  }

  /**
   * Get chunk of items
   */
  chunk(size) {
    const chunks = [];
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size));
    }
    return new Collection(chunks);
  }

  /**
   * Pluck values by key
   */
  pluck(key) {
    return new Collection(this.items.map(item => item[key]));
  }

  /**
   * Sort items
   */
  sort(callback = null) {
    const sorted = [...this.items];
    return new Collection(callback ? sorted.sort(callback) : sorted.sort());
  }

  /**
   * Take first n items
   */
  take(limit) {
    return new Collection(this.items.slice(0, limit));
  }

  /**
   * Skip first n items
   */
  skip(offset) {
    return new Collection(this.items.slice(offset));
  }

  /**
   * Get unique items
   */
  unique(key = null) {
    if (!key) {
      return new Collection([...new Set(this.items)]);
    }

    const seen = new Set();
    return this.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * Reverse items
   */
  reverse() {
    return new Collection([...this.items].reverse());
  }

  /**
   * Group by key
   */
  groupBy(key) {
    const grouped = {};
    for (const item of this.items) {
      const value = typeof key === 'function' ? key(item) : item[key];
      if (!grouped[value]) {
        grouped[value] = [];
      }
      grouped[value].push(item);
    }
    return grouped;
  }

  /**
   * Get sum of values
   */
  sum(key = null) {
    if (!key) {
      return this.items.reduce((sum, item) => sum + item, 0);
    }
    return this.items.reduce((sum, item) => sum + (item[key] || 0), 0);
  }

  /**
   * Get average of values
   */
  avg(key = null) {
    return this.count() > 0 ? this.sum(key) / this.count() : 0;
  }

  /**
   * Get min value
   */
  min(key = null) {
    if (!key) {
      return Math.min(...this.items);
    }
    return Math.min(...this.items.map(item => item[key] || 0));
  }

  /**
   * Get max value
   */
  max(key = null) {
    if (!key) {
      return Math.max(...this.items);
    }
    return Math.max(...this.items.map(item => item[key] || 0));
  }

  /**
   * Convert to array
   */
  toArray() {
    return this.items;
  }

  /**
   * Convert to JSON
   */
  toJson() {
    return JSON.stringify(this.items);
  }
}

export function collect(items) {
  return new Collection(items);
}

export default Collection;
