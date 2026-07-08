import { useCallback, useEffect, useState } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategorySummary from './components/CategorySummary'
import PaymentMethodSummary from './components/PaymentMethodSummary'
import GoalProgress from './components/GoalProgress'
import SummaryCards from './components/SummaryCards'
import GoalForm from './components/GoalForm'
import MonthFilter from './components/MonthFilter'
import FixedExpenseForm from './components/FixedExpenseForm'
import FixedExpenseList from './components/FixedExpenseList'
import BudgetForm from './components/BudgetForm'
import BudgetAlerts from './components/BudgetAlerts'
import MonthlyTrendChart from './components/MonthlyTrendChart'
import {
  getTransactions,
  getCategorySummary,
  getPaymentMethodSummary,
  getGoal,
  getGoalProgress,
  deleteTransaction,
  getFixedExpenses,
  deleteFixedExpense,
  getBudgets,
  getBudgetAlerts,
  deleteBudget,
  getMonthlyTrend,
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
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [budgetAlerts, setBudgetAlerts] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [txs, byCategory, byPaymentMethod, goalData, progress, fixed, budgetList, alerts, trend] =
        await Promise.all([
          getTransactions(month),
          getCategorySummary(month),
          getPaymentMethodSummary(month),
          getGoal(),
          getGoalProgress(month),
          getFixedExpenses(),
          getBudgets(),
          getBudgetAlerts(month),
          getMonthlyTrend(),
        ])
      setTransactions(txs)
      setCategorySummary(byCategory)
      setPaymentMethodSummary(byPaymentMethod)
      setGoal(goalData)
      setGoalProgress(progress)
      setFixedExpenses(fixed)
      setBudgets(budgetList)
      setBudgetAlerts(alerts)
      setMonthlyTrend(trend)
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

  const handleDeleteFixedExpense = async (id) => {
    if (!window.confirm('この固定費・サブスクを削除しますか？')) {
      return
    }
    try {
      await deleteFixedExpense(id)
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('この予算設定を削除しますか？')) {
      return
    }
    try {
      await deleteBudget(id)
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">¥</div>
          <div className="brand-text">
            <h1>家計簿アプリ</h1>
            <p className="app-tagline">収支の記録・集計・予算管理をひとつの画面で</p>
          </div>
        </div>
        <span className={`view-chip ${month ? 'view-chip-month' : ''}`}>
          {month ? `${month} を表示中` : '全期間を表示中'}
        </span>
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
          <FixedExpenseForm onCreated={loadAll} />
          <BudgetForm onSaved={loadAll} />
        </aside>

        <main className="main">
          <SummaryCards progress={goalProgress} />

          <GoalProgress progress={goalProgress} />

          <MonthlyTrendChart data={monthlyTrend} />

          <BudgetAlerts month={month} budgets={budgets} alerts={budgetAlerts} onDelete={handleDeleteBudget} />

          <div className="grid-2">
            <CategorySummary data={categorySummary} />
            <PaymentMethodSummary data={paymentMethodSummary} />
          </div>

          <FixedExpenseList items={fixedExpenses} onDelete={handleDeleteFixedExpense} />

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
