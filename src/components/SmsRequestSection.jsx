import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { getDefaultSmsApiUrl, sendSmsRequest } from '../utils/smsApi'

const PHONE_HEADERS = ['phone', 'sdt', 'sodienthoai', 'msisdn']
const CONTENT_HEADERS = ['content', 'message', 'noidung', 'sms', 'text']
const BRAND_HEADERS = ['brandname', 'brand']
const TYPE_HEADERS = ['type']

const normalizeHeader = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '')

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

const normalizePhone = (value) => normalizeCellValue(value).replace(/[^\d+]/g, '')

const pickByHeaders = (row, headers) => {
  for (const header of headers) {
    if (row[header]) {
      return row[header]
    }
  }

  return ''
}

function SmsRequestSection() {
  const [apiUrl, setApiUrl] = useState(getDefaultSmsApiUrl())

  const [singleForm, setSingleForm] = useState({
    phone: '',
    content: '',
    brandname: 'GAPIT',
    type: 'CSKH',
  })
  const [singleSending, setSingleSending] = useState(false)
  const [singleResult, setSingleResult] = useState(null)

  const [bulkDefaults, setBulkDefaults] = useState({
    brandname: 'GAPIT',
    type: 'CSKH',
  })
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

  const onBulkDefaultChange = (field, value) => {
    setBulkDefaults((prev) => ({ ...prev, [field]: value }))
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
        brandname: normalizeCellValue(singleForm.brandname),
        type: normalizeCellValue(singleForm.type),
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
    const file = event.target.files?.[0]
    setExcelError('')
    setBulkResults([])
    setBulkProgress({ done: 0, total: 0, success: 0, failed: 0 })

    if (!file) {
      setExcelFileName('')
      setExcelRows([])
      setInvalidRowsCount(0)
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
        throw new Error('File Excel rong. Vui long them du lieu phone va content.')
      }

      const parsedRows = rawRows
        .map((rawRow, index) => {
          const normalizedRow = Object.entries(rawRow).reduce((acc, [key, value]) => {
            acc[normalizeHeader(key)] = normalizeCellValue(value)
            return acc
          }, {})

          const phone = normalizePhone(pickByHeaders(normalizedRow, PHONE_HEADERS))
          const content = normalizeCellValue(pickByHeaders(normalizedRow, CONTENT_HEADERS))
          const brandname =
            normalizeCellValue(pickByHeaders(normalizedRow, BRAND_HEADERS)) ||
            normalizeCellValue(bulkDefaults.brandname)
          const type =
            normalizeCellValue(pickByHeaders(normalizedRow, TYPE_HEADERS)) ||
            normalizeCellValue(bulkDefaults.type)

          return {
            rowNumber: index + 2,
            phone,
            content,
            brandname,
            type,
            valid: Boolean(phone && content),
          }
        })

      const validRows = parsedRows.filter((row) => row.valid)
      const invalidRows = parsedRows.length - validRows.length

      setExcelFileName(file.name)
      setExcelRows(validRows)
      setInvalidRowsCount(invalidRows)

      if (validRows.length === 0) {
        setExcelError('Khong tim thay dong hop le. Kiem tra cot phone va content trong file Excel.')
      }
    } catch (error) {
      setExcelFileName(file.name)
      setExcelRows([])
      setInvalidRowsCount(0)
      setExcelError(error.message || 'Khong the doc file Excel.')
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
        brandname: row.brandname,
        type: row.type,
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

  return (
    <div className="sms-request-section">
      <div className="section-title-row">
        <h2>Gui SMS qua API</h2>
        <span className="section-badge">2 che do: Gui don / Gui tu Excel</span>
      </div>

      <div className="sms-api-config">
        <label htmlFor="sms-api-url">API URL</label>
        <input
          id="sms-api-url"
          type="text"
          value={apiUrl}
          onChange={(event) => setApiUrl(event.target.value)}
          placeholder="https://sms.skyfi.com.vn/api/v1/sms/send"
        />
      </div>

      <div className="sms-request-grid">
        <div className="sms-card">
          <h3>Gui don (nhap tay)</h3>

          <div className="sms-field-grid">
            <label>
              Phone
              <input
                type="text"
                value={singleForm.phone}
                onChange={(event) => onSingleInputChange('phone', event.target.value)}
                placeholder="0382741633"
              />
            </label>

            <label>
              Brandname
              <input
                type="text"
                value={singleForm.brandname}
                onChange={(event) => onSingleInputChange('brandname', event.target.value)}
                placeholder="GAPIT"
              />
            </label>

            <label>
              Type
              <input
                type="text"
                value={singleForm.type}
                onChange={(event) => onSingleInputChange('type', event.target.value)}
                placeholder="CSKH"
              />
            </label>
          </div>

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
            {singleSending ? 'Dang gui...' : 'Gui SMS'}
          </button>

          {singleResult && (
            <div className={`sms-result-box ${singleResult.ok ? 'ok' : 'error'}`}>
              <strong>{singleResult.ok ? 'Thanh cong' : 'That bai'}:</strong> {singleResult.message}
              {singleResult.response && <pre>{JSON.stringify(singleResult.response, null, 2)}</pre>}
            </div>
          )}
        </div>

        <div className="sms-card">
          <h3>Gui hang loat tu Excel</h3>

          <div className="sms-field-grid">
            <label>
              Brandname mac dinh
              <input
                type="text"
                value={bulkDefaults.brandname}
                onChange={(event) => onBulkDefaultChange('brandname', event.target.value)}
              />
            </label>

            <label>
              Type mac dinh
              <input
                type="text"
                value={bulkDefaults.type}
                onChange={(event) => onBulkDefaultChange('type', event.target.value)}
              />
            </label>
          </div>

          <label className="sms-file-input">
            Chon file Excel (.xlsx, .xls)
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelFileChange} />
          </label>

          <div className="sms-note">
            Yeu cau toi thieu: cot <strong>phone</strong> va <strong>content</strong>. Co the dung ten cot thay the: sdt, sodienthoai, message, noidung.
          </div>

          {excelFileName && (
            <div className="sms-file-meta">
              File: {excelFileName} | Hop le: {excelRows.length} dong | Bo qua: {invalidRowsCount} dong
            </div>
          )}

          {excelError && <div className="sms-result-box error">{excelError}</div>}

          {previewRows.length > 0 && (
            <div className="sms-preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Dong</th>
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
            {bulkSending ? `Dang gui... (${bulkProgress.done}/${bulkProgress.total})` : 'Gui theo file Excel'}
          </button>

          {bulkProgress.total > 0 && (
            <div className="sms-progress-wrap">
              <div className="sms-progress-bar">
                <div className="sms-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="sms-progress-text">
                {bulkProgress.done}/{bulkProgress.total} | Thanh cong: {bulkProgress.success} | That bai: {bulkProgress.failed}
              </div>
            </div>
          )}

          {bulkResults.length > 0 && (
            <div className="sms-bulk-results">
              <table>
                <thead>
                  <tr>
                    <th>Dong</th>
                    <th>Phone</th>
                    <th>Trang thai</th>
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
      </div>
    </div>
  )
}

export default SmsRequestSection
