/**
 * Base Controller
 * Extends framework Controller with app-specific helpers
 */

import { Controller } from 'vasuzex';

export class BaseController extends Controller {
  /**
   * Paginate response helper
   */
  paginate(res, data, total, page = 1, perPage = 15) {
    const lastPage = Math.ceil(total / perPage);
    return this.success(res, {
      items: data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        hasMore: page < lastPage,
      },
    });
  }
}
