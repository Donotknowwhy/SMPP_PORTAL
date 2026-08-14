function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

function Pagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
}) {
  const total = Math.max(1, totalPages)
  const current = Math.min(Math.max(1, page), total)
  const pageNumbers = buildPageNumbers(current, total)

  return (
    <div className="routing-pagination flex-wrap gap-3">
      <div className="db-page-size">
        <span>Show</span>
        <select
          className="pagination-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={disabled}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>Row</span>
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          disabled={disabled || current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          ‹
        </button>
        {pageNumbers.map((p, idx) => (
          <span key={p} style={{ display: 'contents' }}>
            {idx > 0 && pageNumbers[idx - 1] !== p - 1 && <span className="db-page-ellipsis">...</span>}
            <button
              type="button"
              className={`pagination-btn${p === current ? ' active' : ''}`}
              disabled={disabled}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          type="button"
          className="pagination-btn"
          disabled={disabled || current >= total}
          onClick={() => onPageChange(current + 1)}
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default Pagination
