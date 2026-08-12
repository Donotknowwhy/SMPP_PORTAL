import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { Calendar } from 'primereact/calendar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Send, CheckCircle2, XCircle, Wallet, FileSpreadsheet } from 'lucide-react'
import { BRANDNAME_OPTIONS } from '../constants/customerPortal'

const DAILY_VOLUME = [
  { day: '14/06', success: 3600, failed: 40 },
  { day: '15/06', success: 3850, failed: 55 },
  { day: '16/06', success: 3700, failed: 45 },
  { day: '17/06', success: 4200, failed: 60 },
  { day: '18/06', success: 3550, failed: 38 },
  { day: '19/06', success: 3900, failed: 50 },
  { day: '20/06', success: 4180, failed: 42 },
]

const DAILY_DETAIL = [
  { day: '18/06/2026', brandname: 'MINIME_STORE', viettel: 1600, vinaphone: 1100, mobifone: 900, other: 200, success: 3700, failed: 100 },
  { day: '19/06/2026', brandname: 'THANH_STORE', viettel: 1500, vinaphone: 1200, mobifone: 850, other: 150, success: 3600, failed: 100 },
  { day: '20/06/2026', brandname: 'QUANG_STORE', viettel: 1700, vinaphone: 1300, mobifone: 950, other: 180, success: 3980, failed: 150 },
  { day: '20/06/2026', brandname: 'FASHION_X', viettel: 1650, vinaphone: 1250, mobifone: 900, other: 160, success: 3796, failed: 163 },
]

const numberFormat = (v) => new Intl.NumberFormat('vi-VN').format(v ?? 0)
const currencyFormat = (v) => `${new Intl.NumberFormat('vi-VN').format(v ?? 0)} đ`

const DONUT_COLORS = ['#16A34A', '#E31E24']

function SuccessRateDonut({ successCount, failedCount }) {
  const total = successCount + failedCount
  const successPct = total ? (successCount / total) * 100 : 0
  const failedPct = 100 - successPct

  const data = [
    { name: 'Thành công', value: successCount },
    { name: 'Thất bại', value: failedCount },
  ]

  return (
    <div className="cd-donut-row flex-wrap sm:flex-nowrap">
      <div className="db-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={DONUT_COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="db-donut-hole">
          <span className="db-donut-value">{successPct.toFixed(1)}%</span>
          <span className="db-donut-label">Thành công</span>
        </div>
      </div>
      <div className="db-delivery-legend">
        <div className="db-delivery-row">
          <span className="db-legend-square" style={{ background: '#16A34A' }} />
          <span className="db-delivery-name">Thành công</span>
          <div className="db-delivery-figures">
            <span className="db-delivery-pct">{numberFormat(successCount)} ({successPct.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="db-delivery-row">
          <span className="db-legend-square" style={{ background: '#E31E24' }} />
          <span className="db-delivery-name">Thất bại</span>
          <div className="db-delivery-figures">
            <span className="db-delivery-pct">{numberFormat(failedCount)} ({failedPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerDashboardContent() {
  const [brandname, setBrandname] = useState(BRANDNAME_OPTIONS[0].value)
  const [fromDate, setFromDate] = useState(new Date(2026, 5, 1))
  const [toDate, setToDate] = useState(new Date(2026, 5, 20))

  const totals = useMemo(() => {
    const totalSuccess = DAILY_DETAIL.reduce((sum, r) => sum + r.success, 0)
    const totalFailed = DAILY_DETAIL.reduce((sum, r) => sum + r.failed, 0)
    const totalSent = totalSuccess + totalFailed
    const estimatedCost = totalSent * 100
    return { totalSuccess, totalFailed, totalSent, estimatedCost }
  }, [])

  const columnTotals = useMemo(() => ({
    viettel: DAILY_DETAIL.reduce((s, r) => s + r.viettel, 0),
    vinaphone: DAILY_DETAIL.reduce((s, r) => s + r.vinaphone, 0),
    mobifone: DAILY_DETAIL.reduce((s, r) => s + r.mobifone, 0),
    other: DAILY_DETAIL.reduce((s, r) => s + r.other, 0),
  }), [])

  const handleFilter = () => {
    // Bộ lọc hiện dùng dữ liệu mẫu; sẽ được nối API báo cáo sản lượng khách hàng.
  }

  const handleExportExcel = () => {
    const rows = DAILY_DETAIL.map((r) => ({
      'Ngày': r.day,
      'Brandname': r.brandname,
      'Viettel': r.viettel,
      'VinaPhone': r.vinaphone,
      'MobiFone': r.mobifone,
      'Mạng Khác': r.other,
      'Tổng thành công': r.success,
      'Tổng thất bại': r.failed,
    }))
    rows.push({
      'Ngày': 'Tổng cộng',
      'Brandname': '',
      'Viettel': columnTotals.viettel,
      'VinaPhone': columnTotals.vinaphone,
      'MobiFone': columnTotals.mobifone,
      'Mạng Khác': columnTotals.other,
      'Tổng thành công': totals.totalSuccess,
      'Tổng thất bại': totals.totalFailed,
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'San luong')
    XLSX.writeFile(workbook, `bao-cao-san-luong-${brandname}.xlsx`)
  }

  return (
    <div className="cd-dashboard db-dashboard !px-4 sm:!px-6 lg:!px-8">
      <div className="gw-card cd-filter-card">
        <div className="gw-card-head">
          <div>
            <h2 className="gw-card-title">Báo cáo sản lượng khách hàng</h2>
          </div>
        </div>

        <div className="cd-filter-row flex-wrap lg:flex-nowrap">
          <div className="db-date-field">
            <label>Brandname</label>
            <select value={brandname} onChange={(e) => setBrandname(e.target.value)}>
              {BRANDNAME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="db-date-field">
            <label>Từ ngày</label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value)}
              dateFormat="dd/mm/yy"
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
              showIcon
              className="db-calendar"
            />
          </div>
          <button className="db-search-btn cd-stat-btn" onClick={handleFilter}>
            <Search size={16} /> Thống kê
          </button>
        </div>
      </div>

      <div className="cd-stats-grid">
        <div className="cd-stat-card cd-stat-blue">
          <span className="cd-stat-icon"><Send size={20} /></span>
          <div className="cd-stat-body">
            <div className="cd-stat-value">{numberFormat(totals.totalSent)}</div>
            <div className="cd-stat-label">Tổng tin gửi</div>
          </div>
        </div>
        <div className="cd-stat-card cd-stat-green">
          <span className="cd-stat-icon"><CheckCircle2 size={20} /></span>
          <div className="cd-stat-body">
            <div className="cd-stat-value">{numberFormat(totals.totalSuccess)}</div>
            <div className="cd-stat-label">Tin thành công</div>
          </div>
        </div>
        <div className="cd-stat-card cd-stat-red">
          <span className="cd-stat-icon"><XCircle size={20} /></span>
          <div className="cd-stat-body">
            <div className="cd-stat-value">{numberFormat(totals.totalFailed)}</div>
            <div className="cd-stat-label">Tin thất bại</div>
          </div>
        </div>
        <div className="cd-stat-card cd-stat-amber">
          <span className="cd-stat-icon"><Wallet size={20} /></span>
          <div className="cd-stat-body">
            <div className="cd-stat-value">{currencyFormat(totals.estimatedCost)}</div>
            <div className="cd-stat-label">Tổng chi phí dự kiến</div>
          </div>
        </div>
      </div>

      <div className="db-charts-row cd-charts-row">
        <div className="db-chart-card cd-line-card">
          <div className="db-chart-head">
            <h3>Sản lượng gửi theo ngày</h3>
          </div>
          <div className="cd-line-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_VOLUME} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={{ stroke: '#E5E7EB' }} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={numberFormat} width={40} />
                <Tooltip formatter={(v) => numberFormat(v)} />
                <Legend
                  formatter={(value) => (value === 'success' ? 'Thành công' : 'Thất bại')}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Line type="monotone" dataKey="success" name="success" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="failed" name="failed" stroke="#E31E24" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="db-chart-card db-delivery-card cd-donut-card">
          <div className="db-chart-head">
            <h3>Tỷ lệ thành công</h3>
          </div>
          <SuccessRateDonut successCount={totals.totalSuccess} failedCount={totals.totalFailed} />
        </div>
      </div>

      <div className="db-report-card">
        <div className="cd-table-head">
          <h3 className="db-report-title">Thống kê chi tiết theo ngày</h3>
          <button className="db-export-btn cd-excel-btn" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} /> Xuất file Excel
          </button>
        </div>

        <div className="db-table-wrap">
          <table className="db-report-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Brandname</th>
                <th>Viettel</th>
                <th>VinaPhone</th>
                <th>MobiFone</th>
                <th>Mạng Khác</th>
                <th>Tổng thành công</th>
                <th>Tổng thất bại</th>
              </tr>
            </thead>
            <tbody>
              {DAILY_DETAIL.map((row, i) => (
                <tr key={i}>
                  <td>{row.day}</td>
                  <td><span className="db-brandname-badge">{row.brandname}</span></td>
                  <td>{numberFormat(row.viettel)}</td>
                  <td>{numberFormat(row.vinaphone)}</td>
                  <td>{numberFormat(row.mobifone)}</td>
                  <td>{numberFormat(row.other)}</td>
                  <td className="db-cell-success">{numberFormat(row.success)}</td>
                  <td className="db-cell-fail">{numberFormat(row.failed)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="cd-total-row">
                <td colSpan={2}><strong>Tổng cộng</strong></td>
                <td><strong>{numberFormat(columnTotals.viettel)}</strong></td>
                <td><strong>{numberFormat(columnTotals.vinaphone)}</strong></td>
                <td><strong>{numberFormat(columnTotals.mobifone)}</strong></td>
                <td><strong>{numberFormat(columnTotals.other)}</strong></td>
                <td className="db-cell-success"><strong>{numberFormat(totals.totalSuccess)}</strong></td>
                <td className="db-cell-fail"><strong>{numberFormat(totals.totalFailed)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboardContent
