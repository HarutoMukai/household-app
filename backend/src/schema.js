// PostgreSQL のテーブル定義。SQLite 版（db.js）と同じ構成を移植したもの。
// - AUTOINCREMENT → GENERATED ALWAYS AS IDENTITY
// - datetime('now') → NOW()（TIMESTAMPTZ）
// - goals には goal_type を最初から含める（SQLite版のALTER TABLEマイグレーション相当は不要）
// - date 列は既存ロジック（substr による月フィルター）を変えないため TEXT のまま

async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      date TEXT NOT NULL,
      item_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      memo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      target_amount INTEGER NOT NULL,
      goal_type TEXT NOT NULL DEFAULT 'monthly' CHECK (goal_type IN ('monthly', 'yearly')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fixed_expenses (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      billing_day INTEGER NOT NULL,
      memo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS category_budgets (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      category TEXT NOT NULL UNIQUE,
      budget_amount INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { initSchema };
