const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function parseMonth(rawMonth) {
  if (rawMonth === undefined || rawMonth === null || rawMonth === '') {
    return { month: null, error: null };
  }
  if (!MONTH_PATTERN.test(rawMonth)) {
    return { month: null, error: 'month は YYYY-MM 形式で指定してください' };
  }
  return { month: rawMonth, error: null };
}

module.exports = { parseMonth };
