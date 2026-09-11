import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgeDollarSign,
  CloudUpload,
  Search,
  History,
  RefreshCw,
  Eye,
  Pencil,
  X,
  Tags,
} from 'lucide-react'
import { toast } from 'react-toastify'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import {
  getPricingAuditLog,
  getPricingBrandName,
  importPricing,
  updatePricing,
} from '../utils/pricingApi'

const STATUS_BADGE_CLASS = {
  ACTIVE: 'active',
  MANUAL_ACTIVE: 'manual-active',
  PRICE_ACTIVE: 'price-active',
  INACTIVE: 'inactive',
  DELETED: 'inactive',
  DRAFT: 'draft',
}

const NETWORK_PRICE_FIELDS = [
  { label: 'Gmobile', telco: 'gmobile', importKey: 'gmobileImportPrice', sellKey: 'gmobileSellPrice' },
  { label: 'iTelecom', telco: 'itelecom', importKey: 'itelecomImportPrice', sellKey: 'itelecomSellPrice' },
  { label: 'MobiPhone', telco: 'mobifone', importKey: 'mobiPhoneImportPrice', sellKey: 'mobiPhoneSellPrice' },
  { label: 'SkyFi', telco: 'skyfi', importKey: 'skyFiImportPrice', sellKey: 'skyFiSellPrice' },
  { label: 'VietNaMobile', telco: 'vietnamobile', importKey: 'vietNaMobileImportPrice', sellKey: 'vietNaMobileSellPrice' },
  { label: 'VietTel', telco: 'viettel', importKey: 'vietTelImportPrice', sellKey: 'vietTelSellPrice' },
  { label: 'VinaPhone', telco: 'vinaphone', importKey: 'vinaPhoneImportPrice', sellKey: 'vinaPhoneSellPrice' },
  { label: 'WinTel', telco: 'wintel', importKey: 'winTelImportPrice', sellKey: 'winTelSellPrice' },
]

function getStatusBadgeClass(status) {
  return STATUS_BADGE_CLASS[status] || 'pending'
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (number) => String(number).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '-'
  const price = Number(value)
  return Number.isFinite(price) ? price.toLocaleString('vi-VN') : String(value)
}

function PriceDetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pm-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết bảng giá Brandname</h2>
          <button className="btn-close" onClick={onClose} aria-label="Đóng chi tiết bảng giá">×</button>
        </div>

        <div className="modal-body">
          <div className="pm-detail-summary">
            <div className="pm-detail-row"><span className="gw-history-label">Brandname:</span> {item.brandName || '-'}</div>
            <div className="pm-detail-row"><span className="gw-history-label">Đối tác:</span> {item.providerName || '-'}</div>
            <div className="pm-detail-row"><span className="gw-history-label">Loại SMS:</span> {item.smsType || '-'}</div>
            <div className="pm-detail-row">
              <span className="gw-history-label">Trạng thái:</span>{' '}
              <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                <span className="status-dot" />
                {item.status || '-'}
              </span>
            </div>
            <div className="pm-detail-row"><span className="gw-history-label">Cập nhật lúc:</span> {formatDateTime(item.updatedAt)}</div>
            {item.fullName && (
              <div className="pm-detail-row"><span className="gw-history-label">Người cập nhật:</span> {item.fullName}</div>
            )}
          </div>

          <div className="pm-detail-changes">
            <table className="pm-detail-price-table">
              <thead>
                <tr><th>Nhà mạng</th><th>Giá nhập</th><th>Giá bán</th></tr>
              </thead>
              <tbody>
                {NETWORK_PRICE_FIELDS.map((network) => (
                  <tr key={network.telco}>
                    <td>{network.label}</td>
                    <td>{formatPrice(item[network.importKey])}</td>
                    <td>{formatPrice(item[network.sellKey])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel"><X size={16} /> Đóng</button>
        </div>
      </div>
    </div>
  )
}

function createEditablePrices(item) {
  return NETWORK_PRICE_FIELDS.reduce((prices, network) => ({
    ...prices,
    [network.importKey]: item[network.importKey] ?? '',
    [network.sellKey]: item[network.sellKey] ?? '',
  }), {})
}

function PriceEditModal({ item, saving, onClose, onSave }) {
  const [prices, setPrices] = useState(() => createEditablePrices(item))
  const [formError, setFormError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')

    const telcos = []
    for (const network of NETWORK_PRICE_FIELDS) {
      const importPrice = prices[network.importKey] === '' ? null : Number(prices[network.importKey])
      const sellPrice = prices[network.sellKey] === '' ? null : Number(prices[network.sellKey])

      if (
        (importPrice !== null && (!Number.isFinite(importPrice) || importPrice < 0))
        || (sellPrice !== null && (!Number.isFinite(sellPrice) || sellPrice < 0))
      ) {
        setFormError(`Giá của ${network.label} phải là số không âm hoặc để trống.`)
        return
      }

      telcos.push({ telco: network.telco, importPrice, sellPrice })
    }

    onSave(telcos)
  }

  const updateField = (key, value) => {
    setPrices((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="modal-overlay" onClick={saving ? undefined : onClose}>
      <form className="modal-content pm-edit-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Cập nhật bảng giá Brandname</h2>
          <button type="button" className="btn-close" onClick={onClose} disabled={saving} aria-label="Đóng cập nhật bảng giá">×</button>
        </div>

        <div className="modal-body">
          <div className="pm-detail-summary">
            <div className="pm-detail-row"><span className="gw-history-label">Brandname:</span> {item.brandName || '-'}</div>
            <div className="pm-detail-row"><span className="gw-history-label">Đối tác:</span> {item.providerName || '-'}</div>
            <div className="pm-detail-row"><span className="gw-history-label">Loại SMS:</span> {item.smsType || '-'}</div>
          </div>

          <div className="pm-edit-table-wrap">
            <table className="pm-detail-price-table pm-edit-price-table">
              <thead>
                <tr><th>Nhà mạng</th><th>Giá nhập</th><th>Giá bán</th></tr>
              </thead>
              <tbody>
                {NETWORK_PRICE_FIELDS.map((network) => (
                  <tr key={network.telco}>
                    <td>{network.label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={prices[network.importKey]}
                        onChange={(event) => updateField(network.importKey, event.target.value)}
                        disabled={saving}
                        aria-label={`${network.label} giá nhập`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={prices[network.sellKey]}
                        onChange={(event) => updateField(network.sellKey, event.target.value)}
                        disabled={saving}
                        aria-label={`${network.label} giá bán`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {formError && <p className="pm-form-error" role="alert">{formError}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-cancel" disabled={saving}>Hủy</button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Đang cập nhật...' : 'Cập nhật bảng giá'}
          </button>
        </div>
      </form>
    </div>
  )
}

function AuditPriceBox({ label, importPrice, sellPrice, tone }) {
  return (
    <div className={`pm-effective-box pm-effective-${tone}`}>
      <span className="pm-effective-label">{label}</span>
      <span className="pm-effective-range">Giá nhập: {formatPrice(importPrice)} đ</span>
      <span className="pm-effective-range">Giá bán: {formatPrice(sellPrice)} đ</span>
    </div>
  )
}

function PricingManagementContent() {
  const { authToken } = useAuth()
  const fileInputRef = useRef(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [detailItem, setDetailItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [auditRows, setAuditRows] = useState([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const [auditPageSize, setAuditPageSize] = useState(10)
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState('')
  const [auditRefreshKey, setAuditRefreshKey] = useState(0)

  useEffect(() => {
    if (!authToken) return undefined

    const controller = new AbortController()
    let cancelled = false
    getPricingBrandName({ token: authToken, page, size: pageSize, signal: controller.signal })
      .then(({ rows: fetchedRows, total: fetchedTotal }) => {
        if (cancelled) return
        setRows(fetchedRows)
        setTotal(fetchedTotal)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || 'Không tải được bảng giá SMS Brandname.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [authToken, page, pageSize, listRefreshKey])

  useEffect(() => {
    if (!authToken) return undefined

    const controller = new AbortController()
    let cancelled = false
    getPricingAuditLog({ token: authToken, page: auditPage, limit: auditPageSize, signal: controller.signal })
      .then(({ rows: fetchedRows, total: fetchedTotal, totalPages: fetchedTotalPages }) => {
        if (cancelled) return
        setAuditRows(fetchedRows)
        setAuditTotal(fetchedTotal)
        setAuditTotalPages(fetchedTotalPages)
      })
      .catch((requestError) => {
        if (!cancelled) setAuditError(requestError.message || 'Không tải được lịch sử bảng giá.')
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [authToken, auditPage, auditPageSize, auditRefreshKey])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) =>
      (row.brandName || '').toLowerCase().includes(term)
      || (row.providerName || '').toLowerCase().includes(term),
    )
  }, [rows, search])

  const refreshAfterMutation = () => {
    setLoading(true)
    setError('')
    setAuditLoading(true)
    setAuditError('')
    setListRefreshKey((current) => current + 1)
    setAuditPage(1)
    setAuditRefreshKey((current) => current + 1)
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !authToken) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Vui lòng chọn file Excel định dạng .xlsx.')
      return
    }

    setImporting(true)
    importPricing({ token: authToken, file })
      .then((response) => {
        toast.success(response?.message || 'Import bảng giá thành công.')
        refreshAfterMutation()
      })
      .catch((requestError) => {
        toast.error(requestError.message || 'Import bảng giá thất bại.')
      })
      .finally(() => setImporting(false))
  }

  const handleUpdate = (telcos) => {
    if (!authToken || !editItem) return

    setUpdating(true)
    updatePricing({
      token: authToken,
      brandName: editItem.brandName,
      providerName: editItem.providerName,
      smsType: editItem.smsType,
      telcos,
    })
      .then((response) => {
        toast.success(response?.message || 'Cập nhật bảng giá thành công.')
        setEditItem(null)
        refreshAfterMutation()
      })
      .catch((requestError) => {
        toast.error(requestError.message || 'Cập nhật bảng giá thất bại.')
      })
      .finally(() => setUpdating(false))
  }

  return (
    <div className="pricing-management-content">
      <div className="gw-card pm-header-card gw-header-elevated">
        <div className="gw-card-head" style={{ marginBottom: 0 }}>
          <span className="gw-card-icon"><BadgeDollarSign size={18} /></span>
          <div>
            <h2 className="gw-card-title">Cập nhật bảng giá</h2>
            <p className="gw-card-subtitle">Cấu hình giá theo đối tác/provider</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx" hidden onChange={handleImport} />
        <button
          type="button"
          className="pm-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || !authToken}
        >
          <CloudUpload size={16} /> {importing ? 'Đang upload...' : 'Upload bảng giá'}
        </button>
      </div>

      <div className="routing-table-section gw-table-section gw-header-elevated">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon"><Tags size={18} /></span>
            <div>
              <h3 className="table-title">Bảng giá SMS Brandname</h3>
              <p className="gw-card-subtitle">Quản lý giá nhập/giá bán theo nhà mạng</p>
            </div>
          </div>
          <div className="pm-search-field">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm brandname hoặc đối tác"
            />
            <Search size={16} className="pm-search-icon" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table pm-price-table">
            <thead>
              <tr><th>Brandname</th><th>Đối tác</th><th>Loại SMS</th><th>Trạng thái</th><th>Cập nhật</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="gw-table-status">Đang tải bảng giá...</td></tr>}
              {!loading && error && <tr><td colSpan={6} className="gw-table-status gw-table-error">{error}</td></tr>}
              {!loading && !error && filteredRows.length === 0 && (
                <tr><td colSpan={6} className="gw-table-status">Không có dữ liệu bảng giá.</td></tr>
              )}
              {!loading && !error && filteredRows.map((row, index) => (
                <tr key={`${row.brandName}-${row.providerName}-${row.smsType}-${index}`}>
                  <td><span className="table-network">{row.brandName || '-'}</span></td>
                  <td>{row.providerName || '-'}</td>
                  <td>{row.smsType || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(row.status)}`}>
                      <span className="status-dot" />
                      {row.status || '-'}
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
                      <button className="action-btn" title="Xem chi tiết" onClick={() => setDetailItem(row)}><Eye size={16} /></button>
                      <button className="action-btn" title="Cập nhật bảng giá" onClick={() => setEditItem(row)}><Pencil size={16} /></button>
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
          onPageChange={(nextPage) => {
            setLoading(true)
            setError('')
            setPage(nextPage - 1)
          }}
          onPageSizeChange={(size) => {
            setLoading(true)
            setError('')
            setPageSize(size)
            setPage(0)
          }}
          disabled={loading}
        />
      </div>

      <PriceDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      {editItem && (
        <PriceEditModal item={editItem} saving={updating} onClose={() => setEditItem(null)} onSave={handleUpdate} />
      )}

      <div className="gw-card pm-history-card gw-header-elevated">
        <div className="gw-history-head">
          <span className="gw-card-icon"><History size={18} /></span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">Lịch sử thay đổi bảng giá</h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử cập nhật giá SMS ({auditTotal} bản ghi)</p>
          </div>
          <button
            type="button"
            className="pm-history-btn"
            onClick={() => {
              setAuditLoading(true)
              setAuditError('')
              setAuditRefreshKey((current) => current + 1)
            }}
            disabled={auditLoading}
          >
            <RefreshCw size={16} /> {auditLoading ? 'Đang tải...' : 'Làm mới lịch sử'}
          </button>
        </div>

        <div className="pm-history-list">
          {auditLoading && <div className="pm-history-state">Đang tải lịch sử bảng giá...</div>}
          {!auditLoading && auditError && <div className="pm-history-state gw-table-error">{auditError}</div>}
          {!auditLoading && !auditError && auditRows.length === 0 && (
            <div className="pm-history-state">Chưa có lịch sử thay đổi bảng giá.</div>
          )}
          {!auditLoading && !auditError && auditRows.map((item, index) => (
            <div key={item.id ?? `${item.brandName}-${item.telco}-${item.createdAt}-${index}`} className="pm-history-item pm-bar-orange">
              <div className="pm-history-main">
                <h4 className="pm-history-title">{item.brandName || '-'} · {item.smsType || '-'} · {item.telco || '-'}</h4>
                <p className="pm-history-price">Đối tác: {item.providerName || '-'}</p>
                <p className="pm-history-updater">{item.actionType || 'UPDATED'} bởi {item.fullName || '-'}</p>
              </div>

              <div className="pm-history-compare">
                <AuditPriceBox label="Giá cũ" importPrice={item.oldImportPrice} sellPrice={item.oldSellPrice} tone="old" />
                <span className="pm-effective-arrow">→</span>
                <AuditPriceBox label="Giá mới" importPrice={item.newImportPrice} sellPrice={item.newSellPrice} tone="new" />
              </div>

              <div className="pm-history-time">{formatDateTime(item.createdAt)}</div>
            </div>
          ))}
        </div>

        <Pagination
          page={auditPage}
          totalPages={auditTotalPages}
          pageSize={auditPageSize}
          onPageChange={(nextPage) => {
            setAuditLoading(true)
            setAuditError('')
            setAuditPage(nextPage)
          }}
          onPageSizeChange={(size) => {
            setAuditLoading(true)
            setAuditError('')
            setAuditPageSize(size)
            setAuditPage(1)
          }}
          disabled={auditLoading}
        />
      </div>
    </div>
  )
}

export default PricingManagementContent
