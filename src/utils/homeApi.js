import httpClient, { authHeader, safeRequest } from './httpClient'

const SMS_TRAFFIC_URL = '/dashboard/smsTraffic'
const DELIVER_STATUS_URL = '/dashboard/deliverStatus'
const TOTAL_SMS_OUTPUT_URL = '/dashboard/totalSmsOutput'
const EXPORT_SMS_OUTPUT_URL = '/dashboard/exportSmsOutput'
const CLIENT_OVERVIEW_URL = '/dashboard/client/overView'
const CLIENT_DAILY_OUTPUT_URL = '/dashboard/client/dailyOutput'
const CLIENT_DELIVERY_STATUS_URL = '/dashboard/client/deliveryStatus'
const CLIENT_DETAIL_BY_DAY_URL = '/dashboard/client/detailByDay'

/**
 * Fetch SMS traffic broken down by provider -> telco (success/failed counts).
 * Requires a valid Bearer token.
 */
export async function getSmsTraffic({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      SMS_TRAFFIC_URL,
      { brandNameId, timeType, startTime, endTime },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const list = data?.data?.dataSmsTrafficList
  return Array.isArray(list) ? list : []
}

/**
 * Fetch SMS delivery status rates (success/failed/queued/processing).
 * Requires a valid Bearer token.
 */
export async function getDeliveryStatus({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      DELIVER_STATUS_URL,
      { brandNameId, timeType, startTime, endTime },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return {
    successRate: data?.data?.successRate ?? 0,
    failedRate: data?.data?.failedRate ?? 0,
    queuedRate: data?.data?.queuedRate ?? 0,
    processRate: data?.data?.processRate ?? 0,
  }
}

/**
 * Fetch the paginated total SMS output report (per provider/telco/brandname/customer).
 * Requires a valid Bearer token.
 */
export async function getTotalSmsOutput({
  token,
  username = null,
  brandName = null,
  providerId = 0,
  telcoId = 0,
  timeType = 0,
  startTime,
  endTime,
  page = 0,
  size = 10,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      TOTAL_SMS_OUTPUT_URL,
      { username, brandName, providerId, telcoId, timeType, startTime, endTime, page, size },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const payload = data?.data
  const rows = Array.isArray(payload?.data) ? payload.data : []
  const total = payload?.total ?? rows.length

  return { rows, total }
}

/**
 * Fetch the client dashboard overview totals (sent/success/failed/cost).
 * Requires a valid Bearer token.
 */
export async function getClientOverview({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CLIENT_OVERVIEW_URL,
      { timeType, startTime, endTime, brandNameId },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return {
    totalSms: data?.data?.totalSms ?? 0,
    totalSmsFailed: data?.data?.totalSmsFailed ?? 0,
    totalSmsSuccess: data?.data?.totalSmsSuccess ?? 0,
    totalCost: data?.data?.totalCost ?? 0,
  }
}

/**
 * Fetch the client dashboard daily output (success/failed SMS count per day).
 * Requires a valid Bearer token.
 */
export async function getClientDailyOutput({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CLIENT_DAILY_OUTPUT_URL,
      { timeType, startTime, endTime, brandNameId },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return Array.isArray(data?.data) ? data.data : []
}

/**
 * Fetch the client dashboard delivery status rates (success/failed/queued/processing).
 * Requires a valid Bearer token.
 */
export async function getClientDeliveryStatus({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CLIENT_DELIVERY_STATUS_URL,
      { timeType, startTime, endTime, brandNameId },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return {
    successRate: data?.data?.successRate ?? 0,
    failedRate: data?.data?.failedRate ?? 0,
    queuedRate: data?.data?.queuedRate ?? 0,
    processRate: data?.data?.processRate ?? 0,
  }
}

/**
 * Fetch the client dashboard detail-by-day report (per-telco breakdown per brandname/day).
 * Requires a valid Bearer token.
 */
export async function getClientDetailByDay({
  token,
  brandNameId = 0,
  timeType = 0,
  startTime,
  endTime,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CLIENT_DETAIL_BY_DAY_URL,
      { timeType, startTime, endTime, brandNameId },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return Array.isArray(data?.data) ? data.data : []
}

/**
 * Export the total SMS output report as an Excel file. Requires a valid Bearer token.
 * Returns { blob, filename } for triggering a browser download.
 */
export async function exportTotalSmsOutput(token) {
  const { ok, data, headers } = await safeRequest(
    httpClient.get(EXPORT_SMS_OUTPUT_URL, { headers: authHeader(token), responseType: 'arraybuffer' }),
  )

  if (!ok) {
    let msg = 'Không xuất được báo cáo tổng sản lượng.'
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
    let parsedMsg = 'Không xuất được báo cáo tổng sản lượng.'
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
  const filename = match ? decodeURIComponent(match[1]) : `total-sms-output-${Date.now()}.xlsx`

  return { blob, filename }
}
