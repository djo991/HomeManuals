/*
  # Guest Manual Schema Setup

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users)
      - `name` (text)
      - `slug` (text, unique)
      - `address` (text)
      - `cover_image` (text)
      - `created_at` (timestamp)
    - `manual_sections`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `category` (text)
      - `title` (text)
      - `content` (text)
      - `image_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Policies for Owners (CRUD own data)
    - Policies for Guests (Public Read by Slug/ID)
*/

-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  address text,
  cover_image text,
  created_at timestamptz DEFAULT now()
);

-- Create Manual Sections Table
CREATE TABLE IF NOT EXISTS manual_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  content text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_sections ENABLE ROW LEVEL SECURITY;

-- Policies for Properties

-- Owners can do everything with their own properties
CREATE POLICY "Owners can manage own properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Everyone (Guests) can view properties if they know the slug (via the app logic)
-- Note: We allow public read access so the /g/:slug route works without auth
CREATE POLICY "Public can view properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);

-- Policies for Manual Sections

-- Owners can manage sections for their properties
CREATE POLICY "Owners can manage sections"
  ON manual_sections
  FOR ALL
  TO authenticated
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

-- Public can view sections for any property (since properties are public via slug)
CREATE POLICY "Public can view sections"
  ON manual_sections
  FOR SELECT
  TO public
  USING (true);