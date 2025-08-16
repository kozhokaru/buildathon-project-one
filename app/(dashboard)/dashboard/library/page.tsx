import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryPageClient } from './library-page-client'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get initial screenshots
  const { data: screenshots } = await supabase
    .from('screenshots')
    .select(`
      *,
      screenshot_content (*)
    `)
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })
    .limit(20)

  return <LibraryPageClient initialScreenshots={screenshots || []} />
}