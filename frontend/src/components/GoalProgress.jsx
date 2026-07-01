function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function GoalProgress({ progress }) {
  const { income_total, expense_total, balance, target_amount, achievement_rate, remaining } = progress

  const barWidth = achievement_rate == null ? 0 : Math.min(Math.max(achievement_rate, 0), 100)
  const achieved = target_amount != null && remaining <= 0

  return (
    <section className="card">
      <h2>目標貯金の進捗</h2>
      <ul className="goal-stats">
        <li>収入合計: {formatYen(income_total)}</li>
        <li>支出合計: {formatYen(expense_total)}</li>
        <li>現在の差額: {formatYen(balance)}</li>
      </ul>
      {target_amount == null ? (
        <p>目標貯金額が設定されていません</p>
      ) : (
        <>
          <p>目標貯金額: {formatYen(target_amount)}</p>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${barWidth}%` }} />
          </div>
          <p>達成率: {achievement_rate}%</p>
          <p>{achieved ? '目標を達成しました' : `残り必要金額: ${formatYen(remaining)}`}</p>
        </>
      )}
    </section>
  )
}

export default GoalProgress
