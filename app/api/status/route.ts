import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get screenshot ID from query params
    const url = new URL(req.url)
    const screenshotId = url.searchParams.get('id')

    if (screenshotId) {
      // Get specific screenshot status
      const { data: screenshot } = await supabase
        .from('screenshots')
        .select('*, screenshot_content(*), processing_queue(*)')
        .eq('id', screenshotId)
        .single()

      return NextResponse.json({ screenshot })
    }

    // Get all user's screenshots with their processing status
    const { data: screenshots } = await supabase
      .from('screenshots')
      .select(`
        *,
        screenshot_content(*),
        processing_queue(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get processing queue status
    const { data: queue } = await supabase
      .from('processing_queue')
      .select('*')
      .in('screenshot_id', screenshots?.map(s => s.id) || [])
      .order('created_at', { ascending: false })

    return NextResponse.json({
      screenshots,
      queue,
      summary: {
        total: screenshots?.length || 0,
        completed: screenshots?.filter(s => s.processing_status === 'completed').length || 0,
        processing: screenshots?.filter(s => s.processing_status === 'processing').length || 0,
        pending: screenshots?.filter(s => s.processing_status === 'pending').length || 0,
        failed: screenshots?.filter(s => s.processing_status === 'failed').length || 0
      }
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}