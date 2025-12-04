/**
 * Pagination Helper
 */
export class Paginator {
  /**
   * Create pagination metadata
   */
  static paginate(data, total, page = 1, perPage = 15) {
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return {
      data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        from,
        to,
        hasMore: page < lastPage,
      },
    };
  }

  /**
   * Get pagination links
   */
  static links(currentPage, lastPage, maxLinks = 5) {
    const links = [];
    const halfMax = Math.floor(maxLinks / 2);
    
    let start = Math.max(1, currentPage - halfMax);
    let end = Math.min(lastPage, currentPage + halfMax);

    // Adjust if at beginning or end
    if (currentPage <= halfMax) {
      end = Math.min(lastPage, maxLinks);
    }
    if (currentPage >= lastPage - halfMax) {
      start = Math.max(1, lastPage - maxLinks + 1);
    }

    for (let i = start; i <= end; i++) {
      links.push({
        page: i,
        active: i === currentPage,
      });
    }

    return {
      prev: currentPage > 1 ? currentPage - 1 : null,
      next: currentPage < lastPage ? currentPage + 1 : null,
      links,
    };
  }
}

export default Paginator;
