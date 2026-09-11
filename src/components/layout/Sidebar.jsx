import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Router, Smartphone, BadgeDollarSign, UserCog,
  GitCompare, FileSearch2, Waypoints, Film, User, LogOut,
  Building2, Users, Send, ClipboardCheck, BookUser, History,
  ChevronRight, ChevronDown,
} from 'lucide-react'

const MENU_GROUPS = [
  {
    id: 'admin',
    number: 4,
    label: 'Portal quản trị',
    icon: Building2,
    items: [
      { id: 'dashboard', label: 'Báo cáo thống kê', icon: LayoutDashboard },
      { id: 'gateway', label: 'Cấu hình gateway', icon: Router },
      { id: 'brandname', label: 'Khai báo SMS Brandname', icon: Smartphone },
      { id: 'pricing', label: 'Quản lý bảng giá nhập/ giá bán', icon: BadgeDollarSign },
      { id: 'account', label: 'Quản lý tài khoản', icon: UserCog },
      { id: 'reconcile', label: 'Đổi soát', icon: GitCompare },
      { id: 'lookup', label: 'Tra cứu tin nhắn', icon: FileSearch2 },
      { id: 'routing', label: 'Rule tự động Routing', icon: Waypoints },
      { id: 'motion', label: 'Motion', icon: Film },
    ],
  },
  {
    id: 'customer',
    number: 3,
    label: 'Portal khách hàng (Customer Portal)',
    icon: Users,
    items: [
      { id: 'customer/dashboard', label: 'Dashboard khách hàng', icon: LayoutDashboard },
      { id: 'customer/campaigns/new', label: 'Tạo chiến dịch gửi tin', icon: Send },
      { id: 'customer/campaigns/approval', label: 'Quản lý phê duyệt chiến dịch', icon: ClipboardCheck },
      { id: 'customer/contacts', label: 'Quản lý danh bạ', icon: BookUser },
      { id: 'customer/lookup', label: 'Tra cứu tin nhắn', icon: FileSearch2 },
      { id: 'customer/history', label: 'Lịch sử tin nhắn', icon: History },
    ],
  },
]

function Sidebar({ activeMenu, onChangeMenu, username, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  const activeGroupId = MENU_GROUPS.find((g) => g.items.some((i) => i.id === activeMenu))?.id || 'customer'
  const [openGroups, setOpenGroups] = useState(() => new Set([activeGroupId]))

  useEffect(() => {
    setOpenGroups((prev) => new Set(prev).add(activeGroupId))
  }, [activeGroupId])

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  const labelClass = collapsed ? 'hidden' : 'hidden md:inline-block'

  return (
    <aside className={`sidebar w-16 ${collapsed ? 'collapsed' : 'md:w-60'}`}>
      <div className="sidebar-header">
        <h2 className={`sidebar-title ${labelClass}`}>Main Menu</h2>
        <button
          className="sidebar-toggle-btn hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>
      <nav className="sidebar-nav">
        {MENU_GROUPS.map((group) => {
          const isOpen = openGroups.has(group.id)
          const isActiveGroup = group.id === activeGroupId
          return (
            <div key={group.id} className="sidebar-group">
              <button
                className={`sidebar-group-header ${isActiveGroup ? 'active' : ''}`}
                onClick={() => toggleGroup(group.id)}
                title={group.label}
              >
                <span className="sidebar-menu-icon">
                  <group.icon size={18} />
                </span>
                <span className={`sidebar-group-label ${labelClass}`}>
                  {group.number}. {group.label}
                </span>
                <span className={`sidebar-group-chevron ${labelClass}`}>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </span>
              </button>

              {isOpen && (
                <div className="sidebar-submenu">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      className={`sidebar-menu-item sidebar-submenu-item ${activeMenu === item.id ? 'active' : ''}`}
                      onClick={() => onChangeMenu(item.id)}
                      title={item.label}
                    >
                      <span className="sidebar-menu-icon">
                        <item.icon size={17} />
                      </span>
                      <span className={`sidebar-menu-number ${labelClass}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-icon">
            <User size={16} />
          </span>
          <span className={`sidebar-user-name ${labelClass}`}>{username}</span>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout} title="Đăng xuất">
          <span className={labelClass}>Đăng xuất</span>
          <span className="sidebar-logout-icon">
            <LogOut size={16} />
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
