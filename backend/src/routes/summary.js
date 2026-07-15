const express = require('express');
const pool = require('../pg');
const { parseMonth } = require('../month');

const router = express.Router();

// PostgreSQL の SUM()/COUNT() は文字列で返るため、集計値は必ず Number() で数値化する

function mergeTotals(rowsA, rowsB, key) {
  const totals = new Map();
  for (const row of rowsA) {
    totals.set(row[key], (totals.get(row[key]) || 0) + Number(row.total));
  }
  for (const row of rowsB) {
    totals.set(row[key], (totals.get(row[key]) || 0) + Number(row.total));
  }
  return Array.from(totals.entries())
    .map(([value, total]) => ({ [key]: value, total }))
    .sort((a, b) => b.total - a.total);
}

router.get('/category', async (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    const result = await pool.query(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'
       GROUP BY category
       ORDER BY total DESC`
    );
    return res.json({
      data: result.rows.map((r) => ({ category: r.category, total: Number(r.total) })),
    });
  }

  const transactionTotals = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE type = 'expense' AND substr(date, 1, 7) = $1
     GROUP BY category`,
    [month]
  );

  const fixedTotals = await pool.query(
    'SELECT category, SUM(amount) AS total FROM fixed_expenses GROUP BY category'
  );

  res.json({ data: mergeTotals(transactionTotals.rows, fixedTotals.rows, 'category') });
});

router.get('/payment-method', async (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    const result = await pool.query(
      `SELECT payment_method, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'
       GROUP BY payment_method
       ORDER BY total DESC`
    );
    return res.json({
      data: result.rows.map((r) => ({ payment_method: r.payment_method, total: Number(r.total) })),
    });
  }

  const transactionTotals = await pool.query(
    `SELECT payment_method, SUM(amount) AS total
     FROM transactions
     WHERE type = 'expense' AND substr(date, 1, 7) = $1
     GROUP BY payment_method`,
    [month]
  );

  const fixedTotals = await pool.query(
    'SELECT payment_method, SUM(amount) AS total FROM fixed_expenses GROUP BY payment_method'
  );

  res.json({ data: mergeTotals(transactionTotals.rows, fixedTotals.rows, 'payment_method') });
});

router.get('/goal-progress', async (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  const totalsResult = month
    ? await pool.query(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
         FROM transactions
         WHERE substr(date, 1, 7) = $1`,
        [month]
      )
    : await pool.query(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
         FROM transactions`
      );

  const incomeTotal = Number(totalsResult.rows[0].income_total);
  let expenseTotal = Number(totalsResult.rows[0].expense_total);

  // 集計対象月数（全期間表示のみ使用）。
  // 固定費の合算と目標額の換算の両方で同じ値を使う。
  let monthsCount = null;
  if (!month) {
    const counted = await pool.query(
      `SELECT COUNT(DISTINCT substr(date, 1, 7)) AS cnt FROM transactions`
    );
    monthsCount = Math.max(Number(counted.rows[0].cnt), 1);
  }

  // 固定費・サブスクの合算。
  // 月指定時: 月額合計を1回分加算（従来どおり）。
  // 全期間表示: 月額合計 × months_count を加算する。
  const fixedResult = await pool.query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses'
  );
  const fixedMonthlyTotal = Number(fixedResult.rows[0].total);
  expenseTotal += month ? fixedMonthlyTotal : fixedMonthlyTotal * monthsCount;

  const goalResult = await pool.query('SELECT target_amount, goal_type FROM goals WHERE id = 1');
  const goal = goalResult.rows[0] ?? null;

  // 目標種類に応じて比較対象額を換算する。
  // 月表示: monthly はそのまま、yearly は ÷12。
  // 全期間表示: 収支データが実際に存在する月数分で換算する（無条件に12倍しない）。
  // yearly の全期間換算は Math.round(base * monthsCount / 12) と最後に1回だけ丸める。
  let targetAmount = null;
  let goalType = null;
  let baseTargetAmount = null;

  if (goal) {
    goalType = goal.goal_type || 'monthly';
    baseTargetAmount = goal.target_amount;

    if (month) {
      targetAmount =
        goalType === 'yearly' ? Math.round(baseTargetAmount / 12) : baseTargetAmount;
    } else {
      targetAmount =
        goalType === 'yearly'
          ? Math.round((baseTargetAmount * monthsCount) / 12)
          : baseTargetAmount * monthsCount;
    }
  }

  const balance = incomeTotal - expenseTotal;

  const achievementRate = targetAmount ? Math.round((balance / targetAmount) * 1000) / 10 : null;
  const remaining = targetAmount !== null ? targetAmount - balance : null;

  res.json({
    data: {
      income_total: incomeTotal,
      expense_total: expenseTotal,
      balance,
      target_amount: targetAmount,
      base_target_amount: baseTargetAmount,
      goal_type: goalType,
      months_count: monthsCount,
      achievement_rate: achievementRate,
      remaining,
    },
  });
});

router.get('/budget-alerts', async (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    return res.json({ data: null });
  }

  const budgetsResult = await pool.query(
    'SELECT id, category, budget_amount FROM category_budgets'
  );
  const budgetMap = new Map(budgetsResult.rows.map((b) => [b.category, b]));

  const transactionTotals = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE type = 'expense' AND substr(date, 1, 7) = $1
     GROUP BY category`,
    [month]
  );

  const fixedTotals = await pool.query(
    'SELECT category, SUM(amount) AS total FROM fixed_expenses GROUP BY category'
  );

  const usedMap = new Map();
  for (const row of transactionTotals.rows) {
    usedMap.set(row.category, (usedMap.get(row.category) || 0) + Number(row.total));
  }
  for (const row of fixedTotals.rows) {
    usedMap.set(row.category, (usedMap.get(row.category) || 0) + Number(row.total));
  }

  const categories = new Set([...budgetMap.keys(), ...usedMap.keys()]);

  const alerts = Array.from(categories).map((category) => {
    const budget = budgetMap.get(category) ?? null;
    const usedAmount = usedMap.get(category) || 0;

    let usageRate = null;
    let remainingAmount = null;
    let status = 'unset';

    if (budget) {
      usageRate = Math.round((usedAmount / budget.budget_amount) * 1000) / 10;
      remainingAmount = budget.budget_amount - usedAmount;
      if (usageRate >= 100) {
        status = 'over';
      } else if (usageRate >= 80) {
        status = 'warning';
      } else {
        status = 'normal';
      }
    }

    return {
      category,
      budget_id: budget ? budget.id : null,
      budget_amount: budget ? budget.budget_amount : null,
      used_amount: usedAmount,
      usage_rate: usageRate,
      remaining_amount: remainingAmount,
      status,
    };
  });

  alerts.sort((a, b) => {
    if (a.status === 'unset' && b.status !== 'unset') return 1;
    if (b.status === 'unset' && a.status !== 'unset') return -1;
    return (b.usage_rate ?? -1) - (a.usage_rate ?? -1);
  });

  res.json({ data: alerts });
});

function parseMonths(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return 6;
  }
  return Math.min(Math.max(n, 1), 12);
}

function getRecentMonths(count) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  return months;
}

router.get('/monthly-trend', async (req, res) => {
  const months = parseMonths(req.query.months);
  const monthList = getRecentMonths(months);

  const fixedResult = await pool.query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses'
  );
  const fixedTotal = Number(fixedResult.rows[0].total);

  const data = [];
  for (const month of monthList) {
    const totalsResult = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
       FROM transactions
       WHERE substr(date, 1, 7) = $1`,
      [month]
    );

    const incomeTotal = Number(totalsResult.rows[0].income_total);
    const expenseTotal = Number(totalsResult.rows[0].expense_total);
    const totalExpense = expenseTotal + fixedTotal;

    data.push({
      month,
      income_total: incomeTotal,
      expense_total: expenseTotal,
      fixed_expense_total: fixedTotal,
      total_expense: totalExpense,
      balance: incomeTotal - totalExpense,
    });
  }

  res.json({ data });
});

module.exports = router;
