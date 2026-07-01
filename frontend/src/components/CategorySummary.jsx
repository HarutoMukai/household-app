function CategorySummary({ data }) {
  return (
    <section className="card">
      <h2>カテゴリ別支出合計</h2>
      {data.length === 0 ? (
        <p>支出データがありません</p>
      ) : (
        <ul>
          {data.map((row) => (
            <li key={row.category}>
              {row.category}: {Number(row.total).toLocaleString()}円
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default CategorySummary
