-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Extends Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'consultant')) DEFAULT 'consultant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- PROPERTIES TABLE
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  contact_info JSONB, -- { phone, email, website }
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Everyone can read properties
CREATE POLICY "Properties are viewable by authenticated users" 
ON public.properties FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update properties (We'll assume 'admin' role check in app logic or via custom claim, 
-- but for now, let's allow all authenticated to read, and maybe restrict write)
-- Ideally: USING (auth.jwt() ->> 'role' = 'admin') or similar if using custom claims, 
-- or checking against profiles table.
CREATE POLICY "Admins can manage properties" 
ON public.properties FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- BOOKING VOUCHERS
CREATE TABLE public.booking_vouchers (
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
  property_name TEXT NOT NULL, -- Snapshot name in case property changes
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

ALTER TABLE public.booking_vouchers ENABLE ROW LEVEL SECURITY;

-- Consultants see ONLY their own vouchers
CREATE POLICY "Consultants can view own booking vouchers" 
ON public.booking_vouchers FOR SELECT USING (
  auth.uid() = consultant_id
);

-- Admins see ALL booking vouchers
CREATE POLICY "Admins can view all booking vouchers" 
ON public.booking_vouchers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Insert policy
CREATE POLICY "Consultants can create vouchers" 
ON public.booking_vouchers FOR INSERT WITH CHECK (
  auth.uid() = consultant_id
);

-- Update policy (Owner or Admin)
CREATE POLICY "Consultants can update own vouchers" 
ON public.booking_vouchers FOR UPDATE USING (
  auth.uid() = consultant_id
);


-- QUOTATION VOUCHERS
CREATE TABLE public.quotation_vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL, -- e.g. QV-1001
  consultant_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  client_name TEXT NOT NULL,
  package_type TEXT,
  booking_status TEXT DEFAULT 'Tentative', -- Tentative, Confirmed
  
  check_in_date DATE,
  check_out_date DATE,
  number_of_nights INTEGER,
  number_of_guests TEXT, -- "2 Adults, 1 Child"
  number_of_rooms INTEGER,

  hotel_comparison JSONB, -- Array of objects: { property_name, meal_plan, single_price, double_price }
  
  includes_list TEXT[],
  meal_plan_explanation TEXT,
  terms_and_conditions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quotation_vouchers ENABLE ROW LEVEL SECURITY;

-- Consultants see ONLY their own quotations
CREATE POLICY "Consultants can view own quotations" 
ON public.quotation_vouchers FOR SELECT USING (
  auth.uid() = consultant_id
);

-- Admins see ALL quotations
CREATE POLICY "Admins can view all quotations" 
ON public.quotation_vouchers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Consultants can create quotations" 
ON public.quotation_vouchers FOR INSERT WITH CHECK (
  auth.uid() = consultant_id
);

CREATE POLICY "Consultants can update own quotations" 
ON public.quotation_vouchers FOR UPDATE USING (
  auth.uid() = consultant_id
);


-- TRIGGER FOR NEW USER PROFILE
-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'consultant');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
