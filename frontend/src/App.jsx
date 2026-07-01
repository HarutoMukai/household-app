import { useCallback, useEffect, useState } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategorySummary from './components/CategorySummary'
import PaymentMethodSummary from './components/PaymentMethodSummary'
import GoalProgress from './components/GoalProgress'
import GoalForm from './components/GoalForm'
import {
  getTransactions,
  getCategorySummary,
  getPaymentMethodSummary,
  getGoal,
  getGoalProgress,
} from './api'

const initialGoalProgress = {
  income_total: 0,
  expense_total: 0,
  balance: 0,
  target_amount: null,
  achievement_rate: null,
  remaining: null,
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [categorySummary, setCategorySummary] = useState([])
  const [paymentMethodSummary, setPaymentMethodSummary] = useState([])
  const [goal, setGoal] = useState(null)
  const [goalProgress, setGoalProgress] = useState(initialGoalProgress)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [txs, byCategory, byPaymentMethod, goalData, progress] = await Promise.all([
        getTransactions(),
        getCategorySummary(),
        getPaymentMethodSummary(),
        getGoal(),
        getGoalProgress(),
      ])
      setTransactions(txs)
      setCategorySummary(byCategory)
      setPaymentMethodSummary(byPaymentMethod)
      setGoal(goalData)
      setGoalProgress(progress)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <div className="app">
      <header className="app-header">
        <h1>家計簿アプリ</h1>
        <p className="app-tagline">日々の収支を記録して、カテゴリ・支払い方法別に集計できます</p>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="grid-2">
        <GoalProgress progress={goalProgress} />
        <GoalForm goal={goal} onUpdated={loadAll} />
      </div>

      <TransactionForm onCreated={loadAll} />

      <div className="grid-2">
        <CategorySummary data={categorySummary} />
        <PaymentMethodSummary data={paymentMethodSummary} />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  )
}

export default App
