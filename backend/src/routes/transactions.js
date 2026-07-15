const express = require('express');
const pool = require('../pg');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } = require('../constants');
const { parseMonth } = require('../month');

const router = express.Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TYPES = ['income', 'expense'];

function validateTransaction(body) {
  const errors = [];

  if (!body.date || !DATE_PATTERN.test(body.date)) {
    errors.push('date は YYYY-MM-DD 形式で入力してください');
  }
  if (!body.item_name || !String(body.item_name).trim()) {
    errors.push('内容を入力してください');
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push('amount は正の整数で入力してください');
  }

  const type = body.type;
  if (!VALID_TYPES.includes(type)) {
    errors.push("type は 'income' か 'expense' を指定してください");
    return errors;
  }

  const allowedCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if (!allowedCategories.includes(body.category)) {
    errors.push(`category は次のいずれかを指定してください: ${allowedCategories.join(', ')}`);
  }

  if (type === 'expense' && !PAYMENT_METHODS.includes(body.payment_method)) {
    errors.push(`payment_method は次のいずれかを指定してください: ${PAYMENT_METHODS.join(', ')}`);
  }

  return errors;
}

router.get('/', async (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  const result = month
    ? await pool.query(
        'SELECT * FROM transactions WHERE substr(date, 1, 7) = $1 ORDER BY date DESC, id DESC',
        [month]
      )
    : await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');

  res.json({ data: result.rows });
});

router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const errors = validateTransaction(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const { date, item_name, amount, type, category, memo } = body;
  const payment_method = type === 'expense' ? String(body.payment_method).trim() : '';

  const result = await pool.query(
    `INSERT INTO transactions (date, item_name, amount, type, category, payment_method, memo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      date,
      String(item_name).trim(),
      Number(amount),
      type,
      category,
      payment_method,
      memo ? String(memo).trim() : null,
    ]
  );

  res.status(201).json({ data: result.rows[0] });
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const body = req.body ?? {};
  const errors = validateTransaction(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const { date, item_name, amount, type, category, memo } = body;
  const payment_method = type === 'expense' ? String(body.payment_method).trim() : '';

  const result = await pool.query(
    `UPDATE transactions
     SET date = $1, item_name = $2, amount = $3, type = $4, category = $5, payment_method = $6, memo = $7
     WHERE id = $8
     RETURNING *`,
    [
      date,
      String(item_name).trim(),
      Number(amount),
      type,
      category,
      payment_method,
      memo ? String(memo).trim() : null,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: '指定された収支データが見つかりません' });
  }

  res.json({ data: result.rows[0] });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '指定された収支データが見つかりません' });
  }

  res.json({ data: { id } });
});

module.exports = router;
