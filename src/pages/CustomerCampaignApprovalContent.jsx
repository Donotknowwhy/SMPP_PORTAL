import { useMemo, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import { Search, Eye, Clock, FileClock, CheckCircle2, XCircle, ClipboardCheck, ListChecks } from 'lucide-react'
import {
  BRANDNAME_OPTIONS,
  CAMPAIGN_APPROVAL_STATUSES,
  CAMPAIGN_APPROVAL_ROWS,
  CAMPAIGN_TYPE_LABELS,
} from '../constants/customerPortal'
import Pagination from '../components/common/Pagination'

const ALL_STATUS = { value: 'all', label: 'Tất cả trạng thái' }
const ALL_BRANDNAME = { value: 'all', label: 'Tất cả Brandname' }

const STATUS_ICONS = {
  pending_campaign: Clock,
  pending_content: FileClock,
  approved: CheckCircle2,
  rejected: XCircle,
}

const STATUS_META = CAMPAIGN_APPROVAL_STATUSES.reduce((acc, s) => ({ ...acc, [s.value]: s }), {})

function numberFormat(v) {
  return new Intl.NumberFormat('vi-VN').format(v ?? 0)
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status]
  if (!meta) return null
  const Icon = STATUS_ICONS[status]
  return (
    <span className={`cca-status-badge cca-status-${meta.tone}`}>
      <Icon size={13} /> {meta.label}
    </span>
  )
}

function CustomerCampaignApprovalContent() {
  const [status, setStatus] = useState('all')
  const [brandname, setBrandname] = useState('all')
  const [fromDate, setFromDate] = useState(new Date(2026, 5, 14, 0, 0))
  const [toDate, setToDate] = useState(new Date(2026, 5, 15, 23, 59))
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [detailRow, setDetailRow] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return CAMPAIGN_APPROVAL_ROWS.filter((r) => {
      if (status !== 'all' && r.status !== status) return false
      if (brandname !== 'all' && r.brandname !== brandname) return false
      if (keyword && !r.code.toLowerCase().includes(keyword) && !r.name.toLowerCase().includes(keyword)) return false
      return true
    })
  }, [status, brandname, search])

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageRows = filteredRows.slice(page * pageSize, page * pageSize + pageSize)

  const allChecked = pageRows.length > 0 && pageRows.every((r) => selectedRows.includes(r.code))

  const toggleAll = () => {
    if (allChecked) {
      setSelectedRows((prev) => prev.filter((c) => !pageRows.some((r) => r.code === c)))
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageRows.map((r) => r.code)])))
    }
  }

  const toggleRow = (code) => {
    setSelectedRows((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  const handleSearch = () => {
    setPage(0)
  }

  return (
    <div className="cca-page">
      <div className="gw-card gw-header-elevated cca-filter-card">
        <div className="gw-card-head">
          <span className="gw-card-icon"><ClipboardCheck size={18} /></span>
          <div>
            <h2 className="gw-card-title">Quản lý phê duyệt chiến dịch</h2>
            <p className="gw-card-subtitle">Duyệt nội dung, theo dõi trạng thái và lịch gửi các chiến dịch SMS của khách hàng</p>
          </div>
        </div>

        <div className="cca-filter-grid">
          <div className="gw-form-field">
            <label>Trạng thái</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}>
              <option value={ALL_STATUS.value}>{ALL_STATUS.label}</option>
              {CAMPAIGN_APPROVAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="gw-form-field">
            <label>Brandname</label>
            <select value={brandname} onChange={(e) => { setBrandname(e.target.value); setPage(0) }}>
              <option value={ALL_BRANDNAME.value}>{ALL_BRANDNAME.label}</option>
              {BRANDNAME_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div className="gw-form-field">
            <label>Từ ngày - giờ</label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              dateFormat="dd/mm/yy"
              showTime
              hourFormat="24"
              showIcon
              className="db-calendar cca-calendar"
            />
          </div>

          <div className="gw-form-field">
            <label>Đến ngày - giờ</label>
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value)}
              dateFormat="dd/mm/yy"
              showTime
              hourFormat="24"
              showIcon
              className="db-calendar cca-calendar"
            />
          </div>

          <div className="gw-form-field cca-search-field">
            <label className="cca-search-label-hidden">Tìm kiếm</label>
            <div className="pm-search-field">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm"
              />
              <Search size={16} className="pm-search-icon" />
            </div>
          </div>

          <button className="db-search-btn cca-search-btn" onClick={handleSearch}>
            Tra cứu <Search size={16} />
          </button>
        </div>
      </div>

      <div className="routing-table-section gw-table-section gw-header-elevated">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon"><ListChecks size={18} /></span>
            <h3 className="table-title">
              Danh sách chiến dịch <span className="am-count-badge">{totalRows} chiến dịch</span>
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table cca-table">
            <thead>
              <tr>
                <th className="cca-checkbox-col">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>Mã Campaign</th>
                <th>Tên chiến dịch</th>
                <th>Brandname</th>
                <th>Loại tin</th>
                <th>Sản lượng</th>
                <th>Lịch gửi</th>
                <th>Trạng thái hiện tại</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="gw-table-status">Không có chiến dịch phù hợp bộ lọc.</td>
                </tr>
              )}
              {pageRows.map((row) => (
                <tr key={row.code}>
                  <td className="cca-checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.code)}
                      onChange={() => toggleRow(row.code)}
                    />
                  </td>
                  <td><span className="cca-campaign-code">{row.code}</span></td>
                  <td>{row.name}</td>
                  <td>{row.brandname}</td>
                  <td>{CAMPAIGN_TYPE_LABELS[row.type] || row.type}</td>
                  <td>{numberFormat(row.volume)} SMS</td>
                  <td>{row.scheduledAt}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <button
                      type="button"
                      className="lk-detail-link lk-detail-icon-btn"
                      onClick={() => setDetailRow(row)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page + 1}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p - 1)}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
        />
      </div>

      <Dialog
        header="Chi tiết chiến dịch"
        visible={!!detailRow}
        onHide={() => setDetailRow(null)}
        className="lk-detail-dialog"
        dismissableMask
      >
        {detailRow && (
          <div className="lk-detail-grid">
            <div className="lk-detail-item">
              <span className="lk-detail-label">Mã Campaign</span>
              <span className="lk-detail-value">{detailRow.code}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Tên chiến dịch</span>
              <span className="lk-detail-value">{detailRow.name}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Brandname</span>
              <span className="lk-detail-value">{detailRow.brandname}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Loại tin</span>
              <span className="lk-detail-value">{CAMPAIGN_TYPE_LABELS[detailRow.type] || detailRow.type}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Sản lượng</span>
              <span className="lk-detail-value">{numberFormat(detailRow.volume)} SMS</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Lịch gửi</span>
              <span className="lk-detail-value">{detailRow.scheduledAt}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Trạng thái hiện tại</span>
              <StatusBadge status={detailRow.status} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default CustomerCampaignApprovalContent
