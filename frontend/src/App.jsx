import { useCallback, useEffect, useState } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategorySummary from './components/CategorySummary'
import PaymentMethodSummary from './components/PaymentMethodSummary'
import GoalProgress from './components/GoalProgress'
import GoalForm from './components/GoalForm'
import MonthFilter from './components/MonthFilter'
import {
  getTransactions,
  getCategorySummary,
  getPaymentMethodSummary,
  getGoal,
  getGoalProgress,
  deleteTransaction,
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
  const [month, setMonth] = useState('')
  const [transactions, setTransactions] = useState([])
  const [categorySummary, setCategorySummary] = useState([])
  const [paymentMethodSummary, setPaymentMethodSummary] = useState([])
  const [goal, setGoal] = useState(null)
  const [goalProgress, setGoalProgress] = useState(initialGoalProgress)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [txs, byCategory, byPaymentMethod, goalData, progress] = await Promise.all([
        getTransactions(month),
        getCategorySummary(month),
        getPaymentMethodSummary(month),
        getGoal(),
        getGoalProgress(month),
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
  }, [month])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSaved = async () => {
    setEditingTransaction(null)
    await loadAll()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('この収支データを削除しますか？')) {
      return
    }
    try {
      await deleteTransaction(id)
      if (editingTransaction?.id === id) {
        setEditingTransaction(null)
      }
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>家計簿アプリ</h1>
        <p className="app-tagline">日々の収支を記録して、カテゴリ・支払い方法別に集計できます</p>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="layout">
        <aside className="sidebar">
          <MonthFilter month={month} onChange={setMonth} />
          <TransactionForm
            editingTransaction={editingTransaction}
            onSaved={handleSaved}
            onCancelEdit={() => setEditingTransaction(null)}
          />
          <GoalForm goal={goal} onUpdated={loadAll} />
        </aside>

        <main className="main">
          <GoalProgress progress={goalProgress} />

          <div className="grid-2">
            <CategorySummary data={categorySummary} />
            <PaymentMethodSummary data={paymentMethodSummary} />
          </div>

          <TransactionList
            transactions={transactions}
            onEdit={setEditingTransaction}
            onDelete={handleDelete}
          />
        </main>
      </div>
    </div>
  )
}

export default App
