-- Fix RLS policy for units table to allow anon access
-- This is needed because Excel import uses anon key to look up unit codes

-- Drop the existing policy
DROP POLICY IF EXISTS "select_units_authenticated" ON units;

-- Create new policy that allows both anon and authenticated roles
CREATE POLICY "select_units_all" ON units FOR SELECT
  TO anon, authenticated USING (true);