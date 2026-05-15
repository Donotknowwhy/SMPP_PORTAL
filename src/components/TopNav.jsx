function TopNav({ activeMenu, onChangeMenu, onGoHome, username, onLogout }) {
  return (
    <header className="top-nav">
      <div className="nav-left">
        <div className="logo-container">
          <img src="https://skyfi.vn/assets/logo.svg" alt="SkyFi" className="logo" />
        </div>
        <button
          className={`nav-menu-item ${activeMenu === 'home' ? 'active' : ''}`}
          onClick={onGoHome}
        >
          <span className="nav-icon">▣</span>
          Dashboard
        </button>
        <button
          className={`nav-menu-item ${activeMenu === 'providers' ? 'active' : ''}`}
          onClick={() => onChangeMenu('providers')}
        >
          <span className="nav-icon">☰</span>
          Quản lý phân phối SMS
        </button>
        <button
          className={`nav-menu-item ${activeMenu === 'reports' ? 'active' : ''}`}
          onClick={() => onChangeMenu('reports')}
        >
          <span className="nav-icon">↗</span>
          Báo cáo
        </button>
        <button
          className={`nav-menu-item ${activeMenu === 'send-sms' ? 'active' : ''}`}
          onClick={() => onChangeMenu('send-sms')}
        >
          <span className="nav-icon">✉</span>
          Gửi SMS
        </button>
      </div>
      <div className="nav-right">
        <button className="icon-btn" title="Thông báo">🔔</button>
        {username && (
          <span className="nav-username" title={`Đăng nhập: ${username}`}>👤 {username}</span>
        )}
        <button className="nav-logout-btn" onClick={onLogout} title="Đăng xuất">
          Đăng xuất
        </button>
      </div>
    </header>
  )
}

export default TopNav
