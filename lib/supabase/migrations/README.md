# Database Migrations

## Setup Instructions

1. **Run the migration in Supabase SQL Editor:**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy the contents of `001_screenshot_tables.sql`
   - Run the migration

2. **Create Storage Bucket:**
   - Go to Storage section in Supabase Dashboard
   - Create a new bucket named `screenshots`
   - Set it as private (not public)
   - Configure allowed MIME types:
     - image/png
     - image/jpeg
     - image/jpg
     - image/webp
     - image/gif
   - Set file size limit to 10MB

3. **Enable pgvector:**
   The migration automatically enables pgvector extension. If you encounter any issues, ensure your Supabase project supports pgvector (available on all new projects).

4. **Verify RLS Policies:**
   Row Level Security is automatically enabled for all tables. Users can only access their own data.

## Tables Created

- `screenshots` - Main metadata table
- `screenshot_content` - OCR text and visual descriptions
- `screenshot_embeddings` - Vector embeddings for search
- `search_history` - User search queries
- `processing_queue` - Background job management

## Important Notes

- All tables have RLS enabled for security
- Vector indexes are created for fast similarity search
- Full-text search index on OCR content
- Automatic timestamp updates via triggers