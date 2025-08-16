import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SearchResult } from '@/lib/database.types'
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

    const { query, searchType = 'hybrid', limit = 5 } = await req.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Save search history
    await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query,
        search_type: searchType
      })

    const results: SearchResult[] = []
    const searchMethods: Array<() => Promise<SearchResult[]>> = []

    // Text search (full-text search on OCR content)
    if (searchType === 'text' || searchType === 'hybrid') {
      searchMethods.push(async () => {
        const { data, error } = await supabase
          .from('screenshots')
          .select(`
            *,
            screenshot_content!inner (*)
          `)
          .eq('user_id', user.id)
          .textSearch('screenshot_content.ocr_text', query, {
            type: 'websearch',
            config: 'english'
          })
          .limit(limit * 2) // Get more results for ranking

        if (error) {
          console.error('Text search error:', error)
          return []
        }

        return data?.map(item => ({
          screenshot: item,
          content: item.screenshot_content[0] || null,
          confidence: 0.8, // Base confidence for text match
          match_type: 'text' as const
        })) || []
      })
    }

    // Visual search (search in visual descriptions)
    if (searchType === 'visual' || searchType === 'hybrid') {
      searchMethods.push(async () => {
        // Escape special characters in query for safe SQL pattern matching
        const escapedQuery = query.replace(/[%_]/g, '\\$&')
        
        // Search in visual_description field only (JSONB search requires different approach)
        const { data, error } = await supabase
          .from('screenshots')
          .select(`
            *,
            screenshot_content!inner (*)
          `)
          .eq('user_id', user.id)
          .ilike('screenshot_content.visual_description', `%${escapedQuery}%`)
          .limit(limit * 2)

        if (error) {
          console.error('Visual search error:', error)
          
          // Fallback: Try a simpler query without the join condition
          try {
            const { data: fallbackData } = await supabase
              .from('screenshot_content')
              .select(`
                *,
                screenshots!inner(*)
              `)
              .ilike('visual_description', `%${escapedQuery}%`)
              .eq('screenshots.user_id', user.id)
              .limit(limit * 2)
            
            if (fallbackData) {
              return fallbackData.map(item => ({
                screenshot: item.screenshots,
                content: item,
                confidence: 0.7,
                match_type: 'visual' as const
              }))
            }
          } catch (fallbackError) {
            console.error('Fallback visual search error:', fallbackError)
          }
          
          return []
        }

        return data?.map(item => ({
          screenshot: item,
          content: item.screenshot_content[0] || null,
          confidence: 0.7, // Base confidence for visual match
          match_type: 'visual' as const
        })) || []
      })
    }

    // Search in detected elements (JSONB field) - separate query for hybrid mode
    if (searchType === 'hybrid') {
      searchMethods.push(async () => {
        try {
          // For JSONB search, we need to use a different approach
          // Query all screenshots with content and filter in memory
          const { data: allData } = await supabase
            .from('screenshots')
            .select(`
              *,
              screenshot_content (*)
            `)
            .eq('user_id', user.id)
            .not('screenshot_content.detected_elements', 'is', null)
            .limit(100) // Reasonable limit for in-memory filtering
          
          if (!allData) return []
          
          // Filter in memory for JSONB content
          const filtered = allData.filter(item => {
            if (!item.screenshot_content?.[0]?.detected_elements) return false
            
            const elements = item.screenshot_content[0].detected_elements as any
            const searchLower = query.toLowerCase()
            
            // Check if any element contains the search query
            const elementsStr = JSON.stringify(elements).toLowerCase()
            return elementsStr.includes(searchLower)
          })
          
          return filtered.slice(0, limit).map(item => ({
            screenshot: item,
            content: item.screenshot_content[0] || null,
            confidence: 0.6, // Lower confidence for element matches
            match_type: 'visual' as const
          }))
        } catch (error) {
          console.error('Elements search error:', error)
          return []
        }
      })
    }

    // Vector similarity search (if embeddings are available)
    if (process.env.OPENAI_API_KEY && (searchType === 'hybrid')) {
      searchMethods.push(async () => {
        try {
          // Generate embedding for the query
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
          })
          const queryEmbedding = embeddingResponse.data[0].embedding

          // Perform vector similarity search
          const { data, error } = await supabase.rpc('match_screenshots', {
            query_embedding: queryEmbedding,
            match_threshold: 0.7,
            match_count: limit * 2,
            user_id_filter: user.id
          })

          if (error) {
            console.error('Vector search error:', error)
            return []
          }

          // Fetch full screenshot data for matched IDs
          if (data && data.length > 0) {
            const screenshotIds = data.map((item: any) => item.screenshot_id)
            const { data: screenshots } = await supabase
              .from('screenshots')
              .select(`
                *,
                screenshot_content (*)
              `)
              .in('id', screenshotIds)

            return screenshots?.map((item, index) => ({
              screenshot: item,
              content: item.screenshot_content[0] || null,
              confidence: data[index]?.similarity || 0.5,
              match_type: 'hybrid' as const
            })) || []
          }

          return []
        } catch (vectorError) {
          console.error('Vector search error:', vectorError)
          return []
        }
      })
    }

    // Execute all search methods in parallel
    const searchResults = await Promise.all(searchMethods.map(method => method()))
    
    // Merge and deduplicate results
    const mergedResults = new Map<string, SearchResult>()
    
    for (const methodResults of searchResults) {
      for (const result of methodResults) {
        const existing = mergedResults.get(result.screenshot.id)
        if (existing) {
          // Combine confidence scores
          existing.confidence = Math.max(existing.confidence, result.confidence)
          if (existing.match_type !== result.match_type) {
            existing.match_type = 'hybrid'
          }
        } else {
          mergedResults.set(result.screenshot.id, result)
        }
      }
    }

    // Sort by confidence and limit results
    const finalResults = Array.from(mergedResults.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)

    // Highlight matched text in results
    for (const result of finalResults) {
      if (result.content?.ocr_text) {
        const regex = new RegExp(`(${query})`, 'gi')
        const matches = result.content.ocr_text.match(regex)
        if (matches) {
          const startIndex = Math.max(0, result.content.ocr_text.toLowerCase().indexOf(query.toLowerCase()) - 50)
          const endIndex = Math.min(result.content.ocr_text.length, startIndex + query.length + 100)
          result.highlighted_text = '...' + result.content.ocr_text.substring(startIndex, endIndex) + '...'
        }
      }
    }

    // Update search history with results
    await supabase
      .from('search_history')
      .update({
        results: finalResults.map(r => ({
          screenshot_id: r.screenshot.id,
          confidence: r.confidence,
          match_type: r.match_type
        })),
        result_count: finalResults.length
      })
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(1)

    return NextResponse.json({
      success: true,
      query,
      searchType,
      results: finalResults,
      count: finalResults.length
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for search suggestions
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent search history
    const { data: history } = await supabase
      .from('search_history')
      .select('query, searched_at')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(10)

    // Get common text snippets from screenshots
    const { data: snippets } = await supabase
      .from('screenshot_content')
      .select('ocr_text')
      .limit(50)

    // Extract common phrases for suggestions
    const suggestions = new Set<string>()
    
    // Add recent searches
    history?.forEach(h => suggestions.add(h.query))
    
    // Extract common words from OCR text (simplified)
    snippets?.forEach(s => {
      if (s.ocr_text) {
        const words = s.ocr_text.split(/\s+/).filter((w: string) => w.length > 4)
        words.slice(0, 5).forEach((w: string) => suggestions.add(w.toLowerCase()))
      }
    })

    return NextResponse.json({
      suggestions: Array.from(suggestions).slice(0, 10)
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}