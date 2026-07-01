function PaymentMethodSummary({ data }) {
  return (
    <section className="card">
      <h2>支払い方法別支出合計</h2>
      {data.length === 0 ? (
        <p>支出データがありません</p>
      ) : (
        <ul>
          {data.map((row) => (
            <li key={row.payment_method}>
              {row.payment_method}: {Number(row.total).toLocaleString()}円
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PaymentMethodSummary
