const STATUS_LABEL = {
  normal: '順調',
  warning: '注意',
  over: '使いすぎ',
  unset: '予算未設定',
}

function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function BudgetAlerts({ month, budgets, alerts, onDelete }) {
  const list = alerts || []
  const budgetList = budgets || []

  return (
    <section className="card">
      <h2>使いすぎアラート</h2>
      {!month ? (
        <div>
          <p className="empty-message">月間予算との比較を行うには対象月を選択してください</p>
          {budgetList.length === 0 ? (
            <p className="empty-message">まだ予算が設定されていません</p>
          ) : (
            <ul className="stat-list">
              {budgetList.map((b) => (
                <li key={b.id} className="stat-row">
                  <span className="stat-label">{b.category}</span>
                  <span className="stat-value">{Number(b.budget_amount).toLocaleString()}円/月</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : list.length === 0 ? (
        <p className="empty-message">対象月の支出・予算データがありません</p>
      ) : (
        <ul className="budget-alert-list">
          {list.map((a) => (
            <li key={a.category} className={`budget-alert-row status-${a.status}`}>
              <div className="budget-alert-header">
                <span className="budget-alert-category">{a.category}</span>
                <span className={`badge budget-status-badge status-${a.status}`}>{STATUS_LABEL[a.status]}</span>
              </div>
              {a.status === 'unset' ? (
                <p className="budget-alert-detail">支出 {formatYen(a.used_amount)}（予算未設定）</p>
              ) : (
                <>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill status-${a.status}`}
                      style={{ width: `${Math.min(Math.max(a.usage_rate, 0), 100)}%` }}
                    />
                  </div>
                  <p className="budget-alert-detail">
                    {formatYen(a.used_amount)} / {formatYen(a.budget_amount)}（使用率 {a.usage_rate}%）
                    {a.remaining_amount >= 0
                      ? ` ・残り ${formatYen(a.remaining_amount)}`
                      : ` ・${formatYen(Math.abs(a.remaining_amount))}オーバー`}
                  </p>
                </>
              )}
              {a.budget_id != null && (
                <button
                  type="button"
                  className="button-small button-secondary"
                  onClick={() => onDelete(a.budget_id)}
                >
                  予算を削除
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BudgetAlerts
