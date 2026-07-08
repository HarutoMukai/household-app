import { useState } from 'react'
import { createFixedExpense } from '../api'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants'

function makeInitialForm() {
  return {
    name: '',
    amount: '',
    category: '',
    payment_method: '',
    billing_day: '',
    memo: '',
  }
}

function FixedExpenseForm({ onCreated }) {
  const [form, setForm] = useState(makeInitialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createFixedExpense({
        ...form,
        amount: Number(form.amount),
        billing_day: Number(form.billing_day),
      })
      setForm(makeInitialForm())
      await onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>固定費・サブスク登録</h2>
      {error && <p className="error">{error}</p>}
      <div className="field">
        <label htmlFor="fe-name">名称</label>
        <input
          id="fe-name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="例）家賃、Netflix"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="fe-amount">金額</label>
        <input
          id="fe-amount"
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          min="1"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="fe-category">カテゴリ</label>
        <select id="fe-category" name="category" value={form.category} onChange={handleChange} required>
          <option value="" disabled>
            選択してください
          </option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="fe-payment-method">支払い方法</label>
        <select
          id="fe-payment-method"
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            選択してください
          </option>
          {PAYMENT_METHODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="fe-billing-day">毎月の支払日</label>
        <input
          id="fe-billing-day"
          type="number"
          name="billing_day"
          value={form.billing_day}
          onChange={handleChange}
          min="1"
          max="31"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="fe-memo">メモ</label>
        <input id="fe-memo" type="text" name="memo" value={form.memo} onChange={handleChange} />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? '登録中...' : '登録する'}
      </button>
    </form>
  )
}

export default FixedExpenseForm
