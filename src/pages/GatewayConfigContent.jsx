import { useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Router, ListFilter, Download, Pencil, Trash2, ShieldCheck, History, Save } from 'lucide-react'
import {
  BRANDNAMES,
  NETWORKS,
  PROVIDERS,
  STATUSES,
  PRIORITIES,
  NETWORK_FILTER_OPTIONS,
  ROUTING_ROWS,
  HISTORY_ITEMS,
} from '../constants/gatewayConfig'

function ChangeValue({ from, to, unchanged }) {
  if (unchanged) {
    return (
      <span className="gw-change-value">
        {from} → {to} <span className="gw-change-unchanged">(không đổi)</span>
      </span>
    )
  }

  return (
    <span className="gw-change-value">
      <span className="gw-change-from">{from}</span> → <span className="gw-change-to">{to}</span>
    </span>
  )
}

function GatewayConfigContent() {
  const [form, setForm] = useState({
    brandname: 'GPAY',
    network: 'Tất cả',
    primary: 'ST',
    backup: 'Gapit',
    tps: 1000,
    priority: 1,
    status: 'Active',
  })
  const [filterBrandname, setFilterBrandname] = useState(null)
  const [filterNetwork, setFilterNetwork] = useState(null)

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="gateway-config-content">
      {/* Form card */}
      <div className="gw-card">
        <div className="gw-card-head">
          <span className="gw-card-icon">
            <Router size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">Cấu hình Routing Brandname</h2>
            <p className="gw-card-subtitle">Quản lý mapping Brandname, loại mạng và routing theo đối tác</p>
          </div>
        </div>

        <div className="gw-form-grid">
          <div className="gw-form-field">
            <label>Brandname <span className="gw-required">*</span></label>
            <Dropdown
              value={form.brandname}
              onChange={(e) => updateForm('brandname', e.value)}
              options={BRANDNAMES}
              placeholder="Chọn Brandname"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Nhà mạng (Telco) <span className="gw-required">*</span></label>
            <Dropdown
              value={form.network}
              onChange={(e) => updateForm('network', e.value)}
              options={NETWORKS}
              placeholder="Chọn nhà mạng"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Provider chính <span className="gw-required">*</span></label>
            <Dropdown
              value={form.primary}
              onChange={(e) => updateForm('primary', e.value)}
              options={PROVIDERS}
              placeholder="Chọn Provider chính"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Provider dự phòng (Backup)</label>
            <Dropdown
              value={form.backup}
              onChange={(e) => updateForm('backup', e.value)}
              options={PROVIDERS}
              placeholder="Chọn Provider dự phòng"
              className="bn-dropdown"
            />
          </div>

          <div className="gw-form-field">
            <label>TPS (Tin/giây) <span className="gw-required">*</span></label>
            <input
              type="number"
              min="0"
              value={form.tps}
              onChange={(e) => updateForm('tps', e.target.value)}
            />
          </div>
          <div className="gw-form-field">
            <label>Priority <span className="gw-required">*</span></label>
            <Dropdown
              value={form.priority}
              onChange={(e) => updateForm('priority', e.value)}
              options={PRIORITIES}
              placeholder="Chọn Priority"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái <span className="gw-required">*</span></label>
            <Dropdown
              value={form.status}
              onChange={(e) => updateForm('status', e.value)}
              options={STATUSES}
              placeholder="Chọn trạng thái"
              className="bn-dropdown"
            />
          </div>

          <div className="gw-form-actions">
            <button className="db-export-btn gw-save-btn">
              <Save size={16} /> Lưu cấu hình
            </button>
          </div>
        </div>
      </div>

      {/* Routing table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <span className="table-icon">📋</span>
            <div>
              <h3 className="table-title">Danh sách Routing</h3>
              <p className="gw-card-subtitle">Quản lý cấu hình Routing theo brandname và nhà mạng</p>
            </div>
          </div>
          <div className="gw-table-filters">
            <Dropdown
              value={filterBrandname}
              onChange={(e) => setFilterBrandname(e.value)}
              options={BRANDNAMES}
              placeholder="Brandname"
              className="bn-dropdown gw-filter-dropdown"
            />
            <Dropdown
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.value)}
              options={NETWORK_FILTER_OPTIONS}
              placeholder="--Loại mạng--"
              className="bn-dropdown gw-filter-dropdown"
            />
            {/* <input type="text" className="gw-filter-date" defaultValue="05/06/2026" /> */}
            <button className="db-filter-btn">
              Lọc dữ liệu <ListFilter size={16} />
            </button>
            <button className="db-export-btn">
              Kết xuất cấu hình tổng <Download size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table">
            <thead>
              <tr>
                <th>Brandname</th>
                <th>Nhà mạng</th>
                <th>Provider chính</th>
                <th>Provider dự phòng</th>
                <th>TPS (tin/giây)</th>
                <th>Priority</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Người cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ROUTING_ROWS.map((row) => (
                <tr key={row.id}>
                  <td><span className="table-network">{row.brandname}</span></td>
                  <td>{row.network}</td>
                  <td><span className="table-provider primary">{row.primary}</span></td>
                  <td><span className="table-provider backup">{row.backup}</span></td>
                  <td>{row.tps}</td>
                  <td>{row.priority}</td>
                  <td>
                    <span className="status-badge active">
                      <span className="status-dot" />
                      Active
                    </span>
                  </td>
                  <td>{row.updated}</td>
                  <td>{row.updatedBy}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" title="Chỉnh sửa">
                        <Pencil size={16} />
                      </button>
                      <button className="action-btn delete" title="Xóa">
                        <Trash2 size={16} />
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
      <div className="gw-card gw-history-card">
        <div className="gw-history-head">
          <span className="gw-card-icon">
            <History size={18} />
          </span>
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">Lịch sử cập nhật cấu hình</h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử chỉnh sửa routing</p>
          </div>
          <span className="gw-audit-badge">
            <ShieldCheck size={14} /> Audit Log: Enabled
          </span>
        </div>

        <div className="gw-history-list">
          {HISTORY_ITEMS.map((item) => {
            const mid = Math.ceil(item.changes.length / 2)
            const colA = item.changes.slice(0, mid)
            const colB = item.changes.slice(mid)

            return (
              <div key={item.id} className="gw-history-item">
                <h4 className="gw-history-title">{item.title}</h4>
                <div className="gw-history-grid">
                  <div className="gw-history-col">
                    {colA.map((c) => (
                      <div key={c.label} className="gw-history-row">
                        <span className="gw-history-label">{c.label}:</span>
                        <ChangeValue {...c} />
                      </div>
                    ))}
                  </div>
                  <div className="gw-history-col">
                    {colB.map((c) => (
                      <div key={c.label} className="gw-history-row">
                        <span className="gw-history-label">{c.label}:</span>
                        <ChangeValue {...c} />
                      </div>
                    ))}
                  </div>
                  <div className="gw-history-col">
                    <span className="gw-history-label">Lý do thay đổi</span>
                    <span className="gw-history-reason">{item.reason}</span>
                  </div>
                  <div className="gw-history-col gw-history-meta">
                    <span>{item.date}</span>
                    <span>{item.user}</span>
                  </div>
                </div>
              </div>
            )
          })}
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
    </div>
  )
}

export default GatewayConfigContent
