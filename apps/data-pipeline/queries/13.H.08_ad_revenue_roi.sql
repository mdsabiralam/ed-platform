SELECT
  campaign_id,
  school_id,
  ad_spend,
  new_admissions,
  (ad_spend / new_admissions) as cpa,
  ((new_admissions * avg_lifetime_value) - ad_spend) / ad_spend * 100 as roi
FROM
  `ed_analytics_warehouse.marketing_campaigns`
WHERE
  ((new_admissions * avg_lifetime_value) - ad_spend) / ad_spend * 100 > 300;
