/* 
# Fix Manual Sections Category Constraint
1. Changes
  - Drops the existing `manual_sections_category_check` constraint.
  - Re-adds the constraint with the correct allowed values: 'Essentials', 'Gear', 'Logistics', 'Fun'.
2. Purpose
  - Ensures that the categories defined in the React app (utils.js) match the database rules.
*/

DO $$ 
BEGIN 
    -- Drop the check constraint if it exists
    ALTER TABLE manual_sections DROP CONSTRAINT IF EXISTS manual_sections_category_check;

    -- Add the updated check constraint
    ALTER TABLE manual_sections 
    ADD CONSTRAINT manual_sections_category_check 
    CHECK (category IN ('Essentials', 'Gear', 'Logistics', 'Fun'));
END $$;