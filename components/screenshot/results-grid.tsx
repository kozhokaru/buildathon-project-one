"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Eye, FileText, Palette, Calendar, Target } from 'lucide-react'
import { SearchResult } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ResultsGridProps {
  results: SearchResult[]
  query: string
  isLoading?: boolean
}

export function ResultsGrid({ results, query, isLoading = false }: ResultsGridProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const supabase = createClient()

  const getImageUrl = async (filePath: string): Promise<string> => {
    if (imageUrls[filePath]) return imageUrls[filePath]
    
    // Create a signed URL for the private image (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('screenshots')
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error('Failed to create signed URL:', error)
      return ''
    }
    
    if (data?.signedUrl) {
      setImageUrls(prev => ({ ...prev, [filePath]: data.signedUrl }))
      return data.signedUrl
    }
    
    return ''
  }

  const downloadImage = async (screenshot: SearchResult['screenshot']) => {
    // Create a fresh signed URL for download (to ensure it's not expired)
    const { data, error } = await supabase.storage
      .from('screenshots')
      .createSignedUrl(screenshot.file_path, 60) // 1 minute for download
    
    if (error || !data?.signedUrl) {
      console.error('Failed to create download URL:', error)
      return
    }
    
    const a = document.createElement('a')
    a.href = data.signedUrl
    a.download = screenshot.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getMatchTypeIcon = (matchType: SearchResult['match_type']) => {
    switch (matchType) {
      case 'text':
        return <FileText className="h-3 w-3" />
      case 'visual':
        return <Palette className="h-3 w-3" />
      case 'hybrid':
        return <Target className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-sm text-muted-foreground">
            No screenshots match your search for "{query}"
          </p>
          <p className="text-xs text-muted-foreground">
            Try different keywords or search filters
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result) => (
          <Card 
            key={result.screenshot.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedResult(result)}
          >
            {/* Image Preview */}
            <div className="relative aspect-video bg-muted">
              <ImageWithFallback
                src={() => getImageUrl(result.screenshot.file_path)}
                alt={result.screenshot.filename}
                className="object-cover"
              />
              
              {/* Confidence Badge */}
              <div className="absolute top-2 right-2">
                <Badge 
                  variant="secondary" 
                  className={cn("text-white", getConfidenceColor(result.confidence))}
                >
                  {Math.round(result.confidence * 100)}%
                </Badge>
              </div>

              {/* Match Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="gap-1">
                  {getMatchTypeIcon(result.match_type)}
                  {result.match_type}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Filename */}
              <div className="space-y-1">
                <p className="text-sm font-medium truncate">{result.screenshot.filename}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(result.screenshot.uploaded_at)}
                </p>
              </div>

              {/* Highlighted Text */}
              {result.highlighted_text && (
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-xs line-clamp-3">
                    {result.highlighted_text.split(new RegExp(`(${query})`, 'gi')).map((part, i) => (
                      <span key={i} className={part.toLowerCase() === query.toLowerCase() ? 'bg-yellow-200 font-medium' : ''}>
                        {part}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              {/* Visual Description Preview */}
              {result.content?.visual_description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {result.content.visual_description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedResult(result)
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadImage(result.screenshot)
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        {selectedResult && (
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedResult.screenshot.filename}</DialogTitle>
              <DialogDescription>
                Uploaded {formatDate(selectedResult.screenshot.uploaded_at)}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-full max-h-[70vh]">
              <div className="space-y-4">
                {/* Full Image */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={() => getImageUrl(selectedResult.screenshot.file_path)}
                    alt={selectedResult.screenshot.filename}
                    className="object-contain"
                  />
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>Size: {(selectedResult.screenshot.file_size / 1024).toFixed(1)} KB</p>
                      <p>Dimensions: {selectedResult.screenshot.width} × {selectedResult.screenshot.height}</p>
                      <p>Type: {selectedResult.screenshot.mime_type}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Match Info</h4>
                    <div className="space-y-1 text-sm">
                      <p>Confidence: {Math.round(selectedResult.confidence * 100)}%</p>
                      <p>Match Type: {selectedResult.match_type}</p>
                      <p>Status: {selectedResult.screenshot.processing_status}</p>
                    </div>
                  </div>
                </div>

                {/* OCR Text */}
                {selectedResult.content?.ocr_text && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Extracted Text</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap">{selectedResult.content.ocr_text}</pre>
                    </div>
                  </div>
                )}

                {/* Visual Description */}
                {selectedResult.content?.visual_description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Visual Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedResult.content.visual_description}
                    </p>
                  </div>
                )}

                {/* Detected Elements */}
                {selectedResult.content?.detected_elements && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Detected Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedResult.content.detected_elements as any).ui_elements?.map((element: string, i: number) => (
                        <Badge key={i} variant="secondary">{element}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedResult(null)}>
                Close
              </Button>
              <Button onClick={() => downloadImage(selectedResult.screenshot)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

// Image component with fallback
function ImageWithFallback({ 
  src, 
  alt, 
  className 
}: { 
  src: () => Promise<string>
  alt: string
  className?: string 
}) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [error, setError] = useState(false)

  useEffect(() => {
    src().then(setImageSrc).catch(() => setError(true))
  }, [src])

  if (error || !imageSrc) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  )
}

import { Search } from 'lucide-react'
import { useEffect } from 'react'