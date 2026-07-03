/*
# Populate units with unit_code mapping

## Summary
The `units` table was empty (no rows). This migration inserts the 43 health
units with their canonical Arabic names and the agreed integer `unit_code`
mapping (1–43). This is required because the Excel import now resolves units
by `unit_code` rather than `unit_name`, so every unit must have a code.

## Changes
- Inserts 43 rows into `public.units`.
- Each row: `unit_name` (Arabic) + `unit_code` (integer 1–43).
- `id` defaults to `gen_random_uuid()`, `created_at` defaults to `now()`.

## Security
- No RLS / policy changes. `units` already has RLS enabled with existing policies.

## Important notes
1. The table was empty, so this is a pure insert — no existing data is modified.
2. `unit_name` values are matched exactly to the provided mapping.
3. Idempotent: uses `ON CONFLICT (unit_name) DO UPDATE SET unit_code = EXCLUDED.unit_code`
   so re-running corrects/updates codes without duplicating rows.
*/

INSERT INTO public.units (unit_name, unit_code) VALUES
  ('ميت غمر', 1),
  ('دقادوس', 2),
  ('كوم النور', 3),
  ('دماص', 4),
  ('سنفا', 5),
  ('اتميدة', 6),
  ('بشلا', 7),
  ('أوليلة', 8),
  ('صهرجت الكبرى', 9),
  ('كفر المقدام', 10),
  ('ميت الفرماوي', 11),
  ('ميت محسن', 12),
  ('ميت أبو خالد', 13),
  ('دنديط', 14),
  ('ميت القرشي', 15),
  ('تفهنا الأشراف', 16),
  ('سنتماي', 17),
  ('بشالوش', 18),
  ('كفور البهايتة', 19),
  ('سمبو مقام', 20),
  ('البوها', 21),
  ('كفر النعمان', 22),
  ('سرنجا', 23),
  ('كفر سرنجا', 24),
  ('كفر بهيدة', 25),
  ('ميت ناجي', 26),
  ('المعصرة', 27),
  ('ميت العز', 28),
  ('كفر ميت العز', 29),
  ('هلا', 30),
  ('القيطون', 31),
  ('كفر الشيخ هلال', 32),
  ('جصفا', 33),
  ('ميت يعيش', 34),
  ('الرحمانية', 35),
  ('الدبونية', 36),
  ('كفر الوزير', 37),
  ('كفر الشراقوة', 38),
  ('أبو نبهان', 39),
  ('بهيدة', 40),
  ('كفر الهجرسي', 41),
  ('كفر المحمدية', 42),
  ('رعاية أول', 43)
ON CONFLICT (unit_name) DO UPDATE SET unit_code = EXCLUDED.unit_code;
