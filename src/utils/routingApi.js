import httpClient, { authHeader, safeRequest } from './httpClient'

const GET_LIST_ROUTING_URL = '/routingRule/getListRouting'
const GET_INFO_URL = '/routingRule/getInfo'
const CREATE_URL = '/routingRule/create'
const EXPORT_URL = '/routingRule/exportRoutingRule'
const DELETE_URL = '/routingRule/delete'
const GET_AUDIT_URL = '/routingRule/getRoutingAudit'
const UPDATE_URL = '/routingRule/update'

/**
 * Fetch the routing rule list. Requires a valid Bearer token.
 */
export async function getRoutingList({ token, brandNameId = 0, telcoId = 0, page = 0, size = 10, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      GET_LIST_ROUTING_URL,
      { brandNameId, telcoId, page, size },
      { headers: authHeader(token), signal },
    ),
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
 * Fetch the dropdown reference data (brandnames, telcos, providers) for the routing form.
 * Requires a valid Bearer token.
 */
export async function getRoutingInfo(token, signal) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.get(GET_INFO_URL, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
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
  status: ruleStatus,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      CREATE_URL,
      { brandNameId, telcoId, primaryProviderId, backupProviderId, tps, priority, status: ruleStatus },
      { headers: authHeader(token) },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Update an existing routing rule. Requires a valid Bearer token.
 */
export async function updateRoutingRule({
  token,
  id,
  brandNameId,
  telcoId,
  primaryProviderId,
  backupProviderId = null,
}) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(
      UPDATE_URL,
      { id, brandNameId, telcoId, primaryProviderId, backupProviderId },
      { headers: authHeader(token) },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Delete a routing rule by id. Requires a valid Bearer token.
 */
export async function deleteRoutingRule(token, routingRuleId) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.delete(DELETE_URL, { params: { routingRuleId }, headers: authHeader(token) }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Fetch the routing configuration audit log. Requires a valid Bearer token.
 */
export async function getRoutingAudit({ token, page = 0, size = 10, signal }) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(GET_AUDIT_URL, { page, size }, { headers: authHeader(token), signal }),
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
 * Export the routing rule configuration as an Excel file. Requires a valid Bearer token.
 * Returns { blob, filename } for triggering a browser download.
 */
export async function exportRoutingRules(token) {
  const { ok, data, headers } = await safeRequest(
    httpClient.get(EXPORT_URL, { headers: authHeader(token), responseType: 'arraybuffer' }),
  )

  if (!ok) {
    let msg = 'Không xuất được cấu hình.'
    try {
      const parsed = JSON.parse(new TextDecoder().decode(data))
      msg = parsed?.message || msg
    } catch {
      // not JSON, keep default message
    }
    throw new Error(msg)
  }

  const bytes = new Uint8Array(data)

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

  const disposition = headers?.['content-disposition'] || ''
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  const filename = match ? decodeURIComponent(match[1]) : `routing-rules-${Date.now()}.xlsx`

  return { blob, filename }
}
