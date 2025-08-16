# 🔍 VisualMemory - AI-Powered Screenshot Search

**Never lose visual information again.** VisualMemory lets you capture, organize, and instantly search through all your screenshots using AI-powered visual and text recognition.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-412991?style=flat-square&logo=openai)
![Claude](https://img.shields.io/badge/Claude-Vision-FF6B6B?style=flat-square&logo=anthropic)

## ✨ Features

### Core Features
- 📸 **Smart Screenshot Capture** - Upload and automatically process screenshots with OCR
- 🔍 **AI-Powered Search** - Natural language search through text and visual elements
- 🧠 **Visual Recognition** - Claude Vision API analyzes UI elements, colors, and content
- 💾 **Vector Search** - Semantic search using OpenAI embeddings and pgvector
- 📚 **Visual Library** - Organize and browse your screenshot collection
- ⚡ **Real-time Processing** - Background jobs for instant indexing
- 🔐 **Secure Storage** - User-based authentication with Supabase

### What You Can Search
- **Text Content** - Find any text that appears in your screenshots
- **Error Messages** - "Show me authentication errors" or "database connection failed"
- **UI Elements** - "Screenshots with blue buttons" or "forms with email fields"
- **Visual Descriptions** - "Dark mode dashboard" or "mobile app screenshots"
- **Code Snippets** - Find code blocks, terminal outputs, or debugging info

## 🏃‍♂️ Quick Start (2 minutes)

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- OpenAI API key (required for embeddings)
- Anthropic API key (required for visual analysis)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/kozhokaru/buildathon-project-one.git
cd buildathon-project-one

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your keys
3. Enable pgvector extension:
   - Go to **Database → Extensions**
   - Search for "vector" and enable it
4. Run the database migrations in SQL Editor (see Database Setup below)
5. Configure authentication (optional GitHub OAuth):
   - Enable providers in **Authentication → Providers**

### 3. Configure Environment

Edit `.env.local`:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI APIs (Required)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE  # For embeddings
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE  # For visual analysis

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
visualmemory/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup with validation
│   │   ├── forgot-password/ # Password reset request
│   │   └── reset-password/  # Set new password
│   ├── (dashboard)/          # Protected dashboard area
│   │   └── dashboard/
│   │       ├── layout.tsx   # Sidebar navigation
│   │       ├── page.tsx     # Search interface
│   │       ├── upload/      # Screenshot upload
│   │       └── library/     # Screenshot gallery
│   ├── api/
│   │   ├── analyze/         # Visual analysis with Claude
│   │   ├── embeddings/      # Generate search embeddings
│   │   ├── process/         # Screenshot processing
│   │   ├── search/          # Search endpoint
│   │   └── upload/          # Upload handler
│   ├── auth/
│   │   └── callback/        # OAuth callback handler
│   ├── globals.css          # Tailwind styles
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx       # Buttons with variants
│   │   ├── card.tsx         # Card layouts
│   │   ├── dialog.tsx       # Modal dialogs
│   │   ├── input.tsx        # Form inputs
│   │   ├── toast.tsx        # Notifications
│   │   └── ...              # More components
│   ├── screenshot/          # Screenshot components
│   │   ├── search-bar.tsx   # Search interface
│   │   ├── results-grid.tsx # Search results display
│   │   └── upload-zone.tsx  # Drag & drop upload
│   ├── auth-button.tsx      # Dynamic auth state button
│   └── providers.tsx        # Theme & toast providers
├── hooks/
│   ├── use-user.tsx         # Auth state hook
│   └── use-toast.ts         # Toast notifications
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   ├── middleware.ts    # Auth middleware
│   │   └── migrations/      # Database migrations
│   ├── database.types.ts    # Generated TypeScript types
│   └── utils.ts             # Helper functions
├── middleware.ts            # Route protection
└── package.json             # Dependencies & scripts
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run ui-add   # Add shadcn/ui components
```

## 🎨 Pre-installed Components

All these shadcn/ui components are ready to use:

| Component | Usage | Import |
|-----------|-------|--------|
| **Button** | Interactive elements | `@/components/ui/button` |
| **Card** | Content containers | `@/components/ui/card` |
| **Dialog** | Modal windows | `@/components/ui/dialog` |
| **Input** | Form inputs | `@/components/ui/input` |
| **Label** | Form labels | `@/components/ui/label` |
| **Toast** | Notifications | `@/components/ui/toast` |
| **Avatar** | User avatars | `@/components/ui/avatar` |
| **Badge** | Status indicators | `@/components/ui/badge` |
| **Dropdown** | Menu dropdowns | `@/components/ui/dropdown-menu` |
| **Skeleton** | Loading states | `@/components/ui/skeleton` |
| **Table** | Data tables | `@/components/ui/table` |
| **ScrollArea** | Scrollable areas | `@/components/ui/scroll-area` |

## 🎯 Usage Guide

### 1. Upload Screenshots

Navigate to `/dashboard/upload` and:
- Drag & drop multiple screenshots
- Or click to browse and select files
- Supports PNG, JPG, JPEG formats
- Files are automatically processed with OCR

### 2. Search Your Screenshots

Go to `/dashboard` and search using natural language:

```
Examples:
- "error message about authentication"
- "blue submit button"
- "dashboard with charts"
- "code snippet with Python"
- "red warning alert"
```

### 3. View Your Library

Visit `/dashboard/library` to:
- Browse all your screenshots
- See processing status
- View full-size images
- Delete unwanted screenshots

## 📚 Common Patterns

### Protected Pages

#### Client Component
```tsx
"use client"
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <Skeleton />
  if (!user) return null

  return <div>Protected content</div>
}
```

#### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ServerProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

### Database Operations

#### Fetch Data
```tsx
const supabase = createClient()
const { data, error } = await supabase
  .from('items')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Insert Data
```tsx
const { data, error } = await supabase
  .from('items')
  .insert([{ name, user_id: user.id }])
  .select()
  .single()
```

#### Real-time Subscriptions
```tsx
useEffect(() => {
  const channel = supabase
    .channel('items-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'items'
    }, (payload) => {
      // Handle real-time updates
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

### AI Integration

#### Streaming Chat
```tsx
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello Claude!' }
    ],
    model: 'claude-sonnet-4-20250514',
    temperature: 0.7
  })
})

// Handle streaming response
const reader = response.body?.getReader()
// ... process stream
```

#### Using with Vercel AI SDK
```tsx
import { useChat } from 'ai/react'

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai',
  })

  return (
    // Your chat UI
  )
}
```

## 🗄️ Database Setup

### 1. Enable pgvector Extension

In Supabase Dashboard → Database → Extensions, enable "vector".

### 2. Run Migrations (Supabase SQL Editor)

Copy and run the migrations from `lib/supabase/migrations/` in order:

1. **001_initial_schema.sql** - Creates core tables:
   - `screenshots` - Screenshot metadata
   - `screenshot_content` - OCR text and visual descriptions
   - `screenshot_embeddings` - Vector embeddings for search
   - `search_history` - User search queries
   - `processing_queue` - Background job management

2. **002_vector_search_function.sql** - Adds search functions:
   - `search_screenshots_hybrid` - Combined text + vector search
   - `get_user_screenshot_stats` - Dashboard statistics

Example core tables:

```sql
-- Screenshots table
CREATE TABLE screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (critical for security)
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_embeddings ENABLE ROW LEVEL SECURITY;

-- Example RLS policies for screenshots
CREATE POLICY "Users can view own screenshots" ON screenshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own screenshots" ON screenshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screenshots" ON screenshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own screenshots" ON screenshots
  FOR DELETE USING (auth.uid() = user_id);

```

### Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Then use in your code:
```tsx
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type InsertItem = Database['public']['Tables']['items']['Insert']
```

## 🎨 Customization

### Theme Colors

Edit `app/globals.css`:
```css
:root {
  --primary: 346.8 77.2% 49.8%;     /* Rose */
  --secondary: 240 4.8% 95.9%;      /* Gray */
  --accent: 240 4.8% 95.9%;         /* Gray */
  --background: 0 0% 100%;          /* White */
  --foreground: 240 10% 3.9%;       /* Dark */
}

.dark {
  --primary: 346.8 77.2% 49.8%;     /* Rose */
  --background: 20 14.3% 4.1%;      /* Dark */
  --foreground: 0 0% 95%;           /* Light */
}
```

### Add Sidebar Items

Edit `app/(dashboard)/dashboard/layout.tsx`:
```tsx
const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Your Feature", href: "/dashboard/feature", icon: YourIcon },
  // Add more items
]
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `ANTHROPIC_API_KEY` | ❌ | Claude AI API key |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Auto-deploy with Git
npm run deploy
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Auth not working** | Check Supabase URL and keys in `.env.local` |
| **AI endpoint 500** | Verify `ANTHROPIC_API_KEY` is set and has credits |
| **Styles not loading** | Clear `.next` folder: `rm -rf .next` |
| **Build errors** | Run `npm install` and check Node version (18+) |
| **Database errors** | Check RLS policies and user permissions |

### Debug Mode

Add to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

Check browser console and terminal for detailed logs.

## 📖 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

### Code Snippets
Check `speed-snippets.md` for 50+ copy-paste solutions:
- Forms with validation
- Data tables with sorting
- Modal dialogs
- Real-time updates
- File uploads
- And much more!

## 🎯 Hackathon Tips

1. **Start Fast** - Clone and deploy within first 30 minutes
2. **Use Snippets** - Don't write boilerplate, copy from `speed-snippets.md`
3. **AI First** - Use Claude endpoint for complex logic
4. **Ship Early** - Deploy to Vercel and iterate
5. **Focus Features** - The boring stuff is done, build what's unique

## 🤝 Contributing

Found a bug or want to add a feature? PRs are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT - Use this to win hackathons!

## 🙏 Acknowledgments

Built with amazing open source projects:
- [Next.js](https://nextjs.org) by Vercel
- [Supabase](https://supabase.com) for auth & database
- [shadcn/ui](https://ui.shadcn.com) for components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Anthropic](https://anthropic.com) for Claude AI

---

**Built with ❤️ for anyone who takes too many screenshots**

Star ⭐ this repo if it helps you find that screenshot you took 3 months ago!