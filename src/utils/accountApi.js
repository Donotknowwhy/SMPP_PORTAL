import httpClient, { authHeader, safeRequest } from './httpClient'

const GET_LIST_USER_URL = '/getListUser'
const CREATE_ACCOUNT_URL = '/createAccount'
const GET_USER_AUDIT_LOG_URL = '/getUserAuditLog'
const DELETE_USER_URL = '/deleteUser'

/**
 * Fetch the list of user accounts. Requires a valid Bearer token.
 */
export async function getListUser(token, signal) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(GET_LIST_USER_URL, {}, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const rows = Array.isArray(data?.data?.data) ? data.data.data : []
  const total = typeof data?.data?.total === 'number' ? data.data.total : rows.length
  return { rows, total }
}

/**
 * Create a new user account. Requires a valid Bearer token.
 */
export async function createAccount({
  token,
  username,
  email,
  password,
  role,
  fullName,
  phone,
  gender,
  brandNameList,
  providerId,
  status,
}) {
  const { ok, status: httpStatus, statusText, data } = await safeRequest(
    httpClient.post(
      CREATE_ACCOUNT_URL,
      { username, email, password, role, fullName, phone, gender, brandNameList, providerId, status },
      { headers: authHeader(token) },
    ),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${httpStatus}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Delete a user account by id. Requires a valid Bearer token.
 */
export async function deleteUser(token, id) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.delete(DELETE_USER_URL, { params: { id }, headers: authHeader(token) }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.message ?? ''
}

/**
 * Fetch the user account audit log. Requires a valid Bearer token.
 */
export async function getUserAuditLog(token, signal) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.get(GET_USER_AUDIT_LOG_URL, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return Array.isArray(data?.data) ? data.data : []
}
