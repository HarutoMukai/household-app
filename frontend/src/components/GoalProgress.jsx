function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function GoalProgress({ progress }) {
  const { target_amount, achievement_rate, remaining } = progress

  const barWidth = achievement_rate == null ? 0 : Math.min(Math.max(achievement_rate, 0), 100)
  const achieved = target_amount != null && remaining <= 0

  return (
    <section className="card card-compact">
      <h2>目標貯金の進捗</h2>
      {target_amount == null ? (
        <p className="empty-message">まだ目標貯金額が設定されていません</p>
      ) : (
        <div>
          <div className="goal-detail-header">
            <span>目標貯金額: {formatYen(target_amount)}</span>
            <span className="goal-rate">{achievement_rate}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${achieved ? 'achieved' : ''}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className={achieved ? 'goal-achieved' : ''}>
            {achieved ? '目標を達成しました' : `残り必要金額: ${formatYen(remaining)}`}
          </p>
        </div>
      )}
    </section>
  )
}

export default GoalProgress
