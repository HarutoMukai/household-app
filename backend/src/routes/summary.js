const express = require('express');
const db = require('../db');
const { parseMonth } = require('../month');

const router = express.Router();

function mergeTotals(rowsA, rowsB, key) {
  const totals = new Map();
  for (const row of rowsA) {
    totals.set(row[key], (totals.get(row[key]) || 0) + row.total);
  }
  for (const row of rowsB) {
    totals.set(row[key], (totals.get(row[key]) || 0) + row.total);
  }
  return Array.from(totals.entries())
    .map(([value, total]) => ({ [key]: value, total }))
    .sort((a, b) => b.total - a.total);
}

router.get('/category', (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    const rows = db
      .prepare(
        `SELECT category, SUM(amount) AS total
         FROM transactions
         WHERE type = 'expense'
         GROUP BY category
         ORDER BY total DESC`
      )
      .all();
    return res.json({ data: rows });
  }

  const transactionTotals = db
    .prepare(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense' AND substr(date, 1, 7) = ?
       GROUP BY category`
    )
    .all(month);

  const fixedTotals = db
    .prepare('SELECT category, SUM(amount) AS total FROM fixed_expenses GROUP BY category')
    .all();

  res.json({ data: mergeTotals(transactionTotals, fixedTotals, 'category') });
});

router.get('/payment-method', (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    const rows = db
      .prepare(
        `SELECT payment_method, SUM(amount) AS total
         FROM transactions
         WHERE type = 'expense'
         GROUP BY payment_method
         ORDER BY total DESC`
      )
      .all();
    return res.json({ data: rows });
  }

  const transactionTotals = db
    .prepare(
      `SELECT payment_method, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense' AND substr(date, 1, 7) = ?
       GROUP BY payment_method`
    )
    .all(month);

  const fixedTotals = db
    .prepare('SELECT payment_method, SUM(amount) AS total FROM fixed_expenses GROUP BY payment_method')
    .all();

  res.json({ data: mergeTotals(transactionTotals, fixedTotals, 'payment_method') });
});

router.get('/goal-progress', (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  const totals = month
    ? db
        .prepare(
          `SELECT
             COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
             COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
           FROM transactions
           WHERE substr(date, 1, 7) = ?`
        )
        .get(month)
    : db
        .prepare(
          `SELECT
             COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
             COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
           FROM transactions`
        )
        .get();

  let expenseTotal = totals.expense_total;
  if (month) {
    const fixedTotal = db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses').get();
    expenseTotal += fixedTotal.total;
  }

  const goal = db.prepare('SELECT target_amount FROM goals WHERE id = 1').get();
  const targetAmount = goal ? goal.target_amount : null;
  const balance = totals.income_total - expenseTotal;

  const achievementRate = targetAmount ? Math.round((balance / targetAmount) * 1000) / 10 : null;
  const remaining = targetAmount !== null ? targetAmount - balance : null;

  res.json({
    data: {
      income_total: totals.income_total,
      expense_total: expenseTotal,
      balance,
      target_amount: targetAmount,
      achievement_rate: achievementRate,
      remaining,
    },
  });
});

router.get('/budget-alerts', (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!month) {
    return res.json({ data: null });
  }

  const budgets = db.prepare('SELECT id, category, budget_amount FROM category_budgets').all();
  const budgetMap = new Map(budgets.map((b) => [b.category, b]));

  const transactionTotals = db
    .prepare(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense' AND substr(date, 1, 7) = ?
       GROUP BY category`
    )
    .all(month);

  const fixedTotals = db
    .prepare('SELECT category, SUM(amount) AS total FROM fixed_expenses GROUP BY category')
    .all();

  const usedMap = new Map();
  for (const row of transactionTotals) {
    usedMap.set(row.category, (usedMap.get(row.category) || 0) + row.total);
  }
  for (const row of fixedTotals) {
    usedMap.set(row.category, (usedMap.get(row.category) || 0) + row.total);
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

router.get('/monthly-trend', (req, res) => {
  const months = parseMonths(req.query.months);
  const monthList = getRecentMonths(months);

  const fixedTotal = db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses').get().total;

  const data = monthList.map((month) => {
    const totals = db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
         FROM transactions
         WHERE substr(date, 1, 7) = ?`
      )
      .get(month);

    const totalExpense = totals.expense_total + fixedTotal;

    return {
      month,
      income_total: totals.income_total,
      expense_total: totals.expense_total,
      fixed_expense_total: fixedTotal,
      total_expense: totalExpense,
      balance: totals.income_total - totalExpense,
    };
  });

  res.json({ data });
});

module.exports = router;
