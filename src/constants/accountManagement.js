export const COMPANIES = [
  { label: 'GPAY', value: 'GPAY' },
  { label: 'GOW', value: 'GOW' },
  { label: 'JOV', value: 'JOV' },
  { label: 'VINARY', value: 'VINARY' },
]

export const ROLE_OPTIONS = [
  { label: 'Toàn quyền', value: 'full' },
  { label: 'Chỉnh sửa', value: 'edit' },
  { label: 'Chỉ xem', value: 'view' },
]

export const BRANDNAME_OPTIONS = [
  { label: 'JOV', value: 'JOV' },
  { label: 'Gow', value: 'GOW' },
  { label: 'VINARY', value: 'VINARY' },
  { label: 'GRACOTP', value: 'GRACOTP' },
  { label: 'THECARES', value: 'THECARES' },
  { label: 'GPAY', value: 'GPAY' },
  { label: 'SKYSMS', value: 'SKYSMS' },
]

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending Invite', value: 'pending' },
]

export const ROLE_LABELS = { full: 'Toàn quyền', edit: 'Chỉnh sửa', view: 'Chỉ xem' }
export const ROLE_CLASS = { full: 'am-role-full', edit: 'am-role-edit', view: 'am-role-view' }

export const ACCOUNT_ROWS = [
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

export const AVATAR_COLORS = { DP: '#F472B6', NT: '#A78BFA', LH: '#FACC15', VD: '#60A5FA' }

export const HISTORY_ROWS = [
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
