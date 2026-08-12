import httpClient, { authHeader, safeRequest } from './httpClient'

const LOOKUP_URL = '/lookUpMessageClient'

/**
 * Look up SMS history for the customer portal's message lookup screen. Requires a valid Bearer token.
 */
export async function lookupMessagesClient({
  token,
  content = '',
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
      LOOKUP_URL,
      { content, telcoId, timeType, startTime, endTime, page, size },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const rows = Array.isArray(data?.data?.data) ? data.data.data : []
  const total = typeof data?.data?.total === 'number' ? data.data.total : rows.length
  return { rows, total }
}
