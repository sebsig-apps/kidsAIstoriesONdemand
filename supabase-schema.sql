-- Supabase Database Schema for Magiska Berättelser
-- Run this in your Supabase SQL Editor

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  child_height TEXT,
  favorite_food TEXT NOT NULL,
  favorite_activity TEXT NOT NULL,
  best_memory TEXT NOT NULL,
  personality TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'generating_story', 'generating_images', 'completed', 'failed')),
  story_data JSONB, -- Generated story content with 10 pages
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story images table  
CREATE TABLE IF NOT EXISTS story_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('user_drawing', 'ai_generated')),
  image_url TEXT NOT NULL, -- Cloudinary URL
  cloudinary_public_id TEXT,
  image_prompt TEXT, -- For AI generated images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User drawings table (original uploads)
CREATE TABLE IF NOT EXISTS user_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  page_assignment INTEGER, -- Which page this drawing will be on
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_story_images_story_id ON story_images(story_id);
CREATE INDEX IF NOT EXISTS idx_user_drawings_story_id ON user_drawings(story_id);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_drawings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see images from their own stories
CREATE POLICY "Users can view own story images" ON story_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_images.story_id 
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own story images" ON story_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_images.story_id 
      AND stories.user_id = auth.uid()
    )
  );

-- Users can only see their own drawings
CREATE POLICY "Users can view own drawings" ON user_drawings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = user_drawings.story_id 
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own drawings" ON user_drawings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = user_drawings.story_id 
      AND stories.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_stories_updated_at 
    BEFORE UPDATE ON stories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();