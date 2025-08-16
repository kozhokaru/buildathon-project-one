import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { screenshotId } = await req.json()

    if (!screenshotId) {
      return NextResponse.json({ error: 'Screenshot ID required' }, { status: 400 })
    }

    // Verify user owns the screenshot
    const { data: screenshot } = await supabase
      .from('screenshots')
      .select('*')
      .eq('id', screenshotId)
      .eq('user_id', user.id)
      .single()

    if (!screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 })
    }

    // Reset processing status
    await supabase
      .from('screenshots')
      .update({ 
        processing_status: 'processing',
        error_message: null 
      })
      .eq('id', screenshotId)

    // Reset all failed tasks in queue
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'pending',
        attempts: 0,
        error_message: null,
        started_at: null,
        completed_at: null
      })
      .eq('screenshot_id', screenshotId)
      .in('status', ['failed', 'processing'])

    // Trigger reprocessing
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
        'Authorization': req.headers.get('authorization') || ''
      },
      body: JSON.stringify({ screenshotId })
    })

    if (!response.ok) {
      throw new Error('Failed to restart processing')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Processing restarted',
      screenshotId 
    })
  } catch (error) {
    console.error('Retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry processing' },
      { status: 500 }
    )
  }
}