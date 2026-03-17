function PageHeader() {
  return (
    <div className="page-header">
      <div className="page-title-section">
        <div className="page-icon">🎯</div>
        <div>
          <h1 className="page-title">Quản lý Phân Phối SMS</h1>
          <p className="page-subtitle">Theo dõi và phân phối tin nhắn cho các nhà cung cấp</p>
        </div>
      </div>
      <div className="page-actions">
        <button className="page-action-btn">
          <span className="btn-icon">📊</span>
          Dashboard
        </button>
        <button className="page-action-btn">
          <span className="btn-icon">📄</span>
          Báo cáo
        </button>
      </div>
    </div>
  )
}

export default PageHeader
