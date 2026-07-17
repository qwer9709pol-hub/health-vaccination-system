-- Add password column to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS password text DEFAULT '2468';

-- Set all existing units password to '2468'
UPDATE units SET password = '2468';

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default admin
INSERT INTO admins (username, password) VALUES ('admin', 'Admin#2468')
ON CONFLICT (username) DO UPDATE SET password = 'Admin#2468';

-- Enable RLS on admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins table: only authenticated users can read (for login)
CREATE POLICY "select_admins_authenticated" ON admins FOR SELECT
  TO authenticated USING (true);

-- No inserts/updates/deletes via API for security
