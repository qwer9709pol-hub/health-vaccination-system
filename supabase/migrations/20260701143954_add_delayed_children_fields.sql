/*
# Add extended child and unit fields

## Summary
Adds a set of descriptive columns to the `delayed_children` table to capture
extra information collected during delayed-vaccination follow-up. The `units`
table already has a `unit_code` integer column, so no change is required there.

## Changes to `delayed_children`
1. `registration_number` (text) — nullable. Free-form registration/record
   identifier for the child within the unit's records.
2. `unit_code` (integer) — nullable. Denormalized copy of the owning unit's
   code, kept for quick filtering/reporting without joining to `units`.
3. `reporter_phone` (text) — nullable. Phone number of the person who
   reported the delayed-vaccination case (may differ from the mother's phone).
4. `address` (text) — nullable. Residential address of the child/family.
5. `dose` (text) — nullable. Dose information for the delayed vaccine
   (e.g. "1st dose", "booster").

## Changes to `units`
- None. The `unit_code` integer column already exists on this table.

## Security
- No changes to RLS. Both tables already have RLS enabled with existing
  policies; new columns inherit the table's existing row-level access rules.

## Important notes
1. All new columns are nullable and have no default, so existing rows are
   unaffected and inserts that omit them continue to work.
2. No existing columns are removed, renamed, or type-changed — this is a
   purely additive, data-safe migration.
3. Column additions are wrapped in `IF NOT EXISTS` checks so the migration is
   idempotent and safe to re-apply after a timeout.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'delayed_children'
      AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE public.delayed_children
      ADD COLUMN registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'delayed_children'
      AND column_name = 'unit_code'
  ) THEN
    ALTER TABLE public.delayed_children
      ADD COLUMN unit_code integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'delayed_children'
      AND column_name = 'reporter_phone'
  ) THEN
    ALTER TABLE public.delayed_children
      ADD COLUMN reporter_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'delayed_children'
      AND column_name = 'address'
  ) THEN
    ALTER TABLE public.delayed_children
      ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'delayed_children'
      AND column_name = 'dose'
  ) THEN
    ALTER TABLE public.delayed_children
      ADD COLUMN dose text;
  END IF;
END $$;
