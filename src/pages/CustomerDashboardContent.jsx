import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx-js-style'
import { Calendar } from 'primereact/calendar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Send, CheckCircle2, XCircle, Wallet, FileSpreadsheet, RefreshCw, BarChart3, TrendingUp, Percent } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getClientOverview, getClientDailyOutput, getClientDeliveryStatus, getClientDetailByDay } from '../utils/homeApi'
import { getRoutingInfo } from '../utils/routingApi'

const ALL_BRANDNAME_OPTION = { label: 'Tất cả', value: 0 }

const EXCEL_HEADERS = [
  'Ngày',
  'Brandname',
  'Viettel',
  'VinaPhone',
  'MobiFone',
  'Mạng Khác',
  'Tổng thành công',
  'Tổng thất bại',
]

const EXCEL_BORDER = {
  top: { style: 'thin', color: { rgb: '9CA3AF' } },
  bottom: { style: 'thin', color: { rgb: '9CA3AF' } },
  left: { style: 'thin', color: { rgb: '9CA3AF' } },
  right: { style: 'thin', color: { rgb: '9CA3AF' } },
}

const EXCEL_HEADER_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } },
  font: { bold: true, color: { rgb: '4B5563' }, sz: 11, name: 'Calibri' },
  alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  border: EXCEL_BORDER,
}

const EXCEL_BODY_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
  font: { color: { rgb: '1F2937' }, sz: 11, name: 'Calibri' },
  alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  border: EXCEL_BORDER,
}

const EXCEL_SUCCESS_STYLE = {
  ...EXCEL_BODY_STYLE,
  font: { bold: true, color: { rgb: '2563EB' }, sz: 11, name: 'Calibri' },
  border: EXCEL_BORDER,
}

const EXCEL_FAIL_STYLE = {
  ...EXCEL_BODY_STYLE,
  font: { bold: true, color: { rgb: 'E31E24' }, sz: 11, name: 'Calibri' },
  border: EXCEL_BORDER,
}

const EXCEL_TOTAL_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } },
  font: { bold: true, color: { rgb: '1F2937' }, sz: 11, name: 'Calibri' },
  alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  border: EXCEL_BORDER,
}

const EXCEL_TOTAL_SUCCESS_STYLE = {
  ...EXCEL_TOTAL_STYLE,
  font: { bold: true, color: { rgb: '2563EB' }, sz: 11, name: 'Calibri' },
  border: EXCEL_BORDER,
}

const EXCEL_TOTAL_FAIL_STYLE = {
  ...EXCEL_TOTAL_STYLE,
  font: { bold: true, color: { rgb: 'E31E24' }, sz: 11, name: 'Calibri' },
  border: EXCEL_BORDER,
}

const EXCEL_COL_WIDTHS = [
  { wch: 14 },
  { wch: 18 },
  { wch: 12 },
  { wch: 12 },
  { wch: 12 },
  { wch: 12 },
  { wch: 16 },
  { wch: 14 },
]

function getCellStyle(rowIndex, colIndex, lastRowIndex) {
  if (rowIndex === 0) return EXCEL_HEADER_STYLE
  if (rowIndex === lastRowIndex) {
    if (colIndex === 6) return EXCEL_TOTAL_SUCCESS_STYLE
    if (colIndex === 7) return EXCEL_TOTAL_FAIL_STYLE
    return EXCEL_TOTAL_STYLE
  }
  if (colIndex === 6) return EXCEL_SUCCESS_STYLE
  if (colIndex === 7) return EXCEL_FAIL_STYLE
  return EXCEL_BODY_STYLE
}

function getCurrentMonthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function getCurrentMonthEnd() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
}

function formatDate(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDayLabel(dateStr) {
  if (!dateStr) return ''
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

function buildDailyVolume(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((r) => ({
    day: formatDayLabel(r.date),
    success: r.totalSmsSuccess ?? 0,
    failed: r.totalSmsFailed ?? 0,
  }))
}

function formatFullDayLabel(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function buildDailyDetail(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((r) => ({
    day: formatFullDayLabel(r.sendDate),
    brandname: r.brandName ?? '',
    viettel: r.vietTel ?? 0,
    vinaphone: r.vinaPhone ?? 0,
    mobifone: r.mobiPhone ?? 0,
    other: r.otherTelco ?? 0,
    success: r.totalSuccess ?? 0,
    failed: r.totalFailed ?? 0,
  }))
}

const numberFormat = (v) => new Intl.NumberFormat('vi-VN').format(v ?? 0)
const currencyFormat = (v) => `${new Intl.NumberFormat('vi-VN').format(v ?? 0)} đ`

const DONUT_COLORS = ['#16A34A', '#E31E24']

function SuccessRateDonut({ successCount, failedCount, successPct, failedPct }) {
  const data = [
    { name: 'Thành công', value: successCount },
    { name: 'Thất bại', value: failedCount },
  ]

  return (
    <div className="cd-donut-row">
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
  const { authToken } = useAuth()

  const [brandNameOptions, setBrandNameOptions] = useState([ALL_BRANDNAME_OPTION])
  const [brandNameId, setBrandNameId] = useState(0)
  const [fromDate, setFromDate] = useState(getCurrentMonthStart)
  const [toDate, setToDate] = useState(getCurrentMonthEnd)

  const [overview, setOverview] = useState({ totalSms: 0, totalSmsSuccess: 0, totalSmsFailed: 0, totalCost: 0 })
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState('')

  const [dailyOutput, setDailyOutput] = useState([])
  const [dailyOutputLoading, setDailyOutputLoading] = useState(false)
  const [dailyOutputError, setDailyOutputError] = useState('')

  const [deliveryRates, setDeliveryRates] = useState({ successRate: 0, failedRate: 0, queuedRate: 0, processRate: 0 })
  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')

  const [detailByDay, setDetailByDay] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    if (!authToken) return

    let cancelled = false

    getRoutingInfo(authToken)
      .then(({ brandNames }) => {
        if (cancelled) return
        setBrandNameOptions([ALL_BRANDNAME_OPTION, ...brandNames.map((b) => ({ label: b.brandName, value: b.id }))])
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [authToken])

  const fetchOverview = ({ from = fromDate, to = toDate, brandId = brandNameId } = {}) => {
    if (!authToken) return

    setOverviewLoading(true)
    setOverviewError('')

    getClientOverview({
      token: authToken,
      brandNameId: brandId,
      timeType: from && to ? 1 : 0,
      startTime: from && to ? formatDate(from) : undefined,
      endTime: from && to ? formatDate(to) : undefined,
    })
      .then((data) => setOverview(data))
      .catch((err) => setOverviewError(err.message || 'Không tải được dữ liệu tổng quan.'))
      .finally(() => setOverviewLoading(false))
  }

  const fetchDailyOutput = ({ from = fromDate, to = toDate, brandId = brandNameId } = {}) => {
    if (!authToken) return

    setDailyOutputLoading(true)
    setDailyOutputError('')

    getClientDailyOutput({
      token: authToken,
      brandNameId: brandId,
      timeType: from && to ? 1 : 0,
      startTime: from && to ? formatDate(from) : undefined,
      endTime: from && to ? formatDate(to) : undefined,
    })
      .then((rows) => setDailyOutput(rows))
      .catch((err) => setDailyOutputError(err.message || 'Không tải được sản lượng theo ngày.'))
      .finally(() => setDailyOutputLoading(false))
  }

  const fetchDeliveryStatus = ({ from = fromDate, to = toDate, brandId = brandNameId } = {}) => {
    if (!authToken) return

    setDeliveryLoading(true)
    setDeliveryError('')

    getClientDeliveryStatus({
      token: authToken,
      brandNameId: brandId,
      timeType: from && to ? 1 : 0,
      startTime: from && to ? formatDate(from) : undefined,
      endTime: from && to ? formatDate(to) : undefined,
    })
      .then((rates) => setDeliveryRates(rates))
      .catch((err) => setDeliveryError(err.message || 'Không tải được tỷ lệ thành công.'))
      .finally(() => setDeliveryLoading(false))
  }

  const fetchDetailByDay = ({ from = fromDate, to = toDate, brandId = brandNameId } = {}) => {
    if (!authToken) return

    setDetailLoading(true)
    setDetailError('')

    getClientDetailByDay({
      token: authToken,
      brandNameId: brandId,
      timeType: from && to ? 1 : 0,
      startTime: from && to ? formatDate(from) : undefined,
      endTime: from && to ? formatDate(to) : undefined,
    })
      .then((rows) => setDetailByDay(rows))
      .catch((err) => setDetailError(err.message || 'Không tải được thống kê chi tiết theo ngày.'))
      .finally(() => setDetailLoading(false))
  }

  useEffect(() => {
    fetchOverview()
    fetchDailyOutput()
    fetchDeliveryStatus()
    fetchDetailByDay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const dailyDetail = useMemo(() => buildDailyDetail(detailByDay), [detailByDay])

  const dailyVolume = useMemo(() => buildDailyVolume(dailyOutput), [dailyOutput])

  const totals = useMemo(() => ({
    totalSent: overview.totalSms,
    totalSuccess: overview.totalSmsSuccess,
    totalFailed: overview.totalSmsFailed,
    estimatedCost: overview.totalCost,
  }), [overview])

  const columnTotals = useMemo(() => ({
    viettel: dailyDetail.reduce((s, r) => s + r.viettel, 0),
    vinaphone: dailyDetail.reduce((s, r) => s + r.vinaphone, 0),
    mobifone: dailyDetail.reduce((s, r) => s + r.mobifone, 0),
    other: dailyDetail.reduce((s, r) => s + r.other, 0),
  }), [dailyDetail])

  const isLoading = overviewLoading || dailyOutputLoading || deliveryLoading || detailLoading

  const handleFilter = () => {
    fetchOverview()
    fetchDailyOutput()
    fetchDeliveryStatus()
    fetchDetailByDay()
  }

  const handleExportExcel = () => {
    const bodyRows = dailyDetail.map((r) => [
      r.day,
      r.brandname,
      r.viettel,
      r.vinaphone,
      r.mobifone,
      r.other,
      r.success,
      r.failed,
    ])
    const totalRow = [
      'Tổng cộng',
      '',
      columnTotals.viettel,
      columnTotals.vinaphone,
      columnTotals.mobifone,
      columnTotals.other,
      totals.totalSuccess,
      totals.totalFailed,
    ]
    const aoa = [EXCEL_HEADERS, ...bodyRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    const lastRowIndex = aoa.length - 1
    const numericCols = new Set([2, 3, 4, 5, 6, 7])

    for (let r = 0; r <= lastRowIndex; r += 1) {
      for (let c = 0; c < EXCEL_HEADERS.length; c += 1) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) {
          worksheet[address] = { t: 's', v: '' }
        }
        const cell = worksheet[address]
        cell.s = getCellStyle(r, c, lastRowIndex)
        if (r > 0 && numericCols.has(c) && typeof cell.v === 'number') {
          cell.t = 'n'
          cell.z = '#,##0'
          cell.s = {
            ...cell.s,
            numFmt: '#,##0',
          }
        }
      }
    }

    worksheet['!cols'] = EXCEL_COL_WIDTHS
    worksheet['!rows'] = aoa.map(() => ({ hpt: 22 }))
    worksheet['!merges'] = [{ s: { r: lastRowIndex, c: 0 }, e: { r: lastRowIndex, c: 1 } }]
    if (!worksheet['!ref']) {
      worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: lastRowIndex, c: EXCEL_HEADERS.length - 1 },
      })
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'San luong')
    const brandLabel = brandNameOptions.find((o) => o.value === brandNameId)?.label ?? 'tat-ca'
    XLSX.writeFile(workbook, `bao-cao-san-luong-${brandLabel}.xlsx`, { cellStyles: true })
  }

  return (
    <div className="cd-dashboard db-dashboard !px-4 sm:!px-6 lg:!px-8">
      <div className="gw-card cd-filter-card">
        <div className="gw-card-head">
          <span className="gw-card-icon"><BarChart3 size={18} /></span>
          <div>
            <h2 className="gw-card-title">Báo cáo thống kê</h2>
            <p className="gw-card-subtitle">Theo dõi sản lượng, tỷ lệ thành công và chi phí gửi SMS</p>
          </div>
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

      <div className="gw-card cd-filter-card">
        <div className="cd-filter-row flex-wrap lg:flex-nowrap">
          <div className="db-date-field">
            <label>Brandname</label>
            <select value={brandNameId} onChange={(e) => setBrandNameId(Number(e.target.value))}>
              {brandNameOptions.map((o) => (
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
              panelClassName="db-datepicker-panel"
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
              panelClassName="db-datepicker-panel"
            />
          </div>
          <button
            className="db-refresh-icon-btn"
            onClick={handleFilter}
            disabled={isLoading}
            title="Làm mới bộ lọc và tải lại dữ liệu"
          >
            <RefreshCw size={16} className={isLoading ? 'cd-spin' : ''} />
          </button>
          <button className="db-search-btn cd-stat-btn" onClick={handleFilter} disabled={isLoading}>
            <Search size={16} /> {isLoading ? 'Đang tải...' : 'Tra cứu'}
          </button>
        </div>
        {overviewError && <p className="cd-error-text" style={{ color: '#E31E24', marginTop: 8 }}>{overviewError}</p>}
      </div>

      <div className="db-charts-row cd-charts-row">
        <div className="db-chart-card cd-line-card">
          <div className="db-chart-head">
            <h3><span className="db-chart-icon"><TrendingUp size={15} /></span> Sản lượng gửi theo ngày</h3>
          </div>
          {dailyOutputError && <p className="cd-error-text" style={{ color: '#E31E24' }}>{dailyOutputError}</p>}
          <div className="cd-line-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVolume} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={{ stroke: '#E5E7EB' }} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  allowDecimals={false}
                  tickFormatter={(v) => numberFormat(Math.round(v))}
                  width={40}
                />
                <Tooltip formatter={(v) => numberFormat(Math.round(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="success" name="Thành công" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="failed" name="Thất bại" stroke="#E31E24" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="db-chart-card db-delivery-card cd-donut-card">
          <div className="db-chart-head">
            <h3><span className="db-chart-icon"><Percent size={15} /></span> Tỷ lệ thành công</h3>
          </div>
          {deliveryError && <p className="cd-error-text" style={{ color: '#E31E24' }}>{deliveryError}</p>}
          <SuccessRateDonut
            successCount={totals.totalSuccess}
            failedCount={totals.totalFailed}
            successPct={deliveryRates.successRate}
            failedPct={deliveryRates.failedRate}
          />
        </div>
      </div>

      <div className="db-report-card">
        <div className="cd-table-head">
          <h3 className="db-report-title">Thống kê chi tiết theo ngày</h3>
          <button className="db-export-btn cd-excel-btn" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} /> Xuất file Excel
          </button>
        </div>
        {detailError && <p className="cd-error-text" style={{ color: '#E31E24' }}>{detailError}</p>}

        <div className="db-table-wrap cd-detail-table-wrap">
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
              {dailyDetail.map((row, i) => (
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
