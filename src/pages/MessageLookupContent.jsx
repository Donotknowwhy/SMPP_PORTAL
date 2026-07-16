import { useEffect, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { toast } from 'react-toastify'
import { FileSearch2, ChevronDown, ChevronUp, RefreshCw, Search, Eye } from 'lucide-react'
import {
  CUSTOMER_OPTIONS,
  DLR_STATUS_OPTIONS,
} from '../constants/messageLookup'
import { useAuth } from '../context/AuthContext'
import { getRoutingInfo } from '../utils/routingApi'
import { lookupMessages } from '../utils/messageLookupApi'

const ALL_OPTION = { label: 'Tất cả', value: 0 }
const DEFAULT_FROM_DATE = new Date(2026, 5, 14, 0, 0)
const DEFAULT_TO_DATE = new Date(2026, 5, 15, 23, 59)

function formatDate(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function MessageLookupContent() {
  const { authToken } = useAuth()
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [phone, setPhone] = useState('')
  const [content, setContent] = useState('')
  const [fromDate, setFromDate] = useState(DEFAULT_FROM_DATE)
  const [toDate, setToDate] = useState(DEFAULT_TO_DATE)
  const [msgId, setMsgId] = useState('')
  const [brandname, setBrandname] = useState(0)
  const [customer, setCustomer] = useState('all')
  const [network, setNetwork] = useState(0)
  const [partner, setPartner] = useState(0)
  const [dlrStatus, setDlrStatus] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  const [brandnameOptions, setBrandnameOptions] = useState([ALL_OPTION])
  const [networkOptions, setNetworkOptions] = useState([ALL_OPTION])
  const [partnerOptions, setPartnerOptions] = useState([ALL_OPTION])
  const [infoError, setInfoError] = useState('')

  const [resultRows, setResultRows] = useState([])
  const [resultLoading, setResultLoading] = useState(false)
  const [resultError, setResultError] = useState('')
  const [dateFilterApplied, setDateFilterApplied] = useState(false)

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setInfoError('')

    getRoutingInfo(authToken)
      .then(({ brandNames, telcos, providers }) => {
        if (cancelled) return
        setBrandnameOptions([ALL_OPTION, ...brandNames.map((b) => ({ label: b.brandName, value: b.id }))])
        setNetworkOptions([ALL_OPTION, ...telcos.map((t) => ({ label: t.telco, value: t.id }))])
        setPartnerOptions([ALL_OPTION, ...providers.map((p) => ({ label: p.providerName, value: p.id }))])
      })
      .catch((err) => {
        if (!cancelled) setInfoError(err.message || 'Không tải được dữ liệu bộ lọc.')
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  const handleSearch = () => {
    if (!authToken) return

    setResultLoading(true)
    setResultError('')

    lookupMessages({
      token: authToken,
      phone,
      content,
      timeType: dateFilterApplied ? 1 : 0,
      startTime: dateFilterApplied ? formatDate(fromDate) : undefined,
      endTime: dateFilterApplied ? formatDate(toDate) : undefined,
      requestId: msgId,
      brandNameId: brandname,
      telcoId: network,
      providerId: partner,
      deliveryStatus: dlrStatus,
    })
      .then(({ rows }) => setResultRows(rows))
      .catch((err) => {
        setResultError(err.message || 'Không tra cứu được tin nhắn.')
        toast.error(err.message || 'Không tra cứu được tin nhắn.')
      })
      .finally(() => setResultLoading(false))
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const handleReset = () => {
    setPhone('')
    setContent('')
    setFromDate(DEFAULT_FROM_DATE)
    setToDate(DEFAULT_TO_DATE)
    setMsgId('')
    setBrandname(0)
    setCustomer('all')
    setNetwork(0)
    setPartner(0)
    setDlrStatus('')
    setDateFilterApplied(false)
  }

  return (
    <div className="lookup-content">
      <div className="gw-card">
        <div className="gw-card-head">
          <span className="gw-card-icon">
            <FileSearch2 size={18} />
          </span>
          <div>
            <h2 className="gw-card-title">Tra cứu chi tiết tin nhắn</h2>
            <p className="gw-card-subtitle">
              Tra cứu lịch sử SMS và kết quả Delivery Report (DLR) theo MsgID, số điện thoại, Brandname, nhà mạng, đối tác và thời gian
            </p>
          </div>
        </div>

        <div className="lk-basic-grid">
          <div className="gw-form-field">
            <label>Số điện thoại</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" />
          </div>
          <div className="gw-form-field">
            <label>Nội dung tin nhắn</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung tin nhắn" />
          </div>
          <div className="gw-form-field">
            <label>Từ ngày - giờ</label>
            <Calendar
              value={fromDate}
              onChange={(e) => { setFromDate(e.value); setDateFilterApplied(true) }}
              showTime
              hourFormat="24"
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline lk-calendar"
            />
          </div>
          <div className="gw-form-field">
            <label>Đến ngày - giờ</label>
            <Calendar
              value={toDate}
              onChange={(e) => { setToDate(e.value); setDateFilterApplied(true) }}
              showTime
              hourFormat="24"
              dateFormat="dd/mm/yy"
              showIcon
              className="db-calendar db-calendar-inline lk-calendar"
            />
          </div>
        </div>

        <div className="lk-toolbar-row">
          <button className="lk-advanced-toggle" onClick={() => setAdvancedOpen((v) => !v)}>
            Tìm kiếm nâng cao {advancedOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <div className="lk-toolbar-actions">
            <button className="bn-btn-draft p-button" onClick={handleReset} disabled={resultLoading}>
              <RefreshCw size={16} /> Làm mới
            </button>
            <button className="db-export-btn" onClick={handleSearch} disabled={resultLoading}>
              <Search size={16} /> {resultLoading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>
        <p className="lk-advanced-hint">Mở rộng tìm kiếm theo điều kiện tra cứu khác</p>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        {advancedOpen && (
          <div className="lk-advanced-panel">
            <div className="lk-advanced-head">
              <h3>Tìm kiếm nâng cao</h3>
              <button className="lk-collapse-btn" onClick={() => setAdvancedOpen(false)}>
                Thu gọn <ChevronUp size={15} />
              </button>
            </div>

            <div className="lk-advanced-grid">
              <div className="gw-form-field">
                <label>MsgID / Mã tin nhắn</label>
                <input type="text" value={msgId} onChange={(e) => setMsgId(e.target.value)} placeholder="Nhập MsgID hoặc mã tin nhắn" />
              </div>
              <div className="gw-form-field">
                <label>Brandname</label>
                <Dropdown value={brandname} onChange={(e) => setBrandname(e.value)} options={brandnameOptions} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Khách hàng</label>
                <Dropdown value={customer} onChange={(e) => setCustomer(e.value)} options={CUSTOMER_OPTIONS} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Nhà mạng</label>
                <Dropdown value={network} onChange={(e) => setNetwork(e.value)} options={networkOptions} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Đối tác/Vendor</label>
                <Dropdown value={partner} onChange={(e) => setPartner(e.value)} options={partnerOptions} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Trạng thái DLR</label>
                <Dropdown value={dlrStatus} onChange={(e) => setDlrStatus(e.value)} options={DLR_STATUS_OPTIONS} className="bn-dropdown" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="routing-table-section gw-table-section">
        <div className="routing-table-header gw-table-header">
          <div className="gw-table-header-text">
            <h3 className="table-title">
              <FileSearch2 size={16} /> Kết quả tra cứu
            </h3>
            <span className="am-count-badge lk-result-badge">{resultRows.length} tin nhắn</span>
          </div>
        </div>

        {resultError && <p className="gw-table-error">{resultError}</p>}

        <div className="overflow-x-auto">
          <table className="routing-table lk-result-table">
            <thead>
              <tr>
                <th>MsgID</th>
                <th>Thời gian gửi</th>
                <th>Brandname</th>
                <th>SDT người nhận</th>
                <th>Nhà mạng</th>
                <th>Trạng thái DLR</th>
                <th>Responsee/ Lý do lỗi</th>
                <th>Xem chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {resultLoading && (
                <tr>
                  <td colSpan={8} className="gw-table-status">Đang tra cứu...</td>
                </tr>
              )}
              {!resultLoading && !resultError && resultRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="gw-table-status">Không có dữ liệu.</td>
                </tr>
              )}
              {!resultLoading && resultRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.requestId}</td>
                  <td>{row.sentTime}</td>
                  <td>{row.brandName}</td>
                  <td>{row.phone}</td>
                  <td>{row.telco}</td>
                  <td>
                    <span className={`lk-dlr-badge lk-dlr-${(row.deliveryStatus || '').toLowerCase()}`}>{row.deliveryStatus}</span>
                  </td>
                  <td>{row.errorMessage || '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="lk-detail-link lk-detail-icon-btn"
                      onClick={() => setSelectedRow(row)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lk-pagination">
          <span className="lk-pagination-info">Hiển thị {resultRows.length === 0 ? 0 : 1} - {resultRows.length} của {resultRows.length}</span>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>‹</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">›</button>
          </div>
          <select className="pagination-select" defaultValue="10">
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
          </select>
        </div>
      </div>

      <Dialog
        header="Chi tiết tin nhắn"
        visible={!!selectedRow}
        onHide={() => setSelectedRow(null)}
        className="lk-detail-dialog"
        dismissableMask
      >
        {selectedRow && (
          <div className="lk-detail-grid">
            <div className="lk-detail-item">
              <span className="lk-detail-label">MsgID</span>
              <span className="lk-detail-value">{selectedRow.requestId}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian nhận (request)</span>
              <span className="lk-detail-value">{selectedRow.createdAt}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian gửi</span>
              <span className="lk-detail-value">{selectedRow.sentTime}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian nhận DLR</span>
              <span className="lk-detail-value">{selectedRow.deliveryTime}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Nội dung tin nhắn</span>
              <span className="lk-detail-value">{selectedRow.content}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Khách hàng</span>
              <span className="lk-detail-value">{selectedRow.customerName}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Brandname</span>
              <span className="lk-detail-value">{selectedRow.brandName}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">SDT người nhận</span>
              <span className="lk-detail-value">{selectedRow.phone}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Nhà mạng</span>
              <span className="lk-detail-value">{selectedRow.telco}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Đối tác/ Vendor</span>
              <span className="lk-detail-value">{selectedRow.provider}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Trạng thái DLR</span>
              <span className={`lk-dlr-badge lk-dlr-${(selectedRow.deliveryStatus || '').toLowerCase()}`}>{selectedRow.deliveryStatus}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Response/ Lý do lỗi</span>
              <span className="lk-detail-value">{selectedRow.errorMessage || '-'}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default MessageLookupContent
