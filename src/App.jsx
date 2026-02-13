import { useState } from 'react'
import './App.css'

function App() {
  // State cho navigation
  const [activeMenu, setActiveMenu] = useState('home')
  
  const [providers, setProviders] = useState([
    { id: 1, name: 'Nhà cung cấp 1', percentage: 60, color: '#000', successRate: 95.5, errorRate: 4.5, totalSent: 57000 },
    { id: 2, name: 'Nhà cung cấp 2', percentage: 40, color: '#000', successRate: 92.3, errorRate: 7.7, totalSent: 38000 },
  ])
  
  const [newProviderName, setNewProviderName] = useState('')
  const [totalMessages, setTotalMessages] = useState(1000)
  const [showDistribution, setShowDistribution] = useState(false)
  
  // State cho modal chỉnh sửa
  const [editingProvider, setEditingProvider] = useState(null)
  const [editPercentage, setEditPercentage] = useState(0)
  const [editProviderName, setEditProviderName] = useState('')
  
  // State cho modal thêm nhà cung cấp
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProviderModalName, setNewProviderModalName] = useState('')
  const [newProviderModalPercentage, setNewProviderModalPercentage] = useState(0)

  // Tính tổng phần trăm
  const totalPercentage = providers.reduce((sum, p) => sum + p.percentage, 0)

  // Thêm nhà cung cấp mới
  const addProvider = () => {
    if (newProviderName.trim()) {
      const newProvider = {
        id: Date.now(),
        name: newProviderName,
        percentage: 0,
        color: '#000'
      }
      setProviders([...providers, newProvider])
      setNewProviderName('')
    }
  }
  
  // Mở modal thêm nhà cung cấp
  const openAddModal = () => {
    setShowAddModal(true)
    setNewProviderModalName('')
    setNewProviderModalPercentage(0)
  }
  
  // Đóng modal thêm
  const closeAddModal = () => {
    setShowAddModal(false)
    setNewProviderModalName('')
    setNewProviderModalPercentage(0)
  }
  
  // Lưu nhà cung cấp mới từ modal
  const saveNewProvider = () => {
    if (newProviderModalName.trim()) {
      const newProvider = {
        id: Date.now(),
        name: newProviderModalName.trim(),
        percentage: newProviderModalPercentage,
        color: '#000',
        successRate: 0,
        errorRate: 0,
        totalSent: 0
      }
      setProviders([...providers, newProvider])
      closeAddModal()
    }
  }
  
  // Handle Enter key trong modal thêm
  const handleAddKeyPress = (e) => {
    if (e.key === 'Enter' && newProviderModalName.trim()) {
      saveNewProvider()
    }
  }

  // Xóa nhà cung cấp
  const deleteProvider = (id) => {
    setProviders(providers.filter(p => p.id !== id))
  }

  // Mở modal chỉnh sửa
  const openEditModal = (provider) => {
    setEditingProvider(provider)
    setEditPercentage(provider.percentage)
    setEditProviderName(provider.name)
  }

  // Đóng modal
  const closeEditModal = () => {
    setEditingProvider(null)
    setEditPercentage(0)
    setEditProviderName('')
  }

  // Lưu thay đổi
  const saveEdit = () => {
    setProviders(providers.map(p => 
      p.id === editingProvider.id ? { ...p, percentage: editPercentage, name: editProviderName } : p
    ))
    closeEditModal()
  }

  // Cập nhật phần trăm (không dùng nữa, thay bằng modal)
  const updatePercentage = (id, value) => {
    const percentage = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setProviders(providers.map(p => 
      p.id === id ? { ...p, percentage } : p
    ))
  }

  // Phân phối đồng đều
  const distributeEvenly = () => {
    const evenPercentage = Math.floor(100 / providers.length)
    const remainder = 100 - (evenPercentage * providers.length)
    
    setProviders(providers.map((p, index) => ({
      ...p,
      percentage: index === 0 ? evenPercentage + remainder : evenPercentage
    })))
  }

  // Tính phân phối tin nhắn
  const calculateDistribution = () => {
    if (totalPercentage !== 100) return []
    
    return providers.map(p => ({
      ...p,
      messages: Math.round((totalMessages * p.percentage) / 100)
    }))
  }

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-left">
          <div className="logo-container">
            <img src="https://skyfi.vn/assets/logo.svg" alt="Logo" className="logo" />
          </div>
          <button 
            className={`nav-menu-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('home')
              setShowDistribution(false)
            }}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-menu-item ${activeMenu === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveMenu('providers')}
          >
            <span className="nav-icon">📋</span>
            Quản lý nhà cung cấp
          </button>
          <button 
            className={`nav-menu-item ${activeMenu === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveMenu('reports')}
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

      <div className="container">
        {/* Page Header */}
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

        {/* Content dựa vào menu đang active */}
        {activeMenu === 'home' && (
          <div className="home-content">
            <div className="content-header">
              <h2>Dashboard</h2>
              <div className="date-range">
                <input type="date" className="date-input" defaultValue="2026-02-01" />
                <span>đến</span>
                <input type="date" className="date-input" defaultValue="2026-02-28" />
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Tổng nhà cung cấp</div>
                <div className="stat-value">{providers.length}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Tổng % phân phối</div>
                <div className="stat-value" style={{ 
                  color: totalPercentage === 100 ? '#000' : '#999' 
                }}>
                  {totalPercentage}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Trạng thái</div>
                <div className="stat-value" style={{ fontSize: '1rem' }}>
                  {totalPercentage === 100 ? 'Đã cấu hình' : 'Chưa hoàn tất'}
                </div>
              </div>
            </div>

            {/* Danh sách nhà cung cấp tóm tắt */}
            {providers.length > 0 && (
              <div className="providers-summary">
                <h2>Nhà Cung Cấp Hiện Tại</h2>
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Tên nhà cung cấp</th>
                      <th>Tỷ lệ phân phối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id}>
                        <td>{provider.name}</td>
                        <td>
                          <div className="percentage-bar-container">
                            <div className="percentage-bar-fill" style={{ width: `${provider.percentage}%` }}></div>
                            <span className="percentage-text" style={{ 
                              color: provider.percentage > 30 ? 'white' : '#000',
                              left: provider.percentage > 30 ? '8px' : '8px'
                            }}>
                              {provider.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="distribution-section">
              <h2>Mô Phỏng Phân Phối</h2>
              <div className="distribution-form">
                <label>
                  Tổng số tin nhắn:
                  <input
                    type="number"
                    min="1"
                    value={totalMessages}
                    onChange={(e) => setTotalMessages(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </label>
                <button 
                  onClick={() => setShowDistribution(true)}
                  disabled={totalPercentage !== 100}
                  className="btn-simulate"
                >
                  Tính toán phân phối
                </button>
              </div>

              {showDistribution && totalPercentage === 100 && (
                <div className="distribution-results">
                  <h3>Kết Quả Phân Phối</h3>
                  <div className="distribution-chart">
                    {calculateDistribution().map((provider) => (
                      <div key={provider.id} className="distribution-bar">
                        <div className="distribution-info">
                          <span className="provider-name">{provider.name}</span>
                          <span className="provider-stats">
                            {provider.messages.toLocaleString()} tin nhắn ({provider.percentage}%)
                          </span>
                        </div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{
                              width: `${provider.percentage}%`
                            }}
                          >
                            {provider.percentage > 15 && (
                              <span className="bar-percentage">{provider.percentage}%</span>
                            )}
                          </div>
                          {provider.percentage <= 15 && (
                            <span className="bar-percentage-outside">{provider.percentage}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="distribution-summary">
                    <strong>Tổng kết:</strong> {totalMessages.toLocaleString()} tin nhắn được phân phối cho {providers.length} nhà cung cấp
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMenu === 'providers' && (
          <div className="providers-content">
            {/* Thêm nhà cung cấp */}
            <div className="add-provider-section">
              <div className="section-header">
                <h2>Danh Sách Nhà Cung Cấp ({providers.length})</h2>
                <div className="header-actions">
                  <button onClick={openAddModal} className="btn-add-new">
                    <span className="btn-icon">➕</span>
                    Thêm nhà cung cấp
                  </button>
                  <button onClick={distributeEvenly} className="btn-distribute">
                    <span className="btn-icon">⚖️</span>
                    Phân phối đều
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách nhà cung cấp */}
            <div className="providers-section">
              <div className="total-percentage" style={{
                borderColor: totalPercentage === 100 ? '#000' : '#999'
              }}>
                <span>Tổng: {totalPercentage}%</span>
                {totalPercentage !== 100 && (
                  <span className="warning">
                    {totalPercentage > 100 ? 'Vượt quá 100%' : 'Chưa đủ 100%'}
                  </span>
                )}
              </div>

              {providers.length > 0 ? (
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
                        <td>{provider.name}</td>
                        <td>
                          <span className="percentage-badge">{provider.percentage}%</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => openEditModal(provider)} 
                              className="btn-edit"
                            >
                              Chỉnh sửa
                            </button>
                            <button 
                              onClick={() => deleteProvider(provider.id)} 
                              className="btn-delete-table"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Chưa có nhà cung cấp nào. Hãy thêm nhà cung cấp để bắt đầu!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMenu === 'reports' && (
          <div className="reports-content">
            <div className="page-header">
              <div className="page-title-section">
                <h1 className="page-title">Báo Cáo & Phân Tích</h1>
                <p className="page-subtitle">Tổng quan hiệu suất và tỷ lệ thành công</p>
              </div>
            </div>
            
            {/* Tổng quan chung */}
            <div className="report-overview">
              <div className="overview-card success-card">
                <div className="card-icon">✓</div>
                <div className="card-content">
                  <div className="card-value">{((providers.reduce((sum, p) => sum + (p.successRate * p.totalSent / 100), 0) / providers.reduce((sum, p) => sum + p.totalSent, 0)) * 100 || 0).toFixed(1)}%</div>
                  <div className="card-label">Tỷ Lệ Thành Công</div>
                  <div className="card-detail">{Math.round(providers.reduce((sum, p) => sum + (p.successRate * p.totalSent / 100), 0)).toLocaleString()} tin thành công</div>
                </div>
              </div>
              
              <div className="overview-card error-card">
                <div className="card-icon">✗</div>
                <div className="card-content">
                  <div className="card-value">{((providers.reduce((sum, p) => sum + (p.errorRate * p.totalSent / 100), 0) / providers.reduce((sum, p) => sum + p.totalSent, 0)) * 100 || 0).toFixed(1)}%</div>
                  <div className="card-label">Tỷ Lệ Lỗi</div>
                  <div className="card-detail">{Math.round(providers.reduce((sum, p) => sum + (p.errorRate * p.totalSent / 100), 0)).toLocaleString()} tin lỗi</div>
                </div>
              </div>
              
              <div className="overview-card total-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <div className="card-value">{providers.reduce((sum, p) => sum + p.totalSent, 0).toLocaleString()}</div>
                  <div className="card-label">Tổng Tin Nhắn</div>
                  <div className="card-detail">{providers.length} nhà cung cấp</div>
                </div>
              </div>
            </div>

            {/* Biểu đồ so sánh */}
            <div className="report-section">
              <h3 className="section-title">So Sánh Hiệu Suất Nhà Cung Cấp</h3>
              <div className="chart-container">
                {providers.map((provider) => (
                  <div key={provider.id} className="chart-row">
                    <div className="chart-label">
                      <div className="provider-name">{provider.name}</div>
                      <div className="provider-stats">
                        {provider.totalSent.toLocaleString()} tin
                      </div>
                    </div>
                    <div className="chart-bars">
                      <div className="bar-group">
                        <div className="bar-wrapper">
                          <div 
                            className="bar success-bar" 
                            style={{ width: `${provider.successRate}%` }}
                            title={`Thành công: ${provider.successRate}%`}
                          >
                            <span className="bar-label">{provider.successRate}%</span>
                          </div>
                        </div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar error-bar" 
                            style={{ width: `${provider.errorRate}%` }}
                            title={`Lỗi: ${provider.errorRate}%`}
                          >
                            <span className="bar-label">{provider.errorRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color success-color"></div>
                  <span>Tin thành công</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color error-color"></div>
                  <span>Tin lỗi</span>
                </div>
              </div>
            </div>

            {/* Bảng chi tiết */}
            <div className="report-section">
              <h3 className="section-title">Chi Tiết Từng Nhà Cung Cấp</h3>
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Nhà Cung Cấp</th>
                      <th>Phân Phối</th>
                      <th>Tổng Tin</th>
                      <th>Thành Công</th>
                      <th>Lỗi</th>
                      <th>Tỷ Lệ Thành Công</th>
                      <th>Tỷ Lệ Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id}>
                        <td className="provider-name-cell">{provider.name}</td>
                        <td>{provider.percentage}%</td>
                        <td>{provider.totalSent.toLocaleString()}</td>
                        <td className="success-cell">{Math.round(provider.successRate * provider.totalSent / 100).toLocaleString()}</td>
                        <td className="error-cell">{Math.round(provider.errorRate * provider.totalSent / 100).toLocaleString()}</td>
                        <td>
                          <span className="rate-badge success-badge">{provider.successRate}%</span>
                        </td>
                        <td>
                          <span className="rate-badge error-badge">{provider.errorRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>Tổng</strong></td>
                      <td>{totalPercentage}%</td>
                      <td><strong>{providers.reduce((sum, p) => sum + p.totalSent, 0).toLocaleString()}</strong></td>
                      <td className="success-cell"><strong>{Math.round(providers.reduce((sum, p) => sum + (p.successRate * p.totalSent / 100), 0)).toLocaleString()}</strong></td>
                      <td className="error-cell"><strong>{Math.round(providers.reduce((sum, p) => sum + (p.errorRate * p.totalSent / 100), 0)).toLocaleString()}</strong></td>
                      <td>
                        <span className="rate-badge success-badge">
                          {((providers.reduce((sum, p) => sum + (p.successRate * p.totalSent / 100), 0) / providers.reduce((sum, p) => sum + p.totalSent, 0)) * 100 || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className="rate-badge error-badge">
                          {((providers.reduce((sum, p) => sum + (p.errorRate * p.totalSent / 100), 0) / providers.reduce((sum, p) => sum + p.totalSent, 0)) * 100 || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal chỉnh sửa */}
        {editingProvider && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chỉnh Sửa Nhà Cung Cấp</h2>
                <button className="btn-close" onClick={closeEditModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên nhà cung cấp</label>
                  <input 
                    type="text" 
                    value={editProviderName} 
                    onChange={(e) => setEditProviderName(e.target.value)}
                    placeholder="Nhập tên nhà cung cấp..."
                  />
                </div>

                <div className="form-group">
                  <label>Phần trăm phân phối (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={editPercentage}
                    onChange={(e) => setEditPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="input-number-large"
                  />
                </div>

                <div className="form-group">
                  <label>Xem trước</label>
                  <div className="preview-bar">
                    <div className="preview-fill" style={{ width: `${editPercentage}%` }}>
                      {editPercentage}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeEditModal} className="btn-cancel">
                  Hủy
                </button>
                <button onClick={saveEdit} className="btn-save">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal thêm nhà cung cấp mới */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thêm Nhà Cung Cấp Mới</h2>
                <button className="btn-close" onClick={closeAddModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên nhà cung cấp <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={newProviderModalName} 
                    onChange={(e) => setNewProviderModalName(e.target.value)}
                    onKeyPress={handleAddKeyPress}
                    placeholder="VD: Telco A, Provider B..."
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Phần trăm phân phối (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={newProviderModalPercentage}
                    onChange={(e) => setNewProviderModalPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="input-number-large"
                    placeholder="0-100"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Có thể để 0 và điều chỉnh sau
                  </small>
                </div>

                <div className="form-group">
                  <label>Xem trước</label>
                  <div className="preview-bar">
                    <div className="preview-fill" style={{ width: `${newProviderModalPercentage}%` }}>
                      {newProviderModalPercentage > 0 && `${newProviderModalPercentage}%`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeAddModal} className="btn-cancel">
                  Hủy
                </button>
                <button 
                  onClick={saveNewProvider} 
                  className="btn-save"
                  disabled={!newProviderModalName.trim()}
                >
                  Thêm nhà cung cấp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
