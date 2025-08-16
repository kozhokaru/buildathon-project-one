"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileImage, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // in bytes
}

export function UploadZone({ onUpload, maxFiles = 100, maxSize = 10485760 }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Create preview objects for accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        newFiles.find(nf => nf.id === f.id) 
          ? { ...f, status: 'uploading' as const }
          : f
      ))

      await onUpload(acceptedFiles)

      // Update status to completed
      setFiles(prev => prev.map(f => 
        newFiles.find(nf => nf.id === f.id) 
          ? { ...f, status: 'completed' as const, progress: 100 }
          : f
      ))
    } catch (error) {
      // Update status to error
      setFiles(prev => prev.map(f => 
        newFiles.find(nf => nf.id === f.id) 
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }, [onUpload])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview))
    setFiles([])
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxFiles,
    maxSize,
    disabled: isUploading
  })

  const completedCount = files.filter(f => f.status === 'completed').length
  const totalCount = files.length

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "p-4 rounded-full bg-muted",
            isDragActive && "bg-primary/10",
            isDragReject && "bg-destructive/10"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragActive && "text-primary",
              isDragReject && "text-destructive"
            )} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? "Drop your screenshots here"
                : "Drag & drop screenshots here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, WEBP, GIF (max {(maxSize / 1024 / 1024).toFixed(0)}MB per file)
            </p>
          </div>

          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} files uploaded
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">
              Uploaded Files ({files.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-2 rounded-lg border bg-card"
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover rounded"
                  />
                  {file.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'completed' && (
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  )}
                  {file.status === 'error' && (
                    <div className="h-2 w-2 bg-destructive rounded-full" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}