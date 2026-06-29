import { useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import {
  GitCompare, FileDown, Upload, MessageCircle, FileText, Building2, TrendingDown,
  RefreshCw, Search, Download, Info,
} from 'lucide-react'

const NETWORK_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Viettel', value: 'viettel' },
  { label: 'Mobifone', value: 'mobifone' },
  { label: 'Vinaphone', value: 'vinaphone' },
]

const BRANDNAME_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'GPAY', value: 'GPAY' },
  { label: 'JOY', value: 'JOY' },
  { label: 'VNPAY', value: 'VNPAY' },
]

const PARTNER_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'ST', value: 'ST' },
  { label: 'Gapit', value: 'Gapit' },
  { label: 'VNPAY', value: 'VNPAY' },
]

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Need Review', value: 'review' },
]

const STATS = [
  { id: 1, icon: MessageCircle, color: '#2563EB', label: 'Tổng SMS', value: '5.2M', unit: 'Tin nhắn', trend: '12.3% so với tháng 5' },
  { id: 2, icon: FileText, color: '#16A34A', label: 'Tổng doanh thu', value: '3.5B', unit: 'VND', trend: '8.5% so với tháng 5' },
  { id: 3, icon: Building2, color: '#2563EB', label: 'Tổng chi phí NCC', value: '2.8B', unit: 'VND', trend: '12.5% so với tháng 5' },
  { id: 4, icon: TrendingDown, color: '#E31E24', label: 'Lợi nhuận', value: '700M', unit: 'VND', trend: '12.5% so với tháng 5' },
]

const RECON_ROWS = [
  {
    id: 1,
    from: '02/06/2026', to: '02/06/2026', customer: 'GPAY', brandname: 'GPAY', network: 'Viettel', partner: 'ST',
    volume: '120,000', buyPrice: '119,850 đ', sellPrice: '240 đ', revenue: '38,400,000 đ', cost: '38,250,000 đ',
    profit: '+150,000 đ', profitUp: true, status: 'verified',
  },
  {
    id: 2,
    from: '02/06/2026', to: '02/06/2026', customer: 'JOY', brandname: 'JOY', network: 'Mobifone', partner: 'Gapit',
    volume: '85,000', buyPrice: '84,700 đ', sellPrice: '310 đ', revenue: '26,350,000 đ', cost: '26,350,300 đ',
    profit: '-300 đ', profitUp: false, status: 'review',
  },
  {
    id: 3,
    from: '02/06/2026', to: '02/06/2026', customer: 'VNPAY', brandname: 'VNPAY', network: 'Vinaphone', partner: 'VNPAY',
    volume: '255,000', buyPrice: '253,000 đ', sellPrice: '310 đ', revenue: '76,800,000 đ', cost: '77,400,000 đ',
    profit: '-600,000 đ', profitUp: false, status: 'verified',
  },
]

const HISTORY_ROWS = [
  { id: 1, time: '02/06/2026 10:08', user: 'Finance_admin', action: 'Upload file đối soát NCC', file: 'ST_248565152.xlsx', result: 'success', note: 'Upload thành công' },
  { id: 2, time: '02/06/2026 09:05', user: 'Operation_team', action: 'Import báo cáo khách hàng', file: 'GPAY_248565152.xlsx', result: 'success', note: 'Import thành công' },
  { id: 3, time: '02/06/2026 08:05', user: 'admin_team', action: 'Review lệch sản lượng', file: 'GPAY_248565152.xlsx', result: 'review', note: 'Chênh lệch > 0.5%' },
  { id: 4, time: '02/06/2026 11:05', user: 'Operation_team', action: 'Chạy lại đối soát', file: '-', result: 'success', note: 'Re-Run thành công' },
]

function ReconciliationContent() {
  const [fromDate, setFromDate] = useState(new Date(2025, 5, 14))
  const [toDate, setToDate] = useState(new Date(2025, 5, 26))
  const [network, setNetwork] = useState('all')
  const [brandname, setBrandname] = useState('all')
  const [partner, setPartner] = useState('all')
  const [status, setStatus] = useState('all')

  return (
    <div className="reconciliation-content">
      {/* Header */}
      <div className="gw-card rc-header-card">
        <div className="gw-card-head am-create-head-text" style={{ marginBottom: 0 }}>
          <span className="gw-card-icon">
            <GitCompare size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">SMS Reconciliation Management</h2>
            <p className="gw-card-subtitle">Quản lý đối soát sản lượng SMS Brandname với nhà cung cấp và khách hàng</p>
          </div>
        </div>
        <div className="rc-header-actions">
          <button className="bn-btn-draft p-button">
            <FileDown size={16} /> Export báo cáo
          </button>
          <button className="db-export-btn">
            <Upload size={16} /> Upload file
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="rc-stats-grid">
        {STATS.map((s) => (
          <div key={s.id} className="rc-stat-card">
            <span className="rc-stat-icon" style={{ background: s.color }}>
              <s.icon size={18} />
            </span>
            <div className="rc-stat-body">
              <p className="rc-stat-label">{s.label}</p>
              <p className="rc-stat-value">{s.value} <span className="rc-stat-unit">{s.unit}</span></p>
              <p className="rc-stat-trend">↑ {s.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="gw-card">
        <h3 className="gw-card-title">Bộ lọc đối soát</h3>
        <p className="gw-card-subtitle" style={{ marginBottom: '1rem' }}>Tìm kiếm dữ liệu đối soát theo thời gian và nhà mạng</p>

        <div className="rc-filter-grid">
          <div className="gw-form-field">
            <label>Từ ngày</label>
            <Calendar value={fromDate} onChange={(e) => setFromDate(e.value)} dateFormat="dd/mm/yy" showIcon className="db-calendar db-calendar-inline" />
          </div>
          <div className="gw-form-field">
            <label>Đến ngày</label>
            <Calendar value={toDate} onChange={(e) => setToDate(e.value)} dateFormat="dd/mm/yy" showIcon className="db-calendar db-calendar-inline" />
          </div>
          <div className="gw-form-field">
            <label>Nhà mạng</label>
            <Dropdown value={network} onChange={(e) => setNetwork(e.value)} options={NETWORK_OPTIONS} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Brandname</label>
            <Dropdown value={brandname} onChange={(e) => setBrandname(e.value)} options={BRANDNAME_OPTIONS} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Đối tác</label>
            <Dropdown value={partner} onChange={(e) => setPartner(e.value)} options={PARTNER_OPTIONS} className="bn-dropdown" />
          </div>
          <div className="gw-form-field">
            <label>Trạng thái</label>
            <Dropdown value={status} onChange={(e) => setStatus(e.value)} options={STATUS_OPTIONS} className="bn-dropdown" />
          </div>
        </div>

        <div className="rc-filter-actions">
          <button className="bn-btn-draft p-button">
            <RefreshCw size={16} /> Làm mới
          </button>
          <button className="db-export-btn">
            <Search size={16} /> Tìm kiếm
          </button>
        </div>
      </div>

      {/* Reconciliation table */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <div>
              <h3 className="table-title">Bảng đối soát sản lượng</h3>
              <p className="gw-card-subtitle">Đối soát SMS theo nhà mạng/ brandname/ partner</p>
            </div>
          </div>
          <div className="rc-table-toolbar">
            <div className="pm-search-field">
              <input type="text" placeholder="Tìm kiếm đối soát..." />
              <Search size={16} className="pm-search-icon" />
            </div>
            <button className="db-filter-btn">Tìm <Search size={14} /></button>
            <input type="text" className="gw-filter-date" defaultValue="14/06/2025" />
            <input type="text" className="gw-filter-date" defaultValue="26/06/2025" />
            <button className="bn-btn-draft p-button">
              <Download size={16} /> Tải tất cả
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table rc-recon-table">
            <thead>
              <tr>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Tên KH</th>
                <th>Brandname</th>
                <th>Nhà mạng</th>
                <th>Đối tác</th>
                <th>Sản lượng</th>
                <th>giá nhập</th>
                <th>giá bán</th>
                <th>doanh thu</th>
                <th>chi phí</th>
                <th>Lợi nhuận</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {RECON_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td>{row.customer}</td>
                  <td><span className="table-network">{row.brandname}</span></td>
                  <td>{row.network}</td>
                  <td>{row.partner}</td>
                  <td>{row.volume}</td>
                  <td>{row.buyPrice}</td>
                  <td>{row.sellPrice}</td>
                  <td>{row.revenue}</td>
                  <td>{row.cost}</td>
                  <td className={row.profitUp ? 'pm-diff-up' : 'pm-diff-down'}>{row.profit}</td>
                  <td>
                    <span className={`status-badge ${row.status === 'verified' ? 'active' : 'pending'}`}>
                      <span className="status-dot" />
                      {row.status === 'verified' ? 'Verified' : 'Need Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rc-note">
          <Info size={14} /> Hệ thống tự động đối soát theo nhà mạng, brandname và đối tác, các dòng lệch sẽ được đánh dấu Need Review.
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
      <div className="gw-card">
        <div className="gw-history-head">
          <div className="gw-history-head-text">
            <h2 className="gw-card-title">
              Lịch sử đối soát <span className="am-count-badge">8 bản ghi</span>
            </h2>
            <p className="gw-card-subtitle">Theo dõi lịch sử upload và xử lý đối soát</p>
          </div>
          <button className="db-export-btn am-create-btn">
            <FileDown size={16} /> Xuất excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="routing-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>user</th>
                <th>Hành động</th>
                <th>File</th>
                <th>Kết quả</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>{row.user}</td>
                  <td>{row.action}</td>
                  <td>{row.file}</td>
                  <td>
                    <span className={`am-history-badge am-tone-${row.result === 'success' ? 'green' : 'orange'}`}>
                      {row.result === 'success' ? 'Success' : 'Need Review'}
                    </span>
                  </td>
                  <td>{row.note}</td>
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
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">4</button>
            <span className="db-page-ellipsis">...</span>
            <button className="pagination-btn">10</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReconciliationContent
