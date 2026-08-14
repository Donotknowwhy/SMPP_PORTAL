import { Fragment, useState } from 'react'
import { BadgeDollarSign, CloudUpload, Search, Pencil, MoreVertical, History, ListChecks } from 'lucide-react'
import { NETWORKS, PRICE_ROWS, HISTORY_ITEMS } from '../constants/pricingManagement'
import Pagination from '../components/common/Pagination'

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = 10

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

        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
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
