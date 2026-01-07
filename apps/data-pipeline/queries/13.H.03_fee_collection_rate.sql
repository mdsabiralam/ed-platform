SELECT
  t.city,
  t.school_size,
  AVG( (l.totalPaid / l.totalInvoiced) * 100 ) AS average_fee_collection_rate
FROM
  `ed_analytics_warehouse.student_fee_ledgers` l
JOIN
  `ed_analytics_warehouse.tenants` t ON l.tenantId = t.id
GROUP BY
  t.city,
  t.school_size;
