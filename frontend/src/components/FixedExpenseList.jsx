function FixedExpenseList({ items, onDelete }) {
  return (
    <section className="card">
      <h2>固定費・サブスク一覧</h2>
      <p className="hint-text">固定費は対象月を選択したときに月別集計へ反映されます</p>
      {items.length === 0 ? (
        <p className="empty-message">まだ固定費・サブスクが登録されていません</p>
      ) : (
        <ul className="fixed-expense-list">
          {items.map((f) => (
            <li key={f.id} className="fixed-expense-row">
              <div className="fixed-expense-main">
                <span className="fixed-expense-name">{f.name}</span>
                <span className="fixed-expense-meta">
                  {f.category} ・ {f.payment_method} ・ 毎月{f.billing_day}日
                  {f.memo ? ` ・ ${f.memo}` : ''}
                </span>
              </div>
              <div className="fixed-expense-actions">
                <span className="fixed-expense-amount">{Number(f.amount).toLocaleString()}円</span>
                <button type="button" className="button-small button-danger" onClick={() => onDelete(f.id)}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default FixedExpenseList
