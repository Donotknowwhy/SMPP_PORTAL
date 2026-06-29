import { useState } from 'react'
import {
  LayoutDashboard, Router, Smartphone, BadgeDollarSign, UserCog,
  GitCompare, FileSearch2, Waypoints, Film, User, LogOut,
} from 'lucide-react'

function Sidebar({ activeMenu, onChangeMenu, username, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gateway', label: 'Cấu hình gateway', icon: Router },
    { id: 'brandname', label: 'Khai báo SMS Brandname', icon: Smartphone },
    { id: 'pricing', label: 'Quản lý bảng giá nhập/ giá bán', icon: BadgeDollarSign },
    { id: 'account', label: 'Quản lý tài khoản', icon: UserCog },
    { id: 'reconcile', label: 'Đổi soát', icon: GitCompare },
    { id: 'lookup', label: 'Tra cứu tin nhắn', icon: FileSearch2 },
    { id: 'routing', label: 'Rule tự động Routing', icon: Waypoints },
    { id: 'motion', label: 'Motion', icon: Film },
  ]

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
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onChangeMenu(item.id)}
            title={item.label}
          >
            <span className="sidebar-menu-icon">
              <item.icon size={18} />
            </span>
            <span className={`sidebar-menu-number ${labelClass}`}>
              {menuItems.indexOf(item) + 1}. {item.label}
            </span>
          </button>
        ))}
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
          <span className={`sidebar-logout-icon ${collapsed ? 'inline' : 'inline md:hidden'}`}>
            <LogOut size={16} />
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
