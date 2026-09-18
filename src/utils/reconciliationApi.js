import httpClient, { authHeader, safeRequest } from './httpClient'

const SUMMARY_SMS_URL = '/reconciliationManagement/summarySms'
const SUMMARY_SMS_AUDIT_URL = '/reconciliationManagement/summarySms/auditLogs'
const EXPORT_URL = '/reconciliationManagement/export'

/**
 * Fetch paginated SMS reconciliation summary rows.
 * Requires a valid Bearer token.
 */
export async function getSummarySms({
  token,
  page = 1,
  limit = 10,
  timeType = 0,
  startTime,
  endTime,
  telcoId,
  brandNameId,
  providerId,
  status,
  signal,
}) {
  const body = { page, limit, timeType }
  if (timeType === 1) {
    if (startTime) body.startTime = startTime
    if (endTime) body.endTime = endTime
  }
  if (telcoId) body.telcoId = telcoId
  if (brandNameId) body.brandNameId = brandNameId
  if (providerId) body.providerId = providerId
  if (status) body.status = status

  const { ok, status: httpStatus, statusText, data } = await safeRequest(
    httpClient.post(SUMMARY_SMS_URL, body, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${httpStatus}: ${statusText}`
    throw new Error(msg)
  }

  const payload = data?.data
  const rows = Array.isArray(payload?.data) ? payload.data : []
  const total = typeof payload?.total === 'number' ? payload.total : rows.length
  const totalPage = typeof payload?.totalPage === 'number'
    ? payload.totalPage
    : Math.max(1, Math.ceil(total / limit) || 1)

  return { rows, total, page: payload?.page ?? page, limit: payload?.limit ?? limit, totalPage }
}

/**
 * Mark selected reconciliation summary rows as verified with an optional note.
 * Requires a valid Bearer token.
 */
export async function verifySummarySms({ token, ids, note }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.patch(
      `${SUMMARY_SMS_URL}/verify`,
      { ids, note },
      { headers: authHeader(token) },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Fetch paginated reconciliation audit history.
 * Requires a valid Bearer token.
 */
export async function getSummarySmsAuditLogs({ token, page = 1, limit = 10, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      SUMMARY_SMS_AUDIT_URL,
      { page, limit },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const payload = data?.data
  const rows = Array.isArray(payload?.data) ? payload.data : []
  const total = typeof payload?.total === 'number' ? payload.total : rows.length
  const totalPage = typeof payload?.totalPage === 'number'
    ? payload.totalPage
    : Math.max(1, Math.ceil(total / limit) || 1)

  return { rows, total, page: payload?.page ?? page, limit: payload?.limit ?? limit, totalPage }
}

/**
 * Export the reconciliation report as an Excel file. Requires a valid Bearer token.
 * Returns { blob, filename } for triggering a browser download.
 */
export async function exportReconciliationReport({ token, timeType = 0, startTime, endTime }) {
  const { ok, data, headers } = await safeRequest(
    httpClient.post(
      EXPORT_URL,
      { timeType, startTime, endTime },
      { headers: authHeader(token), responseType: 'arraybuffer' },
    ),
  )

  if (!ok) {
    let msg = 'Không xuất được báo cáo đối soát.'
    try {
      const parsed = JSON.parse(new TextDecoder().decode(data))
      msg = parsed?.message || msg
    } catch {
      // not JSON, keep default message
    }
    throw new Error(msg)
  }

  const bytes = new Uint8Array(data)

  // The backend appends a trailing `{"status":...}` JSON blob after the actual
  // Excel file bytes in the same response body; strip it so the downloaded
  // .xlsx isn't corrupted.
  const marker = new TextEncoder().encode('{"status"')
  let cutIndex = bytes.length
  searchLoop: for (let i = bytes.length - marker.length; i >= 0; i--) {
    for (let j = 0; j < marker.length; j++) {
      if (bytes[i + j] !== marker[j]) continue searchLoop
    }
    cutIndex = i
    break
  }

  if (cutIndex === 0) {
    const msg = new TextDecoder().decode(bytes)
    let parsedMsg = 'Không xuất được báo cáo đối soát.'
    try {
      parsedMsg = JSON.parse(msg)?.message || parsedMsg
    } catch {
      // ignore, keep default message
    }
    throw new Error(parsedMsg)
  }

  const blob = new Blob([bytes.slice(0, cutIndex)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const disposition = headers?.['content-disposition'] || ''
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  const filename = match ? decodeURIComponent(match[1]) : `reconciliation-report-${Date.now()}.xlsx`

  return { blob, filename }
}
