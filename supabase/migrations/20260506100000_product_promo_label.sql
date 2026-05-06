-- Add promo_label to products for "BUY 2 FOR R219" style badges
ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_label TEXT DEFAULT NULL;
