import { useMemo, useRef, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { toast } from 'react-toastify'
import { Upload, Download, Save, Info, X } from 'lucide-react'
import {
  BRANDNAME_OPTIONS,
  CAMPAIGN_MESSAGE_TYPES,
  MESSAGE_VARIABLES,
  SMS_SEGMENTS,
} from '../constants/customerPortal'

const NAME_MAX = 100
const DESCRIPTION_MAX = 255
const CONTENT_MAX = 255

function currentSmsSegment(charCount) {
  if (charCount === 0) return null
  return SMS_SEGMENTS.find((seg) => charCount <= seg.limit) || SMS_SEGMENTS[SMS_SEGMENTS.length - 1]
}

function CustomerCampaignCreateContent() {
  const [campaignName, setCampaignName] = useState('')
  const [brandname, setBrandname] = useState(BRANDNAME_OPTIONS[0].value)
  const [messageType, setMessageType] = useState('cskh')
  const [description, setDescription] = useState('')

  const [uploadedFileName, setUploadedFileName] = useState('')
  const fileInputRef = useRef(null)

  const [phoneNumbers, setPhoneNumbers] = useState('')
  const [content, setContent] = useState('')
  const [variableToInsert, setVariableToInsert] = useState('')

  const [scheduleMode, setScheduleMode] = useState('now')
  const [scheduleDate, setScheduleDate] = useState(null)
  const [scheduleTime, setScheduleTime] = useState(null)

  const charCount = content.length
  const activeSegment = useMemo(() => currentSmsSegment(charCount), [charCount])

  const handleChooseFile = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setUploadedFileName(file ? file.name : '')
  }

  const handleDownloadTemplate = () => {
    toast.info('Chức năng tải template đang được phát triển.')
  }

  const handleInsertVariable = (e) => {
    const value = e.target.value
    if (value) setContent((prev) => `${prev}${value}`.slice(0, CONTENT_MAX))
    setVariableToInsert('')
  }

  const handleSaveDraft = () => {
    toast.success('Đã lưu nháp chiến dịch.')
  }

  const handleCancel = () => {
    setCampaignName('')
    setDescription('')
    setUploadedFileName('')
    setPhoneNumbers('')
    setContent('')
    setScheduleMode('now')
    setScheduleDate(null)
    setScheduleTime(null)
  }

  const handleContinue = () => {
    if (!campaignName.trim()) {
      toast.warn('Vui lòng nhập tên chiến dịch.')
      return
    }
    if (!phoneNumbers.trim()) {
      toast.warn('Vui lòng nhập số điện thoại nhận tin.')
      return
    }
    toast.success('Đã lưu thông tin chiến dịch, tiếp tục sang bước tiếp theo.')
  }

  return (
    <div className="cc-page">
      <div className="cc-page-header">
        <h2 className="cc-page-title">Tạo chiến dịch gửi tin</h2>
        <p className="cc-page-subtitle">Thiết lập nội dung, người nhận và thời gian gửi cho chiến dịch SMS</p>
      </div>

      <div className="cc-layout">
        <div className="cc-main">
          {/* 1. Thông tin chiến dịch */}
          <div className="gw-card cc-section">
            <h3 className="cc-section-title">1. Thông tin chiến dịch</h3>

            <div className="cc-grid-3">
              <div className="gw-form-field">
                <label>Tên chiến dịch <span className="gw-required">*</span></label>
                <input
                  type="text"
                  value={campaignName}
                  maxLength={NAME_MAX}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Nhập tên chiến dịch"
                />
                <span className="cc-char-count">{campaignName.length}/{NAME_MAX}</span>
              </div>

              <div className="gw-form-field">
                <label>Chọn brandname <span className="gw-required">*</span></label>
                <select value={brandname} onChange={(e) => setBrandname(e.target.value)}>
                  {BRANDNAME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="gw-form-field">
                <label>Loại tin nhắn</label>
                <div className="cc-radio-row">
                  {CAMPAIGN_MESSAGE_TYPES.map((t) => (
                    <label key={t.value} className="cc-radio-option">
                      <input
                        type="radio"
                        name="messageType"
                        value={t.value}
                        checked={messageType === t.value}
                        onChange={() => setMessageType(t.value)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="gw-form-field cc-field-block">
              <label>Mục đích/ Mô tả <span className="cc-optional">(không bắt buộc)</span></label>
              <textarea
                value={description}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chiến dịch..."
                rows={3}
              />
              <span className="cc-char-count cc-char-count-right">{description.length}/{DESCRIPTION_MAX}</span>
            </div>
          </div>

          {/* 2. Người nhận & Nội dung */}
          <div className="gw-card cc-section">
            <h3 className="cc-section-title">2. Người nhận &amp; Nội dung</h3>

            <div className="cc-upload-row">
              <button type="button" className="cc-upload-btn" onClick={handleChooseFile}>
                <Upload size={16} />
                Upload file Excel/CSV
                <span className="cc-upload-hint">Gửi SMS theo list điện thoại và nội dung</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="cc-hidden-input"
                onChange={handleFileChange}
              />
              <button type="button" className="cc-template-btn" onClick={handleDownloadTemplate}>
                Tải template <Download size={16} />
              </button>
            </div>
            {uploadedFileName && (
              <div className="cc-uploaded-file">
                {uploadedFileName}
                <button type="button" onClick={() => setUploadedFileName('')} aria-label="Xóa tệp">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="gw-form-field cc-field-block">
              <label>Số điện thoại nhận <span className="gw-required">*</span></label>
              <textarea
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                placeholder="Nhập số điện thoại"
                rows={2}
              />
              <span className="cc-field-hint">Nhập 1 hoặc nhiều số điện thoại (VD: 0701891508; 0701891505;...)</span>
            </div>

            <div className="gw-form-field cc-field-block">
              <label>Nội dung tin nhắn</label>
              <textarea
                value={content}
                maxLength={CONTENT_MAX}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung tin nhắn..."
                rows={4}
              />
              <div className="cc-content-toolbar">
                <select
                  className="cc-variable-select"
                  value={variableToInsert}
                  onChange={handleInsertVariable}
                >
                  <option value="">{'{} Chèn biến'}</option>
                  {MESSAGE_VARIABLES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label} {v.value}</option>
                  ))}
                </select>
                <span className="cc-char-count">{charCount}/{CONTENT_MAX}</span>
              </div>
            </div>

            <div className="cc-warning-box">
              <Info size={15} />
              Tin nhắn sẽ được gửi trực tiếp đến số điện thoại nhập ở trên
            </div>
          </div>

          {/* 3. Thiết lập thời gian */}
          <div className="gw-card cc-section">
            <h3 className="cc-section-title">3. Thiết lập thời gian</h3>

            <div className="cc-radio-row cc-schedule-radio">
              <label className="cc-radio-option">
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={scheduleMode === 'now'}
                  onChange={() => setScheduleMode('now')}
                />
                Gửi ngay
              </label>
              <label className="cc-radio-option">
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={scheduleMode === 'scheduled'}
                  onChange={() => setScheduleMode('scheduled')}
                />
                Hẹn giờ gửi
              </label>
            </div>

            <ul className="cc-schedule-notes">
              <li>Thời điểm gửi phải cách hiện tại tối thiểu 15 phút</li>
              <li>Có thể sửa hoặc hủy lịch gửi trước giờ chạy tối thiểu 5 phút</li>
            </ul>

            <div className="cc-schedule-fields">
              <div className="gw-form-field">
                <label>Ngày gửi</label>
                <Calendar
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.value)}
                  dateFormat="dd/mm/yy"
                  placeholder="DD/MM/YYYY"
                  showIcon
                  disabled={scheduleMode !== 'scheduled'}
                  className="db-calendar"
                />
              </div>
              <div className="gw-form-field">
                <label>Giờ gửi</label>
                <Calendar
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.value)}
                  timeOnly
                  hourFormat="24"
                  placeholder="--:--"
                  showIcon
                  disabled={scheduleMode !== 'scheduled'}
                  className="db-calendar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phân tích nội dung */}
        <aside className="cc-aside gw-card">
          <h3 className="cc-section-title">Phân tích nội dung</h3>

          <div className="cc-analysis-row">
            <span>Ký tự:</span>
            <span className="cc-analysis-value">{charCount}/160</span>
          </div>
          <div className="cc-analysis-row">
            <span>Dự kiến:</span>
            <span className="cc-analysis-value">{charCount}/160</span>
          </div>

          <div className="cc-sms-badges">
            {SMS_SEGMENTS.map((seg) => (
              <div
                key={seg.id}
                className={`cc-sms-badge${activeSegment?.id === seg.id ? ' cc-sms-badge-active' : ''}`}
              >
                <span className="cc-sms-badge-label">{seg.label}</span>
                <span className="cc-sms-badge-limit">{seg.limit} ký tự</span>
              </div>
            ))}
          </div>

          <div className="cc-warning-box cc-warning-box-tight">
            <Info size={14} />
            Tiếng việt không dấu, Ký tự đặc biệt có thể được tính 2 ký tự
          </div>

          <div className="cc-preview">
            <h4 className="cc-preview-title">Xem trước tin nhắn</h4>
            {content.trim() ? (
              <p className="cc-preview-content">{content}</p>
            ) : (
              <>
                <p className="cc-preview-placeholder">Nội dung tin nhắn của bạn sẽ hiển thị tại đây.</p>
                <p className="cc-preview-sample">{'{dữ liệu mẫu}'}</p>
              </>
            )}
          </div>
        </aside>
      </div>

      <div className="cc-actions">
        <button type="button" className="bn-btn-draft p-button" onClick={handleSaveDraft}>
          <Save size={16} /> Lưu nháp
        </button>
        <div className="cc-actions-right">
          <button type="button" className="cc-btn-cancel" onClick={handleCancel}>Hủy</button>
          <button type="button" className="db-export-btn gw-save-btn" onClick={handleContinue}>Tiếp tục</button>
        </div>
      </div>
    </div>
  )
}

export default CustomerCampaignCreateContent
