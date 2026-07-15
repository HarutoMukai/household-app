#!/usr/bin/env bash
set -e
API=http://localhost:3001/api

post() {
  local path="$1" body="$2"
  local resp code
  resp=$(curl -s -w '\n%{http_code}' -X POST "$API$path" -H "Content-Type: application/json" -d "$body")
  code=$(echo "$resp" | tail -n 1)
  if [ "$code" != "200" ] && [ "$code" != "201" ]; then
    echo "FAILED ($code) POST $path : $body"
    echo "$resp" | head -n -1
    exit 1
  fi
}

echo "== 貯金目標 (monthly 60000) =="
post /goal '{"target_amount":60000,"goal_type":"monthly"}'

echo "== 固定費 4件 =="
post /fixed-expenses '{"name":"家賃","amount":65000,"category":"家賃","payment_method":"銀行振込","billing_day":27,"memo":"毎月の家賃（デモ）"}'
post /fixed-expenses '{"name":"電気・ガス","amount":8500,"category":"光熱費","payment_method":"クレジットカード","billing_day":15,"memo":"電気・ガス料金（デモ）"}'
post /fixed-expenses '{"name":"スマートフォン","amount":3980,"category":"通信費","payment_method":"クレジットカード","billing_day":10,"memo":"携帯電話料金（デモ）"}'
post /fixed-expenses '{"name":"Netflix","amount":1490,"category":"娯楽","payment_method":"クレジットカード","billing_day":5,"memo":"動画配信サービス（デモ）"}'

echo "== カテゴリ別予算 8件 =="
post /budgets '{"category":"食費","budget_amount":15000}'
post /budgets '{"category":"交通費","budget_amount":7000}'
post /budgets '{"category":"日用品","budget_amount":5000}'
post /budgets '{"category":"服","budget_amount":9000}'
post /budgets '{"category":"娯楽","budget_amount":3000}'
post /budgets '{"category":"家賃","budget_amount":70000}'
post /budgets '{"category":"光熱費","budget_amount":12000}'
post /budgets '{"category":"通信費","budget_amount":6000}'

echo "== 収支 2026-02 =="
post /transactions '{"date":"2026-02-05","item_name":"バイト代","amount":118000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-02-20","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-02-07","item_name":"食料品まとめ","amount":14500,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-02-12","item_name":"電車・バス","amount":6000,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-02-18","item_name":"洗剤・ティッシュ","amount":3200,"type":"expense","category":"日用品","payment_method":"PayPay","memo":"デモデータ"}'
post /transactions '{"date":"2026-02-24","item_name":"病院","amount":2500,"type":"expense","category":"医療","payment_method":"現金","memo":"デモデータ"}'

echo "== 収支 2026-03 =="
post /transactions '{"date":"2026-03-05","item_name":"バイト代","amount":122000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-03-20","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-03-08","item_name":"食料品まとめ","amount":16500,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-03-13","item_name":"電車・バス","amount":6500,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-03-18","item_name":"春服","amount":7800,"type":"expense","category":"服","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-03-25","item_name":"映画・外出","amount":5500,"type":"expense","category":"娯楽","payment_method":"PayPay","memo":"デモデータ"}'

echo "== 収支 2026-04 =="
post /transactions '{"date":"2026-04-05","item_name":"バイト代","amount":128000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-04-20","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-04-07","item_name":"食料品まとめ","amount":13800,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-04-12","item_name":"通学交通費","amount":6200,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-04-17","item_name":"新生活用品","amount":4500,"type":"expense","category":"日用品","payment_method":"PayPay","memo":"デモデータ"}'
post /transactions '{"date":"2026-04-26","item_name":"カラオケ","amount":3000,"type":"expense","category":"娯楽","payment_method":"現金","memo":"デモデータ"}'

echo "== 収支 2026-05 =="
post /transactions '{"date":"2026-05-05","item_name":"バイト代","amount":125000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-20","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-08","item_name":"食料品まとめ","amount":15000,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-13","item_name":"電車・バス","amount":7000,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-17","item_name":"日用品","amount":3500,"type":"expense","category":"日用品","payment_method":"PayPay","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-22","item_name":"旅行・外出","amount":8500,"type":"expense","category":"娯楽","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-05-28","item_name":"Tシャツ","amount":4200,"type":"expense","category":"服","payment_method":"クレジットカード","memo":"デモデータ"}'

echo "== 収支 2026-06 =="
post /transactions '{"date":"2026-06-05","item_name":"バイト代","amount":132000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-06-20","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-06-07","item_name":"食料品まとめ","amount":14200,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-06-12","item_name":"電車・バス","amount":6500,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-06-18","item_name":"夏服","amount":9800,"type":"expense","category":"服","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-06-25","item_name":"歯科診療","amount":3000,"type":"expense","category":"医療","payment_method":"現金","memo":"デモデータ"}'

echo "== 収支 2026-07 =="
post /transactions '{"date":"2026-07-01","item_name":"バイト代","amount":120000,"type":"income","category":"バイト代","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-02","item_name":"仕送り","amount":50000,"type":"income","category":"仕送り","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-01","item_name":"スーパー","amount":6200,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-02","item_name":"通学定期・電車","amount":4540,"type":"expense","category":"交通費","payment_method":"交通系IC","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-03","item_name":"洗剤・ティッシュ","amount":2400,"type":"expense","category":"日用品","payment_method":"PayPay","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-05","item_name":"カフェ","amount":1450,"type":"expense","category":"食費","payment_method":"PayPay","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-06","item_name":"映画","amount":2000,"type":"expense","category":"娯楽","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-08","item_name":"シャツ","amount":6900,"type":"expense","category":"服","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-10","item_name":"昼食","amount":980,"type":"expense","category":"食費","payment_method":"現金","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-11","item_name":"食料品","amount":4800,"type":"expense","category":"食費","payment_method":"クレジットカード","memo":"デモデータ"}'
post /transactions '{"date":"2026-07-12","item_name":"参考書","amount":3300,"type":"expense","category":"その他","payment_method":"クレジットカード","memo":"デモデータ"}'

echo "== シード完了 =="
