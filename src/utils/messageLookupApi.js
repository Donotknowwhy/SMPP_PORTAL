import httpClient, { authHeader, safeRequest } from './httpClient'

const LOOKUP_URL = '/lookUpMessageAdmin'

/**
 * Look up SMS/DLR history for the admin message lookup screen. Requires a valid Bearer token.
 */
export async function lookupMessages({
  token,
  phone = '',
  content = '',
  timeType = 0,
  startTime,
  endTime,
  requestId = '',
  brandNameId = 0,
  customerId = 0,
  telcoId = 0,
  providerId = 0,
  deliveryStatus = '',
  page = 0,
  size = 10,
  signal,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      LOOKUP_URL,
      {
        phone,
        content,
        timeType,
        startTime,
        endTime,
        requestId,
        brandNameId,
        customerId,
        telcoId,
        providerId,
        deliveryStatus,
        page,
        size,
      },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const rows = Array.isArray(data?.data) ? data.data : []
  return { rows, total: rows.length }
}
