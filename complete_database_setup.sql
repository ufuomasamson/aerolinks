-- =====================================================
-- AeroLink Complete Database Setup for Supabase
-- =====================================================
-- This file contains all necessary tables, policies, functions, and configurations
-- for the AeroLink flight booking system to function properly.
-- Run this entire file in your new Supabase project's SQL editor.

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Locations Table (must be created first due to foreign key dependencies)
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(64) NOT NULL,
  country VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city, country)
);

-- Airlines Table
CREATE TABLE IF NOT EXISTS airlines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  logo_url VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flights Table
CREATE TABLE IF NOT EXISTS flights (
  id SERIAL PRIMARY KEY,
  airline_id INTEGER NOT NULL,
  flight_number VARCHAR(32) NOT NULL,
  departure_location_id INTEGER NOT NULL,
  arrival_location_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(16) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  passenger_name VARCHAR(128),
  tracking_number VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (alternative user profile structure)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(128),
  role VARCHAR(32) DEFAULT 'user',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id INTEGER NOT NULL,
  passenger_name TEXT NOT NULL,
  paid BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  payment_method TEXT,
  amount DECIMAL(10, 2),
  transaction_ref VARCHAR(64),
  payment_status VARCHAR(32) DEFAULT 'pending',
  payment_transaction_id VARCHAR(128),
  flight_amount DECIMAL(12,2),
  currency VARCHAR(8) DEFAULT 'USD',
  ticket_url VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'USD',
  payment_method VARCHAR(64),
  status VARCHAR(32) DEFAULT 'pending',
  transaction_id VARCHAR(128),
  payment_proof_url TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crypto Wallets Table
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  qr_code_url VARCHAR(255) NOT NULL,
  network VARCHAR(64) NOT NULL DEFAULT 'Unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Currencies Table
CREATE TABLE IF NOT EXISTS currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  name VARCHAR(32) NOT NULL,
  symbol VARCHAR(8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Gateways Table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  type VARCHAR(64),
  api_key VARCHAR(128),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_id INTEGER,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Details Table (for bank transfer payments)
CREATE TABLE IF NOT EXISTS bank_details (
  id SERIAL PRIMARY KEY,
  details TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints to flights table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'flights_airline_id_fkey' 
    AND table_name = 'flights'
  ) THEN
    ALTER TABLE flights ADD CONSTRAINT flights_airline_id_fkey 
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'flights_departure_location_id_fkey' 
    AND table_name = 'flights'
  ) THEN
    ALTER TABLE flights ADD CONSTRAINT flights_departure_location_id_fkey 
    FOREIGN KEY (departure_location_id) REFERENCES locations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'flights_arrival_location_id_fkey' 
    AND table_name = 'flights'
  ) THEN
    ALTER TABLE flights ADD CONSTRAINT flights_arrival_location_id_fkey 
    FOREIGN KEY (arrival_location_id) REFERENCES locations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraints to bookings table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_flight_id_fkey' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_flight_id_fkey 
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraints to payments table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_booking_id_fkey' 
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_booking_id_fkey 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraints to user_preferences table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_preferences_currency_id_fkey' 
    AND table_name = 'user_preferences'
  ) THEN
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_currency_id_fkey 
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_transaction_ref ON bookings(transaction_ref) WHERE transaction_ref IS NOT NULL;

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Flights table indexes
CREATE INDEX IF NOT EXISTS idx_flights_airline_id ON flights(airline_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_location_id ON flights(departure_location_id);
CREATE INDEX IF NOT EXISTS idx_flights_arrival_location_id ON flights(arrival_location_id);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(date);

-- Crypto wallets indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);

-- Payment gateways unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS payment_gateways_name_type_unique 
ON payment_gateways (name, type);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES FOR EACH TABLE
-- =====================================================

-- Locations policies
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
CREATE POLICY "Locations are viewable by everyone" ON locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Locations are editable by admins" ON locations;
CREATE POLICY "Locations are editable by admins" ON locations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Airlines policies
DROP POLICY IF EXISTS "Airlines are viewable by everyone" ON airlines;
CREATE POLICY "Airlines are viewable by everyone" ON airlines
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Airlines are editable by admins" ON airlines;
CREATE POLICY "Airlines are editable by admins" ON airlines
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Flights policies
DROP POLICY IF EXISTS "Flights are viewable by everyone" ON flights;
CREATE POLICY "Flights are viewable by everyone" ON flights
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Flights are editable by admins" ON flights;
CREATE POLICY "Flights are editable by admins" ON flights
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all data" ON users;
CREATE POLICY "Admin can view all data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own payments" ON payments;
CREATE POLICY "Users can create their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Crypto wallets policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON crypto_wallets;
CREATE POLICY "Users can view their own wallets" ON crypto_wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own wallets" ON crypto_wallets;
CREATE POLICY "Users can create their own wallets" ON crypto_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallets" ON crypto_wallets;
CREATE POLICY "Users can update their own wallets" ON crypto_wallets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all wallets" ON crypto_wallets;
CREATE POLICY "Admins can view all wallets" ON crypto_wallets
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Currencies policies
DROP POLICY IF EXISTS "Currencies are viewable by everyone" ON currencies;
CREATE POLICY "Currencies are viewable by everyone" ON currencies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Currencies are editable by admins" ON currencies;
CREATE POLICY "Currencies are editable by admins" ON currencies
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Payment gateways policies
DROP POLICY IF EXISTS "Payment gateways are viewable by admins" ON payment_gateways;
CREATE POLICY "Payment gateways are viewable by admins" ON payment_gateways
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Payment gateways are editable by admins" ON payment_gateways;
CREATE POLICY "Payment gateways are editable by admins" ON payment_gateways
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- User preferences policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all preferences" ON user_preferences;
CREATE POLICY "Admins can view all preferences" ON user_preferences
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Bank details policies
DROP POLICY IF EXISTS "Bank details are viewable by everyone" ON bank_details;
CREATE POLICY "Bank details are viewable by everyone" ON bank_details
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bank details are editable by admins" ON bank_details;
CREATE POLICY "Bank details are editable by admins" ON bank_details
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = NEW.email,
      full_name = NEW.raw_user_meta_data->>'full_name',
      role = COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all tables (utility function)
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (table_name text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text
  FROM 
    information_schema.tables t
  WHERE 
    t.table_schema = 'public'
  ORDER BY 
    t.table_name;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 7. INITIAL DATA SEEDING
-- =====================================================

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES 
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('NGN', 'Nigerian Naira', '₦'),
('CAD', 'Canadian Dollar', 'C$'),
('AUD', 'Australian Dollar', 'A$')
ON CONFLICT (code) DO NOTHING;

-- Insert default payment gateways
INSERT INTO payment_gateways (name, type, api_key, enabled) VALUES 
('flutterwave', 'test_public', '', TRUE),
('flutterwave', 'test_secret', '', TRUE),
('flutterwave', 'test_encryption', '', TRUE),
('flutterwave', 'live_public', '', TRUE),
('flutterwave', 'live_secret', '', TRUE),
('flutterwave', 'live_encryption', '', TRUE),
('paystack', 'test_public', '', TRUE),
('paystack', 'test_secret', '', TRUE),
('paystack', 'live_public', '', TRUE),
('paystack', 'live_secret', '', TRUE)
ON CONFLICT (name, type) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (city, country) VALUES 
('New York', 'United States'),
('London', 'United Kingdom'),
('Paris', 'France'),
('Tokyo', 'Japan'),
('Dubai', 'United Arab Emirates'),
('Lagos', 'Nigeria'),
('Toronto', 'Canada'),
('Sydney', 'Australia'),
('Amsterdam', 'Netherlands'),
('Istanbul', 'Turkey')
ON CONFLICT (city, country) DO NOTHING;

-- Insert sample airlines
INSERT INTO airlines (name, logo_url) VALUES 
('United Airlines', 'https://example.com/united-logo.png'),
('Delta Air Lines', 'https://example.com/delta-logo.png'),
('American Airlines', 'https://example.com/american-logo.png'),
('British Airways', 'https://example.com/british-logo.png'),
('Air France', 'https://example.com/airfrance-logo.png'),
('Emirates', 'https://example.com/emirates-logo.png'),
('Lufthansa', 'https://example.com/lufthansa-logo.png'),
('Turkish Airlines', 'https://example.com/turkish-logo.png')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 8. PERMISSIONS AND GRANTS
-- =====================================================

-- Grant permissions to service role (for server-side operations)
GRANT ALL ON TABLE locations TO service_role;
GRANT ALL ON TABLE airlines TO service_role;
GRANT ALL ON TABLE flights TO service_role;
GRANT ALL ON TABLE users TO service_role;
GRANT ALL ON TABLE profiles TO service_role;
GRANT ALL ON TABLE bookings TO service_role;
GRANT ALL ON TABLE payments TO service_role;
GRANT ALL ON TABLE crypto_wallets TO service_role;
GRANT ALL ON TABLE currencies TO service_role;
GRANT ALL ON TABLE payment_gateways TO service_role;
GRANT ALL ON TABLE user_preferences TO service_role;
GRANT ALL ON TABLE bank_details TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON TABLE users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE crypto_wallets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE user_preferences TO authenticated;

-- Grant permissions to anonymous users (for public data)
GRANT SELECT ON TABLE locations TO anon;
GRANT SELECT ON TABLE airlines TO anon;
GRANT SELECT ON TABLE flights TO anon;
GRANT SELECT ON TABLE currencies TO anon;
GRANT SELECT ON TABLE bank_details TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tables() TO anon;

-- =====================================================
-- 9. STORAGE SETUP (requires manual bucket creation)
-- =====================================================

-- Note: You need to create the 'unit-bucket' storage bucket manually in Supabase dashboard
-- After creating the bucket, run the following storage policies:

-- Storage policies for payment proofs
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'unit-bucket');

DROP POLICY IF EXISTS "Allow public access to payment proofs" ON storage.objects;
CREATE POLICY "Allow public access to payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'unit-bucket');

DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
CREATE POLICY "Allow users to delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'unit-bucket' AND (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )));

-- =====================================================
-- 10. ADMIN USER SETUP
-- =====================================================

-- Function to set admin role for a user
CREATE OR REPLACE FUNCTION set_admin_role(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User with email ' || user_email || ' not found';
  END IF;
  
  -- Update the user's metadata to set role=admin
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
      ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
    END
  WHERE id = user_id;
  
  -- Update the users table
  UPDATE public.users
  SET role = 'admin',
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN 'Admin role has been set for ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display completion message
SELECT 'AeroLink database setup completed successfully!' as status;

-- Show all created tables
SELECT 'Created tables:' as info;
SELECT table_name FROM get_tables() ORDER BY table_name;

-- Instructions for next steps
SELECT 'Next steps:' as instructions;
SELECT '1. Create storage bucket named "unit-bucket" in Supabase dashboard' as step1;
SELECT '2. Set admin role for your user: SELECT set_admin_role(''your-email@example.com'');' as step2;
SELECT '3. Configure your payment gateway API keys in the payment_gateways table' as step3;
SELECT '4. Add your bank details to the bank_details table' as step4;
