import { useEffect, useMemo, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { toast } from 'react-toastify'
import {
  GitCompare, RefreshCw, Search, Info, ShieldCheck, History, ListChecks,
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

function isCompletedStatus(status) {
  return String(status || '').toUpperCase() === 'COMPLETED'
}

function ReconciliationContent() {
  const { authToken } = useAuth()
  const [network, setNetwork] = useState(0)
  const [partner, setPartner] = useState(0)
  const [status, setStatus] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  const [networkOptions, setNetworkOptions] = useState([ALL_OPTION])
  const [partnerOptions, setPartnerOptions] = useState([ALL_OPTION])
  const [infoError, setInfoError] = useState('')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyDialogVisible, setVerifyDialogVisible] = useState(false)
  const [verifyNote, setVerifyNote] = useState('')
  const [reconPage, setReconPage] = useState(1)
  const [reconPageSize, setReconPageSize] = useState(10)

  const [historyRows, setHistoryRows] = useState([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPageSize, setHistoryPageSize] = useState(10)

  const selectableRowIds = useMemo(
    () => rows.filter((row) => isCompletedStatus(row.status)).map((row) => row.id),
    [rows],
  )
  const allSelected = selectableRowIds.length > 0 && selectedRows.length === selectableRowIds.length
  const toggleSelectAll = () => setSelectedRows(allSelected ? [] : selectableRowIds)
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
      .then(({ telcos, providers }) => {
        if (cancelled) return
        setNetworkOptions([ALL_OPTION, ...telcos.map((t) => ({ label: t.telco, value: t.id }))])
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
    providerId = partner,
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
      providerId,
      timeType: 0,
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
    setNetwork(0)
    setPartner(0)
    setStatus(null)

    fetchList({
      page: 1,
      limit: reconPageSize,
      telcoId: 0,
      providerId: 0,
      statusFilter: null,
    })
  }

  const handleSearch = () => {
    fetchList({ page: 1, limit: reconPageSize })
  }

  const openVerifyDialog = () => {
    if (selectedRows.length === 0) return
    setVerifyNote('')
    setVerifyDialogVisible(true)
  }

  const closeVerifyDialog = () => {
    if (verifying) return
    setVerifyDialogVisible(false)
    setVerifyNote('')
  }

  const handleVerifySelected = () => {
    if (!authToken || selectedRows.length === 0) return

    setVerifying(true)
    verifySummarySms({ token: authToken, ids: selectedRows, note: verifyNote.trim() })
      .then((message) => {
        toast.success(message || `Đã xác thực ${selectedRows.length} bản ghi đối soát.`)
        setVerifyDialogVisible(false)
        setVerifyNote('')
        fetchList({ page: reconPage, limit: reconPageSize })
        fetchHistory({ page: 1, limit: historyPageSize })
      })
      .catch((err) => {
        toast.error(err.message || 'Không xác thực được các bản ghi đối soát.')
      })
      .finally(() => setVerifying(false))
  }

  const verifyDialogFooter = (
    <div className="rc-verify-dialog-actions">
      <button type="button" className="bn-btn-draft p-button" onClick={closeVerifyDialog} disabled={verifying}>
        Hủy
      </button>
      <button type="button" className="db-export-btn gw-save-btn" onClick={handleVerifySelected} disabled={verifying}>
        <ShieldCheck size={16} /> {verifying ? 'Đang xác thực...' : 'Xác thực đối soát'}
      </button>
    </div>
  )

  return (
    <div className="reconciliation-content">
      {/* Header */}
      <div className="gw-card rc-header-card gw-header-elevated">
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

      {/* Compact filters */}
      <div className="gw-card gw-header-elevated rc-filter-card">
        <div className="rc-filter-heading">
          <span className="gw-card-icon"><Search size={18} /></span>
          <div>
            <h3 className="gw-card-title" style={{ margin: 0 }}>Bộ lọc đối soát</h3>
            <p className="gw-card-subtitle" style={{ margin: '0.2rem 0 0' }}>Lọc theo nhà mạng, đối tác và trạng thái</p>
          </div>
        </div>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        <div className="rc-compact-filter-row">
          <div className="gw-form-field">
            <label>Nhà mạng</label>
            <Dropdown value={network} onChange={(e) => setNetwork(e.value)} options={networkOptions} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Đối tác</label>
            <Dropdown value={partner} onChange={(e) => setPartner(e.value)} options={partnerOptions} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái</label>
            <Dropdown value={status} onChange={(e) => setStatus(e.value)} options={STATUS_OPTIONS} className="bn-dropdown" />
          </div>
          <div className="rc-filter-actions">
            <button
              className="db-refresh-icon-btn"
              onClick={handleResetFilters}
              disabled={listLoading}
              title="Làm mới bộ lọc"
            >
              <RefreshCw size={16} />
            </button>
            <button className="db-export-btn" onClick={handleSearch} disabled={listLoading}>
              <Search size={16} /> {listLoading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>
      </div>

      {/* Reconciliation table */}
      <div className="routing-table-section gw-table-section gw-header-elevated">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon"><ListChecks size={18} /></span>
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
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={selectableRowIds.length === 0 || listLoading} />
            Đã chọn {selectedRows.length} bản ghi
          </label>
          <button
            className="db-export-btn gw-save-btn"
            disabled={selectedRows.length === 0 || verifying}
            onClick={openVerifyDialog}
          >
            <ShieldCheck size={16} /> {verifying ? 'Đang xác thực...' : 'Xác thực đối soát'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table rc-recon-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={selectableRowIds.length === 0 || listLoading} />
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
                <th>Kết quả đối soát</th>
                <th>Trạng thái xử lý</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {listLoading && (
                <tr><td colSpan={15} className="gw-table-status">Đang tải dữ liệu đối soát...</td></tr>
              )}
              {!listLoading && !listError && rows.length === 0 && (
                <tr><td colSpan={15} className="gw-table-status">Không có dữ liệu đối soát.</td></tr>
              )}
              {!listLoading && rows.map((row) => {
                const verified = isVerifiedStatus(row.reconciliationStatus)
                const canVerify = isCompletedStatus(row.status)
                const profit = Number(row.totalProfit) || 0
                return (
                  <tr key={row.id}>
                    <td>
                      {canVerify && (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                        />
                      )}
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
                        {row.reconciliationStatus || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${canVerify ? 'active' : 'pending'}`}>
                        <span className="status-dot" />
                        {row.processStatus || '-'}
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

      <Dialog
        header="Xác thực đối soát"
        visible={verifyDialogVisible}
        onHide={closeVerifyDialog}
        footer={verifyDialogFooter}
        className="rc-verify-dialog"
        closable={!verifying}
        dismissableMask={!verifying}
      >
        <div className="rc-verify-dialog-body">
          <p>Bạn đang xác thực <strong>{selectedRows.length}</strong> bản ghi đối soát.</p>
          <div className="gw-form-field">
            <label htmlFor="reconciliation-verify-note">Ghi chú <span className="cc-optional">(không bắt buộc)</span></label>
            <textarea
              id="reconciliation-verify-note"
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              placeholder="Nhập ghi chú cho các bản ghi đã chọn"
              rows={4}
              disabled={verifying}
            />
          </div>
        </div>
      </Dialog>

      {/* History */}
      <div className="gw-card gw-header-elevated">
        <div className="gw-history-head">
          <span className="gw-card-icon"><History size={18} /></span>
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
