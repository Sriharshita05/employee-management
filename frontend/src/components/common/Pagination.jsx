function getPageList(currentPage, totalPages) {
  const pages = [];
  const delta = 1;

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (rangeStart > 2) pages.push('ellipsis-start');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) pages.push('ellipsis-end');
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageList(currentPage, totalPages);

  return (
    <div className="pagination-bar">
      <div className="pagination-summary">
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{' '}
        <strong>{totalItems}</strong> employees
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((page, idx) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={`${page}-${idx}`} className="pagination-ellipsis">
              …
            </span>
          )
        )}

        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default Pagination;
