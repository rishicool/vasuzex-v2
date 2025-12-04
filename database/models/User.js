import Model from 'vasuzex/Database/Model';
import { Hash } from 'vasuzex/Support/Facades';

export class User extends Model {
  static tableName = 'users';
  static primaryKey = 'id';
  static timestamps = true;
  static softDeletes = true;
  
  static fillable = [
    'name',
    'email',
    'phone',
    'avatar',
    'role'
  ];

  static hidden = [
    'password',
    'remember_token'
  ];

  static casts = {
    email_verified_at: 'datetime',
    created_at: 'datetime',
    updated_at: 'datetime',
    deleted_at: 'datetime'
  };

  /**
   * Hash password before saving
   */
  async setPasswordAttribute(value) {
    if (value) {
      this.attributes.password = await Hash.make(value);
    }
  }

  /**
   * Get name attribute (accessor example)
   */
  getNameAttribute(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  /**
   * Get full name (appended attribute example)
   */
  getFullNameAttribute() {
    return `${this.getAttribute('name')} (${this.getAttribute('email')})`;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.getAttribute('role') === 'admin';
  }

  /**
   * Verify password
   */
  async verifyPassword(password) {
    return await Hash.check(password, this.attributes.password);
  }
}

export default User;
