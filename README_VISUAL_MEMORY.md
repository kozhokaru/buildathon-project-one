# Visual Memory Search 🔍📸

A production-ready application that allows you to search through your screenshot history using natural language queries for both text content AND visual elements.

## 🚀 Features

- **Hybrid Search**: Search by OCR text, visual descriptions, or both
- **Smart Processing**: Client-side OCR + AI-powered visual analysis
- **Confidence Scoring**: Results ranked by relevance with confidence scores
- **Batch Upload**: Drag-and-drop multiple screenshots at once
- **Real-time Processing**: Watch as your screenshots are analyzed
- **Cost Optimization**: Smart caching and client-side processing to minimize API costs

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL + pgvector for embeddings)
- **Storage**: Supabase Storage
- **OCR**: Tesseract.js (client-side)
- **AI Vision**: Claude API (Anthropic)
- **Embeddings**: OpenAI API (optional)
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Anthropic API key (for visual analysis)
- OpenAI API key (optional, for semantic search)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd buildathon-project-one
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic AI (Required for visual analysis)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE

# OpenAI (Optional - for embeddings)
OPENAI_API_KEY=sk-YOUR_KEY_HERE
```

### 3. Set Up Supabase

1. **Run Database Migrations**:
   - Go to Supabase SQL Editor
   - Run `/lib/supabase/migrations/001_screenshot_tables.sql`
   - Run `/lib/supabase/migrations/002_vector_search_function.sql`

2. **Create Storage Bucket**:
   - Go to Storage in Supabase Dashboard
   - Create bucket named `screenshots`
   - Set as private
   - Configure allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp, image/gif`
   - Set max file size: 10MB

3. **Enable pgvector** (should be automatic):
   - Already included in migration
   - Available on all new Supabase projects

### 4. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

## 🎯 How to Use

### Upload Screenshots
1. Navigate to `/dashboard/upload`
2. Drag and drop screenshots or click to browse
3. OCR processing happens instantly (client-side)
4. Visual analysis runs in the background

### Search Your Screenshots
1. Go to Dashboard (`/dashboard`)
2. Enter search query:
   - Text queries: "error message", "login failed"
   - Visual queries: "blue button", "dark theme"
   - Combined: "settings page with toggle switch"
3. Select search type (Text/Visual/Hybrid)
4. View results with confidence scores

### Manage Library
1. Visit `/dashboard/library`
2. Filter by processing status
3. Retry failed processing
4. Delete unwanted screenshots

## 🏗️ Architecture

### Processing Pipeline
1. **Upload**: Files uploaded to Supabase Storage
2. **OCR**: Tesseract.js extracts text client-side (instant)
3. **Vision Analysis**: Claude API describes visual elements
4. **Embeddings**: Generate vectors for semantic search
5. **Indexing**: Store in PostgreSQL with pgvector

### Search Algorithm
- **Text Search**: PostgreSQL full-text search on OCR content
- **Visual Search**: Match against AI-generated descriptions
- **Vector Search**: Semantic similarity using embeddings
- **Hybrid Ranking**: Combine all methods with weighted scoring

## 💰 Cost Optimization

- **Client-side OCR**: Free text extraction using Tesseract.js
- **Batch Processing**: Queue and batch API calls
- **Smart Caching**: Avoid reprocessing identical images
- **Progressive Enhancement**: OCR first, vision analysis later
- **Optional Embeddings**: Works without OpenAI API

## 📊 Database Schema

- `screenshots`: Metadata and processing status
- `screenshot_content`: OCR text and visual descriptions
- `screenshot_embeddings`: Vector embeddings for search
- `search_history`: User queries and results
- `processing_queue`: Background job management

## 🔒 Security

- Row Level Security (RLS) enabled
- Users can only access their own data
- Secure file uploads with type validation
- API rate limiting and error handling

## 🚦 API Endpoints

- `POST /api/upload`: Handle screenshot uploads
- `POST /api/process`: Queue processing tasks
- `POST /api/analyze`: Claude Vision analysis
- `POST /api/embeddings`: Generate search vectors
- `POST /api/search`: Hybrid search endpoint

## 🐛 Troubleshooting

### Processing Stuck
- Check API keys in `.env.local`
- Verify Supabase bucket permissions
- Check browser console for OCR errors

### Search Not Working
- Ensure screenshots are fully processed
- Check if embeddings are generated (needs OpenAI key)
- Verify pgvector extension is enabled

### Upload Failures
- Check file size (max 10MB)
- Verify file type (PNG, JPG, WEBP, GIF)
- Check Supabase storage quota

## 📈 Future Enhancements

- [ ] Bulk export functionality
- [ ] Advanced filters (date, size, colors)
- [ ] Screenshot annotations
- [ ] Sharing capabilities
- [ ] Mobile app
- [ ] Browser extension for auto-capture

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome! Please follow the existing code style and add tests for new features.

## 🙏 Acknowledgments

Built with the Hackathon Template using Next.js, Supabase, and Claude AI.