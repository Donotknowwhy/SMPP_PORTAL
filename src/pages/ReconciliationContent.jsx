import { useEffect, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { toast } from 'react-toastify'
import {
  GitCompare, FileDown, Upload,
  RefreshCw, Search, Download, Info, NotebookPen, Save,
} from 'lucide-react'
import {
  BULK_STATUS_OPTIONS,
  STATUS_OPTIONS,
  STATS_CONFIG,
  RECON_ROWS,
  HISTORY_ROWS,
} from '../constants/reconciliation'
import { useAuth } from '../context/AuthContext'
import { getRoutingInfo } from '../utils/routingApi'
import { getReconciliationStats, exportReconciliationReport } from '../utils/reconciliationApi'

const ALL_OPTION = { label: 'Tất cả', value: 0 }

function formatDate(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0)
}

const DEFAULT_FROM_DATE = new Date(2025, 5, 14)
const DEFAULT_TO_DATE = new Date(2025, 5, 26)

function ReconciliationContent() {
  const { authToken } = useAuth()
  const [fromDate, setFromDate] = useState(DEFAULT_FROM_DATE)
  const [toDate, setToDate] = useState(DEFAULT_TO_DATE)
  const [network, setNetwork] = useState(0)
  const [brandname, setBrandname] = useState(0)
  const [partner, setPartner] = useState(0)
  const [status, setStatus] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [bulkStatus, setBulkStatus] = useState('')

  const [networkOptions, setNetworkOptions] = useState([ALL_OPTION])
  const [brandnameOptions, setBrandnameOptions] = useState([ALL_OPTION])
  const [partnerOptions, setPartnerOptions] = useState([ALL_OPTION])
  const [infoError, setInfoError] = useState('')

  const [stats, setStats] = useState({ totalCost: 0, totalPrice: 0, totalSms: 0, profit: 0 })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [dateFilterApplied, setDateFilterApplied] = useState(false)

  const allSelected = selectedRows.length === RECON_ROWS.length
  const toggleSelectAll = () => setSelectedRows(allSelected ? [] : RECON_ROWS.map((row) => row.id))
  const toggleSelectRow = (id) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setInfoError('')

    getRoutingInfo(authToken)
      .then(({ brandNames, telcos, providers }) => {
        if (cancelled) return
        setNetworkOptions([ALL_OPTION, ...telcos.map((t) => ({ label: t.telco, value: t.id }))])
        setBrandnameOptions([ALL_OPTION, ...brandNames.map((b) => ({ label: b.brandName, value: b.id }))])
        setPartnerOptions([ALL_OPTION, ...providers.map((p) => ({ label: p.providerName, value: p.id }))])
      })
      .catch((err) => {
        if (!cancelled) setInfoError(err.message || 'Không tải được dữ liệu bộ lọc.')
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  const fetchStats = ({
    telcoId = network,
    brandNameId = brandname,
    providerId = partner,
    applyDateFilter = dateFilterApplied,
    from = fromDate,
    to = toDate,
    statusFilter = status,
  } = {}) => {
    if (!authToken) return

    setStatsLoading(true)
    setStatsError('')

    getReconciliationStats({
      token: authToken,
      telcoId,
      brandNameId,
      providerId,
      timeType: applyDateFilter ? 1 : 0,
      startTime: applyDateFilter ? formatDate(from) : undefined,
      endTime: applyDateFilter ? formatDate(to) : undefined,
      status: statusFilter,
    })
      .then((result) => setStats(result))
      .catch((err) => {
        setStatsError(err.message || 'Không tải được dữ liệu đối soát.')
        toast.error(err.message || 'Không tải được dữ liệu đối soát.')
      })
      .finally(() => setStatsLoading(false))
  }

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const handleResetFilters = () => {
    setFromDate(DEFAULT_FROM_DATE)
    setToDate(DEFAULT_TO_DATE)
    setNetwork(0)
    setBrandname(0)
    setPartner(0)
    setStatus('')
    setDateFilterApplied(false)

    fetchStats({
      telcoId: 0,
      brandNameId: 0,
      providerId: 0,
      applyDateFilter: false,
      from: DEFAULT_FROM_DATE,
      to: DEFAULT_TO_DATE,
      statusFilter: '',
    })
  }

  const handleExport = () => {
    if (!authToken) return

    setExporting(true)

    exportReconciliationReport({
      token: authToken,
      timeType: dateFilterApplied ? 1 : 0,
      startTime: dateFilterApplied ? formatDate(fromDate) : undefined,
      endTime: dateFilterApplied ? formatDate(toDate) : undefined,
    })
      .then(({ blob, filename }) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
        toast.success('Xuất báo cáo đối soát thành công.')
      })
      .catch((err) => {
        toast.error(err.message || 'Không xuất được báo cáo đối soát.')
      })
      .finally(() => setExporting(false))
  }

  return (
    <div className="reconciliation-content">
        {/* Header */}
      <div className="gw-card rc-header-card">
        <div className="gw-card-head am-create-head-text" style={{ marginBottom: 0 }}>
          <span className="gw-card-icon">
            <GitCompare size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">SMS Reconciliation Management</h2>
            <p className="gw-card-subtitle">Quản lý đối soát sản lượng SMS Brandname với nhà cung cấp và khách hàng</p>
          </div>
        </div>
        <div className="rc-header-actions">
          <button className="bn-btn-draft p-button" onClick={handleExport} disabled={exporting}>
            <FileDown size={16} /> {exporting ? 'Đang xuất...' : 'Export báo cáo'}
          </button>
          <button className="db-export-btn">
            <Upload size={16} /> Upload file
          </button>
        </div>
      </div>

       {/* Filters */}
      <div className="gw-card">
        <h3 className="gw-card-title">Bộ lọc đối soát</h3>
        <p className="gw-card-subtitle" style={{ marginBottom: '1rem' }}>Tìm kiếm dữ liệu đối soát theo thời gian và nhà mạng</p>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        <div className="rc-filter-grid">
          <div className="gw-form-field">
            <label>Từ ngày</label>
            <Calendar
              value={fromDate}
              onChange={(e) => { setFromDate(e.value); setDateFilterApplied(true) }}
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline"
            />
          </div>
          <div className="gw-form-field">
            <label>Đến ngày</label>
            <Calendar
              value={toDate}
              onChange={(e) => { setToDate(e.value); setDateFilterApplied(true) }}
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline"
            />
          </div>
          <div className="gw-form-field">
            <label>Nhà mạng</label>
            <Dropdown value={network} onChange={(e) => setNetwork(e.value)} options={networkOptions} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Brandname</label>
            <Dropdown value={brandname} onChange={(e) => setBrandname(e.value)} options={brandnameOptions} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Đối tác</label>
            <Dropdown value={partner} onChange={(e) => setPartner(e.value)} options={partnerOptions} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái</label>
            <Dropdown value={status} onChange={(e) => setStatus(e.value)} options={STATUS_OPTIONS} className="bn-dropdown" />
          </div>
        </div>

        <div className="rc-filter-actions">
          <button className="bn-btn-draft p-button" onClick={handleResetFilters} disabled={statsLoading}>
            <RefreshCw size={16} /> Làm mới
          </button>
          <button className="db-export-btn" onClick={fetchStats} disabled={statsLoading}>
            <Search size={16} /> {statsLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>
    
      {/* KPI stats */}
      {statsError && <p className="gw-table-error">{statsError}</p>}
      <div className="rc-stats-grid">
        {STATS_CONFIG.map((s) => (
          <div key={s.id} className="rc-stat-card">
            <span className="rc-stat-icon" style={{ background: s.color }}>
              <s.icon size={18} />
            </span>
            <div className="rc-stat-body">
              <p className="rc-stat-label">{s.label}</p>
              <p className="rc-stat-value">
                {statsLoading ? '...' : formatNumber(stats[s.key])} <span className="rc-stat-unit">{s.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

     

      {/* Reconciliation table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <div>
              <h3 className="table-title">Bảng đối soát sản lượng</h3>
              <p className="gw-card-subtitle">Đối soát SMS theo nhà mạng/ brandname/ partner</p>
            </div>
          </div>
          <div className="rc-table-toolbar">
            <div className="pm-search-field">
              <input type="text" placeholder="Tìm kiếm đối soát..." />
              <Search size={16} className="pm-search-icon" />
            </div>
            <button className="db-filter-btn">Tìm <Search size={14} /></button>
            <input type="text" className="gw-filter-date" defaultValue="14/06/2025" />
            <input type="text" className="gw-filter-date" defaultValue="26/06/2025" />
            <button className="bn-btn-draft p-button">
              <Download size={16} /> Tải tất cả
            </button>
          </div>
        </div>

        <div className="rc-bulk-bar">
          <label className="rc-bulk-checkbox">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            Đã chọn {selectedRows.length} bản ghi
          </label>
          <Dropdown
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.value)}
            options={BULK_STATUS_OPTIONS}
            disabled={selectedRows.length === 0}
            className="bn-dropdown rc-bulk-dropdown"
          />
          <button className="bn-btn-draft p-button" disabled={selectedRows.length === 0}>
            <NotebookPen size={16} /> Thêm ghi chú
          </button>
          <button className="db-export-btn gw-save-btn" disabled={selectedRows.length === 0}>
            <Save size={16} /> Lưu
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table rc-recon-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Tên KH</th>
                <th>Brandname</th>
                <th>Nhà mạng</th>
                <th>Đối tác</th>
                <th>Sản lượng</th>
                <th>giá nhập</th>
                <th>giá bán</th>
                <th>doanh thu</th>
                <th>chi phí</th>
                <th>Lợi nhuận</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {RECON_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleSelectRow(row.id)}
                    />
                  </td>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td>{row.customer}</td>
                  <td><span className="table-network">{row.brandname}</span></td>
                  <td>{row.network}</td>
                  <td>{row.partner}</td>
                  <td>{row.volume}</td>
                  <td>{row.buyPrice}</td>
                  <td>{row.sellPrice}</td>
                  <td>{row.revenue}</td>
                  <td>{row.cost}</td>
                  <td className={row.profitUp ? 'pm-diff-up' : 'pm-diff-down'}>{row.profit}</td>
                  <td>
                    <span className={`status-badge ${row.status === 'verified' ? 'active' : 'pending'}`}>
                      <span className="status-dot" />
                      {row.status === 'verified' ? 'Verified' : 'Need Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rc-note">
          <Info size={14} /> Hệ thống tự động đối soát theo nhà mạng, brandname và đối tác, các dòng lệch sẽ được đánh dấu Need Review.
        </div>

        <div className="routing-pagination flex-wrap gap-3">
          <div className="db-page-size">
            <span>Show</span>
            <select defaultValue="10" className="pagination-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>‹</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`pagination-btn${n === 1 ? ' active' : ''}`}>{n}</button>
            ))}
            <span className="db-page-ellipsis">...</span>
            <button className="pagination-btn">10</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="gw-card">
        <div className="gw-history-head">
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">
              Lịch sử đối soát <span className="am-count-badge">8 bản ghi</span>
            </h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử upload và xử lý đối soát</p>
          </div>
          <button className="db-export-btn am-create-btn">
            <FileDown size={16} /> Xuất excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>user</th>
                <th>Hành động</th>
                <th>File</th>
                <th>Kết quả</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>{row.user}</td>
                  <td>{row.action}</td>
                  <td>{row.file}</td>
                  <td>
                    <span className={`am-history-badge am-tone-${row.result === 'success' ? 'green' : 'orange'}`}>
                      {row.result === 'success' ? 'Success' : 'Need Review'}
                    </span>
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="routing-pagination flex-wrap gap-3">
          <div className="db-page-size">
            <span>Show</span>
            <select defaultValue="10" className="pagination-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>‹</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">4</button>
            <span className="db-page-ellipsis">...</span>
            <button className="pagination-btn">10</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReconciliationContent
