import httpClient, { authHeader, safeRequest } from './httpClient'

const GET_LIST_USER_URL = '/getListUser'
const CREATE_ACCOUNT_URL = '/createAccount'
const UPDATE_ACCOUNT_URL = '/updateAccount'
const GET_USER_URL = '/getUser'
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
 * Fetch a single user account by id. Requires a valid Bearer token.
 */
export async function getUser(token, id, signal) {
  const { ok, status, statusText, data } = await safeRequest(
    httpClient.get(`${GET_USER_URL}/${id}`, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  return data?.data ?? null
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
 * Update an existing user account. Requires a valid Bearer token.
 * Password is optional — omit when the admin does not want to reset it.
 */
export async function updateAccount({
  token,
  id,
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
  const body = { username, email, role, fullName, phone, gender, brandNameList, providerId, status }
  if (password) body.password = password

  const { ok, status: httpStatus, statusText, data } = await safeRequest(
    httpClient.patch(`${UPDATE_ACCOUNT_URL}/${id}`, body, { headers: authHeader(token) }),
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
 * Fetch the user account audit log (paginated). Requires a valid Bearer token.
 */
export async function getUserAuditLog({ token, userId, page = 1, limit = 10, signal }) {
  const body = { page, limit }
  if (userId != null && userId !== '') body.userId = userId

  const { ok, status, statusText, data } = await safeRequest(
    httpClient.post(GET_USER_AUDIT_LOG_URL, body, { headers: authHeader(token), signal }),
  )

  if (!ok || data?.status !== 1) {
    const msg = data?.message || `HTTP ${status}: ${statusText}`
    throw new Error(msg)
  }

  const payload = data?.data
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
  const total = typeof payload?.total === 'number' ? payload.total : rows.length
  const totalPage = typeof payload?.totalPage === 'number'
    ? payload.totalPage
    : Math.max(1, Math.ceil(total / limit) || 1)

  return { rows, total, page: payload?.page ?? page, limit: payload?.limit ?? limit, totalPage }
}
