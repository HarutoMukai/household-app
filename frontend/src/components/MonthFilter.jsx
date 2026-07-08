function MonthFilter({ month, onChange }) {
  return (
    <section className="card month-filter">
      <h2>対象月</h2>
      <div className="month-filter-controls">
        <input
          type="month"
          value={month}
          onChange={(e) => onChange(e.target.value)}
          aria-label="対象月を選択"
        />
        {month ? (
          <button type="button" className="button-secondary" onClick={() => onChange('')}>
            全期間表示に戻す
          </button>
        ) : (
          <span className="badge month-filter-badge">全期間表示中</span>
        )}
      </div>
      {month && <p className="month-filter-status">{month} のデータを表示中</p>}
    </section>
  )
}

export default MonthFilter
