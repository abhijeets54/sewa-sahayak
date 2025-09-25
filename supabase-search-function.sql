-- Create the search function for vector similarity search
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding TEXT,
  match_threshold FLOAT DEFAULT 0.1,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  content TEXT,
  document_name TEXT,
  page_number INTEGER,
  chunk_index INTEGER,
  distance FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.document_name,
    d.page_number,
    d.chunk_index,
    (d.embedding <-> query_embedding::vector) AS distance
  FROM documents d
  WHERE d.embedding IS NOT NULL
    AND (d.embedding <-> query_embedding::vector) < (1 - match_threshold)
  ORDER BY d.embedding <-> query_embedding::vector
  LIMIT match_count;
END;
$$;