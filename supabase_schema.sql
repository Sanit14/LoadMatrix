-- ==============================================================
-- AI-Transit Manifest Engine (ATME) — Database Schema Setup
-- Run this script inside your Supabase project's SQL Editor.
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Master lookup tables (for autocomplete)
CREATE TABLE IF NOT EXISTS customers_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receivers_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent: Trip record
CREATE TABLE IF NOT EXISTS trip_challans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challan_no VARCHAR(100) UNIQUE NOT NULL,
  truck_no VARCHAR(50) NOT NULL,
  driver_name VARCHAR(150) NOT NULL,
  origin VARCHAR(100),
  destination VARCHAR(100),
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_biltis INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  total_weight NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child: Individual consignment lines
CREATE TABLE IF NOT EXISTS bilti_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challan_id UUID REFERENCES trip_challans(id) ON DELETE CASCADE NOT NULL,
  bilti_no VARCHAR(100) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  goods_type VARCHAR(150) NOT NULL,
  items_count INTEGER NOT NULL DEFAULT 0,
  weight_numeric NUMERIC(10,2) NOT NULL DEFAULT 0,
  weight_auto_calculated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Setup
ALTER TABLE customers_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivers_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilti_entries ENABLE ROW LEVEL SECURITY;

-- Allow all for public / authenticated users to facilitate quick operations
CREATE POLICY "Allow all for authenticated users" ON customers_master
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON receivers_master
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON trip_challans
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON bilti_entries
  FOR ALL USING (true) WITH CHECK (true);
