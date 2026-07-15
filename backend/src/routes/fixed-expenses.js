const express = require('express');
const pool = require('../pg');
const { EXPENSE_CATEGORIES, PAYMENT_METHODS } = require('../constants');

const router = express.Router();

function validateFixedExpense(body) {
  const errors = [];

  if (!body.name || !String(body.name).trim()) {
    errors.push('名称を入力してください');
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push('amount は正の整数で入力してください');
  }

  if (!EXPENSE_CATEGORIES.includes(body.category)) {
    errors.push(`category は次のいずれかを指定してください: ${EXPENSE_CATEGORIES.join(', ')}`);
  }

  if (!PAYMENT_METHODS.includes(body.payment_method)) {
    errors.push(`payment_method は次のいずれかを指定してください: ${PAYMENT_METHODS.join(', ')}`);
  }

  const billingDay = Number(body.billing_day);
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) {
    errors.push('billing_day は1〜31の整数で指定してください');
  }

  return errors;
}

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM fixed_expenses ORDER BY billing_day ASC, id DESC'
  );
  res.json({ data: result.rows });
});

router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const errors = validateFixedExpense(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const result = await pool.query(
    `INSERT INTO fixed_expenses (name, amount, category, payment_method, billing_day, memo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      String(body.name).trim(),
      Number(body.amount),
      body.category,
      body.payment_method,
      Number(body.billing_day),
      body.memo ? String(body.memo).trim() : null,
    ]
  );

  res.status(201).json({ data: result.rows[0] });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const result = await pool.query('DELETE FROM fixed_expenses WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '指定された固定費が見つかりません' });
  }

  res.json({ data: { id } });
});

module.exports = router;
