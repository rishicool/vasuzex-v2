/**
 * Http Facade
 * 
 * @example
 * import { Http } from '#framework';
 * 
 * const response = await Http.get('https://api.example.com/users');
 * const data = await Http.withToken(token).post(url, { name: 'John' });
 */

import { Facade } from './Facade.js';

export class Http extends Facade {
  static getFacadeAccessor() {
    return 'http';
  }
}

export default Http;
