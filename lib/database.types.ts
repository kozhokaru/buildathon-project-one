export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      screenshots: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          width: number | null
          height: number | null
          uploaded_at: string
          processed_at: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          width?: number | null
          height?: number | null
          uploaded_at?: string
          processed_at?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          width?: number | null
          height?: number | null
          uploaded_at?: string
          processed_at?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      screenshot_content: {
        Row: {
          id: string
          screenshot_id: string
          ocr_text: string | null
          visual_description: string | null
          dominant_colors: Json | null
          detected_elements: Json | null
          processing_cost: number
          ocr_completed_at: string | null
          vision_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          screenshot_id: string
          ocr_text?: string | null
          visual_description?: string | null
          dominant_colors?: Json | null
          detected_elements?: Json | null
          processing_cost?: number
          ocr_completed_at?: string | null
          vision_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          screenshot_id?: string
          ocr_text?: string | null
          visual_description?: string | null
          dominant_colors?: Json | null
          detected_elements?: Json | null
          processing_cost?: number
          ocr_completed_at?: string | null
          vision_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      screenshot_embeddings: {
        Row: {
          id: string
          screenshot_id: string
          text_embedding: number[] | null
          visual_embedding: number[] | null
          combined_embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          screenshot_id: string
          text_embedding?: number[] | null
          visual_embedding?: number[] | null
          combined_embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          screenshot_id?: string
          text_embedding?: number[] | null
          visual_embedding?: number[] | null
          combined_embedding?: number[] | null
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          search_type: 'text' | 'visual' | 'hybrid'
          results: Json | null
          result_count: number
          searched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          search_type?: 'text' | 'visual' | 'hybrid'
          results?: Json | null
          result_count?: number
          searched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          search_type?: 'text' | 'visual' | 'hybrid'
          results?: Json | null
          result_count?: number
          searched_at?: string
        }
      }
      processing_queue: {
        Row: {
          id: string
          screenshot_id: string
          task_type: 'ocr' | 'vision' | 'embeddings'
          priority: number
          attempts: number
          max_attempts: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          scheduled_at: string
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          screenshot_id: string
          task_type: 'ocr' | 'vision' | 'embeddings'
          priority?: number
          attempts?: number
          max_attempts?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          scheduled_at?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          screenshot_id?: string
          task_type?: 'ocr' | 'vision' | 'embeddings'
          priority?: number
          attempts?: number
          max_attempts?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          scheduled_at?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Screenshot = Database['public']['Tables']['screenshots']['Row']
export type ScreenshotInsert = Database['public']['Tables']['screenshots']['Insert']
export type ScreenshotUpdate = Database['public']['Tables']['screenshots']['Update']

export type ScreenshotContent = Database['public']['Tables']['screenshot_content']['Row']
export type ScreenshotContentInsert = Database['public']['Tables']['screenshot_content']['Insert']
export type ScreenshotContentUpdate = Database['public']['Tables']['screenshot_content']['Update']

export type ScreenshotEmbeddings = Database['public']['Tables']['screenshot_embeddings']['Row']
export type ScreenshotEmbeddingsInsert = Database['public']['Tables']['screenshot_embeddings']['Insert']

export type SearchHistory = Database['public']['Tables']['search_history']['Row']
export type SearchHistoryInsert = Database['public']['Tables']['search_history']['Insert']

export type ProcessingQueue = Database['public']['Tables']['processing_queue']['Row']
export type ProcessingQueueInsert = Database['public']['Tables']['processing_queue']['Insert']
export type ProcessingQueueUpdate = Database['public']['Tables']['processing_queue']['Update']

// Search result type
export interface SearchResult {
  screenshot: Screenshot
  content: ScreenshotContent | null
  confidence: number
  match_type: 'text' | 'visual' | 'hybrid'
  highlighted_text?: string
}