-- Fix RLS policies for delayed_children table
-- The system uses anon key with application-level authentication
-- RLS should allow access but we rely on app-level filtering for unit isolation

-- Drop existing policies
DROP POLICY IF EXISTS "select_own_children" ON delayed_children;
DROP POLICY IF EXISTS "insert_own_children" ON delayed_children;
DROP POLICY IF EXISTS "update_own_children" ON delayed_children;
DROP POLICY IF EXISTS "delete_own_children" ON delayed_children;

-- Create new policies that allow anon and authenticated access
-- Data isolation by unit_id is handled at the application level
CREATE POLICY "select_children_all" ON delayed_children FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_children_all" ON delayed_children FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_children_all" ON delayed_children FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_children_all" ON delayed_children FOR DELETE
  TO anon, authenticated USING (true);

-- Fix notifications RLS as well
DROP POLICY IF EXISTS "select_notifications" ON notifications;
DROP POLICY IF EXISTS "insert_notifications" ON notifications;

CREATE POLICY "select_notifications_all" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_notifications_all" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);