import { Fragment, useState } from 'react'
import { BadgeDollarSign, CloudUpload, Search, Pencil, MoreVertical, History, ListChecks } from 'lucide-react'

const NETWORKS = ['VTL', 'Vina', 'MBF', 'VNM', 'GTel']

const PRICE_ROWS = [
  {
    id: 1,
    brandname: 'GPAY',
    partner: 'ST',
    type: 'OTP',
    prices: { VTL: [320, 300], Vina: [300, 300], MBF: [300, 300], VNM: [300, 300], GTel: [300, 300] },
    status: 'active',
    updated: '26/05/2026',
    updatedBy: 'admin_sr...',
  },
  {
    id: 2,
    brandname: 'JOY',
    partner: 'Gapit',
    type: 'CSKH',
    prices: { VTL: [360, 390], Vina: [390, 390], MBF: [390, 390], VNM: [390, 390], GTel: [390, 390] },
    status: 'draft',
    updated: '26/05/2026',
    updatedBy: 'pricing_t...',
  },
]

const HISTORY_ITEMS = [
  {
    id: 1,
    color: 'orange',
    title: 'ST - OTP - Viettel',
    oldPrice: 320,
    newPrice: 330,
    diff: 10,
    diffPct: 3.13,
    up: true,
    updatedBy: 'admin_sms',
    oldRange: { from: '21/06/2026', to: '21/06/2026', days: 36 },
    newRange: { from: '21/06/2026', to: '21/06/2026', days: 32 },
    time: '21/06/2026 11:30',
  },
  {
    id: 2,
    color: 'green',
    title: 'Gapit - CSKH - MobiFone',
    oldPrice: 375,
    newPrice: 330,
    diff: 13,
    diffPct: 3.47,
    up: true,
    updatedBy: 'pricing_team',
    oldRange: { from: '21/06/2026', to: '21/06/2026', days: 6 },
    newRange: { from: '21/06/2026', to: '21/06/2026', days: 6 },
    time: '21/06/2026 16:30',
  },
]

function EffectiveBox({ label, range, tone }) {
  return (
    <div className={`pm-effective-box pm-effective-${tone}`}>
      <span className="pm-effective-label">{label}</span>
      <span className="pm-effective-range">{range.from} → {range.to}</span>
      <span className="pm-effective-days">({range.days} ngày)</span>
    </div>
  )
}

function PricingManagementContent() {
  const [search, setSearch] = useState('')

  return (
    <div className="pricing-management-content">
      {/* Header card */}
      <div className="gw-card pm-header-card">
        <div className="gw-card-head" style={{ marginBottom: 0 }}>
          <span className="gw-card-icon">
            <BadgeDollarSign size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">Cập nhật bảng giá</h2>
            <p className="gw-card-subtitle">Cấu hình giá theo đối tác/provider</p>
          </div>
        </div>
        <button className="pm-upload-btn">
          <CloudUpload size={16} /> Upload bảng giá
        </button>
      </div>

      {/* Price table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <div>
              <h3 className="table-title">Bảng giá SMS Brandname</h3>
              <p className="gw-card-subtitle">Quản lý giá gửi nhận/ giá bán theo nhà mạng</p>
            </div>
          </div>
          <div className="pm-search-field">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm brandname hoặc đối tác"
            />
            <Search size={16} className="pm-search-icon" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table pm-price-table">
            <thead>
              <tr>
                <th>Brandname</th>
                <th>Đối tác</th>
                <th>Loại SMS</th>
                {NETWORKS.map((n) => (
                  <th key={n} colSpan={2}>{n}</th>
                ))}
                <th>TT cấu hình</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
              <tr className="pm-subheader-row">
                <th colSpan={3} />
                {NETWORKS.map((n) => (
                  <Fragment key={n}>
                    <th>giá nhập</th>
                    <th>giá bán</th>
                  </Fragment>
                ))}
                <th colSpan={3} />
              </tr>
            </thead>
            <tbody>
              {PRICE_ROWS.map((row) => (
                <tr key={row.id}>
                  <td><span className="table-network">{row.brandname}</span></td>
                  <td>{row.partner}</td>
                  <td>{row.type}</td>
                  {NETWORKS.map((n) => (
                    <Fragment key={n}>
                      <td>{row.prices[n][0]}</td>
                      <td>{row.prices[n][1]}</td>
                    </Fragment>
                  ))}
                  <td>
                    <span className={`status-badge ${row.status === 'active' ? 'active' : 'draft'}`}>
                      <span className="status-dot" />
                      {row.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="pm-updated-cell">
                      <span>{row.updated}</span>
                      <span className="pm-updated-by">Bởi {row.updatedBy}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" title="Chỉnh sửa">
                        <Pencil size={16} />
                      </button>
                      <button className="action-btn" title="Thêm">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="routing-pagination flex-wrap gap-3">
          <div className="db-page-size">
            <span>Show</span>
            <select defaultValue="10" className="pagination-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>‹</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`pagination-btn${n === 1 ? ' active' : ''}`}>{n}</button>
            ))}
            <span className="db-page-ellipsis">...</span>
            <button className="pagination-btn">10</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="gw-card pm-history-card">
        <div className="gw-history-head">
          <span className="gw-card-icon">
            <History size={18} />
          </span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">Lịch sử thay đổi bảng giá</h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử cập nhật giá SMS</p>
          </div>
          <button className="pm-history-btn">
            <ListChecks size={16} /> Xem đầy đủ lịch sử
          </button>
        </div>

        <div className="pm-history-list">
          {HISTORY_ITEMS.map((item) => (
            <div key={item.id} className={`pm-history-item pm-bar-${item.color}`}>
              <div className="pm-history-main">
                <h4 className="pm-history-title">{item.title}</h4>
                <p className="pm-history-price">
                  Giá cũ: {item.oldPrice} đ → Giá mới: {item.newPrice} đ{' '}
                  <span className={item.up ? 'pm-diff-up' : 'pm-diff-down'}>
                    ({item.up ? '↑' : '↓'} {item.diff} đ / {item.diffPct}%)
                  </span>
                </p>
                <p className="pm-history-updater">Người cập nhật: {item.updatedBy}</p>
              </div>

              <div className="pm-history-compare">
                <EffectiveBox label="Hiệu lực cũ" range={item.oldRange} tone="old" />
                <span className="pm-effective-arrow">→</span>
                <EffectiveBox label="Hiệu lực mới" range={item.newRange} tone="new" />
              </div>

              <div className="pm-history-time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PricingManagementContent
