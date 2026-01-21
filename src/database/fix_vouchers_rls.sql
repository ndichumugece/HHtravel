-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.booking_vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL, -- e.g. BV-1001
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
  room_type TEXT,
  meal_plan TEXT,
  number_of_rooms INTEGER DEFAULT 1,
  number_of_adults INTEGER DEFAULT 1,
  number_of_children INTEGER DEFAULT 0,

  -- Details
  special_requests TEXT,
  flight_details TEXT,
  arrival_time TEXT,
  
  status TEXT DEFAULT 'issued', -- issued, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.booking_vouchers ENABLE ROW LEVEL SECURITY;

-- 1. DROP existing policies to allow clean recreation
DROP POLICY IF EXISTS "Consultants can view own booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can view all booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can create vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can update own vouchers" ON public.booking_vouchers;

-- 2. Re-create Policies

-- READ: Consultants see their own
CREATE POLICY "Consultants can view own booking vouchers" 
ON public.booking_vouchers FOR SELECT USING (
  auth.uid() = consultant_id
);

-- READ: Admins see ALL
CREATE POLICY "Admins can view all booking vouchers" 
ON public.booking_vouchers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- INSERT: Consultants (and Admins) can create for THEMSELVES
CREATE POLICY "Consultants can create vouchers" 
ON public.booking_vouchers FOR INSERT WITH CHECK (
  auth.uid() = consultant_id
);

-- UPDATE: Consultants (and Admins) can update THEIR OWN
CREATE POLICY "Consultants can update own vouchers" 
ON public.booking_vouchers FOR UPDATE USING (
  auth.uid() = consultant_id
);

-- UPDATE: Admins can update ALL (New Policy for flexibility)
CREATE POLICY "Admins can update all vouchers" 
ON public.booking_vouchers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
