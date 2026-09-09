import { useEffect, useMemo, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { toast } from 'react-toastify'
import { UserCog, UserPlus, CalendarClock, Search, Pencil, Lock, Trash2, FileDown, Save, X, Users } from 'lucide-react'
import {
  ROLE_LABELS,
  ROLE_CLASS,
} from '../constants/accountManagement'
import { useAuth } from '../context/AuthContext'
import { getListUser, createAccount, getUserAuditLog, deleteUser } from '../utils/accountApi'
import { getRoutingInfo } from '../utils/routingApi'
import Pagination from '../components/common/Pagination'

const GENDER_OPTIONS = [
  { label: 'Nam', value: 'nam' },
  { label: 'Nữ', value: 'nu' },
]

const ACCOUNT_ROLE_OPTIONS = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'CLIENT', value: 'CLIENT' },
]

const CREATE_STATUS_OPTIONS = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
]

const DEFAULT_FORM = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  gender: 'nam',
  brandnames: [],
  role: 'ADMIN',
  providerId: null,
  status: 1,
}

const AVATAR_PALETTE = ['#F472B6', '#A78BFA', '#FACC15', '#60A5FA', '#34D399', '#FB923C']

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(name) {
  const str = name || ''
  let hash = 0
  for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function AccountManagementContent() {
  const { authToken } = useAuth()

  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const [brandNameOptions, setBrandNameOptions] = useState([])
  const [providerOptions, setProviderOptions] = useState([])

  const [accountRows, setAccountRows] = useState([])
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [search, setSearch] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [auditRows, setAuditRows] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  const refreshAccountList = () => {
    if (!authToken) return
    setAccountLoading(true)
    setAccountError('')

    return getListUser(authToken)
      .then(({ rows }) => setAccountRows(rows))
      .catch((err) => setAccountError(err.message || 'Không tải được danh sách tài khoản.'))
      .finally(() => setAccountLoading(false))
  }

  const refreshAuditLog = () => {
    if (!authToken) return
    setAuditLoading(true)
    setAuditError('')

    return getUserAuditLog(authToken)
      .then((rows) => setAuditRows(rows))
      .catch((err) => setAuditError(err.message || 'Không tải được lịch sử thay đổi.'))
      .finally(() => setAuditLoading(false))
  }

  useEffect(() => {
    if (!authToken) return
    let cancelled = false

    refreshAccountList()
    refreshAuditLog()

    getRoutingInfo(authToken)
      .then(({ brandNames, providers }) => {
        if (cancelled) return
        setBrandNameOptions(brandNames.map((b) => ({ label: b.brandName, value: b.id })))
        setProviderOptions(providers.map((p) => ({ label: p.providerName, value: p.id })))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const handleCreateAccount = () => {
    if (!authToken) return

    if (!form.username.trim() || !form.email.trim() || !form.password || !form.fullName.trim()
      || !form.phone.trim() || !form.role || !form.providerId || form.brandnames.length === 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc.')
      return
    }

    setSubmitting(true)
    createAccount({
      token: authToken,
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      brandNameList: form.brandnames,
      providerId: form.providerId,
      status: form.status,
    })
      .then((message) => {
        toast.success(message || 'Tạo tài khoản thành công.')
        setForm(DEFAULT_FORM)
        refreshAccountList()
        refreshAuditLog()
      })
      .catch((err) => toast.error(err.message || 'Không tạo được tài khoản.'))
      .finally(() => setSubmitting(false))
  }

  const handleCancelCreate = () => setForm(DEFAULT_FORM)

  const handleDelete = (id) => {
    if (!authToken) return

    setDeletingId(id)
    deleteUser(authToken, id)
      .then((message) => {
        toast.success(message || 'Xóa tài khoản thành công.')
        refreshAccountList()
        refreshAuditLog()
      })
      .catch((err) => toast.error(err.message || 'Không xóa được tài khoản.'))
      .finally(() => setDeletingId(null))
  }

  const confirmDelete = (row) => {
    confirmDialog({
      message: `Có muốn xóa tài khoản "${row.username}" không?`,
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

  const mappedAccountRows = useMemo(
    () => accountRows.map((r) => ({
      id: r.id,
      username: r.userName,
      fullName: r.fullName,
      email: r.email,
      role: r.role,
      brandnames: (Array.isArray(r.brandName) ? r.brandName : (r.brandName || '').split(','))
        .map((b) => String(b).trim())
        .filter(Boolean),
      status: r.status === '1' || r.status === 1 ? 'active' : 'inactive',
      created: formatDateTime(r.createdAt),
    })),
    [accountRows],
  )

  const filteredAccountRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return mappedAccountRows
    return mappedAccountRows.filter((r) => (r.username || '').toLowerCase().includes(keyword))
  }, [mappedAccountRows, search])

  const totalAccountPages = Math.max(1, Math.ceil(filteredAccountRows.length / pageSize))
  const pagedAccountRows = useMemo(
    () => filteredAccountRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredAccountRows, page, pageSize],
  )

  return (
    <div className="account-management-content">
      <ConfirmDialog />

      {/* Create / edit account */}
      <div className="gw-card gw-header-elevated">
        <div className="gw-card-head am-create-head">
          <div className="am-create-head-text">
            <span className="gw-card-icon">
              <UserCog size={18} />
            </span>
            <div>
              <h2 className="gw-card-title">Tạo / Chỉnh sửa tài khoản</h2>
              <p className="gw-card-subtitle">Admin tạo account và phân quyền sử dụng hệ thống</p>
            </div>
          </div>
          <button className="db-export-btn am-create-btn" onClick={handleCreateAccount} disabled={submitting}>
            <UserPlus size={16} /> {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </div>

        <div className="am-form-grid">
          <div className="gw-form-field">
            <label>Đối tác <span className="gw-required">*</span></label>
            <Dropdown
              value={form.providerId}
              onChange={(e) => updateForm('providerId', e.value)}
              options={providerOptions}
              placeholder="Chọn đối tác"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Username <span className="gw-required">*</span></label>
            <InputText
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value)}
              placeholder="Nhập username"
            />
          </div>
          <div className="gw-form-field">
            <label>Email <span className="gw-required">*</span></label>
            <InputText
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="Nhập email"
            />
          </div>
          
          <div className="gw-form-field">
            <label>Họ tên <span className="gw-required">*</span></label>
            <InputText
              value={form.fullName}
              onChange={(e) => updateForm('fullName', e.target.value)}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="gw-form-field">
            <label>Mật khẩu <span className="gw-required">*</span></label>
            <Password
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              placeholder="Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt"
              toggleMask
              feedback={false}
              className="am-password"
              inputClassName="p-inputtext"
            />
          </div>
          <div className="gw-form-field">
            <label>Số điện thoại <span className="gw-required">*</span></label>
            <InputText
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="gw-form-field">
            <label>Giới tính</label>
            <Dropdown
              value={form.gender}
              onChange={(e) => updateForm('gender', e.value)}
              options={GENDER_OPTIONS}
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Vai trò <span className="gw-required">*</span></label>
            <Dropdown
              value={form.role}
              onChange={(e) => updateForm('role', e.value)}
              options={ACCOUNT_ROLE_OPTIONS}
              placeholder="Chọn vai trò"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Brandname <span className="gw-required">*</span></label>
            <MultiSelect
              value={form.brandnames}
              onChange={(e) => updateForm('brandnames', e.value)}
              options={brandNameOptions}
              display="chip"
              placeholder="Chọn brandname"
              className="am-multiselect"
              panelClassName="am-multiselect-panel"
            />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái <span className="gw-required">*</span></label>
            <Dropdown
              value={form.status}
              onChange={(e) => updateForm('status', e.value)}
              options={CREATE_STATUS_OPTIONS}
              className="bn-dropdown"
            />
          </div>
        </div>


        <div className="am-form-grid am-form-grid-bottom">
          <div className="am-form-actions">
            <button className="bn-btn-draft p-button" onClick={handleCancelCreate} disabled={submitting}>
              <X size={16} /> Hủy
            </button>
            <button className="bn-btn-submit p-button" onClick={handleCreateAccount} disabled={submitting}>
              <Save size={16} /> {submitting ? 'Đang lưu...' : 'Lưu tài khoản'}
            </button>
          </div>
        </div>
      </div>

      {/* Account list */}
      <div className="routing-table-section gw-table-section gw-header-elevated">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon"><Users size={18} /></span>
            <h3 className="table-title">
              Danh sách tài khoản <span className="am-count-badge">{filteredAccountRows.length} tài khoản</span>
            </h3>
          </div>
          <div className="pm-search-field">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Tìm kiếm tài khoản..."
            />
            <Search size={16} className="pm-search-icon" />
          </div>
        </div>

        {accountError && <p className="gw-table-error">{accountError}</p>}

        <div className="overflow-x-auto">
          <table className="routing-table am-account-table">
            <thead>
              <tr>
                <th>User name</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Phân quyền</th>
                <th>Brandname</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accountLoading && (
                <tr><td colSpan={8} className="gw-table-status">Đang tải danh sách tài khoản...</td></tr>
              )}
              {!accountLoading && !accountError && pagedAccountRows.length === 0 && (
                <tr><td colSpan={8} className="gw-table-status">Không có tài khoản nào.</td></tr>
              )}
              {!accountLoading && pagedAccountRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.username}</td>
                  <td>{row.fullName || '-'}</td>
                  <td>{row.email || '-'}</td>
                  <td>{row.role ? <span className={ROLE_CLASS[row.role] || 'am-role-view'}>{ROLE_LABELS[row.role] || row.role}</span> : '-'}</td>
                  <td>
                    {row.brandnames.length > 0 ? (
                      <div className="am-brandname-chips">
                        {row.brandnames.map((b) => <span key={b} className="am-chip">{b}</span>)}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${row.status === 'active' ? 'active' : 'draft'}`}>
                      <span className="status-dot" />
                      {row.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{row.created}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" title="Chỉnh sửa"><Pencil size={16} /></button>
                      <button className="action-btn" title="Khóa"><Lock size={16} /></button>
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

        <Pagination
          page={page}
          totalPages={totalAccountPages}
          pageSize={pageSize}
          disabled={accountLoading}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </div>

      {/* Change history */}
      <div className="gw-card gw-header-elevated">
        <div className="gw-history-head">
          <span className="gw-card-icon"><CalendarClock size={18} /></span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">
              Lịch sử thay đổi tài khoản <span className="am-count-badge">{auditRows.length} bản ghi</span>
            </h2>
          </div>
          <button className="db-export-btn am-create-btn">
            <FileDown size={16} /> Xuất excel
          </button>
        </div>

        {auditError && <p className="gw-table-error">{auditError}</p>}

        <div className="overflow-x-auto">
          <table className="routing-table am-history-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Chi tiết thay đổi</th>
                <th>Giá trị trước đó</th>
                <th>Giá trị mới</th>
                <th>Đối tác</th>
              </tr>
            </thead>
            <tbody>
              {auditLoading && (
                <tr><td colSpan={7} className="gw-table-status">Đang tải lịch sử thay đổi...</td></tr>
              )}
              {!auditLoading && !auditError && auditRows.length === 0 && (
                <tr><td colSpan={7} className="gw-table-status">Chưa có lịch sử thay đổi.</td></tr>
              )}
              {!auditLoading && auditRows.map((row, index) => (
                <tr key={index}>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>
                    <div className="am-actor-cell">
                      <span className="am-avatar" style={{ background: getAvatarColor(row.fullName) }}>
                        {getInitials(row.fullName)}
                      </span>
                      <div className="am-actor-info">
                        <span className="am-actor-name">{row.fullName || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="am-action-label">{row.actionChange || '-'}</span></td>
                  <td>{row.changeField || '-'}</td>
                  <td>{row.oldValue || '-'}</td>
                  <td>{row.newValue || '-'}</td>
                  <td>{row.providerName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AccountManagementContent
