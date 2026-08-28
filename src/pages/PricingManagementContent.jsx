import { useEffect, useMemo, useState } from 'react'
import { BadgeDollarSign, CloudUpload, Search, History, ListChecks, Eye, X } from 'lucide-react'
import { HISTORY_ITEMS } from '../constants/pricingManagement'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import { getPricingBrandName } from '../utils/pricingApi'

function EffectiveBox({ label, range, tone }) {
  return (
    <div className={`pm-effective-box pm-effective-${tone}`}>
      <span className="pm-effective-label">{label}</span>
      <span className="pm-effective-range">{range.from} → {range.to}</span>
      <span className="pm-effective-days">({range.days} ngày)</span>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const STATUS_BADGE_CLASS = {
  ACTIVE: 'active',
  MANUAL_ACTIVE: 'manual-active',
  PRICE_ACTIVE: 'price-active',
  INACTIVE: 'inactive',
  DELETED: 'inactive',
  DRAFT: 'draft',
}

function getStatusBadgeClass(status) {
  return STATUS_BADGE_CLASS[status] || 'pending'
}

const NETWORK_PRICE_FIELDS = [
  { label: 'Gmobile', importKey: 'gmobileImportPrice', sellKey: 'gmobileSellPrice' },
  { label: 'iTelecom', importKey: 'itelecomImportPrice', sellKey: 'itelecomSellPrice' },
  { label: 'MobiPhone', importKey: 'mobiPhoneImportPrice', sellKey: 'mobiPhoneSellPrice' },
  { label: 'SkyFi', importKey: 'skyFiImportPrice', sellKey: 'skyFiSellPrice' },
  { label: 'VietNaMobile', importKey: 'vietNaMobileImportPrice', sellKey: 'vietNaMobileSellPrice' },
  { label: 'VietTel', importKey: 'vietTelImportPrice', sellKey: 'vietTelSellPrice' },
  { label: 'VinaPhone', importKey: 'vinaPhoneImportPrice', sellKey: 'vinaPhoneSellPrice' },
  { label: 'WinTel', importKey: 'winTelImportPrice', sellKey: 'winTelSellPrice' },
]

function formatPrice(value) {
  return value === null || value === undefined ? '-' : value.toLocaleString('vi-VN')
}

function PriceDetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pm-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết bảng giá Brandname</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="pm-detail-summary">
            <div className="pm-detail-row">
              <span className="gw-history-label">Brandname:</span> {item.brandName}
            </div>
            <div className="pm-detail-row">
              <span className="gw-history-label">Đối tác:</span> {item.providerName}
            </div>
            <div className="pm-detail-row">
              <span className="gw-history-label">Loại SMS:</span> {item.smsType}
            </div>
            <div className="pm-detail-row">
              <span className="gw-history-label">Trạng thái:</span>{' '}
              <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                <span className="status-dot" />
                {item.status}
              </span>
            </div>
            <div className="pm-detail-row">
              <span className="gw-history-label">Cập nhật lúc:</span> {formatDateTime(item.updatedAt)}
            </div>
            {item.fullName && (
              <div className="pm-detail-row">
                <span className="gw-history-label">Người cập nhật:</span> {item.fullName}
              </div>
            )}
          </div>

          <div className="pm-detail-changes">
            <table className="pm-detail-price-table">
              <thead>
                <tr>
                  <th>Nhà mạng</th>
                  <th>Giá nhập</th>
                  <th>Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {NETWORK_PRICE_FIELDS.map((n) => (
                  <tr key={n.label}>
                    <td>{n.label}</td>
                    <td>{formatPrice(item[n.importKey])}</td>
                    <td>{formatPrice(item[n.sellKey])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            <X size={16} /> Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

function PricingManagementContent() {
  const { authToken } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setLoading(true)
    setError('')

    getPricingBrandName({ token: authToken, page, size: pageSize })
      .then(({ rows: fetchedRows, total: fetchedTotal }) => {
        if (cancelled) return
        setRows(fetchedRows)
        setTotal(fetchedTotal)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Không tải được bảng giá SMS Brandname.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authToken, page, pageSize])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) =>
      (row.brandName || '').toLowerCase().includes(term) || (row.providerName || '').toLowerCase().includes(term),
    )
  }, [rows, search])

  return (
    <div className="pricing-management-content">
      {/* Header card */}
      <div className="gw-card pm-header-card">
        <div className="gw-card-head" style={{ marginBottom: 0 }}>
          <span className="gw-card-icon">
            <BadgeDollarSign size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">Cập nhật bảng giá</h2>
            <p className="gw-card-subtitle">Cấu hình giá theo đối tác/provider</p>
          </div>
        </div>
        <button className="pm-upload-btn">
          <CloudUpload size={16} /> Upload bảng giá
        </button>
      </div>

      {/* Price table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <div>
              <h3 className="table-title">Bảng giá SMS Brandname</h3>
              <p className="gw-card-subtitle">Quản lý giá gửi nhận/ giá bán theo nhà mạng</p>
            </div>
          </div>
          <div className="pm-search-field">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm brandname hoặc đối tác"
            />
            <Search size={16} className="pm-search-icon" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table pm-price-table">
            <thead>
              <tr>
                <th>Brandname</th>
                <th>Đối tác</th>
                <th>Loại SMS</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="gw-table-status">Đang tải bảng giá...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="gw-table-status gw-table-error">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="gw-table-status">Không có dữ liệu bảng giá.</td>
                </tr>
              )}
              {!loading && !error && filteredRows.map((row, index) => (
                <tr key={`${row.brandName}-${row.providerName}-${row.smsType}-${index}`}>
                  <td><span className="table-network">{row.brandName}</span></td>
                  <td>{row.providerName}</td>
                  <td>{row.smsType}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(row.status)}`}>
                      <span className="status-dot" />
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="pm-updated-cell">
                      <span>{formatDateTime(row.updatedAt)}</span>
                      {row.fullName && <span className="pm-updated-by">Bởi {row.fullName}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="Xem chi tiết" onClick={() => setDetailItem(row)}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page + 1}
          totalPages={Math.max(1, Math.ceil(total / pageSize))}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p - 1)}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
        />
      </div>

      <PriceDetailModal item={detailItem} onClose={() => setDetailItem(null)} />

      {/* History */}
      <div className="gw-card pm-history-card">
        <div className="gw-history-head">
          <span className="gw-card-icon">
            <History size={18} />
          </span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">Lịch sử thay đổi bảng giá</h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử cập nhật giá SMS</p>
          </div>
          <button className="pm-history-btn">
            <ListChecks size={16} /> Xem đầy đủ lịch sử
          </button>
        </div>

        <div className="pm-history-list">
          {HISTORY_ITEMS.map((item) => (
            <div key={item.id} className={`pm-history-item pm-bar-${item.color}`}>
              <div className="pm-history-main">
                <h4 className="pm-history-title">{item.title}</h4>
                <p className="pm-history-price">
                  Giá cũ: {item.oldPrice} đ → Giá mới: {item.newPrice} đ{' '}
                  <span className={item.up ? 'pm-diff-up' : 'pm-diff-down'}>
                    ({item.up ? '↑' : '↓'} {item.diff} đ / {item.diffPct}%)
                  </span>
                </p>
                <p className="pm-history-updater">Người cập nhật: {item.updatedBy}</p>
              </div>

              <div className="pm-history-compare">
                <EffectiveBox label="Hiệu lực cũ" range={item.oldRange} tone="old" />
                <span className="pm-effective-arrow">→</span>
                <EffectiveBox label="Hiệu lực mới" range={item.newRange} tone="new" />
              </div>

              <div className="pm-history-time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PricingManagementContent
