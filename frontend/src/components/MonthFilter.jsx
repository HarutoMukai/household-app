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
        <button type="button" className="button-secondary" onClick={() => onChange('')} disabled={!month}>
          全期間表示
        </button>
      </div>
      <p className="month-filter-status">
        {month ? `${month} のデータを表示中` : '全期間のデータを表示中'}
      </p>
    </section>
  )
}

export default MonthFilter
