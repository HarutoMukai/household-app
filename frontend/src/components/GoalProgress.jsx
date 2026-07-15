function formatYen(value) {
  return `${Number(value).toLocaleString()}円`
}

function GoalProgress({ progress }) {
  const { target_amount, base_target_amount, goal_type, months_count, achievement_rate, remaining } = progress

  const barWidth = achievement_rate == null ? 0 : Math.min(Math.max(achievement_rate, 0), 100)
  const achieved = target_amount != null && remaining <= 0
  const typeLabel = goal_type === 'yearly' ? '年間目標' : '月間目標'

  const conversionNote = (() => {
    if (target_amount == null || target_amount === base_target_amount) return null
    if (months_count != null) {
      return `全期間（${months_count}か月分）の比較対象: ${formatYen(target_amount)}`
    }
    return `月換算の比較対象: ${formatYen(target_amount)}`
  })()

  return (
    <section className="card card-compact">
      <h2>目標貯金の進捗</h2>
      {target_amount == null ? (
        <p className="empty-message">まだ目標貯金額が設定されていません</p>
      ) : (
        <div className="goal-progress-body">
          <div className="goal-detail-header">
            <span>
              <span className="badge goal-type-badge">{typeLabel}</span> {formatYen(base_target_amount)}
            </span>
            <span className={`goal-rate ${achieved ? 'goal-rate-achieved' : ''}`}>{achievement_rate}%</span>
          </div>
          {conversionNote && <p className="hint-text goal-conversion-note">{conversionNote}</p>}
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${achieved ? 'achieved' : ''}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className={`goal-status-text ${achieved ? 'goal-achieved' : ''}`}>
            {achieved ? '目標を達成しました 🎉' : `目標まであと ${formatYen(remaining)}`}
          </p>
        </div>
      )}
    </section>
  )
}

export default GoalProgress
