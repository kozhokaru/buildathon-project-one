"use client"

import { useState } from 'react'
import { UploadZone } from '@/components/screenshot/upload-zone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export function UploadPageClient() {
  const { toast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const handleUpload = async (files: File[]) => {
    setIsProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadPromises = files.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get image dimensions
        const dimensions = await getImageDimensions(file)

        // Create database record
        const { data: screenshot, error: dbError } = await supabase
          .from('screenshots')
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            width: dimensions.width,
            height: dimensions.height,
            processing_status: 'pending'
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Create content record
        const { error: contentError } = await supabase
          .from('screenshot_content')
          .insert({
            screenshot_id: screenshot.id
          })

        if (contentError) throw contentError

        // Queue for processing
        await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenshotId: screenshot.id })
        })

        return screenshot
      })

      const results = await Promise.allSettled(uploadPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (successful > 0) {
        toast({
          title: 'Upload successful',
          description: `${successful} file(s) uploaded successfully${failed > 0 ? `, ${failed} failed` : ''}`
        })
        
        // Navigate to library after a short delay
        setTimeout(() => {
          router.push('/dashboard/library')
        }, 2000)
      } else {
        throw new Error('All uploads failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        resolve({ width: 0, height: 0 })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Screenshots</h1>
        <p className="text-muted-foreground">
          Upload your screenshots to start searching through them with AI
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Screenshots will be processed automatically with OCR for text extraction and AI vision for visual descriptions. 
          Processing may take a few moments depending on the number of files.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop your screenshots or click to browse. Supports PNG, JPG, WEBP, and GIF formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadZone 
            onUpload={handleUpload}
            maxFiles={100}
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Processing uploads...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}