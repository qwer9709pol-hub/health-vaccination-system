-- Units table
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 43 health units
INSERT INTO units (unit_name) VALUES
('ميت غمر'),
('دقادوس'),
('كوم النور'),
('دماص'),
('سنفا'),
('أتميدة'),
('بشلا'),
('أوليلة'),
('صهرجت الكبرى'),
('كفر المقدام'),
('ميت الفرماوي'),
('ميت محسن'),
('ميت أبو خالد'),
('دنديط'),
('ميت القرشي'),
('تفهنا الأشراف'),
('سنتماي'),
('بشالوش'),
('كفور البهايتة'),
('سمبو مقام'),
('البوها'),
('كفر النعمان'),
('سرنجا'),
('كفر سرنجا'),
('كفر بهيدة'),
('ميت ناجي'),
('المعصرة'),
('ميت العز'),
('كفر ميت العز'),
('هلا'),
('القيطون'),
('كفر الشيخ هلال'),
('جصفا'),
('ميت يعيش'),
('الرحمانية'),
('الدبونية'),
('كفر الوزير'),
('كفر الشراقوة'),
('أبو نبهان'),
('بهيدة'),
('كفر الهجرسي'),
('كفر المحمدية'),
('رعاية أول');

-- Delayed children table
CREATE TABLE delayed_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  child_name VARCHAR(255) NOT NULL,
  mother_name VARCHAR(255),
  birth_date DATE,
  age INTEGER,
  phone_number VARCHAR(50),
  delayed_vaccine VARCHAR(255),
  last_vaccine VARCHAR(255),
  status VARCHAR(50) DEFAULT 'لم يتم التطعيم',
  follow_up_notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE delayed_children ENABLE ROW LEVEL SECURITY;

-- RLS policies for units (accessible to all authenticated users)
CREATE POLICY "select_units_authenticated" ON units FOR SELECT
  TO authenticated USING (true);

-- RLS policies for delayed_children
CREATE POLICY "select_own_children" ON delayed_children FOR SELECT
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.uid() = id
    )
  );

CREATE POLICY "insert_own_children" ON delayed_children FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_own_children" ON delayed_children FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_own_children" ON delayed_children FOR DELETE
  TO authenticated USING (true);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES delayed_children(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'warning',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_notifications" ON notifications FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_delayed_children_unit ON delayed_children(unit_id);
CREATE INDEX idx_delayed_children_status ON delayed_children(status);
CREATE INDEX idx_delayed_children_phone ON delayed_children(phone_number);
CREATE INDEX idx_notifications_unit ON notifications(unit_id);