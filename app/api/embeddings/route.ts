import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

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

    // Get screenshot content
    const { data: content, error: contentError } = await supabase
      .from('screenshot_content')
      .select('*')
      .eq('screenshot_id', screenshotId)
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Screenshot content not found' }, { status: 404 })
    }

    // Verify user owns the screenshot
    const { data: screenshot } = await supabase
      .from('screenshots')
      .select('user_id')
      .eq('id', screenshotId)
      .single()

    if (!screenshot || screenshot.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare text for embedding
    const textParts: string[] = []
    
    if (content.ocr_text) {
      textParts.push(`OCR Text: ${content.ocr_text}`)
    }
    
    if (content.visual_description) {
      textParts.push(`Visual Description: ${content.visual_description}`)
    }
    
    if (content.detected_elements) {
      const elements = content.detected_elements as any
      if (elements.ui_elements?.length > 0) {
        textParts.push(`UI Elements: ${elements.ui_elements.join(', ')}`)
      }
      if (elements.text_snippets?.length > 0) {
        textParts.push(`Text Snippets: ${elements.text_snippets.join(', ')}`)
      }
      if (elements.context) {
        textParts.push(`Context: ${elements.context}`)
      }
    }

    if (textParts.length === 0) {
      return NextResponse.json({ 
        error: 'No content available for embedding generation' 
      }, { status: 400 })
    }

    const combinedText = textParts.join('\n\n')

    // Generate embeddings using OpenAI
    let textEmbedding: number[] | null = null
    let visualEmbedding: number[] | null = null
    let combinedEmbedding: number[] | null = null

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured - skipping embeddings')
      
      // Mark task as completed without embeddings
      await supabase
        .from('processing_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          error_message: 'Embeddings API not configured'
        })
        .match({
          screenshot_id: screenshotId,
          task_type: 'embeddings'
        })

      // Still mark screenshot as completed
      await supabase
        .from('screenshots')
        .update({
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', screenshotId)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Embeddings skipped - API not configured',
        hasEmbeddings: false 
      })
    }

    // Generate embeddings if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        // Generate text embedding (from OCR)
        if (content.ocr_text) {
          const textResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: content.ocr_text.substring(0, 8000), // Limit to avoid token limits
          })
          textEmbedding = textResponse.data[0].embedding
        }

        // Generate visual embedding (from description)
        if (content.visual_description) {
          const visualResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: content.visual_description.substring(0, 8000),
          })
          visualEmbedding = visualResponse.data[0].embedding
        }

        // Generate combined embedding
        const combinedResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: combinedText.substring(0, 8000),
        })
        combinedEmbedding = combinedResponse.data[0].embedding
      } catch (embedError) {
        console.error('Embedding generation failed:', embedError)
        // Continue without embeddings - fallback to text search
      }
    } else {
      console.warn('OpenAI API key not configured - skipping embedding generation')
    }

    // Save embeddings if generated
    if (combinedEmbedding) {
      const { error: embeddingError } = await supabase
        .from('screenshot_embeddings')
        .upsert({
          screenshot_id: screenshotId,
          text_embedding: textEmbedding,
          visual_embedding: visualEmbedding,
          combined_embedding: combinedEmbedding
        })

      if (embeddingError) {
        console.error('Failed to save embeddings:', embeddingError)
        return NextResponse.json({ error: 'Failed to save embeddings' }, { status: 500 })
      }
    }

    // Update processing queue
    await supabase
      .from('processing_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .match({
        screenshot_id: screenshotId,
        task_type: 'embeddings'
      })

    // Check if all processing is complete
    const { data: pendingTasks } = await supabase
      .from('processing_queue')
      .select('id')
      .eq('screenshot_id', screenshotId)
      .neq('status', 'completed')

    if (!pendingTasks || pendingTasks.length === 0) {
      // Update screenshot status to completed
      await supabase
        .from('screenshots')
        .update({
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', screenshotId)
    }

    return NextResponse.json({
      success: true,
      message: 'Embeddings generated successfully',
      hasEmbeddings: !!combinedEmbedding
    })
  } catch (error) {
    console.error('Embeddings API error:', error)
    
    // Update processing queue with error
    const supabase = await createClient()
    const { screenshotId } = await req.json().catch(() => ({ screenshotId: null }))
    
    if (screenshotId) {
      await supabase
        .from('processing_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Embedding generation failed',
          completed_at: new Date().toISOString()
        })
        .match({
          screenshot_id: screenshotId,
          task_type: 'embeddings'
        })
    }

    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}