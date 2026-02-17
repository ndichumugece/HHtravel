-- Add columns to inclusions table
ALTER TABLE inclusions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE inclusions ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE inclusions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add columns to exclusions table
ALTER TABLE exclusions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE exclusions ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE exclusions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Create unique constraint on slug if it doesn't exist (optional, but good practice)
-- removing UNIQUE constraint for now to avoid issues with existing duplicate names, 
-- ideally we'd auto-generate slugs for existing rows first.

-- Auto-generate slugs for existing items
UPDATE inclusions SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
UPDATE exclusions SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
