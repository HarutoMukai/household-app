const express = require('express');
const pool = require('../pg');

const router = express.Router();

const VALID_GOAL_TYPES = ['monthly', 'yearly'];

function validateGoal(body) {
  const errors = [];

  const amount = Number(body.target_amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push('target_amount は正の整数で入力してください');
  }

  if (body.goal_type !== undefined && !VALID_GOAL_TYPES.includes(body.goal_type)) {
    errors.push("goal_type は 'monthly' か 'yearly' を指定してください");
  }

  return errors;
}

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT target_amount, goal_type, updated_at FROM goals WHERE id = 1'
  );
  res.json({ data: result.rows[0] ?? null });
});

router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const errors = validateGoal(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const goalType = body.goal_type ?? 'monthly';

  const result = await pool.query(
    `INSERT INTO goals (id, target_amount, goal_type, updated_at)
     VALUES (1, $1, $2, NOW())
     ON CONFLICT (id) DO UPDATE SET
       target_amount = EXCLUDED.target_amount,
       goal_type = EXCLUDED.goal_type,
       updated_at = EXCLUDED.updated_at
     RETURNING target_amount, goal_type, updated_at`,
    [Number(body.target_amount), goalType]
  );

  res.json({ data: result.rows[0] });
});

module.exports = router;
