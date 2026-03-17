function AddProviderModal({
  showAddModal,
  closeAddModal,
  newProviderModalName,
  setNewProviderModalName,
  newProviderModalPercentage,
  setNewProviderModalPercentage,
  handleAddKeyPress,
  saveNewProvider,
}) {
  if (!showAddModal) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={closeAddModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Nhà Cung Cấp Mới</h2>
          <button className="btn-close" onClick={closeAddModal}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>
              Tên nhà cung cấp <span className="required">*</span>
            </label>
            <input
              type="text"
              value={newProviderModalName}
              onChange={(e) => setNewProviderModalName(e.target.value)}
              onKeyDown={handleAddKeyPress}
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
          <button onClick={saveNewProvider} className="btn-save" disabled={!newProviderModalName.trim()}>
            Thêm nhà cung cấp
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddProviderModal
