const express = require('express');
const db = require('../db');
const { EXPENSE_CATEGORIES } = require('../constants');

const router = express.Router();

function validateBudget(body) {
  const errors = [];

  if (!EXPENSE_CATEGORIES.includes(body.category)) {
    errors.push(`category は次のいずれかを指定してください: ${EXPENSE_CATEGORIES.join(', ')}`);
  }

  const amount = Number(body.budget_amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push('budget_amount は正の整数で入力してください');
  }

  return errors;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM category_budgets ORDER BY category ASC').all();
  res.json({ data: rows });
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const errors = validateBudget(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  db.prepare(
    `INSERT INTO category_budgets (category, budget_amount, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(category) DO UPDATE SET budget_amount = excluded.budget_amount, updated_at = excluded.updated_at`
  ).run(body.category, Number(body.budget_amount));

  const saved = db.prepare('SELECT * FROM category_budgets WHERE category = ?').get(body.category);
  res.status(201).json({ data: saved });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const result = db.prepare('DELETE FROM category_budgets WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: '指定された予算が見つかりません' });
  }

  res.json({ data: { id } });
});

module.exports = router;
