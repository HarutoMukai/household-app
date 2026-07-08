const express = require('express');
const cors = require('cors');
require('./db');
const transactionsRouter = require('./routes/transactions');
const summaryRouter = require('./routes/summary');
const goalRouter = require('./routes/goal');
const fixedExpensesRouter = require('./routes/fixed-expenses');
const budgetsRouter = require('./routes/budgets');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
