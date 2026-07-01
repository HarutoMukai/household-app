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

module.exports = router;
