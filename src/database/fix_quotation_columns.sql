-- CONSOLIDATED FIX FOR QUOTATION VOUCHERS TABLE
-- This script ensures all missing columns are added to the quotation_vouchers table.
-- RUN THIS IN YOUR SUPABASE SQL EDITOR.

-- 1. Guest and Room Info
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS number_of_adults INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_rooms INTEGER DEFAULT 1;

-- 2. Room Arrangements
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS room_arrangements TEXT;

-- 3. Travel Date Options
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS travel_date_type TEXT DEFAULT 'specific',
ADD COLUMN IF NOT EXISTS travel_month TEXT;

-- 4. Visibility Toggles
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS show_hotel_comparison BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_inclusions_exclusions BOOLEAN DEFAULT false;

-- 5. Rich Text Notes
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS rich_text_notes TEXT;

-- 6. Inclusions and Exclusions
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS inclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exclusions JSONB DEFAULT '[]'::jsonb;

-- 7. Ensure defaults for existing rows (safe to run)
UPDATE public.quotation_vouchers SET travel_date_type = 'specific' WHERE travel_date_type IS NULL;
UPDATE public.quotation_vouchers SET number_of_rooms = 1 WHERE number_of_rooms IS NULL;
UPDATE public.quotation_vouchers SET show_hotel_comparison = false WHERE show_hotel_comparison IS NULL;
UPDATE public.quotation_vouchers SET show_inclusions_exclusions = false WHERE show_inclusions_exclusions IS NULL;

-- Notify Postgres to refresh the schema cache
NOTIFY pgrst, 'reload schema';
