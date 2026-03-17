const DEFAULT_SMS_API_URL =
  import.meta.env.VITE_SMS_API_URL || 'https://sms.skyfi.com.vn/api/v1/sms/send'

export async function sendSmsRequest(payload, apiUrl = DEFAULT_SMS_API_URL) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const rawText = await response.text()
  let responseData = null

  try {
    responseData = rawText ? JSON.parse(rawText) : null
  } catch {
    responseData = { raw: rawText }
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`
    const error = new Error(errorMessage)
    error.details = responseData
    throw error
  }

  return {
    status: response.status,
    data: responseData,
  }
}

export function getDefaultSmsApiUrl() {
  return DEFAULT_SMS_API_URL
}
