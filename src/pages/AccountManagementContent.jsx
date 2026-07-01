import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { InputSwitch } from 'primereact/inputswitch'
import { UserCog, UserPlus, CalendarClock, Search, Pencil, Lock, Trash2, FileDown, ChevronDown, Info } from 'lucide-react'

const COMPANIES = [
  { label: 'GPAY', value: 'GPAY' },
  { label: 'GOW', value: 'GOW' },
  { label: 'JOV', value: 'JOV' },
  { label: 'VINARY', value: 'VINARY' },
]

const ROLE_OPTIONS = [
  { label: 'Toàn quyền', value: 'full' },
  { label: 'Chỉnh sửa', value: 'edit' },
  { label: 'Chỉ xem', value: 'view' },
]

const BRANDNAME_OPTIONS = [
  { label: 'JOV', value: 'JOV' },
  { label: 'Gow', value: 'GOW' },
  { label: 'VINARY', value: 'VINARY' },
  { label: 'GRACOTP', value: 'GRACOTP' },
  { label: 'THECARES', value: 'THECARES' },
  { label: 'GPAY', value: 'GPAY' },
  { label: 'SKYSMS', value: 'SKYSMS' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending Invite', value: 'pending' },
]

const ROLE_LABELS = { full: 'Toàn quyền', edit: 'Chỉnh sửa', view: 'Chỉ xem' }
const ROLE_CLASS = { full: 'am-role-full', edit: 'am-role-edit', view: 'am-role-view' }

const ACCOUNT_ROWS = [
  {
    id: 1,
    company: 'Công ty GOW',
    username: 'nguyen.hoan',
    email: 'hoan.nguyen@gow.vn',
    role: 'full',
    brandnames: ['GOW', 'JOV', 'VINARY'],
    extra: 1,
    status: 'active',
    lastLogin: '24/05/2026 10:32',
    created: '21/09/2026 09:32',
    createdBy: 'Bởi admin_sms',
  },
  {
    id: 2,
    company: 'Công ty JOV',
    username: 'tran.minh',
    email: 'minh.tran@jov.vn',
    role: 'edit',
    brandnames: ['JOV'],
    status: 'active',
    lastLogin: '24/05/2026 10:32',
    created: '21/09/2026 09:32',
    createdBy: 'Bởi pricing_team',
  },
  {
    id: 3,
    company: 'Công ty JOV',
    username: 'tran.minh',
    email: 'minh.tran@jov.vn',
    role: 'edit',
    brandnames: ['THECARES'],
    status: 'inactive',
    lastLogin: '-',
    created: '21/09/2026 09:32',
    createdBy: 'Bởi pricing_team',
  },
  {
    id: 4,
    company: 'Công ty JOV',
    username: 'tran.minh',
    email: 'minh.tran@jov.vn',
    role: 'view',
    brandnames: ['JOV'],
    status: 'pending',
    lastLogin: 'Chưa đăng nhập',
    created: '21/09/2026 09:32',
    createdBy: 'Bởi pricing_team',
  },
]

const AVATAR_COLORS = { DP: '#F472B6', NT: '#A78BFA', LH: '#FACC15', VD: '#60A5FA' }

const HISTORY_ROWS = [
  {
    id: 1,
    time: '24/06/2026 10:32',
    initials: 'DP',
    name: 'Đặng phương',
    sub: 'admin_gow',
    action: 'Cập nhật tài khoản',
    detail: 'Trạng thái tài khoản',
    before: { label: 'Inactive', tone: 'red' },
    after: { label: 'Active', tone: 'green' },
    company: 'Công ty THECARES',
  },
  {
    id: 2,
    time: '24/06/2026 10:32',
    initials: 'NT',
    name: 'Nguyễn Thảo',
    sub: 'admin_jov',
    action: 'Đặt lại mật khẩu',
    detail: 'Reset mật khẩu người dùng',
    before: { label: '********', tone: 'plain' },
    after: { label: '********', tone: 'plain' },
    company: 'Công ty JOV',
  },
  {
    id: 3,
    time: '24/06/2026 10:32',
    initials: 'LH',
    name: 'Lê Hùng',
    sub: 'admin_vinary',
    action: 'Cập nhật tài khoản',
    detail: 'Phân quyền',
    before: { label: 'Chỉ xem', tone: 'blue' },
    after: { label: 'Inactive', tone: 'orange' },
    company: 'Công ty VINARY',
  },
  {
    id: 4,
    time: '24/06/2026 10:32',
    initials: 'VD',
    name: 'Văn Duy',
    sub: 'admin_gow',
    action: 'Đổi mật khẩu',
    detail: 'Tạo tài khoản mới',
    before: { label: '-', tone: 'plain' },
    after: { label: 'Pending Invite', tone: 'orange' },
    company: 'Công ty JOV',
  },
]

function HistoryBadge({ label, tone }) {
  if (tone === 'plain') {
    return <span className="am-history-plain">{label}</span>
  }
  return <span className={`am-history-badge am-tone-${tone}`}>{label}</span>
}

function AccountManagementContent() {
  const [form, setForm] = useState({
    company: 'GPAY',
    username: null,
    email: null,
    role: null,
    brandnames: [],
    status: 'active',
    sendInvite: true,
  })

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="account-management-content">
      {/* Create / edit account */}
      <div className="gw-card">
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
          <button className="db-export-btn am-create-btn">
            <UserPlus size={16} /> Tạo tài khoản
          </button>
        </div>

        <div className="am-form-grid">
          <div className="gw-form-field">
            <label>Công ty</label>
            <Dropdown
              value={form.company}
              onChange={(e) => updateForm('company', e.value)}
              options={COMPANIES}
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Username</label>
            <InputText
              value={form.username || ''}
              onChange={(e) => updateForm('username', e.target.value)}
              placeholder="Nhập username"
            />
          </div>
          <div className="gw-form-field">
            <label>Email</label>
            <InputText
              value={form.email || ''}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="Nhập email"
            />
          </div>
        </div>

        <div className="am-validity-badge">
          <CalendarClock size={13} /> Hiệu lực 32 ngày
        </div>

        <div className="am-form-grid am-form-grid-bottom">
          <div className="gw-form-field">
            <label>Phân quyền <span className="gw-required">*</span></label>
            <Dropdown
              value={form.role}
              onChange={(e) => updateForm('role', e.value)}
              options={ROLE_OPTIONS}
              placeholder="Chọn phân quyền"
              className="bn-dropdown"
            />
            <ul className="am-role-hint">
              <li><strong>Toàn quyền:</strong> Truy cập và quản lý toàn bộ hệ thống</li>
              <li><strong>Chỉnh sửa:</strong> Tạo và chỉnh sửa dữ liệu</li>
              <li><strong>Chỉ xem:</strong> Xem dữ liệu, không chỉnh sửa</li>
            </ul>
          </div>

          <div className="gw-form-field">
            <label>Brandname <span className="gw-required">*</span></label>
            <MultiSelect
              value={form.brandnames}
              onChange={(e) => updateForm('brandnames', e.value)}
              options={BRANDNAME_OPTIONS}
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
              options={STATUS_OPTIONS}
              className="bn-dropdown"
            />
            <label className="am-switch-row">
              <InputSwitch checked={form.sendInvite} onChange={(e) => updateForm('sendInvite', e.value)} />
              Gửi email kích hoạt
              <Info size={13} className="am-switch-info" />
            </label>
          </div>

          <div className="am-form-actions">
            <button className="bn-btn-draft p-button">Hủy</button>
            <button className="bn-btn-submit p-button">Lưu tài khoản</button>
          </div>
        </div>
      </div>

      {/* Account list */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <h3 className="table-title">
              Danh sách tài khoản <span className="am-count-badge">44 tài khoản</span>
            </h3>
          </div>
          <div className="pm-search-field">
            <input type="text" placeholder="Tìm kiếm đối tác..." />
            <Search size={16} className="pm-search-icon" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table am-account-table">
            <thead>
              <tr>
                <th>Công ty</th>
                <th>User name</th>
                <th>Email</th>
                <th>Phân quyền</th>
                <th>Brandname</th>
                <th>Trạng thái</th>
                <th>Lần đăng nhập cuối</th>
                <th>Ngày tạo</th>
                <th>Người tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.company}</td>
                  <td>{row.username}</td>
                  <td>{row.email}</td>
                  <td><span className={ROLE_CLASS[row.role]}>{ROLE_LABELS[row.role]}</span></td>
                  <td>
                    <div className="am-brandname-chips">
                      {row.brandnames.map((b) => <span key={b} className="am-chip">{b}</span>)}
                      {row.extra && <span className="am-chip am-chip-more">+{row.extra}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${row.status === 'active' ? 'active' : row.status === 'inactive' ? 'draft' : 'pending'}`}>
                      <span className="status-dot" />
                      {row.status === 'active' ? 'Active' : row.status === 'inactive' ? 'Inactive' : 'Pending Invite'}
                    </span>
                  </td>
                  <td>{row.lastLogin}</td>
                  <td>{row.created}</td>
                  <td>{row.createdBy}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" title="Chỉnh sửa"><Pencil size={16} /></button>
                      <button className="action-btn" title="Khóa"><Lock size={16} /></button>
                      <button className="action-btn delete" title="Xóa"><Trash2 size={16} /></button>
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

      {/* Change history */}
      <div className="gw-card">
        <div className="gw-history-head">
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">
              Lịch sử thay đổi tài khoản <span className="am-count-badge">78 bản ghi</span>
            </h2>
          </div>
          <button className="db-export-btn am-create-btn">
            <FileDown size={16} /> Xuất excel
          </button>
        </div>

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
                <th>Công ty</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>
                    <div className="am-actor-cell">
                      <span className="am-avatar" style={{ background: AVATAR_COLORS[row.initials] }}>{row.initials}</span>
                      <div className="am-actor-info">
                        <span className="am-actor-name">{row.name}</span>
                        <span className="am-actor-sub">{row.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="am-action-label">{row.action}</span></td>
                  <td>{row.detail}</td>
                  <td><HistoryBadge {...row.before} /></td>
                  <td><HistoryBadge {...row.after} /></td>
                  <td>{row.company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="am-show-more">
          <a href="#more">Xem thêm nhật ký <ChevronDown size={14} /></a>
        </div>
      </div>
    </div>
  )
}

export default AccountManagementContent
