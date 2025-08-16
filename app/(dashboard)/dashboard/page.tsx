import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardPageClient } from './dashboard-page-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user statistics (with error handling)
  let stats = null
  try {
    const { data, error } = await supabase.rpc('get_user_screenshot_stats', {
      user_id_param: user.id
    })
    if (!error && data) {
      // Ensure we have a valid stats object
      stats = data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Stats will remain null, client will use defaults
  }

  return <DashboardPageClient initialStats={stats} />
}