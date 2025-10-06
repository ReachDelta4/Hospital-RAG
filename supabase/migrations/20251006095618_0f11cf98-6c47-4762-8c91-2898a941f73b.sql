-- Create patients table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  contact_number text NOT NULL,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_number text,
  blood_group text,
  allergies text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  illness text NOT NULL,
  symptoms text NOT NULL,
  diagnosis text,
  prescription text,
  doctor_name text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admissions table
CREATE TABLE public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  is_admitted boolean DEFAULT false NOT NULL,
  admission_date timestamp with time zone,
  discharge_date timestamp with time zone,
  floor_number integer,
  room_number text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(patient_id)
);

-- Create billing table
CREATE TABLE public.billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  total_amount numeric(10,2) DEFAULT 0 NOT NULL,
  amount_paid numeric(10,2) DEFAULT 0 NOT NULL,
  amount_due numeric(10,2) DEFAULT 0 NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  billing_items jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(patient_id)
);

-- Create profiles table for staff
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text DEFAULT 'staff' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated staff
CREATE POLICY "Staff can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff can view all medical records"
  ON public.medical_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert medical records"
  ON public.medical_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update medical records"
  ON public.medical_records FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff can view all admissions"
  ON public.admissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert admissions"
  ON public.admissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update admissions"
  ON public.admissions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff can view all billing"
  ON public.billing FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert billing"
  ON public.billing FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update billing"
  ON public.billing FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Staff Member'),
    'staff'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
  BEFORE UPDATE ON public.billing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();