-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Screenshots table for storing metadata
CREATE TABLE IF NOT EXISTS screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Screenshot content table for OCR text and descriptions
CREATE TABLE IF NOT EXISTS screenshot_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  screenshot_id UUID REFERENCES screenshots(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ocr_text TEXT,
  visual_description TEXT,
  dominant_colors JSONB,
  detected_elements JSONB,
  processing_cost DECIMAL(10, 4) DEFAULT 0,
  ocr_completed_at TIMESTAMP WITH TIME ZONE,
  vision_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Screenshot embeddings table for vector search
CREATE TABLE IF NOT EXISTS screenshot_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  screenshot_id UUID REFERENCES screenshots(id) ON DELETE CASCADE NOT NULL UNIQUE,
  text_embedding vector(1536),
  visual_embedding vector(1536),
  combined_embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('text', 'visual', 'hybrid')) DEFAULT 'hybrid',
  results JSONB,
  result_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Processing queue table for managing background jobs
CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  screenshot_id UUID REFERENCES screenshots(id) ON DELETE CASCADE NOT NULL,
  task_type TEXT CHECK (task_type IN ('ocr', 'vision', 'embeddings')) NOT NULL,
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX idx_screenshots_processing_status ON screenshots(processing_status);
CREATE INDEX idx_screenshots_uploaded_at ON screenshots(uploaded_at DESC);
CREATE INDEX idx_screenshot_content_screenshot_id ON screenshot_content(screenshot_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);
CREATE INDEX idx_processing_queue_status ON processing_queue(status, scheduled_at);

-- Create vector indexes for similarity search
CREATE INDEX idx_embeddings_text_vector ON screenshot_embeddings 
  USING ivfflat (text_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_visual_vector ON screenshot_embeddings 
  USING ivfflat (visual_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_combined_vector ON screenshot_embeddings 
  USING ivfflat (combined_embedding vector_cosine_ops) WITH (lists = 100);

-- Enable full-text search on OCR content
CREATE INDEX idx_screenshot_content_ocr_text ON screenshot_content 
  USING gin(to_tsvector('english', ocr_text));

-- Row Level Security (RLS) Policies
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- Screenshots policies
CREATE POLICY "Users can view their own screenshots" ON screenshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own screenshots" ON screenshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own screenshots" ON screenshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own screenshots" ON screenshots
  FOR DELETE USING (auth.uid() = user_id);

-- Screenshot content policies
CREATE POLICY "Users can view content of their screenshots" ON screenshot_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM screenshots 
      WHERE screenshots.id = screenshot_content.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage content of their screenshots" ON screenshot_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM screenshots 
      WHERE screenshots.id = screenshot_content.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

-- Screenshot embeddings policies
CREATE POLICY "Users can view embeddings of their screenshots" ON screenshot_embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM screenshots 
      WHERE screenshots.id = screenshot_embeddings.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage embeddings of their screenshots" ON screenshot_embeddings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM screenshots 
      WHERE screenshots.id = screenshot_embeddings.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

-- Search history policies
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" ON search_history
  FOR DELETE USING (auth.uid() = user_id);

-- Processing queue policies (service role only for workers)
CREATE POLICY "Users can view their own processing queue" ON processing_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM screenshots 
      WHERE screenshots.id = processing_queue.screenshot_id 
      AND screenshots.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screenshot_content_updated_at BEFORE UPDATE ON screenshot_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for screenshots (to be created via Supabase dashboard or API)
-- Note: Run this in Supabase SQL editor after creating the bucket in the dashboard:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'screenshots', 
--   'screenshots', 
--   false, 
--   10485760, -- 10MB limit per file
--   ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
-- );