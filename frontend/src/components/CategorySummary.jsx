function CategorySummary({ data }) {
  const maxTotal = data.reduce((max, row) => Math.max(max, row.total), 0)

  return (
    <section className="card">
      <h2>カテゴリ別支出合計</h2>
      {data.length === 0 ? (
        <p className="empty-message">まだ支出の登録がありません</p>
      ) : (
        <ul className="stat-list">
          {data.map((row) => (
            <li key={row.category} className="stat-row">
              <div
                className="stat-row-fill"
                style={{ width: `${maxTotal ? (row.total / maxTotal) * 100 : 0}%` }}
              />
              <span className="stat-label">{row.category}</span>
              <span className="stat-value">{Number(row.total).toLocaleString()}円</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default CategorySummary
