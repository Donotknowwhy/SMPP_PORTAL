const API_BASE_URL = import.meta.env.VITE_SMS_API_BASE_URL || 'https://uat-sms.skyfi.com.vn/api/sms'

const LOGIN_URL = `${API_BASE_URL}/login`
const SEND_URL = `${API_BASE_URL}/send`

async function parseResponse(response) {
  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = { raw: rawText }
  }
  return { response, data }
}

/**
 * Authenticate with the SMS gateway.
 * Returns { token, username } on success, throws on failure.
 */
export async function loginSms(username, password) {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  const token = data?.data?.token
  if (!token) {
    throw new Error('Không nhận được token từ server.')
  }

  return { token, username: data?.data?.username ?? username }
}

/**
 * Send an SMS. Requires a valid Bearer token.
 */
export async function sendSmsRequest(payload, token) {
  const res = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok) {
    const msg = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
    const error = new Error(msg)
    error.details = data
    throw error
  }

  return { status: response.status, data }
}
