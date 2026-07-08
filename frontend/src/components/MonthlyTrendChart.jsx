import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function MonthlyTrendChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0

  return (
    <section className="card">
      <h2>月別収支推移</h2>
      <p className="hint-text">過去6か月の収入・支出（固定費込み）と差額の推移です</p>
      {!hasData ? (
        <p className="empty-message">表示できる月別データがありません</p>
      ) : (
        <div className="trend-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 24, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} width={70} />
              <Tooltip formatter={(value) => formatYen(value)} />
              <Legend wrapperStyle={{ fontSize: '0.85rem', paddingTop: '0.5rem' }} />
              <Bar dataKey="income_total" name="収入" fill="#16794d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_expense" name="支出（固定費込み）" fill="#c0392b" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="balance" name="差額" stroke="#213547" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default MonthlyTrendChart
