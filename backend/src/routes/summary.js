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

module.exports = router;
