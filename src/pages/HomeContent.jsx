import { useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ListSortDescending, Upload } from 'lucide-react'
import iconSms from '../assets/icons/icon-park-outline_city.svg'
import iconSuccessRate from '../assets/icons/icon-park-outline_city (1).svg'
import iconRevenue from '../assets/icons/icon-park-outline_city (2).svg'
import iconFailed from '../assets/icons/icon-park-outline_city (3).svg'
import iconProfit from '../assets/icons/icon-park-outline_city (4).svg'
import iconSearch from '../assets/icons/flowbite_search-outline.svg'

const STATS = [
  { id: 1, icon: iconSms, label: 'Tổng SMS', value: '12.584.220', trend: '12.3% so với hôm qua', trendType: 'up', highlighted: true },
  { id: 2, icon: iconSuccessRate, label: 'tỷ lệ thành công', value: '98.7%', trend: '0.6% so với hôm qua', trendType: 'up' },
  { id: 3, icon: iconRevenue, label: 'Doanh thu', value: '1.258 VND', trend: 'Cập nhật realtime', trendType: 'realtime' },
  { id: 4, icon: iconFailed, label: 'Tin nhắn thất bại', value: '1.842', trend: 'Trong ngưỡng an toàn', trendType: 'neutral' },
  { id: 5, icon: iconProfit, label: 'Tổng lợi nhuận', value: '5.000', trend: '0.9% so với hôm qua', trendType: 'up', highlighted: true },
]

const TRAFFIC_DATA = [
  { label: 'VTP', ST: 2.5, VNPAY: 0.3, GAPIT: 1.6 },
  { label: 'VNP', ST: 2.0, VNPAY: 2.7, GAPIT: 2.0 },
  { label: 'VNM', ST: 2.2, VNPAY: 1.5, GAPIT: 0.1 },
  { label: 'GTEL', ST: 2.2, VNPAY: 1.8, GAPIT: 1.8 },
  { label: 'MBF', ST: 3.2, VNPAY: 0.3, GAPIT: 0.8 },
]
const TRAFFIC_MAX = 4
const SERIES_COLORS = { ST: '#16A34A', VNPAY: '#2563EB', GAPIT: '#F59E0B' }

const DELIVERY_SEGMENTS = [
  { label: 'Thành công', pct: 72.4, value: '9,103,240', color: '#16A34A' },
  { label: 'Thất bại', pct: 3.8, value: '103,240', color: '#E31E24' },
  { label: 'Đang xử lý', pct: 8.2, value: '1,103,240', color: '#FDBA74' },
  { label: 'Chờ gửi', pct: 15.6, value: '1,803,240', color: '#FACC15' },
]

const REPORT_ROWS = [
  { date: '26/06/2026', customer: 'Thanh Store', brandname: 'THANH_STORE', route: 'Viettel', routeColor: 'red', network: 'Viettel', networkSub: 'Tin CSKH', total: '31,500', success: '31,500', fail: '500', buy: '320 đ', sell: '500 đ', profit: '+5,670,000 đ' },
  { date: '26/06/2026', customer: 'Quang Store', brandname: 'QUANG_STORE', route: 'VNPT', routeColor: 'blue', network: 'VNPT', networkSub: 'Tin CSKH', total: '12,600', success: '12,600', fail: '100', buy: '350 đ', sell: '520 đ', profit: '+4,670,000 đ' },
  { date: '26/06/2026', customer: 'Cty thời trang', brandname: 'FASHION_X', route: 'Mobifone', routeColor: 'orange', network: 'Mobifone', networkSub: 'Tin quảng cáo', total: '100,000', success: '100,000', fail: '4,000', buy: '450 đ', sell: '705 đ', profit: '+23,670,000 đ' },
]

const DONUT_SIZE = 220
const DONUT_RADIUS = 89
const DONUT_STROKE = 38
const DONUT_CIRC = 2 * Math.PI * DONUT_RADIUS

function DonutDelivery({ segments }) {
  const [tooltip, setTooltip] = useState(null)
  const total = segments.reduce((sum, s) => (s.label === 'Thành công' ? s.pct : sum), 0)

  let cumulative = 0
  const arcs = segments.map((s) => {
    const length = (s.pct / 100) * DONUT_CIRC
    const offset = -(cumulative / 100) * DONUT_CIRC
    cumulative += s.pct
    return { ...s, length, offset }
  })

  const handleMove = (arc) => (e) => {
    const rect = e.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect()
    setTooltip({ arc, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="db-donut-row flex-wrap sm:flex-nowrap">
      <div className="db-donut">
        <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          <g transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
            <circle
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={DONUT_RADIUS}
              fill="none"
              stroke="#F1F2F4"
              strokeWidth={DONUT_STROKE}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={DONUT_RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={DONUT_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${arc.length} ${DONUT_CIRC - arc.length}`}
                strokeDashoffset={arc.offset}
                style={{ cursor: 'pointer' }}
                onMouseMove={handleMove(arc)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </g>
        </svg>
        <div className="db-donut-hole">
          <span className="db-donut-value">{Math.round(total)}%</span>
          <span className="db-donut-label">Giao dịch</span>
        </div>
        {tooltip && (
          <div className="db-donut-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <span className="db-legend-square" style={{ background: tooltip.arc.color }} />
            {tooltip.arc.label}: <strong>{tooltip.arc.pct}%</strong> ({tooltip.arc.value})
          </div>
        )}
      </div>
      <div className="db-delivery-legend">
        {segments.map((s) => (
          <div key={s.label} className="db-delivery-row">
            <span className="db-legend-square" style={{ background: s.color }} />
            <span className="db-delivery-name">{s.label}</span>
            <div className="db-delivery-figures">
              <span className="db-delivery-pct">{s.pct}%</span>
              <span className="db-delivery-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeContent() {
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [reportFromDate, setReportFromDate] = useState(new Date(2025, 5, 14))
  const [reportToDate, setReportToDate] = useState(new Date(2025, 5, 14))

  return (
    <div className="db-dashboard !px-4 sm:!px-6 lg:!px-8">
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">
            <span className="db-title-icon">☰</span> Dashboard
          </h1>
          <p className="db-subtitle">Dữ liệu ngày T-1</p>
        </div>
        <div className="db-date-filters flex-wrap sm:flex-nowrap">
          <div className="db-date-field">
            <label>Từ ngày</label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              dateFormat="dd/mm/yy"
              placeholder="DD/MM/YYYY"
              showIcon
              className="db-calendar"
            />
          </div>
          <div className="db-date-field">
            <label>Đến ngày</label>
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value)}
              dateFormat="dd/mm/yy"
              placeholder="DD/MM/YYYY"
              showIcon
              className="db-calendar"
            />
          </div>
          <button className="db-search-btn">
            Tìm <img src={iconSearch} alt="Tìm" className="db-search-icon" />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="db-stats-grid">
        {STATS.map((stat) => (
          <div key={stat.id} className={`db-stat-card${stat.highlighted ? ' highlighted' : ''}`}>
            <img src={stat.icon} alt={stat.label} className="db-stat-icon" />
            <div className="db-stat-body">
              <div className="db-stat-label">{stat.label}</div>
              <div className="db-stat-value">{stat.value}</div>
              <div className={`db-stat-trend db-stat-trend-${stat.trendType}`}>
                {stat.trendType === 'up' && <span className="db-trend-arrow">▲</span>}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="db-filter-row">
        <div className="db-filter-field">
          <label>Brandname</label>
          <select>
            <option>Tất cả</option>
          </select>
        </div>
        <button className="db-refresh-btn">↻ Làm mới</button>
      </div>

      {/* Charts row */}
      <div className="db-charts-row">
        {/* Traffic bar chart */}
        <div className="db-chart-card db-traffic-card w-full max-w-[833px] h-[380px] sm:h-[420px] md:h-[450px]">
          <div className="db-chart-head">
            <h3>Lưu lượng SMS</h3>
            <div className="db-chart-toggles">
              <span className="db-t1-badge">T-1</span>
              <label className="db-toggle-checkbox active">
                <input type="checkbox" defaultChecked readOnly /> Thành công
              </label>
              <label className="db-toggle-checkbox">
                <input type="checkbox" readOnly /> Thất bại
              </label>
            </div>
          </div>

          <div className="db-bar-chart-area">
            <div className="db-bar-mini-legend">
              <div><span className="db-legend-dot" style={{ background: SERIES_COLORS.ST }} /> ST 48</div>
              <div><span className="db-legend-dot" style={{ background: SERIES_COLORS.VNPAY }} /> VNPAY 22</div>
              <div><span className="db-legend-dot" style={{ background: SERIES_COLORS.GAPIT }} /> GAPIT 10</div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAFFIC_DATA} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barGap={3} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={{ stroke: '#E5E7EB' }} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                <YAxis
                  domain={[1, TRAFFIC_MAX]}
                  ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4]}
                  tickFormatter={(v) => `${v}M`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  width={36}
                />
                <Tooltip formatter={(v) => `${v}M`} />
                <Bar dataKey="ST" fill={SERIES_COLORS.ST} radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="VNPAY" fill={SERIES_COLORS.VNPAY} radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="GAPIT" fill={SERIES_COLORS.GAPIT} radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="db-bar-legend">
            <span><span className="db-legend-dot" style={{ background: SERIES_COLORS.ST }} /> ST</span>
            <span><span className="db-legend-dot" style={{ background: SERIES_COLORS.VNPAY }} /> VNPAY</span>
            <span><span className="db-legend-dot" style={{ background: SERIES_COLORS.GAPIT }} /> GAPIT</span>
          </div>
        </div>

        {/* Delivery status donut */}
        <div className="db-chart-card db-delivery-card">
          <div className="db-chart-head">
            <h3>Delivery Status</h3>
            <span className="db-t1-badge">T-1</span>
          </div>
          <DonutDelivery segments={DELIVERY_SEGMENTS} />
        </div>
      </div>

      {/* Report table */}
      <div className="db-report-card">
        <h3 className="db-report-title">
          Báo cáo tổng sản lượng toàn hệ thống <span className="db-report-subtitle">(Màn hình root admin)</span>
        </h3>

        <div className="db-report-filters flex-wrap lg:flex-nowrap">
          <select><option>Tên khách hàng/User</option></select>
          <select><option>Tên kênh Brandname</option></select>
          <select><option>-Tất cả nhà Cung cấp-</option></select>
          <select><option>-Tất cả nhà mạng-</option></select>
          <div className="db-date-field db-date-field-inline">
            <label>Từ:</label>
            <Calendar
              value={reportFromDate}
              onChange={(e) => setReportFromDate(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline"
            />
          </div>
          <div className="db-date-field db-date-field-inline">
            <label>Đến:</label>
            <Calendar
              value={reportToDate}
              onChange={(e) => setReportToDate(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline"
            />
          </div>
          <button className="db-filter-btn">
            Lọc dữ liệu <ListSortDescending size={16} />
          </button>
          <button className="db-export-btn">
            Kết xuất báo cáo Tổng <Upload size={16} />
          </button>
        </div>

        <div className="db-table-wrap">
          <table className="db-report-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th>Brandname</th>
                <th>Route partner</th>
                <th>Loại mạng</th>
                <th>Tổng tin gửi</th>
                <th>Tin thành công</th>
                <th>Tin thất bại</th>
                <th>Giá mua đ</th>
                <th>Giá bán đ</th>
                <th>Lợi nhuận tạm tính</th>
              </tr>
            </thead>
            <tbody>
              {REPORT_ROWS.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{row.customer}</td>
                  <td><span className="db-brandname-badge">{row.brandname}</span></td>
                  <td><span className={`db-route-text db-route-${row.routeColor}`}>{row.route}</span></td>
                  <td>
                    <div className="db-network-cell">
                      <span>{row.network}</span>
                      <span className="db-network-sub">{row.networkSub}</span>
                    </div>
                  </td>
                  <td>{row.total}</td>
                  <td className="db-cell-success">{row.success}</td>
                  <td className="db-cell-fail">{row.fail}</td>
                  <td>{row.buy}</td>
                  <td>{row.sell}</td>
                  <td className="db-cell-profit">{row.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="db-table-pagination">
          <div className="db-page-size">
            <span>Show</span>
            <select defaultValue="10">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Row</span>
          </div>
          <div className="db-page-controls">
            <button className="db-page-btn" disabled>‹</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`db-page-btn${n === 1 ? ' active' : ''}`}>{n}</button>
            ))}
            <span className="db-page-ellipsis">...</span>
            <button className="db-page-btn">10</button>
            <button className="db-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeContent
