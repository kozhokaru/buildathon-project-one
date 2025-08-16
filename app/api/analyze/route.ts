import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

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

    // Get screenshot details
    const { data: screenshot, error: screenshotError } = await supabase
      .from('screenshots')
      .select('*')
      .eq('id', screenshotId)
      .eq('user_id', user.id)
      .single()

    if (screenshotError || !screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 })
    }

    // Create a signed URL for the private image (valid for 60 seconds)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('screenshots')
      .createSignedUrl(screenshot.file_path, 60)

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Failed to create signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to get image URL' }, { status: 500 })
    }

    // Download image using the signed URL
    const imageResponse = await fetch(signedUrlData.signedUrl)
    
    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.status, imageResponse.statusText)
      return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = screenshot.mime_type || 'image/png'
    
    // Log image size for debugging
    console.log('Processing image:', {
      screenshotId,
      size: imageBuffer.byteLength,
      mimeType,
      base64Length: base64Image.length
    })

    // Generate visual description using Claude
    const visionPrompt = `Analyze this screenshot and provide:
1. A detailed description of what's visible in the image
2. List of UI elements (buttons, forms, menus, etc.)
3. Main colors and visual style
4. Any notable text or error messages visible
5. The apparent purpose or context of this screen

Format your response as JSON with these keys:
- description: string (overall description)
- elements: array of strings (UI elements found)
- colors: array of strings (dominant colors)
- text_snippets: array of strings (notable text found)
- context: string (what this screen appears to be for)`

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: visionPrompt
            },
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`
            }
          ]
        }
      ],
      temperature: 0.3
    })

    // Parse the response
    let visionData
    try {
      // Extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        visionData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse vision response:', parseError)
      visionData = {
        description: result.text,
        elements: [],
        colors: [],
        text_snippets: [],
        context: 'Unable to parse structured data'
      }
    }

    // Calculate processing cost (approximate)
    const estimatedCost = 0.003 // Approximate cost per image analysis

    // Update screenshot content with vision data
    const { error: updateError } = await supabase
      .from('screenshot_content')
      .update({
        visual_description: visionData.description,
        dominant_colors: visionData.colors,
        detected_elements: {
          ui_elements: visionData.elements,
          text_snippets: visionData.text_snippets,
          context: visionData.context
        },
        vision_completed_at: new Date().toISOString(),
        processing_cost: estimatedCost
      })
      .eq('screenshot_id', screenshotId)

    if (updateError) {
      console.error('Failed to update vision data:', updateError)
      return NextResponse.json({ error: 'Failed to save vision data' }, { status: 500 })
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
        task_type: 'vision'
      })

    return NextResponse.json({
      success: true,
      message: 'Visual analysis completed',
      data: visionData
    })
  } catch (error) {
    console.error('Analyze API error:', error)
    
    // Update processing queue with error
    const supabase = await createClient()
    const { screenshotId } = await req.json().catch(() => ({ screenshotId: null }))
    
    if (screenshotId) {
      await supabase
        .from('processing_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Analysis failed',
          completed_at: new Date().toISOString()
        })
        .match({
          screenshot_id: screenshotId,
          task_type: 'vision'
        })
    }

    return NextResponse.json(
      { error: 'Failed to analyze screenshot' },
      { status: 500 }
    )
  }
}