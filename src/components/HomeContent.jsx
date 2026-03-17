import SmsRequestSection from './SmsRequestSection'

function HomeContent({
  providers,
  totalPercentage,
  totalMessages,
  setTotalMessages,
  showDistribution,
  setShowDistribution,
  calculateDistribution,
}) {
  return (
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
          <div
            className="stat-value"
            style={{
              color: totalPercentage === 100 ? '#000' : '#999',
            }}
          >
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
                      <span
                        className="percentage-text"
                        style={{
                          color: provider.percentage > 30 ? 'white' : '#000',
                          left: provider.percentage > 30 ? '8px' : '8px',
                        }}
                      >
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

      <SmsRequestSection />

      <div className="distribution-section">
        <h2>Mô Phỏng Phân Phối</h2>
        <div className="distribution-form">
          <label>
            Tổng số tin nhắn:
            <input
              type="number"
              min="1"
              value={totalMessages}
              onChange={(e) => setTotalMessages(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
                        width: `${provider.percentage}%`,
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
  )
}

export default HomeContent
