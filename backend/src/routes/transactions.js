const express = require('express');
const db = require('../db');

const router = express.Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TYPES = ['income', 'expense'];

function validateTransaction(body) {
  const errors = [];

  if (!body.date || !DATE_PATTERN.test(body.date)) {
    errors.push('date は YYYY-MM-DD 形式で入力してください');
  }
  if (!body.item_name || !String(body.item_name).trim()) {
    errors.push('item_name は必須です');
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push('amount は正の整数で入力してください');
  }

  if (!VALID_TYPES.includes(body.type)) {
    errors.push("type は 'income' か 'expense' を指定してください");
  }
  if (!body.category || !String(body.category).trim()) {
    errors.push('category は必須です');
  }
  if (!body.payment_method || !String(body.payment_method).trim()) {
    errors.push('payment_method は必須です');
  }

  return errors;
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC')
    .all();
  res.json({ data: rows });
});

router.post('/', (req, res) => {
  const errors = validateTransaction(req.body ?? {});
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const { date, item_name, amount, type, category, payment_method, memo } = req.body;

  const result = db
    .prepare(
      `INSERT INTO transactions (date, item_name, amount, type, category, payment_method, memo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      date,
      String(item_name).trim(),
      Number(amount),
      type,
      String(category).trim(),
      String(payment_method).trim(),
      memo ? String(memo).trim() : null
    );

  const created = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ data: created });
});

module.exports = router;
