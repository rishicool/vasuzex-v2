/**
 * String Helper - Common string manipulation utilities
 */
export class Str {
  /**
   * Mask phone number
   */
  static maskPhone(phone) {
    if (!phone) return '';
    const str = phone.toString();
    if (str.length < 4) return str;
    return str.slice(0, -4).replace(/./g, '*') + str.slice(-4);
  }

  /**
   * Mask email
   */
  static maskEmail(email) {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    
    const visibleChars = Math.min(3, Math.floor(username.length / 2));
    const masked = username.slice(0, visibleChars) + 
                  username.slice(visibleChars).replace(/./g, '*');
    
    return `${masked}@${domain}`;
  }

  /**
   * Convert to slug
   */
  static slug(str, separator = '-') {
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, separator)
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate random string
   */
  static random(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Capitalize first letter
   */
  static ucfirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert to title case
   */
  static title(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Convert to camelCase
   */
  static camel(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  }

  /**
   * Convert to snake_case
   */
  static snake(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Truncate string
   */
  static limit(str, limit = 100, end = '...') {
    if (str.length <= limit) return str;
    return str.substring(0, limit) + end;
  }

  /**
   * Check if string contains substring
   */
  static contains(str, search) {
    return str.includes(search);
  }

  /**
   * Check if string starts with substring
   */
  static startsWith(str, search) {
    return str.startsWith(search);
  }

  /**
   * Check if string ends with substring
   */
  static endsWith(str, search) {
    return str.endsWith(search);
  }
}

export default Str;
