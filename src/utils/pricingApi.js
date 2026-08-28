import httpClient, { authHeader, safeRequest } from './httpClient'

const GET_PRICING_BRANDNAME_URL = '/pricing/getPricingBrandName'

/**
 * Fetch the pricing/routing change history for brandnames. Requires a valid Bearer token.
 */
export async function getPricingBrandName({ token, page = 0, size = 10, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(GET_PRICING_BRANDNAME_URL, { page, size }, { headers: authHeader(token), signal }),
  )

  if (!ok) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  if (Array.isArray(data)) return { rows: data, total: data.length }

  if (data?.status !== undefined && data.status !== 1) {
    throw new Error(data?.message || `HTTP ${status}: ${statusText}`)
  }

  const payload = data?.data
  if (Array.isArray(payload)) return { rows: payload, total: payload.length }
  if (Array.isArray(payload?.data)) return { rows: payload.data, total: payload.total ?? payload.data.length }
  if (Array.isArray(payload?.content)) return { rows: payload.content, total: payload.totalElements ?? payload.content.length }
  return { rows: [], total: 0 }
}
