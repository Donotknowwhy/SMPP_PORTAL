import httpClient, { authHeader, safeRequest } from './httpClient'

const SUMMARY_SMS_URL = '/reconciliationManagement/summarySms'
const SUMMARY_SMS_AUDIT_URL = '/reconciliationManagement/summarySms/auditLogs'

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
 * Mark a reconciliation summary row as verified.
 * Requires a valid Bearer token.
 */
export async function verifySummarySms(token, summaryId) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.patch(
      `${SUMMARY_SMS_URL}/${summaryId}/verify`,
      {},
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
