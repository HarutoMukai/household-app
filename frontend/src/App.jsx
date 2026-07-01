import { useCallback, useEffect, useState } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategorySummary from './components/CategorySummary'
import PaymentMethodSummary from './components/PaymentMethodSummary'
import { getTransactions, getCategorySummary, getPaymentMethodSummary } from './api'

function App() {
  const [transactions, setTransactions] = useState([])
  const [categorySummary, setCategorySummary] = useState([])
  const [paymentMethodSummary, setPaymentMethodSummary] = useState([])
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [txs, byCategory, byPaymentMethod] = await Promise.all([
        getTransactions(),
        getCategorySummary(),
        getPaymentMethodSummary(),
      ])
      setTransactions(txs)
      setCategorySummary(byCategory)
      setPaymentMethodSummary(byPaymentMethod)
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
      <h1>家計簿アプリ</h1>
      {error && <p className="error">{error}</p>}
      <TransactionForm onCreated={loadAll} />
      <div className="summaries">
        <CategorySummary data={categorySummary} />
        <PaymentMethodSummary data={paymentMethodSummary} />
      </div>
      <TransactionList transactions={transactions} />
    </div>
  )
}

export default App
