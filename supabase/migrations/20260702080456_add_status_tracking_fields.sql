-- Add new fields for enhanced status tracking
ALTER TABLE delayed_children
ADD COLUMN IF NOT EXISTS vaccination_date DATE,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS last_follow_up TIMESTAMPTZ;

-- Update status column to accommodate longer status values
ALTER TABLE delayed_children
ALTER COLUMN status TYPE VARCHAR(50);

-- Add index for better filtering
CREATE INDEX IF NOT EXISTS idx_delayed_children_vaccination_date ON delayed_children(vaccination_date);
CREATE INDEX IF NOT EXISTS idx_delayed_children_updated_by ON delayed_children(updated_by);