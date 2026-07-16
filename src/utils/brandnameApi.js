import httpClient, { authHeader, safeRequest } from './httpClient'

const CREATE_URL = '/brandName/create'

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
