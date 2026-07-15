const express = require('express');
const cors = require('cors');
require('./db');
const pool = require('./pg');
const { initSchema } = require('./schema');
const transactionsRouter = require('./routes/transactions');
const summaryRouter = require('./routes/summary');
const goalRouter = require('./routes/goal');
const fixedExpensesRouter = require('./routes/fixed-expenses');
const budgetsRouter = require('./routes/budgets');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'postgresql' });
  } catch (err) {
    console.error('PostgreSQL接続エラー:', err.message);
    res.status(500).json({ error: 'データベースに接続できません' });
  }
});

app.use('/api/transactions', transactionsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/goal', goalRouter);
app.use('/api/fixed-expenses', fixedExpensesRouter);
app.use('/api/budgets', budgetsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

initSchema(pool)
  .then(() => {
    console.log('PostgreSQL: テーブル初期化完了');
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('PostgreSQL: テーブル初期化に失敗しました:', err.message);
    process.exit(1);
  });
