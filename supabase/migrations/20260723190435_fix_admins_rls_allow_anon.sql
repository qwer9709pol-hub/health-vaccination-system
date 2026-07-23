DROP POLICY IF EXISTS "select_admins_authenticated" ON admins;

CREATE POLICY "select_admins_anon" ON admins FOR SELECT
  TO anon, authenticated USING (true);
