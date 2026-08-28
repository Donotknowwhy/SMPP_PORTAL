import httpClient, { authHeader, safeRequest } from './httpClient'

const CREATE_URL = '/brandName/create'
const GET_LIST_URL = '/brandName/getList'

/**
 * Fetch the declared brandname list. Requires a valid Bearer token.
 */
export async function getBrandnameList(token, signal) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.get(GET_LIST_URL, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return Array.isArray(data?.data) ? data.data : []
}

/**
 * Create a new brandname declaration. Requires a valid Bearer token.
 */
export async function createBrandname({
  token,
  brandName,
  providerId,
  type,
  business,
  taxCode,
  phone,
  email,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CREATE_URL,
      { brandName, providerId, type, business, taxCode, phone, email },
      { headers: authHeader(token) },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}
