/* 
# Refine Delete Policy for Manual Sections
1. Changes
  - Drops the generic "FOR ALL" policy for manual_sections.
  - Adds specific policies for SELECT, INSERT, UPDATE, and DELETE.
  - Ensures DELETE policy is straightforward to prevent RLS evaluation errors.
2. Purpose
  - Fixes issues where "FOR ALL" policies with complex subqueries can sometimes fail during DELETE operations.
*/

-- 1. Drop the old catch-all policy
DROP POLICY IF EXISTS "Owners can manage sections" ON manual_sections;

-- 2. Add explicit SELECT policy for owners
CREATE POLICY "Owners can select own sections" 
ON manual_sections FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = manual_sections.property_id 
    AND properties.owner_id = auth.uid()
  )
);

-- 3. Add explicit INSERT policy for owners
CREATE POLICY "Owners can insert own sections" 
ON manual_sections FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = manual_sections.property_id 
    AND properties.owner_id = auth.uid()
  )
);

-- 4. Add explicit UPDATE policy for owners
CREATE POLICY "Owners can update own sections" 
ON manual_sections FOR UPDATE TO authenticated 
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

-- 5. Add explicit DELETE policy for owners
CREATE POLICY "Owners can delete own sections" 
ON manual_sections FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = manual_sections.property_id 
    AND properties.owner_id = auth.uid()
  )
);