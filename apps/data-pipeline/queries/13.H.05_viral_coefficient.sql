SELECT
  date_trunc(date, MONTH) as month,
  (SUM(total_shares) / COUNT(DISTINCT parent_id)) * (SUM(new_inquiries) / SUM(total_shares)) as k_factor
FROM
  `ed_analytics_warehouse.viral_stats`
GROUP BY
  month
ORDER BY
  month;
