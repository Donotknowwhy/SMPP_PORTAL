import { useMemo } from 'react'
import SmsRequestSection from './SmsRequestSection'

// Provider color palette for the pie chart
const PROVIDER_COLORS = [
  '#E31E24', '#F59E0B', '#2563EB', '#16A34A',
  '#9333EA', '#EA580C', '#0891B2', '#BE185D',
]

function DonutChart({ providers, totalPercentage }) {
  const validTotal = totalPercentage > 0 ? totalPercentage : 1
  const segments = useMemo(() => {
    let cumulative = 0
    return providers.map((p, i) => {
      const pct = (p.percentage / 100) * 360
      const start = (cumulative / 100) * 360
      cumulative += p.percentage
      return { ...p, startDeg: start, sweepDeg: pct, color: PROVIDER_COLORS[i % PROVIDER_COLORS.length] }
    })
  }, [providers])

  // Build conic-gradient string
  const gradient = useMemo(() => {
    if (segments.length === 0) return 'conic-gradient(#E5E7EB 0deg 360deg)'
    let parts = []
    let cur = 0
    segments.forEach((s) => {
      const sweep = (s.percentage / 100) * 360
      parts.push(`${s.color} ${cur}deg ${cur + sweep}deg`)
      cur += sweep
    })
    if (cur < 360) parts.push(`#E5E7EB ${cur}deg 360deg`)
    return `conic-gradient(${parts.join(', ')})`
  }, [segments])

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart" style={{ background: gradient }}>
        <div className="donut-hole">
          <span className="donut-center-value">{totalPercentage}%</span>
          <span className="donut-center-label">Tổng phân phối</span>
        </div>
      </div>
      <div className="chart-legend">
        {segments.map((s) => (
          <div key={s.id} className="legend-item">
            <div className="legend-dot" style={{ background: s.color }} />
            <span className="legend-name">{s.name}</span>
            <span className="legend-pct">{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeContent({
  providers,
  totalPercentage,
  totalMessages,
  setTotalMessages,
  showDistribution,
  setShowDistribution,
  calculateDistribution,
  authToken,
}) {
  return (
    <div className="home-content">
      {/* Header row */}
      <div className="content-header">
        <h2>Dashboard</h2>
        <div className="date-range">
          <input type="date" className="date-input" defaultValue="2026-02-01" />
          <span>đến</span>
          <input type="date" className="date-input" defaultValue="2026-02-28" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-body">
            <div className="stat-label">Nhà cung cấp</div>
            <div className="stat-value">{providers.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✓</div>
          <div className="stat-card-body">
            <div className="stat-label">Tổng phân phối</div>
            <div className="stat-value" style={{ color: totalPercentage === 100 ? 'var(--success)' : 'var(--gray-400)' }}>
              {totalPercentage}%
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔵</div>
          <div className="stat-card-body">
            <div className="stat-label">Trạng thái</div>
            <div className="stat-value" style={{ fontSize: '1rem', color: totalPercentage === 100 ? 'var(--success)' : 'var(--gray-400)' }}>
              {totalPercentage === 100 ? 'Đã cấu hình ✓' : 'Chưa hoàn tất'}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column dashboard */}
      {providers.length > 0 && (
        <div className="dashboard-grid">
          {/* Left: Pie chart panel */}
          <div className="chart-panel">
            <h3>Tỉ lệ phân phối</h3>
            <DonutChart providers={providers} totalPercentage={totalPercentage} />
          </div>

          {/* Right: Providers table panel */}
          <div className="providers-panel">
            <div className="providers-panel-header">
              <h3>Nhà cung cấp hiện tại</h3>
              <span className={`total-badge ${totalPercentage === 100 ? 'ok' : 'warn'}`}>
                {totalPercentage === 100 ? '✓ Tổng 100%' : `⚠ Tổng ${totalPercentage}%`}
              </span>
            </div>
            <table className="summary-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>STT</th>
                  <th>Tên nhà cung cấp</th>
                  <th>% Phân phối</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, index) => (
                  <tr key={provider.id}>
                    <td style={{ textAlign: 'center', color: 'var(--gray-400)', fontWeight: 600 }}>{index + 1}</td>
                    <td>{provider.name}</td>
                    <td style={{ width: '45%' }}>
                      <div className="percentage-bar-container">
                        <div
                          className="percentage-bar-fill"
                          style={{
                            width: `${provider.percentage}%`,
                            background: PROVIDER_COLORS[index % PROVIDER_COLORS.length],
                          }}
                        />
                        <span
                          className="percentage-text"
                          style={{ color: provider.percentage > 25 ? 'white' : 'var(--gray-800)' }}
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
        </div>
      )}

      {/* SMS Send Section */}
      <SmsRequestSection authToken={authToken} />

      {/* Distribution Simulator */}
      <div className="distribution-section">
        <h2>Mô phỏng phân phối</h2>
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
                    <div className="bar-fill" style={{ width: `${provider.percentage}%` }}>
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
