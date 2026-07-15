import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_SMS_API_BASE_URL || 'https://uat-sms.skyfi.com.vn/api/sms'

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

/**
 * Runs an axios request and normalizes success/failure into the same shape,
 * since this API returns a `status` field in the body even on HTTP errors.
 */
export async function safeRequest(promise) {
  try {
    const response = await promise
    return { ok: true, status: response.status, statusText: response.statusText, data: response.data, headers: response.headers }
  } catch (error) {
    if (error.response) {
      const { status, statusText, data, headers } = error.response
      return { ok: false, status, statusText, data, headers }
    }
    throw error
  }
}

export default httpClient
