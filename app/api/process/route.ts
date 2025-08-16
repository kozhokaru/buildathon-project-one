import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProcessingQueueInsert } from '@/lib/database.types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { screenshotId, ocrText } = await req.json()

    if (!screenshotId) {
      return NextResponse.json({ error: 'Screenshot ID required' }, { status: 400 })
    }

    // Verify user owns the screenshot
    const { data: screenshot, error: screenshotError } = await supabase
      .from('screenshots')
      .select('*')
      .eq('id', screenshotId)
      .eq('user_id', user.id)
      .single()

    if (screenshotError || !screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 })
    }

    // Update OCR text if provided (from client-side processing)
    if (ocrText) {
      const { error: ocrError } = await supabase
        .from('screenshot_content')
        .update({
          ocr_text: ocrText,
          ocr_completed_at: new Date().toISOString()
        })
        .eq('screenshot_id', screenshotId)

      if (ocrError) {
        console.error('Failed to update OCR text:', ocrError)
      }
    }

    // Queue tasks for background processing
    const tasks: ProcessingQueueInsert[] = [
      {
        screenshot_id: screenshotId,
        task_type: 'vision',
        priority: 5
      },
      {
        screenshot_id: screenshotId,
        task_type: 'embeddings',
        priority: 3
      }
    ]

    const { error: queueError } = await supabase
      .from('processing_queue')
      .insert(tasks)

    if (queueError) {
      console.error('Failed to queue processing tasks:', queueError)
      return NextResponse.json({ error: 'Failed to queue processing' }, { status: 500 })
    }

    // Update screenshot status
    await supabase
      .from('screenshots')
      .update({ processing_status: 'processing' })
      .eq('id', screenshotId)

    // Trigger async processing (in production, this would be a background job)
    // For now, we'll process inline but return immediately
    // Pass auth headers for internal API calls
    const authHeaders = {
      cookie: req.headers.get('cookie') || '',
      authorization: req.headers.get('authorization') || ''
    }
    processScreenshot(screenshotId, user.id, authHeaders).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      message: 'Screenshot queued for processing',
      screenshotId 
    })
  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json(
      { error: 'Failed to process screenshot' },
      { status: 500 }
    )
  }
}

// Background processing function (would be in a separate worker in production)
async function processScreenshot(screenshotId: string, userId: string, authHeaders: { cookie: string, authorization: string }) {
  const supabase = await createClient()

  try {
    // Get the next task from queue
    const { data: task, error: taskError } = await supabase
      .from('processing_queue')
      .select('*')
      .eq('screenshot_id', screenshotId)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(1)
      .single()

    if (taskError || !task) {
      return
    }

    // Mark task as processing
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', task.id)

    // Process based on task type
    if (task.task_type === 'vision') {
      // Call vision API endpoint with auth headers
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': authHeaders.cookie,
          'Authorization': authHeaders.authorization
        },
        body: JSON.stringify({ screenshotId })
      })
    } else if (task.task_type === 'embeddings') {
      // Generate embeddings with auth headers
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/embeddings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': authHeaders.cookie,
          'Authorization': authHeaders.authorization
        },
        body: JSON.stringify({ screenshotId })
      })
    }

    // Mark task as completed
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id)

    // Check if all tasks are completed
    const { data: incompleteTasks } = await supabase
      .from('processing_queue')
      .select('id, status')
      .eq('screenshot_id', screenshotId)
      .neq('status', 'completed')

    console.log('Checking task completion:', { 
      screenshotId, 
      incompleteTasks,
      taskJustCompleted: task.task_type 
    })

    if (!incompleteTasks || incompleteTasks.length === 0) {
      // All tasks completed, update screenshot status
      console.log('All tasks completed for screenshot:', screenshotId)
      await supabase
        .from('screenshots')
        .update({ 
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', screenshotId)
    } else {
      // Process next task if available
      const nextPendingTask = incompleteTasks.find(t => t.status === 'pending')
      if (nextPendingTask) {
        console.log('Processing next task:', nextPendingTask)
        // Recursively process next task
        setTimeout(() => {
          processScreenshot(screenshotId, userId, authHeaders).catch(console.error)
        }, 1000) // Small delay to avoid overwhelming the API
      }
    }
  } catch (error) {
    console.error('Background processing error:', error)
    
    // Update screenshot status to failed
    await supabase
      .from('screenshots')
      .update({ 
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed'
      })
      .eq('id', screenshotId)
  }
}