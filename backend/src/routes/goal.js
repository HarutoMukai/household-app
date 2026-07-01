const express = require('express');
const db = require('../db');

const router = express.Router();

function validateTargetAmount(value) {
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount <= 0) {
    return 'target_amount は正の整数で入力してください';
  }
  return null;
}

router.get('/', (req, res) => {
  const goal = db.prepare('SELECT target_amount, updated_at FROM goals WHERE id = 1').get();
  res.json({ data: goal ?? null });
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const error = validateTargetAmount(body.target_amount);
  if (error) {
    return res.status(400).json({ error });
  }

  db.prepare(
    `INSERT INTO goals (id, target_amount, updated_at)
     VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET target_amount = excluded.target_amount, updated_at = excluded.updated_at`
  ).run(Number(body.target_amount));

  const goal = db.prepare('SELECT target_amount, updated_at FROM goals WHERE id = 1').get();
  res.json({ data: goal });
});

module.exports = router;
