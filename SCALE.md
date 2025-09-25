# Seva Sahayak - Scaling and Document Management Guide

## Overview
Seva Sahayak is an AI-powered assistant for Punjab Government services using RAG (Retrieval-Augmented Generation) architecture. This guide covers how to scale the system and manage document updates.

## Current System Status
- **Total Documents Indexed**: 1,840 document chunks
- **PDF Files Processed**: 9 government service documents
- **Vector Database**: ChromaDB with persistent storage
- **AI Model**: Google Gemini for embeddings and responses
- **Processing Status**: ✅ Complete (all 184 batches processed)

## Adding New Documents

### 1. Document Placement
- Place new PDF files in the `E:\pdfs\` folder
- Supported format: PDF files only
- File naming: Use descriptive names (e.g., `passport-service-2024.pdf`)

### 2. Trigger Reprocessing
Choose one of the following methods:

**Browser Method:**
```
http://localhost:3000/api/process
```

**Command Line Method:**
```bash
curl -X POST http://localhost:3000/api/process
```

### 3. Processing Pipeline
The system will automatically:
1. Scan the `pdfs` folder for all PDF files
2. Clear the existing ChromaDB collection
3. Extract text from ALL PDFs (including new ones)
4. Create text chunks (1500 characters with 300 overlap)
5. Generate embeddings using Google Gemini
6. Rebuild the vector database with all documents

### 4. Monitor Progress
Watch the console output for:
```
Found X PDF files to process
Processing: filename.pdf
Created X chunks from filename.pdf
Processing batch X/Y
Successfully added X documents to vector database
```

### 5. Verify Completion
Check document count after processing:
```bash
curl -X GET http://localhost:3000/api/debug
```

Expected response:
```json
{
  "status": "Debug API ready",
  "collectionInfo": {
    "name": "seva-sahayak-documents",
    "count": 1840  // Will increase with new documents
  },
  "timestamp": "2025-09-24T11:05:22.882Z"
}
```

## System Performance

### Current Configuration
```javascript
// src/lib/config.ts
export const config = {
  topKResults: 8,           // Increased for better coverage
  chunkSize: 1500,          // Larger chunks for more context
  chunkOverlap: 300,        // More overlap for continuity
  similarityThreshold: -0.1, // Lower threshold for broader results
}
```

### Processing Times
- **Per PDF**: ~30-60 seconds (depends on size)
- **Batch Processing**: ~6 seconds per batch of 10 chunks
- **Total Time**: Scales linearly with document count

### Accuracy Metrics
- **Relevance Scores**: Up to 46.9% for highly relevant matches
- **Multi-language Support**: ✅ Punjabi and English
- **Source Citations**: ✅ Document name and page number
- **Query Variations**: 4 automatic variations per user query

## Scaling Considerations

### Hardware Requirements
- **RAM**: 4GB+ recommended for large document sets
- **Storage**: ~100MB per 1000 document chunks
- **CPU**: Multi-core beneficial for parallel processing

### Performance Optimization
1. **Batch Size**: Currently 10 chunks per batch (optimal for most setups)
2. **Concurrent Processing**: Limited to prevent memory issues
3. **Embedding Cache**: Reduces redundant API calls

### High-Volume Scaling
For processing 100+ PDF files:
1. Consider increasing batch size in `vector-db.ts`
2. Monitor memory usage during processing
3. Implement incremental updates (future enhancement)

## API Endpoints

### Processing
- **POST** `/api/process` - Reprocess all documents
- **GET** `/api/debug` - Check system status and document count

### Chat Interface
- **POST** `/api/chat` - Query the AI assistant
- **GET** `/` - Web interface

### Health Check
- **GET** `/api/debug` - System health and statistics

## Troubleshooting

### Common Issues

**Processing Fails:**
- Check ChromaDB server is running (`python -m chromadb.cli.cli run --host 0.0.0.0 --port 8000`)
- Verify Google API key in `.env.local`
- Ensure PDFs are not corrupted

**Low Accuracy:**
- Check relevance scores in debug output
- Verify document content quality
- Consider adjusting `similarityThreshold` in config

**Memory Issues:**
- Reduce batch size in processing
- Process documents in smaller groups
- Monitor system resources

### Server Management

**Start ChromaDB:**
```bash
# Windows
start-chromadb.bat

# Linux/Mac
./start-chromadb.sh

# Manual
python -m chromadb.cli.cli run --host 0.0.0.0 --port 8000
```

**Start Application:**
```bash
cd seva-sahayak
npm run dev
```

## Multi-Language Support

### Current Capabilities
- **Input Languages**: English, Punjabi (Gurmukhi script)
- **Output**: English (with translation of Punjabi content)
- **Document Processing**: Handles mixed-language documents

### Language Processing Pipeline
1. Text extraction preserves original script
2. Embedding generation works with mixed content
3. Response generation translates Punjabi to English
4. Context maintains original language for accuracy

## Future Enhancements

### Planned Features
- **Incremental Updates**: Add new documents without full reprocessing
- **Document Versioning**: Track changes in government documents
- **Advanced Analytics**: Usage patterns and query success rates
- **Auto-sync**: Scheduled document updates
- **Multi-tenant**: Support multiple departments/regions

### Performance Improvements
- **Caching Layer**: Redis for frequently accessed data
- **Load Balancing**: Multiple processing instances
- **Database Optimization**: Advanced indexing strategies

## Support

### Resources
- **Helpline**: 1100 (Punjab Government)
- **Website**: https://connect.punjab.gov.in/
- **WhatsApp**: 98555 01076

### System Monitoring
Monitor these metrics for optimal performance:
- Document count growth
- Query response times
- Relevance score trends
- User query patterns

---

**Last Updated**: September 24, 2025
**System Version**: 1.0
**Document Capacity**: 1,840 chunks (expandable)