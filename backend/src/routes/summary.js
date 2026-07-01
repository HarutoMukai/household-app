const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/category', (req, res) => {
  const rows = db
    .prepare(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'
       GROUP BY category
       ORDER BY total DESC`
    )
    .all();
  res.json({ data: rows });
});

router.get('/payment-method', (req, res) => {
  const rows = db
    .prepare(
      `SELECT payment_method, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'
       GROUP BY payment_method
       ORDER BY total DESC`
    )
    .all();
  res.json({ data: rows });
});

router.get('/goal-progress', (req, res) => {
  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
       FROM transactions`
    )
    .get();

  const goal = db.prepare('SELECT target_amount FROM goals WHERE id = 1').get();
  const targetAmount = goal ? goal.target_amount : null;
  const balance = totals.income_total - totals.expense_total;

  const achievementRate = targetAmount ? Math.round((balance / targetAmount) * 1000) / 10 : null;
  const remaining = targetAmount !== null ? targetAmount - balance : null;

  res.json({
    data: {
      income_total: totals.income_total,
      expense_total: totals.expense_total,
      balance,
      target_amount: targetAmount,
      achievement_rate: achievementRate,
      remaining,
    },
  });
});

module.exports = router;
