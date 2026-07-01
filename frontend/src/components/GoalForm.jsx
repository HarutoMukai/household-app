import { useEffect, useState } from 'react'
import { updateGoal } from '../api'

function GoalForm({ goal, onUpdated }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (goal?.target_amount != null) {
      setAmount(String(goal.target_amount))
    }
  }, [goal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await updateGoal({ target_amount: Number(amount) })
      await onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>目標貯金額の設定</h2>
      {error && <p className="error">{error}</p>}
      <div className="inline-form">
        <div className="field">
          <label htmlFor="target_amount">目標貯金額</label>
          <input
            id="target_amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : goal ? '更新する' : '設定する'}
        </button>
      </div>
    </form>
  )
}

export default GoalForm
