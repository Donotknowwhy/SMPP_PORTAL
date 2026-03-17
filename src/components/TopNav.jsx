function TopNav({ activeMenu, onChangeMenu, onGoHome }) {
  return (
    <header className="top-nav">
      <div className="nav-left">
        <div className="logo-container">
          <img src="https://skyfi.vn/assets/logo.svg" alt="Logo" className="logo" />
        </div>
        <button
          className={`nav-menu-item ${activeMenu === 'home' ? 'active' : ''}`}
          onClick={onGoHome}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button
          className={`nav-menu-item ${activeMenu === 'providers' ? 'active' : ''}`}
          onClick={() => onChangeMenu('providers')}
        >
          <span className="nav-icon">📋</span>
          Quản lý nhà cung cấp
        </button>
        <button
          className={`nav-menu-item ${activeMenu === 'reports' ? 'active' : ''}`}
          onClick={() => onChangeMenu('reports')}
        >
          <span className="nav-icon">📈</span>
          Báo cáo
        </button>
      </div>
      <div className="nav-right">
        <button className="icon-btn" title="Thông báo">🔔</button>
        <button className="icon-btn" title="Cài đặt">⚙️</button>
      </div>
    </header>
  )
}

export default TopNav
