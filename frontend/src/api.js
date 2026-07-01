const API_BASE = '/api'

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

export function getTransactions() {
  return request('/transactions')
}

export function createTransaction(payload) {
  return request('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getCategorySummary() {
  return request('/summary/category')
}

export function getPaymentMethodSummary() {
  return request('/summary/payment-method')
}
