import { useEffect, useState } from 'react'
import { updateGoal } from '../api'

function GoalForm({ goal, onUpdated }) {
  const [amount, setAmount] = useState('')
  const [goalType, setGoalType] = useState('monthly')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (goal?.target_amount != null) {
      setAmount(String(goal.target_amount))
      setGoalType(goal.goal_type || 'monthly')
    }
  }, [goal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await updateGoal({ target_amount: Number(amount), goal_type: goalType })
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
      <div className="field">
        <label htmlFor="goal_type">目標の種類</label>
        <select id="goal_type" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          <option value="monthly">月間目標</option>
          <option value="yearly">年間目標</option>
        </select>
      </div>
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
      <p className="hint-text" style={{ margin: '0.5rem 0 0' }}>
        {goalType === 'yearly'
          ? '月表示では 1/12 に換算して比較します'
          : '全期間表示では対象月数分に換算して比較します'}
      </p>
    </form>
  )
}

export default GoalForm
