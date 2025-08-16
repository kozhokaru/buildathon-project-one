-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_screenshots(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_filter uuid
)
RETURNS TABLE (
  screenshot_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.screenshot_id,
    1 - (se.combined_embedding <=> query_embedding) as similarity
  FROM screenshot_embeddings se
  INNER JOIN screenshots s ON s.id = se.screenshot_id
  WHERE 
    s.user_id = user_id_filter
    AND se.combined_embedding IS NOT NULL
    AND 1 - (se.combined_embedding <=> query_embedding) > match_threshold
  ORDER BY se.combined_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_screenshots TO authenticated;

-- Create function for getting screenshot statistics
CREATE OR REPLACE FUNCTION get_user_screenshot_stats(user_id_param uuid)
RETURNS TABLE (
  total_screenshots bigint,
  processed_screenshots bigint,
  pending_screenshots bigint,
  failed_screenshots bigint,
  total_storage_used bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_screenshots,
    COUNT(*) FILTER (WHERE processing_status = 'completed') as processed_screenshots,
    COUNT(*) FILTER (WHERE processing_status = 'pending') as pending_screenshots,
    COUNT(*) FILTER (WHERE processing_status = 'failed') as failed_screenshots,
    COALESCE(SUM(file_size), 0) as total_storage_used
  FROM screenshots
  WHERE user_id = user_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_screenshot_stats TO authenticated;