function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function SummaryCards({ progress }) {
  const { income_total, expense_total, balance } = progress

  return (
    <div className="summary-cards">
      <div className="summary-card summary-card-income">
        <span className="summary-card-label">収入合計</span>
        <span className="summary-card-value">{formatYen(income_total)}</span>
      </div>
      <div className="summary-card summary-card-expense">
        <span className="summary-card-label">支出合計</span>
        <span className="summary-card-value">{formatYen(expense_total)}</span>
      </div>
      <div className={`summary-card summary-card-balance ${balance < 0 ? 'is-negative' : ''}`}>
        <span className="summary-card-label">現在の差額</span>
        <span className="summary-card-value">{formatYen(balance)}</span>
      </div>
    </div>
  )
}

export default SummaryCards
