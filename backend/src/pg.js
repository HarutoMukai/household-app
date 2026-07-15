const path = require('node:path');
const { Pool } = require('pg');

// ローカル開発では backend/.env から環境変数を読み込む。
// Render 上には .env が存在しないため何もしない（環境変数はプラットフォームから渡される）。
try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  // .env が無い環境では何もしない
}

const connectionString = process.env.DATABASE_URL;

// SSL設定は接続先ホストで自動判定する。
// - External URL（*.render.com）: RenderのDBへ外部から接続するためSSL必須
// - Internal URL（Render内部ホスト名）やローカルPostgreSQL: SSL不要
function resolveSsl(urlString) {
  if (!urlString) return false;
  try {
    const host = new URL(urlString).hostname;
    return host.endsWith('.render.com') ? { rejectUnauthorized: false } : false;
  } catch {
    return false;
  }
}

if (!connectionString) {
  console.warn(
    'DATABASE_URL が設定されていません。backend/.env に設定するか、環境変数で渡してください。'
  );
}

const pool = new Pool({
  connectionString,
  ssl: resolveSsl(connectionString),
});

module.exports = pool;
