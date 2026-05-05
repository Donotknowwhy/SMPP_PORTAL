import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { getDefaultSmsApiUrl, sendSmsRequest } from '../utils/smsApi'

const REQUIRED_HEADERS = ['phone', 'content']
const DEFAULT_BRANDNAME = 'GAPIT'
const DEFAULT_TYPE = 'CSKH'

const normalizeHeader = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '')

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

const normalizePhone = (value) => {
  const rawValue = normalizeCellValue(value).replace(/[^\d+]/g, '')

  if (!rawValue) {
    return ''
  }

  if (rawValue.startsWith('+')) {
    return rawValue
  }

  const digitsOnly = rawValue.replace(/\D/g, '')

  // Excel often removes the leading zero for local 10-digit phone numbers.
  if (digitsOnly.length === 9 && !digitsOnly.startsWith('0')) {
    return `0${digitsOnly}`
  }

  return digitsOnly
}

function SmsRequestSection() {
  const apiUrl = getDefaultSmsApiUrl()

  const [singleForm, setSingleForm] = useState({
    phone: '',
    content: '',
  })
  const [singleSending, setSingleSending] = useState(false)
  const [singleResult, setSingleResult] = useState(null)

  const [excelFileName, setExcelFileName] = useState('')
  const [excelRows, setExcelRows] = useState([])
  const [invalidRowsCount, setInvalidRowsCount] = useState(0)
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, success: 0, failed: 0 })
  const [bulkResults, setBulkResults] = useState([])
  const [excelError, setExcelError] = useState('')

  const previewRows = useMemo(() => excelRows.slice(0, 5), [excelRows])

  const onSingleInputChange = (field, value) => {
    setSingleForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSingleSend = async () => {
    const phone = normalizePhone(singleForm.phone)
    const content = normalizeCellValue(singleForm.content)

    if (!phone || !content) {
      setSingleResult({
        ok: false,
        message: 'Vui long nhap day du phone va content.',
      })
      return
    }

    setSingleSending(true)
    setSingleResult(null)

    try {
      const payload = {
        phone,
        content,
        brandname: DEFAULT_BRANDNAME,
        type: DEFAULT_TYPE,
      }

      const result = await sendSmsRequest(payload, apiUrl.trim())
      setSingleResult({
        ok: true,
        message: result.data?.message || 'Gui SMS thanh cong.',
        payload,
        response: result.data,
      })
    } catch (error) {
      setSingleResult({
        ok: false,
        message: error.message || 'Gui SMS that bai.',
        response: error.details || null,
      })
    } finally {
      setSingleSending(false)
    }
  }

  const handleExcelFileChange = async (event) => {
    const inputElement = event.target
    const file = inputElement.files?.[0]
    setExcelError('')
    setBulkResults([])
    setBulkProgress({ done: 0, total: 0, success: 0, failed: 0 })

    if (!file) {
      setExcelFileName('')
      setExcelRows([])
      setInvalidRowsCount(0)
      inputElement.value = ''
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]

      if (!firstSheetName) {
        throw new Error('File Excel khong co du lieu.')
      }

      const worksheet = workbook.Sheets[firstSheetName]
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false })

      if (rawRows.length === 0) {
        throw new Error('File Excel rỗng. Vui lòng thêm dữ liệu phone và content.')
      }

      const normalizedHeaders = Object.keys(rawRows[0]).map(normalizeHeader)
      const missingHeaders = REQUIRED_HEADERS.filter((header) => !normalizedHeaders.includes(header))

      if (missingHeaders.length > 0) {
        throw new Error('Template Excel phải có đúng 2 cột phone và content.')
      }

      const parsedRows = rawRows
        .map((rawRow, index) => {
          const normalizedRow = Object.entries(rawRow).reduce((acc, [key, value]) => {
            acc[normalizeHeader(key)] = normalizeCellValue(value)
            return acc
          }, {})

          const phone = normalizePhone(normalizedRow.phone)
          const content = normalizeCellValue(normalizedRow.content)

          return {
            rowNumber: index + 2,
            phone,
            content,
            valid: Boolean(phone && content),
          }
        })

      const validRows = parsedRows.filter((row) => row.valid)
      const invalidRows = parsedRows.length - validRows.length

      setExcelFileName(file.name)
      setExcelRows(validRows)
      setInvalidRowsCount(invalidRows)

      if (validRows.length === 0) {
        setExcelError('Không tìm thấy dòng hợp lệ. Kiểm tra lại cột phone và content.')
      }
    } catch (error) {
      setExcelFileName(file.name)
      setExcelRows([])
      setInvalidRowsCount(0)
      setExcelError(error.message || 'Khong the doc file Excel.')
    } finally {
      // Allow selecting the same file again to force re-parse and refresh the list.
      inputElement.value = ''
    }
  }

  const handleBulkSend = async () => {
    if (excelRows.length === 0) {
      return
    }

    setBulkSending(true)
    setBulkResults([])

    let success = 0
    let failed = 0
    const results = []

    setBulkProgress({
      done: 0,
      total: excelRows.length,
      success: 0,
      failed: 0,
    })

    for (let index = 0; index < excelRows.length; index += 1) {
      const row = excelRows[index]
      const payload = {
        phone: row.phone,
        content: row.content,
        brandname: DEFAULT_BRANDNAME,
        type: DEFAULT_TYPE,
      }

      try {
        const result = await sendSmsRequest(payload, apiUrl.trim())
        success += 1
        results.push({
          rowNumber: row.rowNumber,
          phone: row.phone,
          ok: true,
          message: result.data?.message || 'SUCCESS',
          code: result.data?.code || '',
        })
      } catch (error) {
        failed += 1
        results.push({
          rowNumber: row.rowNumber,
          phone: row.phone,
          ok: false,
          message: error.message || 'FAILED',
          code: error.details?.code || '',
        })
      }

      setBulkProgress({
        done: index + 1,
        total: excelRows.length,
        success,
        failed,
      })
      setBulkResults([...results])
    }

    setBulkSending(false)
  }

  const progressPercent =
    bulkProgress.total > 0 ? Math.round((bulkProgress.done / bulkProgress.total) * 100) : 0

  const [activeTab, setActiveTab] = useState('single')

  return (
    <div className="sms-request-section">
      <div className="section-title-row">
        <h2>Gửi SMS qua API</h2>
      </div>

      {/* Tab bar */}
      <div className="sms-tabs">
        <button
          className={`sms-tab-btn${activeTab === 'single' ? ' active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Gửi đơn (nhập tay)
        </button>
        <button
          className={`sms-tab-btn${activeTab === 'bulk' ? ' active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          Gửi hàng loạt từ Excel
        </button>
      </div>

      {/* Tab content */}
      <div className="sms-tab-content">

        {activeTab === 'single' && (
          <div className="sms-card">
            <div className="sms-field-grid sms-single-grid">
              <label>
                Phone
                <input
                  type="text"
                  value={singleForm.phone}
                  onChange={(event) => onSingleInputChange('phone', event.target.value)}
                  placeholder="0707123583"
                />
              </label>
            </div>

            <div className="sms-helper-text">Brandname: {DEFAULT_BRANDNAME} | Type: {DEFAULT_TYPE}</div>

            <label className="sms-textarea-label">
              Content
              <textarea
                rows={4}
                value={singleForm.content}
                onChange={(event) => onSingleInputChange('content', event.target.value)}
                placeholder="Xin chao. Day la tin nhan de mo."
              />
            </label>

            <button className="btn-simulate" onClick={handleSingleSend} disabled={singleSending}>
              {singleSending ? 'Đang gửi...' : 'Gửi SMS'}
            </button>

            {singleResult && (
              <div className={`sms-result-box ${singleResult.ok ? 'ok' : 'error'}`}>
                <strong>{singleResult.ok ? 'Thành công' : 'Thất bại'}:</strong> {singleResult.message}
                {singleResult.response && <pre>{JSON.stringify(singleResult.response, null, 2)}</pre>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="sms-card">
            <div className="sms-template-actions">
              <a className="sms-template-link" href="/templates/sms-template.xlsx" download>
                Tải template Excel mẫu (phone, content)
              </a>
            </div>

            <label className="sms-file-input">
              Chọn file Excel (.xlsx, .xls)
              <input
                type="file"
                accept=".xlsx,.xls"
                onClick={(event) => {
                  event.currentTarget.value = ''
                }}
                onChange={handleExcelFileChange}
              />
            </label>

            <div className="sms-note">
              File chỉ cần 2 cột: <strong>phone</strong> và <strong>content</strong>. Hệ thống sẽ gửi tuần tự từng dòng một.
            </div>

            <div className="sms-helper-text">Nếu Excel làm mất số 0 đầu số, hệ thống sẽ tự thêm lại trước khi gửi.</div>

            <div className="sms-helper-text">Brandname: {DEFAULT_BRANDNAME} | Type: {DEFAULT_TYPE}</div>

            {excelFileName && (
              <div className="sms-file-meta">
                File: {excelFileName} | Hợp lệ: {excelRows.length} dòng | Bỏ qua: {invalidRowsCount} dòng
              </div>
            )}

            {excelError && <div className="sms-result-box error">{excelError}</div>}

            {previewRows.length > 0 && (
              <div className="sms-preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Dòng</th>
                      <th>Phone</th>
                      <th>Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td>{row.rowNumber}</td>
                        <td>{row.phone}</td>
                        <td>{row.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="btn-simulate" onClick={handleBulkSend} disabled={bulkSending || excelRows.length === 0}>
              {bulkSending ? `Đang gửi... (${bulkProgress.done}/${bulkProgress.total})` : 'Gửi theo file Excel'}
            </button>

            {bulkProgress.total > 0 && (
              <div className="sms-progress-wrap">
                <div className="sms-progress-bar">
                  <div className="sms-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="sms-progress-text">
                  {bulkProgress.done}/{bulkProgress.total} | Thành công: {bulkProgress.success} | Thất bại: {bulkProgress.failed}
                </div>
              </div>
            )}

            {bulkResults.length > 0 && (
              <div className="sms-bulk-results">
                <table>
                  <thead>
                    <tr>
                      <th>Dòng</th>
                      <th>Phone</th>
                      <th>Trạng thái</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.slice(-20).map((item) => (
                      <tr key={`${item.rowNumber}-${item.phone}`}>
                        <td>{item.rowNumber}</td>
                        <td>{item.phone}</td>
                        <td className={item.ok ? 'status-ok' : 'status-error'}>{item.ok ? 'SUCCESS' : 'FAILED'}</td>
                        <td>{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default SmsRequestSection
