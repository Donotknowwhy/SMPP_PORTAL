function Sidebar({ activeMenu, onChangeMenu, username, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '▣' },
    { id: 'gateway', label: 'Cấu hình gateway', icon: '⚙' },
    { id: 'brandname', label: 'Khai báo SMS Brandname', icon: '📱' },
    { id: 'pricing', label: 'Quản lý bảng giá nhập/ giá bán', icon: '💰' },
    { id: 'account', label: 'Quản lý tài khoản', icon: '👤' },
    { id: 'reconcile', label: 'Đổi soát', icon: '📊' },
    { id: 'routing', label: 'Rule tự động Routing', icon: '🔄' },
    { id: 'motion', label: 'Motion', icon: '🎬' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Main Menu</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onChangeMenu(item.id)}
          >
            <span className="sidebar-menu-icon">{item.icon}</span>
            <span className="sidebar-menu-number">
              {menuItems.indexOf(item) + 1}. {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-icon">👤</span>
          <span className="sidebar-user-name">{username}</span>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
