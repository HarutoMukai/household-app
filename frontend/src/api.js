const API_BASE = '/api'

function withMonth(path, month) {
  return month ? `${path}?month=${encodeURIComponent(month)}` : path
}

async function request(path, options) {
  const url = `${API_BASE}${path}`
  let res
  try {
    res = await fetch(url, options)
  } catch (networkErr) {
    console.error('APIへの接続に失敗しました', { url, error: networkErr })
    throw new Error(`サーバーに接続できませんでした: ${url}`)
  }

  const text = await res.text()
  let body = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch (parseErr) {
      console.error('APIレスポンスがJSONとして解析できませんでした', {
        url,
        status: res.status,
        body: text,
      })
      throw new Error(`サーバーから不正な応答が返されました (status: ${res.status})`)
    }
  }

  if (!res.ok) {
    console.error('APIエラー応答', { url, status: res.status, body: text })
    throw new Error(body?.error || `リクエストに失敗しました (status: ${res.status})`)
  }

  return body?.data
}

export function getTransactions(month) {
  return request(withMonth('/transactions', month))
}

export function createTransaction(payload) {
  return request('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateTransaction(id, payload) {
  return request(`/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: 'DELETE' })
}

export function getCategorySummary(month) {
  return request(withMonth('/summary/category', month))
}

export function getPaymentMethodSummary(month) {
  return request(withMonth('/summary/payment-method', month))
}

export function getGoal() {
  return request('/goal')
}

export function updateGoal(payload) {
  return request('/goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getGoalProgress(month) {
  return request(withMonth('/summary/goal-progress', month))
}

export function getFixedExpenses() {
  return request('/fixed-expenses')
}

export function createFixedExpense(payload) {
  return request('/fixed-expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteFixedExpense(id) {
  return request(`/fixed-expenses/${id}`, { method: 'DELETE' })
}

export function getBudgets() {
  return request('/budgets')
}

export function upsertBudget(payload) {
  return request('/budgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteBudget(id) {
  return request(`/budgets/${id}`, { method: 'DELETE' })
}

export function getBudgetAlerts(month) {
  return request(withMonth('/summary/budget-alerts', month))
}

export function getMonthlyTrend(months) {
  const query = months ? `?months=${encodeURIComponent(months)}` : ''
  return request(`/summary/monthly-trend${query}`)
}
