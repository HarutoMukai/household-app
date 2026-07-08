function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function SummaryCards({ progress }) {
  const { income_total, expense_total, balance, target_amount, achievement_rate } = progress

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
      <div className="summary-card summary-card-goal">
        <span className="summary-card-label">目標達成率</span>
        {target_amount == null ? (
          <span className="summary-card-value summary-card-value-muted">未設定</span>
        ) : (
          <span className="summary-card-value">{achievement_rate}%</span>
        )}
      </div>
    </div>
  )
}

export default SummaryCards
