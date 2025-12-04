/**
 * Translator
 * Laravel-inspired translation/i18n system
 */

import fs from 'fs';
import path from 'path';

export class Translator {
  constructor(locale = 'en', fallbackLocale = 'en') {
    this.locale = locale;
    this.fallbackLocale = fallbackLocale;
    this.loaded = {};
    this.translationPaths = [];
  }

  /**
   * Get translation for key
   */
  get(key, replace = {}, locale = null) {
    locale = locale || this.locale;

    // Parse key (namespace::group.item)
    const { namespace, group, item } = this.parseKey(key);

    // Load translation group
    this.load(namespace, group, locale);

    // Get translation line
    let line = this.getLine(namespace, group, locale, item);

    // Try fallback locale if not found
    if (!line && locale !== this.fallbackLocale) {
      this.load(namespace, group, this.fallbackLocale);
      line = this.getLine(namespace, group, this.fallbackLocale, item);
    }

    // Return key if translation not found
    if (!line) {
      return key;
    }

    // Make replacements
    return this.makeReplacements(line, replace);
  }

  /**
   * Get translation with pluralization
   */
  choice(key, count, replace = {}, locale = null) {
    locale = locale || this.locale;

    let line = this.get(key, replace, locale);

    if (typeof line !== 'string') {
      return line;
    }

    // Simple pluralization: "message|messages"
    const parts = line.split('|');

    if (parts.length === 1) {
      return this.makeReplacements(parts[0], { ...replace, count });
    }

    // Choose appropriate form
    const chosen = count === 1 ? parts[0] : (parts[1] || parts[0]);

    return this.makeReplacements(chosen, { ...replace, count });
  }

  /**
   * Check if translation exists
   */
  has(key, locale = null) {
    locale = locale || this.locale;

    const { namespace, group, item } = this.parseKey(key);

    this.load(namespace, group, locale);

    const line = this.getLine(namespace, group, locale, item);

    return line !== null && line !== undefined;
  }

  /**
   * Parse translation key
   */
  parseKey(key) {
    // Check for namespace (namespace::group.item)
    const namespaceParts = key.split('::');

    if (namespaceParts.length === 2) {
      const [namespace, rest] = namespaceParts;
      const [group, ...itemParts] = rest.split('.');

      return {
        namespace,
        group,
        item: itemParts.join('.')
      };
    }

    // No namespace (group.item)
    const [group, ...itemParts] = key.split('.');

    return {
      namespace: '*',
      group,
      item: itemParts.join('.')
    };
  }

  /**
   * Load translation group
   */
  load(namespace, group, locale) {
    if (this.isLoaded(namespace, group, locale)) {
      return;
    }

    // Initialize structure
    if (!this.loaded[namespace]) {
      this.loaded[namespace] = {};
    }

    if (!this.loaded[namespace][group]) {
      this.loaded[namespace][group] = {};
    }

    // Load translations from file
    const translations = this.loadPath(namespace, group, locale);

    this.loaded[namespace][group][locale] = translations;
  }

  /**
   * Check if group is loaded
   */
  isLoaded(namespace, group, locale) {
    return this.loaded[namespace]?.[group]?.[locale] !== undefined;
  }

  /**
   * Load translations from file path
   */
  loadPath(namespace, group, locale) {
    for (const translationPath of this.translationPaths) {
      const filePath = this.getFilePath(translationPath, namespace, group, locale);

      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          return JSON.parse(content);
        } catch (error) {
          console.error(`Failed to load translation file: ${filePath}`, error);
        }
      }
    }

    return {};
  }

  /**
   * Get file path for translations
   */
  getFilePath(basePath, namespace, group, locale) {
    if (namespace === '*') {
      return path.join(basePath, locale, `${group}.json`);
    }

    return path.join(basePath, namespace, locale, `${group}.json`);
  }

  /**
   * Get translation line
   */
  getLine(namespace, group, locale, item) {
    const translations = this.loaded[namespace]?.[group]?.[locale];

    if (!translations) {
      return null;
    }

    // Support nested keys (user.name)
    const keys = item.split('.');
    let value = translations;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Make replacements in translation
   */
  makeReplacements(line, replace) {
    if (typeof line !== 'string') {
      return line;
    }

    let result = line;

    for (const [key, value] of Object.entries(replace)) {
      result = result.replace(`:${key}`, value);
      result = result.replace(`:${key.toUpperCase()}`, String(value).toUpperCase());
      result = result.replace(`:${this.ucfirst(key)}`, this.ucfirst(String(value)));
    }

    return result;
  }

  /**
   * Uppercase first letter
   */
  ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Set locale
   */
  setLocale(locale) {
    this.locale = locale;
    return this;
  }

  /**
   * Get current locale
   */
  getLocale() {
    return this.locale;
  }

  /**
   * Set fallback locale
   */
  setFallback(locale) {
    this.fallbackLocale = locale;
    return this;
  }

  /**
   * Get fallback locale
   */
  getFallback() {
    return this.fallbackLocale;
  }

  /**
   * Add translation path
   */
  addPath(translationPath) {
    this.translationPaths.push(translationPath);
    return this;
  }

  /**
   * Add namespace
   */
  addNamespace(namespace, translationPath) {
    this.translationPaths.push({
      namespace,
      path: translationPath
    });
    return this;
  }
}

export default Translator;
