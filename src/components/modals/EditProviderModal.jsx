function EditProviderModal({
  editingProvider,
  editProviderName,
  setEditProviderName,
  editPercentage,
  setEditPercentage,
  closeEditModal,
  saveEdit,
}) {
  if (!editingProvider) {
    return null
  }

  return (
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
  )
}

export default EditProviderModal
