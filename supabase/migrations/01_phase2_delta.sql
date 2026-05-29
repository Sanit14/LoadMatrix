-- User profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'clerk' CHECK (role IN ('clerk', 'supervisor')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add clerk_id and status columns to trip_challans
ALTER TABLE trip_challans
  ADD COLUMN IF NOT EXISTS clerk_id UUID REFERENCES user_profiles(id),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'saved'
    CHECK (status IN ('saved', 'printed', 'pending'));

-- RLS: clerks see only their own trips; supervisors see all
DROP POLICY IF EXISTS "Allow all for authenticated users" ON trip_challans;

CREATE POLICY "Clerk sees own trips" ON trip_challans
  FOR SELECT USING (
    clerk_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'supervisor'
    )
  );

CREATE POLICY "Clerk inserts own trips" ON trip_challans
  FOR INSERT WITH CHECK (clerk_id = auth.uid());

CREATE POLICY "Supervisor can update any trip" ON trip_challans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'supervisor'
    )
  );

-- Goods weight rules (replaces hardcoded GOODS_WEIGHT_RULES constant)
CREATE TABLE IF NOT EXISTS goods_weight_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(100) UNIQUE NOT NULL,
  weight_per_unit NUMERIC(8,2) NOT NULL,
  unit_label VARCHAR(50) DEFAULT 'bag',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default rules
INSERT INTO goods_weight_rules (keyword, weight_per_unit, unit_label) VALUES
  ('cement',     50,  'bag'),
  ('rice',       50,  'sack'),
  ('wheat',      50,  'sack'),
  ('sugar',      50,  'bag'),
  ('fertilizer', 45,  'bag'),
  ('cotton',     170, 'bale')
ON CONFLICT (keyword) DO NOTHING;

-- RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own profile" ON user_profiles;
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Supervisor sees all profiles" ON user_profiles;
CREATE POLICY "Supervisor sees all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor')
  );

ALTER TABLE goods_weight_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated read rules" ON goods_weight_rules;
CREATE POLICY "All authenticated read rules" ON goods_weight_rules
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Supervisor manages rules" ON goods_weight_rules;
CREATE POLICY "Supervisor manages rules" ON goods_weight_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor')
  );
