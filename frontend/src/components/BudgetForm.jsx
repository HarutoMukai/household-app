import { useState } from 'react'
import { upsertBudget } from '../api'
import { EXPENSE_CATEGORIES } from '../constants'

function BudgetForm({ onSaved }) {
  const [form, setForm] = useState({ category: '', budget_amount: '' })
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
      await upsertBudget({ ...form, budget_amount: Number(form.budget_amount) })
      setForm((prev) => ({ category: prev.category, budget_amount: '' }))
      await onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>カテゴリ別予算設定</h2>
      {error && <p className="error">{error}</p>}
      <div className="field">
        <label htmlFor="budget-category">カテゴリ</label>
        <select id="budget-category" name="category" value={form.category} onChange={handleChange} required>
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
        <label htmlFor="budget-amount">月間予算</label>
        <input
          id="budget-amount"
          type="number"
          name="budget_amount"
          value={form.budget_amount}
          onChange={handleChange}
          min="1"
          required
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? '保存中...' : '設定する'}
      </button>
    </form>
  )
}

export default BudgetForm
