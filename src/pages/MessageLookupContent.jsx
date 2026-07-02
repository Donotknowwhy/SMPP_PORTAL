import { useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { FileSearch2, ChevronDown, ChevronUp, RefreshCw, Search, Eye } from 'lucide-react'
import {
  BRANDNAME_OPTIONS,
  CUSTOMER_OPTIONS,
  NETWORK_OPTIONS,
  PARTNER_OPTIONS,
  DLR_STATUS_OPTIONS,
  RESULT_ROWS,
} from '../constants/messageLookup'

function MessageLookupContent() {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [phone, setPhone] = useState('')
  const [content, setContent] = useState('')
  const [fromDate, setFromDate] = useState(new Date(2026, 5, 14, 0, 0))
  const [toDate, setToDate] = useState(new Date(2026, 5, 15, 23, 59))
  const [msgId, setMsgId] = useState('')
  const [brandname, setBrandname] = useState('all')
  const [customer, setCustomer] = useState('all')
  const [network, setNetwork] = useState('all')
  const [partner, setPartner] = useState('all')
  const [dlrStatus, setDlrStatus] = useState('all')
  const [selectedRow, setSelectedRow] = useState(null)

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
              onChange={(e) => setFromDate(e.value)}
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
              onChange={(e) => setToDate(e.value)}
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
            <button className="bn-btn-draft p-button">
              <RefreshCw size={16} /> Làm mới
            </button>
            <button className="db-export-btn">
              <Search size={16} /> Tìm kiếm
            </button>
          </div>
        </div>
        <p className="lk-advanced-hint">Mở rộng tìm kiếm theo điều kiện tra cứu khác</p>

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
                <Dropdown value={brandname} onChange={(e) => setBrandname(e.value)} options={BRANDNAME_OPTIONS} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Khách hàng</label>
                <Dropdown value={customer} onChange={(e) => setCustomer(e.value)} options={CUSTOMER_OPTIONS} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Nhà mạng</label>
                <Dropdown value={network} onChange={(e) => setNetwork(e.value)} options={NETWORK_OPTIONS} className="bn-dropdown" />
              </div>
              <div className="gw-form-field">
                <label>Đối tác/Vendor</label>
                <Dropdown value={partner} onChange={(e) => setPartner(e.value)} options={PARTNER_OPTIONS} className="bn-dropdown" />
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
            <span className="am-count-badge lk-result-badge">2.364 tin nhắn</span>
          </div>
        </div>

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
              {RESULT_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.msgId}</td>
                  <td>{row.sentAt}</td>
                  <td>{row.brandname}</td>
                  <td>{row.phone}</td>
                  <td>{row.network}</td>
                  <td>
                    <span className={`lk-dlr-badge lk-dlr-${row.dlr.toLowerCase()}`}>{row.dlr}</span>
                  </td>
                  <td>{row.response}</td>
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
          <span className="lk-pagination-info">Hiển thị 1 - 2 của 2</span>
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
              <span className="lk-detail-value">{selectedRow.msgId}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian nhận (request)</span>
              <span className="lk-detail-value">{selectedRow.requestAt}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian gửi</span>
              <span className="lk-detail-value">{selectedRow.sentAt}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Thời gian nhận DLR</span>
              <span className="lk-detail-value">{selectedRow.dlrAt}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Nội dung tin nhắn</span>
              <span className="lk-detail-value">{selectedRow.content}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Khách hàng</span>
              <span className="lk-detail-value">{selectedRow.customer}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Brandname</span>
              <span className="lk-detail-value">{selectedRow.brandname}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">SDT người nhận</span>
              <span className="lk-detail-value">{selectedRow.phone}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Nhà mạng</span>
              <span className="lk-detail-value">{selectedRow.network}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Đối tác/ Vendor</span>
              <span className="lk-detail-value">{selectedRow.partner}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Trạng thái DLR</span>
              <span className={`lk-dlr-badge lk-dlr-${selectedRow.dlr.toLowerCase()}`}>{selectedRow.dlr}</span>
            </div>
            <div className="lk-detail-item">
              <span className="lk-detail-label">Response/ Lý do lỗi</span>
              <span className="lk-detail-value">{selectedRow.response}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default MessageLookupContent
