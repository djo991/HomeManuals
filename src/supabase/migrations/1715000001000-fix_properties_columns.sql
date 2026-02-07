/* 
# Fix missing columns in properties table
1. Changes
  - Ensures `cover_image` and `address` columns exist in the `properties` table.
  - Adds these columns if they are missing to prevent schema cache errors.
2. Security
  - Maintains existing RLS settings.
*/

DO $$ 
BEGIN 
    -- Add cover_image if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'cover_image'
    ) THEN 
        ALTER TABLE properties ADD COLUMN cover_image text;
    END IF;

    -- Add address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'address'
    ) THEN 
        ALTER TABLE properties ADD COLUMN address text;
    END IF;
END $$;