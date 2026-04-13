-- Create confirmation_vouchers table
CREATE TABLE IF NOT EXISTS public.confirmation_vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL, -- e.g. CV-1001
  consultant_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  -- Guest Info
  guest_name TEXT NOT NULL,
  guest_nationality TEXT,
  guest_contact TEXT,

  -- Stay Info
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_nights INTEGER,
  
  -- Property & Room Info
  property_name TEXT NOT NULL,
  number_of_rooms INTEGER DEFAULT 1,
  number_of_adults INTEGER DEFAULT 1,
  number_of_children INTEGER DEFAULT 0,
  room_details JSONB DEFAULT '[]'::jsonb,
  room_arrangements TEXT,

  -- Details
  special_requests TEXT,
  flight_details TEXT,
  arrival_time TEXT,
  departure_time TEXT,
  
  -- Config Toggles (for the sidebar)
  show_flight_details BOOLEAN DEFAULT true,
  show_special_requests BOOLEAN DEFAULT true,
  
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, draft
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.confirmation_vouchers ENABLE ROW LEVEL SECURITY;

-- 1. DROP existing policies
DROP POLICY IF EXISTS "Consultants can view own confirmation vouchers" ON public.confirmation_vouchers;
DROP POLICY IF EXISTS "Admins can view all confirmation vouchers" ON public.confirmation_vouchers;
DROP POLICY IF EXISTS "Consultants can create confirmation vouchers" ON public.confirmation_vouchers;
DROP POLICY IF EXISTS "Consultants can update own confirmation vouchers" ON public.confirmation_vouchers;
DROP POLICY IF EXISTS "Admins can update all confirmation vouchers" ON public.confirmation_vouchers;

-- 2. Create Policies
CREATE POLICY "Consultants can view own confirmation vouchers" 
ON public.confirmation_vouchers FOR SELECT USING (auth.uid() = consultant_id);

CREATE POLICY "Admins can view all confirmation vouchers" 
ON public.confirmation_vouchers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Consultants can create confirmation vouchers" 
ON public.confirmation_vouchers FOR INSERT WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Consultants can update own confirmation vouchers" 
ON public.confirmation_vouchers FOR UPDATE USING (auth.uid() = consultant_id);

CREATE POLICY "Admins can update all confirmation vouchers" 
ON public.confirmation_vouchers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
