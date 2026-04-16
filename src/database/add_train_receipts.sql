-- Create train_receipts table
CREATE TABLE IF NOT EXISTS public.train_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL, -- e.g. TR-1001
  consultant_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  -- Client & Contact Info
  client_name TEXT NOT NULL,
  mobile_number TEXT,
  
  -- Train Info
  train_type TEXT NOT NULL, -- Inter county, Express, Suswa train
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  ticket_number TEXT,

  -- Guest Details (Dynamic list)
  -- Structure: [{ name: string, coach_no: string, seat_no: string }]
  guests JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.train_receipts ENABLE ROW LEVEL SECURITY;

-- 1. DROP existing policies
DROP POLICY IF EXISTS "Consultants can view own train receipts" ON public.train_receipts;
DROP POLICY IF EXISTS "Admins can view all train receipts" ON public.train_receipts;
DROP POLICY IF EXISTS "Consultants can create train receipts" ON public.train_receipts;
DROP POLICY IF EXISTS "Consultants can update own train receipts" ON public.train_receipts;
DROP POLICY IF EXISTS "Admins can update all train receipts" ON public.train_receipts;

-- 2. Create Policies
CREATE POLICY "Consultants can view own train receipts" 
ON public.train_receipts FOR SELECT USING (auth.uid() = consultant_id);

CREATE POLICY "Admins can view all train receipts" 
ON public.train_receipts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Consultants can create train receipts" 
ON public.train_receipts FOR INSERT WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Consultants can update own train receipts" 
ON public.train_receipts FOR UPDATE USING (auth.uid() = consultant_id);

CREATE POLICY "Admins can update all train receipts" 
ON public.train_receipts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Create sequence for train receipt reference number
CREATE SEQUENCE IF NOT EXISTS public.train_receipt_ref_seq START 1001;

-- Function to get next train receipt reference number
CREATE OR REPLACE FUNCTION public.get_next_train_receipt_ref()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val INTEGER;
BEGIN
  next_val := nextval('public.train_receipt_ref_seq');
  RETURN 'TR-' || next_val;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_next_train_receipt_ref TO authenticated;
