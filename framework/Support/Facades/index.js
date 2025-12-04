/**
 * Framework Facades
 * Laravel-style static accessors for services
 * 
 * Usage:
 * import { DB, Cache, Auth } from '@framework/Support/Facades';
 * 
 * DB.table('users').where('id', 1).first();
 * Cache.put('key', 'value', 3600);
 * Auth.user();
 */

export { default as Auth } from './Auth.js';
export { default as Broadcast } from './Broadcast.js';
export { default as Cache } from './Cache.js';
export { default as Config } from './Config.js';
export { default as Cookie } from './Cookie.js';
export { default as Crypt } from './Crypt.js';
export { default as DB } from './DB.js';
export { default as Event } from './Event.js';
export { default as Gate } from './Gate.js';
export { default as GeoIP } from './GeoIP.js';
export { default as Hash } from './Hash.js';
export { default as Http } from './Http.js';
export { default as Format } from './Format.js';
export { default as Image } from './Image.js';
export { default as Location } from './Location.js';
export { default as Log } from './Log.js';
export { default as Mail } from './Mail.js';
export { default as Media } from './Media.js';
export { default as Notification } from './Notification.js';
export { default as Queue } from './Queue.js';
export { default as RateLimiter } from './RateLimiter.js';
export { default as Session } from './Session.js';
export { default as SMS } from './SMS.js';
export { default as Storage } from './Storage.js';
export { default as Upload } from './Upload.js';
export { default as Validator } from './Validator.js';

export { Facade, createFacade } from './Facade.js';
