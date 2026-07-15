const express = require('express');
const db = require('../db');

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

router.get('/', (req, res) => {
  const goal = db
    .prepare('SELECT target_amount, goal_type, updated_at FROM goals WHERE id = 1')
    .get();
  res.json({ data: goal ?? null });
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const errors = validateGoal(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' / ') });
  }

  const goalType = body.goal_type ?? 'monthly';

  db.prepare(
    `INSERT INTO goals (id, target_amount, goal_type, updated_at)
     VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       target_amount = excluded.target_amount,
       goal_type = excluded.goal_type,
       updated_at = excluded.updated_at`
  ).run(Number(body.target_amount), goalType);

  const goal = db
    .prepare('SELECT target_amount, goal_type, updated_at FROM goals WHERE id = 1')
    .get();
  res.json({ data: goal });
});

module.exports = router;
