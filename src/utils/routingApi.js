const API_BASE_URL = import.meta.env.VITE_SMS_API_BASE_URL || 'https://uat-sms.skyfi.com.vn/api/sms'

const GET_LIST_ROUTING_URL = `${API_BASE_URL}/routingRule/getListRouting`
const GET_INFO_URL = `${API_BASE_URL}/routingRule/getInfo`
const CREATE_URL = `${API_BASE_URL}/routingRule/create`
const EXPORT_URL = `${API_BASE_URL}/routingRule/exportRoutingRule`
const DELETE_URL = `${API_BASE_URL}/routingRule/delete`
const GET_AUDIT_URL = `${API_BASE_URL}/routingRule/getRoutingAudit`

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
 * Fetch the routing rule list. Requires a valid Bearer token.
 */
export async function getRoutingList({ token, brandNameId = 0, telcoId = 0, page = 0, size = 10, signal }) {
  const res = await fetch(GET_LIST_ROUTING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ brandNameId, telcoId, page, size }),
    signal,
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  if (Array.isArray(data)) return { rows: data, total: data.length }

  if (data?.status !== undefined && data.status !== 1) {
    throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  const payload = data?.data
  if (Array.isArray(payload)) return { rows: payload, total: payload.length }
  if (Array.isArray(payload?.data)) return { rows: payload.data, total: payload.total ?? payload.data.length }
  if (Array.isArray(payload?.content)) return { rows: payload.content, total: payload.totalElements ?? payload.content.length }
  return { rows: [], total: 0 }
}

/**
 * Fetch the dropdown reference data (brandnames, telcos, providers) for the routing form.
 * Requires a valid Bearer token.
 */
export async function getRoutingInfo(token, signal) {
  const res = await fetch(GET_INFO_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  return {
    brandNames: Array.isArray(data?.data?.listBrandName) ? data.data.listBrandName : [],
    telcos: Array.isArray(data?.data?.listTelcos) ? data.data.listTelcos : [],
    providers: Array.isArray(data?.data?.listProvider) ? data.data.listProvider : [],
  }
}

/**
 * Create a new routing rule. Requires a valid Bearer token.
 */
export async function createRoutingRule({
  token,
  brandNameId,
  telcoId,
  primaryProviderId,
  backupProviderId = null,
  tps,
  priority,
  status,
}) {
  const res = await fetch(CREATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandNameId,
      telcoId,
      primaryProviderId,
      backupProviderId,
      tps,
      priority,
      status,
    }),
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Delete a routing rule by id. Requires a valid Bearer token.
 */
export async function deleteRoutingRule(token, routingRuleId) {
  const res = await fetch(`${DELETE_URL}?routingRuleId=${routingRuleId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Fetch the routing configuration audit log. Requires a valid Bearer token.
 */
export async function getRoutingAudit({ token, page = 0, size = 10, signal }) {
  const res = await fetch(GET_AUDIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ page, size }),
    signal,
  })

  const { response, data } = await parseResponse(res)

  if (!response.ok) {
    const msg = data?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  if (Array.isArray(data)) return { rows: data, total: data.length }

  if (data?.status !== undefined && data.status !== 1) {
    throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  const payload = data?.data
  if (Array.isArray(payload)) return { rows: payload, total: payload.length }
  if (Array.isArray(payload?.data)) return { rows: payload.data, total: payload.total ?? payload.data.length }
  if (Array.isArray(payload?.content)) return { rows: payload.content, total: payload.totalElements ?? payload.content.length }
  return { rows: [], total: 0 }
}

/**
 * Export the routing rule configuration as an Excel file. Requires a valid Bearer token.
 * Returns { blob, filename } for triggering a browser download.
 */
export async function exportRoutingRules(token) {
  const res = await fetch(EXPORT_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `HTTP ${res.status}: ${res.statusText}`
    try {
      const data = JSON.parse(text)
      msg = data?.message || msg
    } catch {
      // not JSON, keep default message
    }
    throw new Error(msg)
  }

  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // The backend appends a trailing `{"status":...}` JSON blob after the actual
  // Excel file bytes in the same response body; strip it so the downloaded
  // .xlsx isn't corrupted.
  const marker = new TextEncoder().encode('{"status"')
  let cutIndex = bytes.length
  searchLoop: for (let i = bytes.length - marker.length; i >= 0; i--) {
    for (let j = 0; j < marker.length; j++) {
      if (bytes[i + j] !== marker[j]) continue searchLoop
    }
    cutIndex = i
    break
  }

  if (cutIndex === 0) {
    const msg = new TextDecoder().decode(bytes)
    let parsedMsg = 'Không xuất được cấu hình.'
    try {
      parsedMsg = JSON.parse(msg)?.message || parsedMsg
    } catch {
      // ignore, keep default message
    }
    throw new Error(parsedMsg)
  }

  const blob = new Blob([bytes.slice(0, cutIndex)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const disposition = res.headers.get('content-disposition') || ''
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  const filename = match ? decodeURIComponent(match[1]) : `routing-rules-${Date.now()}.xlsx`

  return { blob, filename }
}
