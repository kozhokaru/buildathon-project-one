"use client"

import { useEffect, useState } from 'react'
import { extractTextFromFile, terminateOCR } from '@/lib/ocr/tesseract'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { FileText, Loader2 } from 'lucide-react'

interface OCRProcessorProps {
  file: File
  onComplete: (text: string) => void
  autoStart?: boolean
}

export function OCRProcessor({ file, onComplete, autoStart = true }: OCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (autoStart) {
      processOCR()
    }

    return () => {
      // Cleanup on unmount
      terminateOCR()
    }
  }, [file, autoStart])

  const processOCR = async () => {
    setIsProcessing(true)
    setError('')
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const text = await extractTextFromFile(file)
      
      clearInterval(progressInterval)
      setProgress(100)
      setExtractedText(text)
      onComplete(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR processing failed')
      onComplete('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">OCR Processing</span>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs text-muted-foreground">
                Extracting text from {file.name}...
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {extractedText && !isProcessing && (
          <div className="space-y-2">
            <p className="text-xs text-green-600">✓ Text extraction complete</p>
            <div className="p-2 bg-muted rounded text-xs max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{extractedText.substring(0, 200)}...</pre>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </Card>
  )
}