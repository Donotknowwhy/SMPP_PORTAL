import httpClient, { authHeader, safeRequest } from './httpClient'

const GET_PRICING_BRANDNAME_URL = '/pricing/getPricingBrandName'
const GET_PRICING_AUDIT_LOG_URL = '/pricing/getPricingAuditLog'
const IMPORT_PRICING_URL = '/pricing/import'
const UPDATE_PRICING_URL = '/pricing/update'

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

/**
 * Fetch the one-based pricing audit log. Requires a valid Bearer token.
 */
export async function getPricingAuditLog({ token, page = 1, limit = 10, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(GET_PRICING_AUDIT_LOG_URL, { page, limit }, { headers: authHeader(token), signal }),
  )

  if (!ok) {
    throw new Error(data?.message || `HTTP ${status}: ${statusText}`)
  }

  if (data?.status !== undefined && data.status !== 1) {
    throw new Error(data?.message || `HTTP ${status}: ${statusText}`)
  }

  const payload = data?.data
  if (Array.isArray(payload)) return { rows: payload, total: payload.length, totalPages: 1 }

  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.content)
      ? payload.content
      : []
  const total = payload?.total ?? payload?.totalElements ?? rows.length
  const totalPages = payload?.totalPage ?? payload?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  return { rows, total, totalPages }
}

/**
 * Import a pricing workbook. The browser sets the multipart boundary automatically.
 */
export async function importPricing({ token, file, signal }) {
  const formData = new FormData()
  formData.append('file', file)

  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(IMPORT_PRICING_URL, formData, {
      headers: { ...authHeader(token), 'Content-Type': undefined },
      signal,
    }),
  )

  if (!ok || (data?.status !== undefined && data.status !== 1)) {
    throw new Error(data?.message || `HTTP ${status}: ${statusText}`)
  }

  return data
}

/**
 * Update import and sell prices for every telco attached to a brandname/provider.
 */
export async function updatePricing({ token, brandName, providerName, smsType, telcos, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.patch(
      UPDATE_PRICING_URL,
      { brandName, providerName, smsType, telcos },
      { headers: authHeader(token), signal },
    ),
  )

  if (!ok || (data?.status !== undefined && data.status !== 1)) {
    throw new Error(data?.message || `HTTP ${status}: ${statusText}`)
  }

  return data
}
