SELECT
  reseller_name,
  COUNT(DISTINCT school_id) as new_schools_onboarded_monthly,
  SUM(recurring_revenue) as total_arr
FROM
  `ed_analytics_warehouse.franchise_sales`
WHERE
  sale_date >= DATE_TRUNC(CURRENT_DATE(), MONTH)
GROUP BY
  reseller_name
ORDER BY
  total_arr DESC
LIMIT 10;
