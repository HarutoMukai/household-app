const express = require('express');
const db = require('../db');
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

router.get('/', (req, res) => {
  const { month, error } = parseMonth(req.query.month);
  if (error) {
    return res.status(400).json({ error });
  }

  const rows = month
    ? db
        .prepare('SELECT * FROM transactions WHERE substr(date, 1, 7) = ? ORDER BY date DESC, id DESC')
        .all(month)
    : db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();

  res.json({ data: rows });
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const errors = validateTransaction(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const { date, item_name, amount, type, category, memo } = body;
  const payment_method = type === 'expense' ? String(body.payment_method).trim() : '';

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
      category,
      payment_method,
      memo ? String(memo).trim() : null
    );

  const created = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ data: created });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '指定された収支データが見つかりません' });
  }

  const body = req.body ?? {};
  const errors = validateTransaction(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const { date, item_name, amount, type, category, memo } = body;
  const payment_method = type === 'expense' ? String(body.payment_method).trim() : '';

  db.prepare(
    `UPDATE transactions
     SET date = ?, item_name = ?, amount = ?, type = ?, category = ?, payment_method = ?, memo = ?
     WHERE id = ?`
  ).run(
    date,
    String(item_name).trim(),
    Number(amount),
    type,
    category,
    payment_method,
    memo ? String(memo).trim() : null,
    id
  );

  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.json({ data: updated });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: '指定された収支データが見つかりません' });
  }

  res.json({ data: { id } });
});

module.exports = router;
