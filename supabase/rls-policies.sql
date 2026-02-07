-- Row Level Security (RLS) Policies for Guest Manual App
-- Run these in the Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- PROPERTIES TABLE
-- ============================================

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own properties
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (auth.uid() = owner_id);

-- Policy: Users can insert properties (they become the owner)
CREATE POLICY "Users can create properties"
ON properties FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can only update their own properties
CREATE POLICY "Users can update own properties"
ON properties FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can only delete their own properties
CREATE POLICY "Users can delete own properties"
ON properties FOR DELETE
USING (auth.uid() = owner_id);

-- Policy: Anyone can view properties by slug (for guest view)
CREATE POLICY "Public can view properties by slug"
ON properties FOR SELECT
USING (true);
-- Note: This allows public read. If you want slug-only access,
-- you'd need to handle this in application logic or use a function.

-- ============================================
-- MANUAL_SECTIONS TABLE
-- ============================================

-- Enable RLS on manual_sections table
ALTER TABLE manual_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sections of properties they own
CREATE POLICY "Users can view sections of own properties"
ON manual_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = manual_sections.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- Policy: Anyone can view sections (for guest view)
CREATE POLICY "Public can view sections"
ON manual_sections FOR SELECT
USING (true);

-- Policy: Users can insert sections to properties they own
CREATE POLICY "Users can create sections for own properties"
ON manual_sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = manual_sections.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- Policy: Users can update sections of properties they own
CREATE POLICY "Users can update sections of own properties"
ON manual_sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = manual_sections.property_id
    AND properties.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = manual_sections.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- Policy: Users can delete sections of properties they own
CREATE POLICY "Users can delete sections of own properties"
ON manual_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = manual_sections.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- ============================================
-- STORAGE BUCKET POLICIES (run separately)
-- ============================================
-- Go to Storage > property-assets > Policies and add:
--
-- For uploads (INSERT):
--   Policy name: "Authenticated users can upload"
--   Allowed operation: INSERT
--   Policy definition: (auth.role() = 'authenticated')
--
-- For public read (SELECT):
--   Policy name: "Public can view assets"
--   Allowed operation: SELECT
--   Policy definition: true
