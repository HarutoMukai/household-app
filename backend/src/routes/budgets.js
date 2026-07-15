const express = require('express');
const pool = require('../pg');
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

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM category_budgets ORDER BY category ASC');
  res.json({ data: result.rows });
});

router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const errors = validateBudget(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const result = await pool.query(
    `INSERT INTO category_budgets (category, budget_amount)
     VALUES ($1, $2)
     ON CONFLICT (category) DO UPDATE SET
       budget_amount = EXCLUDED.budget_amount,
       updated_at = NOW()
     RETURNING *`,
    [body.category, Number(body.budget_amount)]
  );

  res.status(201).json({ data: result.rows[0] });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: '不正なIDです' });
  }

  const result = await pool.query('DELETE FROM category_budgets WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '指定された予算が見つかりません' });
  }

  res.json({ data: { id } });
});

module.exports = router;
