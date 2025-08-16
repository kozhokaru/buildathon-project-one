import { createWorker, Worker } from 'tesseract.js'

let worker: Worker | null = null

export async function initializeOCR() {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        // Optional: Log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
  }
  return worker
}

export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const ocrWorker = await initializeOCR()
    const { data: { text } } = await ocrWorker.recognize(imageUrl)
    return text.trim()
  } catch (error) {
    console.error('OCR extraction failed:', error)
    return ''
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file)
  try {
    const text = await extractTextFromImage(imageUrl)
    return text
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}

// Batch processing for multiple images
export async function batchExtractText(files: File[]): Promise<Map<File, string>> {
  const results = new Map<File, string>()
  const ocrWorker = await initializeOCR()
  
  for (const file of files) {
    const imageUrl = URL.createObjectURL(file)
    try {
      const { data: { text } } = await ocrWorker.recognize(imageUrl)
      results.set(file, text.trim())
    } catch (error) {
      console.error(`OCR failed for ${file.name}:`, error)
      results.set(file, '')
    } finally {
      URL.revokeObjectURL(imageUrl)
    }
  }
  
  return results
}