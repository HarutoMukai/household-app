function formatAmount(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${Number(amount).toLocaleString()}円`
}

function TransactionList({ transactions }) {
  return (
    <section className="card">
      <h2>収支一覧</h2>
      {transactions.length === 0 ? (
        <p className="empty-message">まだ収支の登録がありません</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>日付</th>
                <th>内容</th>
                <th>金額</th>
                <th>区分</th>
                <th>カテゴリ</th>
                <th>支払い方法</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.item_name}</td>
                  <td className={t.type === 'income' ? 'income' : 'expense'}>
                    {formatAmount(t.amount, t.type)}
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type === 'income' ? '収入' : '支出'}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.payment_method ? t.payment_method : '—'}</td>
                  <td>{t.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default TransactionList
