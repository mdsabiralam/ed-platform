SELECT
  module_name,
  COUNT(*) as screen_views
FROM
  `ed_analytics_warehouse.analytics_events`
WHERE
  event_type = 'SCREEN_VIEW'
GROUP BY
  module_name
ORDER BY
  screen_views DESC;
