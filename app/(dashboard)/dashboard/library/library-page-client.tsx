"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from '@/lib/supabase/client'
import { Screenshot, ScreenshotContent } from '@/lib/database.types'
import { 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  Search,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'

interface ScreenshotWithContent extends Screenshot {
  screenshot_content: ScreenshotContent[]
}

interface LibraryPageClientProps {
  initialScreenshots: ScreenshotWithContent[]
}

export function LibraryPageClient({ initialScreenshots }: LibraryPageClientProps) {
  const [screenshots, setScreenshots] = useState<ScreenshotWithContent[]>(initialScreenshots)
  const [filteredScreenshots, setFilteredScreenshots] = useState<ScreenshotWithContent[]>(initialScreenshots)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for filter in URL params
    const filter = searchParams.get('filter')
    if (filter) {
      setFilterStatus(filter)
    }
  }, [searchParams])

  useEffect(() => {
    // Apply filters
    let filtered = screenshots

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.processing_status === filterStatus)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.screenshot_content[0]?.ocr_text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredScreenshots(filtered)
  }, [screenshots, filterStatus, searchQuery])

  const refreshScreenshots = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('screenshots')
        .select(`
          *,
          screenshot_content (*)
        `)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setScreenshots(data || [])
    } catch (error) {
      console.error('Failed to refresh:', error)
      toast({
        title: 'Failed to refresh',
        description: 'Could not load latest screenshots',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteScreenshot = async (id: string) => {
    try {
      const screenshot = screenshots.find(s => s.id === id)
      if (!screenshot) return

      // Delete from storage
      await supabase.storage
        .from('screenshots')
        .remove([screenshot.file_path])

      // Delete from database (cascades to related tables)
      const { error } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', id)

      if (error) throw error

      setScreenshots(prev => prev.filter(s => s.id !== id))
      
      toast({
        title: 'Screenshot deleted',
        description: 'The screenshot has been removed'
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'Could not delete the screenshot',
        variant: 'destructive'
      })
    }
  }

  const retryProcessing = async (id: string) => {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshotId: id })
      })

      if (!response.ok) throw new Error('Processing failed')

      toast({
        title: 'Processing restarted',
        description: 'The screenshot is being processed again'
      })

      // Update local status
      setScreenshots(prev => prev.map(s => 
        s.id === id ? { ...s, processing_status: 'processing' } : s
      ))
    } catch (error) {
      toast({
        title: 'Retry failed',
        description: 'Could not restart processing',
        variant: 'destructive'
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Screenshot Library</h1>
        <p className="text-muted-foreground">
          Browse and manage all your uploaded screenshots
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <div className="flex gap-2">
              <Button onClick={refreshScreenshots} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/dashboard/upload">
                <Button size="sm">
                  Upload More
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by filename or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({screenshots.length})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Processed
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('processing')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Processing
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('failed')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screenshots Grid */}
      {filteredScreenshots.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No screenshots found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Upload some screenshots to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredScreenshots.map((screenshot) => (
            <Card key={screenshot.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <ImagePreview screenshot={screenshot} />
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(screenshot.processing_status)}>
                    {getStatusIcon(screenshot.processing_status)}
                    <span className="ml-1">{screenshot.processing_status}</span>
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium truncate">{screenshot.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(screenshot.uploaded_at).toLocaleDateString()}
                  </p>
                </div>

                {screenshot.screenshot_content[0]?.ocr_text && (
                  <div className="flex items-start gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {screenshot.screenshot_content[0].ocr_text}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {screenshot.processing_status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryProcessing(screenshot.id)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteScreenshot(screenshot.id)}
                    className={screenshot.processing_status === 'failed' ? '' : 'flex-1'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ImagePreview({ screenshot }: { screenshot: ScreenshotWithContent }) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        // Create a signed URL for the private image (valid for 1 hour)
        const { data, error } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(screenshot.file_path, 3600)
        
        if (error) {
          console.error('Failed to create signed URL:', error)
          setLoading(false)
          return
        }
        
        if (data?.signedUrl) {
          setImageUrl(data.signedUrl)
        }
      } catch (err) {
        console.error('Error getting signed URL:', err)
      } finally {
        setLoading(false)
      }
    }

    getSignedUrl()
  }, [screenshot.file_path, supabase.storage])

  if (loading || !imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        {loading ? (
          <div className="animate-pulse">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
    )
  }

  return (
    <img 
      src={imageUrl} 
      alt={screenshot.filename}
      className="w-full h-full object-cover"
      onError={() => {
        console.error('Image failed to load:', screenshot.file_path)
        setImageUrl('') // Reset to show fallback
      }}
    />
  )
}