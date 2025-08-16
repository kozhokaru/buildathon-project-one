import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UploadPageClient } from './upload-page-client'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return <UploadPageClient />
}