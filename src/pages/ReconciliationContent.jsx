import { useEffect, useMemo, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { toast } from 'react-toastify'
import {
  GitCompare, RefreshCw, Search, Info, ShieldCheck,
} from 'lucide-react'
import {
  STATUS_OPTIONS,
  STATS_CONFIG,
} from '../constants/reconciliation'
import { useAuth } from '../context/AuthContext'
import { getRoutingInfo } from '../utils/routingApi'
import {
  getSummarySms,
  verifySummarySms,
  getSummarySmsAuditLogs,
} from '../utils/reconciliationApi'
import Pagination from '../components/common/Pagination'

const ALL_OPTION = { label: 'Tất cả', value: 0 }

function formatDate(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDisplayDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0)
}

function formatMoney(value) {
  return `${formatNumber(value)} đ`
}

function isVerifiedStatus(status) {
  const normalized = String(status || '').toUpperCase()
  return normalized === 'VERIFIED' || normalized === 'RECONCILED'
}

function ReconciliationContent() {
  const { authToken } = useAuth()
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [network, setNetwork] = useState(0)
  const [brandname, setBrandname] = useState(0)
  const [partner, setPartner] = useState(0)
  const [status, setStatus] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  const [networkOptions, setNetworkOptions] = useState([ALL_OPTION])
  const [brandnameOptions, setBrandnameOptions] = useState([ALL_OPTION])
  const [partnerOptions, setPartnerOptions] = useState([ALL_OPTION])
  const [infoError, setInfoError] = useState('')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [dateFilterApplied, setDateFilterApplied] = useState(false)

  const [reconPage, setReconPage] = useState(1)
  const [reconPageSize, setReconPageSize] = useState(10)

  const [historyRows, setHistoryRows] = useState([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPageSize, setHistoryPageSize] = useState(10)

  const allSelected = rows.length > 0 && selectedRows.length === rows.length
  const toggleSelectAll = () => setSelectedRows(allSelected ? [] : rows.map((row) => row.id))
  const toggleSelectRow = (id) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))

  const stats = useMemo(() => ({
    totalSms: rows.reduce((sum, row) => sum + (Number(row.totalMessages) || 0), 0),
    totalPrice: rows.reduce((sum, row) => sum + (Number(row.totalRevenue) || 0), 0),
    totalCost: rows.reduce((sum, row) => sum + (Number(row.totalCost) || 0), 0),
    profit: rows.reduce((sum, row) => sum + (Number(row.totalProfit) || 0), 0),
  }), [rows])

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

  const fetchList = ({
    page = reconPage,
    limit = reconPageSize,
    telcoId = network,
    brandNameId = brandname,
    providerId = partner,
    applyDateFilter = dateFilterApplied,
    from = fromDate,
    to = toDate,
    statusFilter = status,
  } = {}) => {
    if (!authToken) return

    setListLoading(true)
    setListError('')

    getSummarySms({
      token: authToken,
      page,
      limit,
      telcoId,
      brandNameId,
      providerId,
      timeType: applyDateFilter ? 1 : 0,
      startTime: applyDateFilter ? formatDate(from) : undefined,
      endTime: applyDateFilter ? formatDate(to) : undefined,
      status: statusFilter,
    })
      .then(({ rows: nextRows, total: nextTotal, totalPage }) => {
        setRows(nextRows)
        setTotal(nextTotal)
        setTotalPages(totalPage)
        setReconPage(page)
        setSelectedRows([])
      })
      .catch((err) => {
        setListError(err.message || 'Không tải được dữ liệu đối soát.')
        toast.error(err.message || 'Không tải được dữ liệu đối soát.')
      })
      .finally(() => setListLoading(false))
  }

  const fetchHistory = ({ page = historyPage, limit = historyPageSize } = {}) => {
    if (!authToken) return

    setHistoryLoading(true)
    setHistoryError('')

    getSummarySmsAuditLogs({ token: authToken, page, limit })
      .then(({ rows: nextRows, total: nextTotal, totalPage }) => {
        setHistoryRows(nextRows)
        setHistoryTotal(nextTotal)
        setHistoryTotalPages(totalPage)
        setHistoryPage(page)
      })
      .catch((err) => {
        setHistoryError(err.message || 'Không tải được lịch sử đối soát.')
      })
      .finally(() => setHistoryLoading(false))
  }

  useEffect(() => {
    if (!authToken) return
    fetchList({ page: 1, limit: reconPageSize })
    fetchHistory({ page: 1, limit: historyPageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const handleResetFilters = () => {
    setFromDate(null)
    setToDate(null)
    setNetwork(0)
    setBrandname(0)
    setPartner(0)
    setStatus('')
    setDateFilterApplied(false)

    fetchList({
      page: 1,
      limit: reconPageSize,
      telcoId: 0,
      brandNameId: 0,
      providerId: 0,
      applyDateFilter: false,
      from: null,
      to: null,
      statusFilter: '',
    })
  }

  const handleSearch = () => {
    const hasAnyDate = Boolean(fromDate || toDate)
    const hasBothDates = Boolean(fromDate && toDate)
    if (hasAnyDate && !hasBothDates) {
      toast.error('Vui lòng chọn đủ Từ ngày và Đến ngày.')
      return
    }

    const applyDateFilter = hasBothDates
    setDateFilterApplied(applyDateFilter)
    fetchList({ page: 1, limit: reconPageSize, applyDateFilter })
  }

  const handleVerifySelected = () => {
    if (!authToken || selectedRows.length === 0) return

    setVerifying(true)
    Promise.allSettled(selectedRows.map((id) => verifySummarySms(authToken, id)))
      .then((results) => {
        const successCount = results.filter((r) => r.status === 'fulfilled').length
        const failCount = results.length - successCount
        if (successCount > 0) toast.success(`Đã xác thực ${successCount}/${results.length} bản ghi đối soát.`)
        if (failCount > 0) {
          const firstError = results.find((r) => r.status === 'rejected')?.reason
          toast.error(firstError?.message || `Không xác thực được ${failCount} bản ghi.`)
        }
        fetchList({ page: reconPage, limit: reconPageSize })
        fetchHistory({ page: 1, limit: historyPageSize })
      })
      .finally(() => setVerifying(false))
  }

  return (
    <div className="reconciliation-content">
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
      </div>

      <div className="gw-card">
        <h3 className="gw-card-title">Bộ lọc đối soát</h3>
        <p className="gw-card-subtitle" style={{ marginBottom: '1rem' }}>Tìm kiếm dữ liệu đối soát theo thời gian và nhà mạng</p>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        <div className="rc-filter-grid">
          <div className="gw-form-field">
            <label>Từ ngày</label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline"
            />
          </div>
          <div className="gw-form-field">
            <label>Đến ngày</label>
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value)}
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
          <button className="bn-btn-draft p-button" onClick={handleResetFilters} disabled={listLoading}>
            <RefreshCw size={16} /> Làm mới
          </button>
          <button className="db-export-btn" onClick={handleSearch} disabled={listLoading}>
            <Search size={16} /> {listLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      <div className="rc-stats-grid">
        {STATS_CONFIG.map((s) => (
          <div key={s.id} className="rc-stat-card">
            <span className="rc-stat-icon" style={{ background: s.color }}>
              <s.icon size={18} />
            </span>
            <div className="rc-stat-body">
              <p className="rc-stat-label">{s.label} (trang hiện tại)</p>
              <p className="rc-stat-value">
                {listLoading ? '...' : formatNumber(stats[s.key])} <span className="rc-stat-unit">{s.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <div>
              <h3 className="table-title">
                Bảng đối soát sản lượng <span className="am-count-badge">{total} bản ghi</span>
              </h3>
              <p className="gw-card-subtitle">Đối soát SMS theo nhà mạng/ brandname/ partner</p>
            </div>
          </div>
        </div>

        {listError && <p className="gw-table-error">{listError}</p>}

        <div className="rc-bulk-bar">
          <label className="rc-bulk-checkbox">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={rows.length === 0 || listLoading} />
            Đã chọn {selectedRows.length} bản ghi
          </label>
          <button
            className="db-export-btn gw-save-btn"
            disabled={selectedRows.length === 0 || verifying}
            onClick={handleVerifySelected}
          >
            <ShieldCheck size={16} /> {verifying ? 'Đang xác thực...' : 'Xác thực đối soát'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table rc-recon-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={rows.length === 0 || listLoading} />
                </th>
                <th>Tháng đối soát</th>
                <th>Tên KH</th>
                <th>Brandname</th>
                <th>Nhà mạng</th>
                <th>Đối tác</th>
                <th>Sản lượng</th>
                <th>Giá nhập TB</th>
                <th>Giá bán TB</th>
                <th>Doanh thu</th>
                <th>Chi phí</th>
                <th>Lợi nhuận</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {listLoading && (
                <tr><td colSpan={14} className="gw-table-status">Đang tải dữ liệu đối soát...</td></tr>
              )}
              {!listLoading && !listError && rows.length === 0 && (
                <tr><td colSpan={14} className="gw-table-status">Không có dữ liệu đối soát.</td></tr>
              )}
              {!listLoading && rows.map((row) => {
                const verified = isVerifiedStatus(row.reconciliationStatus)
                const profit = Number(row.totalProfit) || 0
                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                      />
                    </td>
                    <td>{formatDisplayDate(row.summaryMonth)}</td>
                    <td>{row.fullName || '-'}</td>
                    <td><span className="table-network">{row.brandName || '-'}</span></td>
                    <td>{row.telco || '-'}</td>
                    <td>{row.provider || '-'}</td>
                    <td>{formatNumber(row.totalMessages)}</td>
                    <td>{formatMoney(row.avgCostPrice)}</td>
                    <td>{formatMoney(row.avgSellPrice)}</td>
                    <td>{formatMoney(row.totalRevenue)}</td>
                    <td>{formatMoney(row.totalCost)}</td>
                    <td className={profit >= 0 ? 'pm-diff-up' : 'pm-diff-down'}>{formatMoney(profit)}</td>
                    <td>
                      <span className={`status-badge ${verified ? 'active' : 'pending'}`}>
                        <span className="status-dot" />
                        {row.reconciliationStatus || row.processStatus || row.status || '-'}
                      </span>
                    </td>
                    <td>{row.note || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="rc-note">
          <Info size={14} /> Hệ thống tự động đối soát theo nhà mạng, brandname và đối tác. Chọn bản ghi rồi bấm &quot;Xác thực đối soát&quot; để gọi API verify.
        </div>

        <Pagination
          page={reconPage}
          totalPages={totalPages}
          pageSize={reconPageSize}
          disabled={listLoading}
          onPageChange={(next) => fetchList({ page: next, limit: reconPageSize })}
          onPageSizeChange={(size) => {
            setReconPageSize(size)
            fetchList({ page: 1, limit: size })
          }}
        />
      </div>

      <div className="gw-card">
        <div className="gw-history-head">
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">
              Lịch sử đối soát <span className="am-count-badge">{historyTotal} bản ghi</span>
            </h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử xác thực và xử lý đối soát</p>
          </div>
        </div>

        {historyError && <p className="gw-table-error">{historyError}</p>}

        <div className="overflow-x-auto">
          <table className="routing-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Summary ID</th>
                <th>Giá trị trước</th>
                <th>Giá trị mới</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading && (
                <tr><td colSpan={6} className="gw-table-status">Đang tải lịch sử đối soát...</td></tr>
              )}
              {!historyLoading && !historyError && historyRows.length === 0 && (
                <tr><td colSpan={6} className="gw-table-status">Chưa có lịch sử đối soát.</td></tr>
              )}
              {!historyLoading && historyRows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>{row.fullName || '-'}</td>
                  <td>{row.actionChange || '-'}</td>
                  <td>{row.summaryId ?? '-'}</td>
                  <td>{row.oldValue || '-'}</td>
                  <td>{row.newValue || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={historyPage}
          totalPages={historyTotalPages}
          pageSize={historyPageSize}
          disabled={historyLoading}
          onPageChange={(next) => fetchHistory({ page: next, limit: historyPageSize })}
          onPageSizeChange={(size) => {
            setHistoryPageSize(size)
            fetchHistory({ page: 1, limit: size })
          }}
        />
      </div>
    </div>
  )
}

export default ReconciliationContent
