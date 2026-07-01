import { useState } from 'react'
import { createTransaction } from '../api'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants'

const today = () => new Date().toISOString().slice(0, 10)

function makeInitialForm() {
  return {
    date: today(),
    item_name: '',
    amount: '',
    type: 'expense',
    category: '',
    payment_method: '',
    memo: '',
  }
}

function TransactionForm({ onCreated }) {
  const [form, setForm] = useState(makeInitialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (e) => {
    const type = e.target.value
    setForm((prev) => ({ ...prev, type, category: '', payment_method: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createTransaction({
        ...form,
        amount: Number(form.amount),
        payment_method: form.type === 'expense' ? form.payment_method : '',
      })
      setForm((prev) => ({ ...makeInitialForm(), date: prev.date, type: prev.type }))
      await onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>収支の登録</h2>
      {error && <p className="error">{error}</p>}
      <div className="field">
        <label htmlFor="date">日付</label>
        <input id="date" type="date" name="date" value={form.date} onChange={handleChange} required />
      </div>
      <div className="field">
        <label htmlFor="item_name">内容</label>
        <input
          id="item_name"
          type="text"
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
          placeholder={form.type === 'expense' ? '例）おにぎり、服、電車代' : '例）給料、バイト代、仕送り'}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="amount">金額</label>
        <input id="amount" type="number" name="amount" value={form.amount} onChange={handleChange} min="1" required />
      </div>
      <div className="field">
        <label htmlFor="type">区分</label>
        <select id="type" name="type" value={form.type} onChange={handleTypeChange}>
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="category">カテゴリ</label>
        <select id="category" name="category" value={form.category} onChange={handleChange} required>
          <option value="" disabled>
            選択してください
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {form.type === 'expense' && (
        <div className="field">
          <label htmlFor="payment_method">支払い方法</label>
          <select
            id="payment_method"
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
      )}
      <div className="field">
        <label htmlFor="memo">メモ</label>
        <input id="memo" type="text" name="memo" value={form.memo} onChange={handleChange} />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? '登録中...' : '登録する'}
      </button>
    </form>
  )
}

export default TransactionForm
