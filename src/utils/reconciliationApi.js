import httpClient, { authHeader, safeRequest } from './httpClient'

const OUTPUT_CONTROL_URL = '/reconciliationManagement/outputControl'
const EXPORT_URL = '/reconciliationManagement/export'

/**
 * Fetch aggregated reconciliation stats (cost/price/sms/profit) for the given filters.
 * Requires a valid Bearer token.
 */
export async function getReconciliationStats({
  token,
  telcoId = 0,
  brandNameId = 0,
  providerId = 0,
  timeType = 0,
  startTime,
  endTime,
  status = '',
  signal,
}) {
  const { ok, status: httpStatus, statusText, data } = await safeRequest(
    httpClient.post(
      OUTPUT_CONTROL_URL,
      { telcoId, brandNameId, providerId, timeType, startTime, endTime, status },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${httpStatus}: ${statusText}`
    throw new Error(msg)
  }

  return {
    totalCost: data?.data?.totalCost ?? 0,
    totalPrice: data?.data?.totalPrice ?? 0,
    totalSms: data?.data?.totalSms ?? 0,
    profit: data?.data?.profit ?? 0,
  }
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
