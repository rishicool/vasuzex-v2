/**
 * Neastore Framework
 * Laravel-inspired framework for Node.js monorepos with Facades
 * 
 * Usage:
 * import { Application, DB, Cache, Auth, Model } from '@framework';
 */

export * from './Foundation/index.js';
export * from './Config/index.js';
export * from './Routing/index.js';
export * from './Http/index.js';
export * from './Database/index.js';
export * from './Validation/index.js';
export * from './Services/index.js';
export * from './Support/index.js';

// Export Facades with aliases
export {
  Auth,
  Broadcast,
  Cache,
  Config,
  Cookie,
  Crypt,
  DB,
  Event,
  Gate,
  Hash,
  Log,
  Mail,
  Media,
  Notification,
  Queue,
  RateLimiter,
  Session,
  Storage,
  Validator,
  Facade,
  createFacade
} from './Support/Facades/index.js';

// Export Model and Database utilities
export { default as Model } from './Database/Model.js';
export { Relations } from './Database/Relations.js';
export { Observer, observe } from './Database/Observer.js';
export { Scope, SoftDeletingScope, LocalScope } from './Database/Scope.js';

export const VERSION = '0.1.0';
