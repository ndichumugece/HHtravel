-- Add return journey fields to train_receipts table
ALTER TABLE public.train_receipts 
ADD COLUMN IF NOT EXISTS has_return_journey BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS return_train_type TEXT,
ADD COLUMN IF NOT EXISTS return_from_station TEXT,
ADD COLUMN IF NOT EXISTS return_to_station TEXT,
ADD COLUMN IF NOT EXISTS return_departure_date DATE,
ADD COLUMN IF NOT EXISTS return_departure_time TEXT,
ADD COLUMN IF NOT EXISTS return_arrival_time TEXT,
ADD COLUMN IF NOT EXISTS return_ticket_number TEXT,
ADD COLUMN IF NOT EXISTS return_guests JSONB DEFAULT '[]'::jsonb;
