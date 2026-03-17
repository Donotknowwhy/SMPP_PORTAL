function ReportsContent({ providers, totalPercentage }) {
  const totalSent = providers.reduce((sum, p) => sum + p.totalSent, 0)
  const totalSuccess = providers.reduce((sum, p) => sum + (p.successRate * p.totalSent) / 100, 0)
  const totalError = providers.reduce((sum, p) => sum + (p.errorRate * p.totalSent) / 100, 0)

  const successRate = ((totalSuccess / totalSent) * 100 || 0).toFixed(1)
  const errorRate = ((totalError / totalSent) * 100 || 0).toFixed(1)

  return (
    <div className="reports-content">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Báo Cáo & Phân Tích</h1>
          <p className="page-subtitle">Tổng quan hiệu suất và tỷ lệ thành công</p>
        </div>
      </div>

      <div className="report-overview">
        <div className="overview-card success-card">
          <div className="card-icon">✓</div>
          <div className="card-content">
            <div className="card-value">{successRate}%</div>
            <div className="card-label">Tỷ Lệ Thành Công</div>
            <div className="card-detail">{Math.round(totalSuccess).toLocaleString()} tin thành công</div>
          </div>
        </div>

        <div className="overview-card error-card">
          <div className="card-icon">✗</div>
          <div className="card-content">
            <div className="card-value">{errorRate}%</div>
            <div className="card-label">Tỷ Lệ Lỗi</div>
            <div className="card-detail">{Math.round(totalError).toLocaleString()} tin lỗi</div>
          </div>
        </div>

        <div className="overview-card total-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-value">{totalSent.toLocaleString()}</div>
            <div className="card-label">Tổng Tin Nhắn</div>
            <div className="card-detail">{providers.length} nhà cung cấp</div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3 className="section-title">So Sánh Hiệu Suất Nhà Cung Cấp</h3>
        <div className="chart-container">
          {providers.map((provider) => (
            <div key={provider.id} className="chart-row">
              <div className="chart-label">
                <div className="provider-name">{provider.name}</div>
                <div className="provider-stats">{provider.totalSent.toLocaleString()} tin</div>
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
                  <td className="success-cell">
                    {Math.round((provider.successRate * provider.totalSent) / 100).toLocaleString()}
                  </td>
                  <td className="error-cell">
                    {Math.round((provider.errorRate * provider.totalSent) / 100).toLocaleString()}
                  </td>
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
                <td><strong>{totalSent.toLocaleString()}</strong></td>
                <td className="success-cell"><strong>{Math.round(totalSuccess).toLocaleString()}</strong></td>
                <td className="error-cell"><strong>{Math.round(totalError).toLocaleString()}</strong></td>
                <td>
                  <span className="rate-badge success-badge">{successRate}%</span>
                </td>
                <td>
                  <span className="rate-badge error-badge">{errorRate}%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsContent
