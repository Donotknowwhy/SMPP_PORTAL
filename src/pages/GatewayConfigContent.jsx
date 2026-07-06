import { useEffect, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { toast } from 'react-toastify'
import { Router, ListFilter, Download, Pencil, Trash2, ShieldCheck, History, Save } from 'lucide-react'
import {
  BRANDNAMES,
  NETWORK_FILTER_OPTIONS,
  STATUSES,
  PRIORITIES,
} from '../constants/gatewayConfig'
import { useAuth } from '../context/AuthContext'
import {
  getRoutingList,
  getRoutingInfo,
  createRoutingRule,
  exportRoutingRules,
  deleteRoutingRule,
  getRoutingAudit,
} from '../utils/routingApi'

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const AUDIT_FIELD_LABELS = {
  primaryProvider: 'Provider chính',
  backupProvider: 'Provider dự phòng',
  tps: 'TPS (tin/giây)',
  priority: 'Priority',
  status: 'Trạng thái',
}

function parseAuditValue(value) {
  if (!value) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function buildAuditChanges(oldValue, newValue) {
  const oldObj = parseAuditValue(oldValue)
  const newObj = parseAuditValue(newValue)

  return Object.keys(AUDIT_FIELD_LABELS)
    .filter((key) => key in oldObj || key in newObj)
    .map((key) => {
      const from = oldObj[key] ?? '-'
      const to = newObj[key] ?? '-'
      return { label: AUDIT_FIELD_LABELS[key], from, to, unchanged: String(from) === String(to) }
    })
}

function ChangeValue({ from, to, unchanged }) {
  if (unchanged) {
    return (
      <span className="gw-change-value">
        {from} → {to} <span className="gw-change-unchanged">(không đổi)</span>
      </span>
    )
  }

  return (
    <span className="gw-change-value">
      <span className="gw-change-from">{from}</span> → <span className="gw-change-to">{to}</span>
    </span>
  )
}

const DEFAULT_FORM = {
  brandname: null,
  network: null,
  primary: null,
  backup: null,
  tps: 1000,
  priority: 1,
  status: 'Active',
}

function GatewayConfigContent() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [filterBrandname, setFilterBrandname] = useState(null)
  const [filterNetwork, setFilterNetwork] = useState(null)

  const { authToken } = useAuth()
  const [routingRows, setRoutingRows] = useState([])
  const [routingTotal, setRoutingTotal] = useState(0)
  const [routingLoading, setRoutingLoading] = useState(false)
  const [routingError, setRoutingError] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [auditItems, setAuditItems] = useState([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [auditPage, setAuditPage] = useState(0)
  const [auditPageSize, setAuditPageSize] = useState(10)

  const [brandNameOptions, setBrandNameOptions] = useState([])
  const [telcoOptions, setTelcoOptions] = useState([])
  const [providerOptions, setProviderOptions] = useState([])
  const [infoError, setInfoError] = useState('')

  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleExport = () => {
    if (!authToken) return

    setExporting(true)

    exportRoutingRules(authToken)
      .then(({ blob, filename }) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
        toast.success('Xuất cấu hình thành công.')
      })
      .catch((err) => {
        toast.error(err.message || 'Không xuất được cấu hình.')
      })
      .finally(() => setExporting(false))
  }

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setInfoError('')

    getRoutingInfo(authToken)
      .then(({ brandNames, telcos, providers }) => {
        if (cancelled) return
        setBrandNameOptions(brandNames.map((b) => ({ label: b.brandName, value: b.id })))
        setTelcoOptions(telcos.map((t) => ({ label: t.telco, value: t.id })))
        setProviderOptions(providers.map((p) => ({ label: p.providerName, value: p.id })))
      })
      .catch((err) => {
        if (!cancelled) setInfoError(err.message || 'Không tải được dữ liệu cấu hình.')
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setRoutingLoading(true)
    setRoutingError('')

    getRoutingList({ token: authToken, brandNameId: 0, telcoId: 0, page, size: pageSize })
      .then(({ rows, total }) => {
        if (cancelled) return
        setRoutingRows(rows)
        setRoutingTotal(total)
      })
      .catch((err) => {
        if (!cancelled) setRoutingError(err.message || 'Không tải được danh sách routing.')
      })
      .finally(() => {
        if (!cancelled) setRoutingLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authToken, page, pageSize])

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setAuditLoading(true)
    setAuditError('')

    getRoutingAudit({ token: authToken, page: auditPage, size: auditPageSize })
      .then(({ rows, total }) => {
        if (cancelled) return
        setAuditItems(rows)
        setAuditTotal(total)
      })
      .catch((err) => {
        if (!cancelled) setAuditError(err.message || 'Không tải được lịch sử cấu hình.')
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authToken, auditPage, auditPageSize])

  const refreshRoutingList = () => {
    if (!authToken) return
    setRoutingLoading(true)
    setRoutingError('')

    getRoutingList({ token: authToken, brandNameId: 0, telcoId: 0, page: 0, size: pageSize })
      .then(({ rows, total }) => {
        setRoutingRows(rows)
        setRoutingTotal(total)
      })
      .catch((err) => setRoutingError(err.message || 'Không tải được danh sách routing.'))
      .finally(() => setRoutingLoading(false))

    setPage(0)
  }

  const refreshAuditList = () => {
    if (!authToken) return
    setAuditLoading(true)
    setAuditError('')

    getRoutingAudit({ token: authToken, page: 0, size: auditPageSize })
      .then(({ rows, total }) => {
        setAuditItems(rows)
        setAuditTotal(total)
      })
      .catch((err) => setAuditError(err.message || 'Không tải được lịch sử cấu hình.'))
      .finally(() => setAuditLoading(false))

    setAuditPage(0)
  }

  const handleDelete = (routingRuleId) => {
    if (!authToken) return

    setDeletingId(routingRuleId)

    deleteRoutingRule(authToken, routingRuleId)
      .then((message) => {
        toast.success(message || 'Xóa cấu hình routing thành công.')
        refreshRoutingList()
        refreshAuditList()
      })
      .catch((err) => {
        toast.error(err.message || 'Không xóa được cấu hình routing.')
      })
      .finally(() => setDeletingId(null))
  }

  const confirmDelete = (row) => {
    confirmDialog({
      message: `Có muốn xóa cấu hình routing "${row.brandName} - ${row.telco}" không?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-text',
      defaultFocus: 'reject',
      accept: () => handleDelete(row.id),
    })
  }

  const handleSave = () => {
    if (!authToken) return
    if (!form.brandname || !form.network || !form.primary) {
      toast.warn('Vui lòng chọn Brandname, Nhà mạng và Provider chính.')
      return
    }

    setSaving(true)

    createRoutingRule({
      token: authToken,
      brandNameId: form.brandname,
      telcoId: form.network,
      primaryProviderId: form.primary,
      backupProviderId: form.backup || null,
      tps: Number(form.tps),
      priority: form.priority,
      status: form.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
    })
      .then((message) => {
        toast.success(message || 'Tạo cấu hình routing thành công.')
        setForm(DEFAULT_FORM)
        refreshRoutingList()
        refreshAuditList()
      })
      .catch((err) => {
        toast.error(err.message || 'Không tạo được cấu hình routing.')
      })
      .finally(() => setSaving(false))
  }

  return (
    <div className="gateway-config-content">
      <ConfirmDialog />

      {/* Form card */}
      <div className="gw-card">
        <div className="gw-card-head">
          <span className="gw-card-icon">
            <Router size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">Cấu hình Routing Brandname</h2>
            <p className="gw-card-subtitle">Quản lý mapping Brandname, loại mạng và routing theo đối tác</p>
          </div>
        </div>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        <div className="gw-form-grid">
          <div className="gw-form-field">
            <label>Brandname <span className="gw-required">*</span></label>
            <Dropdown
              value={form.brandname}
              onChange={(e) => updateForm('brandname', e.value)}
              options={brandNameOptions}
              placeholder="Chọn Brandname"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Nhà mạng (Telco) <span className="gw-required">*</span></label>
            <Dropdown
              value={form.network}
              onChange={(e) => updateForm('network', e.value)}
              options={telcoOptions}
              placeholder="Chọn nhà mạng"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Provider chính <span className="gw-required">*</span></label>
            <Dropdown
              value={form.primary}
              onChange={(e) => updateForm('primary', e.value)}
              options={providerOptions}
              placeholder="Chọn Provider chính"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Provider dự phòng (Backup)</label>
            <Dropdown
              value={form.backup}
              onChange={(e) => updateForm('backup', e.value)}
              options={providerOptions}
              placeholder="Chọn Provider dự phòng"
              className="bn-dropdown"
            />
          </div>

          <div className="gw-form-field">
            <label>TPS (Tin/giây) <span className="gw-required">*</span></label>
            <input
              type="number"
              min="0"
              value={form.tps}
              onChange={(e) => updateForm('tps', e.target.value)}
            />
          </div>
          <div className="gw-form-field">
            <label>Priority <span className="gw-required">*</span></label>
            <Dropdown
              value={form.priority}
              onChange={(e) => updateForm('priority', e.value)}
              options={PRIORITIES}
              placeholder="Chọn Priority"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái <span className="gw-required">*</span></label>
            <Dropdown
              value={form.status}
              onChange={(e) => updateForm('status', e.value)}
              options={STATUSES}
              placeholder="Chọn trạng thái"
              className="bn-dropdown"
            />
          </div>

          <div className="gw-form-actions">
            <button className="db-export-btn gw-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>

      {/* Routing table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon">📋</span>
            <div>
              <h3 className="table-title">Danh sách Routing</h3>
              <p className="gw-card-subtitle">Quản lý cấu hình Routing theo brandname và nhà mạng</p>
            </div>
          </div>
          <div className="gw-table-filters">
            <Dropdown
              value={filterBrandname}
              onChange={(e) => setFilterBrandname(e.value)}
              options={BRANDNAMES}
              placeholder="Brandname"
              className="bn-dropdown gw-filter-dropdown"
            />
            <Dropdown
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.value)}
              options={NETWORK_FILTER_OPTIONS}
              placeholder="--Loại mạng--"
              className="bn-dropdown gw-filter-dropdown"
            />
            {/* <input type="text" className="gw-filter-date" defaultValue="05/06/2026" /> */}
            <button className="db-filter-btn">
              Lọc dữ liệu <ListFilter size={16} />
            </button>
            <button className="db-export-btn" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Đang xuất...' : 'Kết xuất cấu hình tổng'} <Download size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table">
            <thead>
              <tr>
                <th>Brandname</th>
                <th>Nhà mạng</th>
                <th>Provider chính</th>
                <th>Provider dự phòng</th>
                <th>TPS (tin/giây)</th>
                <th>Priority</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Người cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {routingLoading && (
                <tr>
                  <td colSpan={10} className="gw-table-status">Đang tải danh sách routing...</td>
                </tr>
              )}
              {!routingLoading && routingError && (
                <tr>
                  <td colSpan={10} className="gw-table-status gw-table-error">{routingError}</td>
                </tr>
              )}
              {!routingLoading && !routingError && routingRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="gw-table-status">Không có dữ liệu routing.</td>
                </tr>
              )}
              {!routingLoading && !routingError && routingRows.map((row) => (
                <tr key={row.id}>
                  <td><span className="table-network">{row.brandName}</span></td>
                  <td>{row.telco}</td>
                  <td><span className="table-provider primary">{row.primaryProvider}</span></td>
                  <td><span className="table-provider backup">{row.backUpProvider || '-'}</span></td>
                  <td>{row.tps}</td>
                  <td>{row.priority}</td>
                  <td>
                    <span className={`status-badge ${row.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      <span className="status-dot" />
                      {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>{row.createdBy}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" title="Chỉnh sửa">
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        title="Xóa"
                        onClick={() => confirmDelete(row)}
                        disabled={deletingId === row.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="routing-pagination flex-wrap gap-3">
          <div className="db-page-size">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="pagination-select"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>‹</button>
            <button className="pagination-btn active">{page + 1}</button>
            <button className="pagination-btn" disabled={(page + 1) * pageSize >= routingTotal} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="gw-card gw-history-card">
        <div className="gw-history-head">
          <span className="gw-card-icon">
            <History size={18} />
          </span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">Lịch sử cập nhật cấu hình</h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử chỉnh sửa routing</p>
          </div>
          <span className="gw-audit-badge">
            <ShieldCheck size={14} /> Audit Log: Enabled
          </span>
        </div>

        <div className="gw-history-list">
          {auditLoading && <p className="gw-table-status">Đang tải lịch sử cấu hình...</p>}
          {!auditLoading && auditError && <p className="gw-table-status gw-table-error">{auditError}</p>}
          {!auditLoading && !auditError && auditItems.length === 0 && (
            <p className="gw-table-status">Không có lịch sử cấu hình.</p>
          )}
          {!auditLoading && !auditError && auditItems.map((item) => {
            const changes = buildAuditChanges(item.oldValue, item.newValue)
            const mid = Math.ceil(changes.length / 2)
            const colA = changes.slice(0, mid)
            const colB = changes.slice(mid)

            return (
              <div key={item.id} className="gw-history-item">
                <h4 className="gw-history-title">{item.brandName} - {item.telco}</h4>
                <div className="gw-history-grid">
                  <div className="gw-history-col">
                    {colA.map((c) => (
                      <div key={c.label} className="gw-history-row">
                        <span className="gw-history-label">{c.label}:</span>
                        <ChangeValue {...c} />
                      </div>
                    ))}
                  </div>
                  <div className="gw-history-col">
                    {colB.map((c) => (
                      <div key={c.label} className="gw-history-row">
                        <span className="gw-history-label">{c.label}:</span>
                        <ChangeValue {...c} />
                      </div>
                    ))}
                  </div>
                  <div className="gw-history-col">
                    <span className="gw-history-label">Lý do thay đổi</span>
                    <span className="gw-history-reason">{item.reason}</span>
                  </div>
                  <div className="gw-history-col gw-history-meta">
                    <span>{formatDateTime(item.updatedAt)}</span>
                    <span>{item.updatedBy}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="routing-pagination flex-wrap gap-3">
          <div className="db-page-size">
            <span>Show</span>
            <select
              value={auditPageSize}
              onChange={(e) => { setAuditPageSize(Number(e.target.value)); setAuditPage(0) }}
              className="pagination-select"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={auditPage === 0} onClick={() => setAuditPage((p) => Math.max(0, p - 1))}>‹</button>
            <button className="pagination-btn active">{auditPage + 1}</button>
            <button className="pagination-btn" disabled={(auditPage + 1) * auditPageSize >= auditTotal} onClick={() => setAuditPage((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GatewayConfigContent
