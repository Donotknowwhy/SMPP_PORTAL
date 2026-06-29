function ProvidersContent({
  providers,
  totalPercentage,
  openAddModal,
  distributeEvenly,
  openEditModal,
  deleteProvider,
}) {
  return (
    <div className="providers-content">
      {/* Header with actions */}
      <div className="add-provider-section">
        <div className="section-header flex-wrap gap-3 sm:flex-nowrap">
          <h2>Danh Sách Nhà Cung Cấp ({providers.length})</h2>
          <div className="header-actions flex-wrap sm:flex-nowrap">
            <button onClick={openAddModal} className="btn-add-new">
              <span className="btn-icon">＋</span>
              Thêm nhà cung cấp
            </button>
            <button onClick={distributeEvenly} className="btn-distribute">
              <span className="btn-icon">≡</span>
              Phân phối đều
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="providers-section">
        <div className="total-percentage">
          {totalPercentage === 100 ? (
            <span className="check-icon">✓</span>
          ) : null}
          <span>Tổng: {totalPercentage}%</span>
          {totalPercentage !== 100 && (
            <span className="warning">
              {totalPercentage > 100 ? 'Vượt quá 100%' : 'Chưa đủ 100%'}
            </span>
          )}
          {totalPercentage === 100 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 500 }}>
              Đã cấu hình
            </span>
          )}
        </div>

        {providers.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="providers-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên nhà cung cấp</th>
                <th>Phần trăm phân phối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => (
                <tr key={provider.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{provider.name}</td>
                  <td>
                    <span className="percentage-badge">{provider.percentage}%</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openEditModal(provider)} className="btn-edit">
                        Chỉnh sửa
                      </button>
                      <button onClick={() => deleteProvider(provider.id)} className="btn-delete-table">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Chưa có nhà cung cấp nào. Hãy thêm nhà cung cấp để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProvidersContent
