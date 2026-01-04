CREATE OR REPLACE FUNCTION calculate_commission(invoice_amount DECIMAL, tier_percent DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN (invoice_amount * tier_percent) / 100.0;
END;
$$;
