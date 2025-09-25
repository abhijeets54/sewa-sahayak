# Seva Sahayak - Punjab Government Services Assistant

An AI-powered web application that provides instant, accurate answers to citizen queries regarding government services in Punjab. Built with Next.js and powered by Google Gemini AI with Retrieval-Augmented Generation (RAG) architecture.

## Features

- 🤖 **AI-Powered Assistant**: Uses Google Gemini for natural language processing
- 📄 **PDF-Based Knowledge**: Answers derived exclusively from official government PDFs
- 🔍 **Source Citations**: Every answer includes source document and page references
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Chat**: Instant responses with typing indicators
- 🔄 **Scalable Architecture**: Easy to add new documents and handle more users

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **AI/ML**: Google Gemini API (gemini-pro, embedding-001)
- **Vector Database**: ChromaDB
- **PDF Processing**: pdf-parse
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key
- ChromaDB instance (local or hosted)

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd seva-sahayak
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - Other variables can use default values for local development

4. **Place your PDF documents**:
   Add your government PDF documents to the `pdfs/` directory

5. **Process the PDFs** (First time setup):
   ```bash
   npm run process-pdfs
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
seva-sahayak/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── chat/       # Chat endpoint
│   │   │   └── process/    # PDF processing endpoint
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   └── chat/          # Chat-specific components
│   ├── lib/               # Utilities and services
│   │   ├── config.ts      # Configuration
│   │   ├── gemini.ts      # Google Gemini integration
│   │   ├── pdf-processor.ts # PDF text extraction
│   │   ├── vector-db.ts   # ChromaDB integration
│   │   ├── rag-service.ts # RAG implementation
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript type definitions
├── scripts/               # Utility scripts
│   └── process-pdfs.js   # PDF processing script
├── pdfs/                 # PDF documents directory
└── public/               # Static assets
```

## How It Works

### 1. Data Processing Pipeline (Offline)
- **PDF Text Extraction**: Extracts text from PDFs using pdf-parse
- **Text Chunking**: Splits large documents into manageable chunks
- **Embedding Generation**: Creates vector embeddings using Gemini embedding-001
- **Vector Storage**: Stores embeddings and metadata in ChromaDB

### 2. Query Processing Pipeline (Real-time)
- **Query Embedding**: Converts user question to vector representation
- **Similarity Search**: Finds most relevant document chunks
- **Context Assembly**: Combines relevant chunks with user query
- **Answer Generation**: Uses Gemini to generate contextual response
- **Source Citation**: Includes document sources and page numbers

## API Endpoints

### Chat API
- **POST** `/api/chat`
  - Body: `{ "message": "user question" }`
  - Response: Answer with sources and citations

- **GET** `/api/chat`
  - Health check endpoint

### Processing API
- **POST** `/api/process`
  - Triggers PDF processing pipeline
  - Response: Processing results and statistics

- **GET** `/api/process`
  - Returns current database status

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run process-pdfs` - Process PDF documents

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `CHROMA_HOST` | ChromaDB host | localhost |
| `CHROMA_PORT` | ChromaDB port | 8000 |
| `VECTOR_DIMENSION` | Embedding vector dimension | 768 |
| `TOP_K_RESULTS` | Number of similar chunks to retrieve | 5 |
| `CHUNK_SIZE` | Text chunk size for processing | 1000 |
| `CHUNK_OVERLAP` | Overlap between chunks | 200 |

## Customization

### Adding New Documents
1. Place PDF files in the `pdfs/` directory
2. Run `npm run process-pdfs` to update the vector database

### Modifying the AI Prompt
Edit the `createPrompt` method in `src/lib/rag-service.ts`

### UI Customization
- Colors: Edit `tailwind.config.ts` for color scheme changes
- Components: Modify files in `src/components/` for UI changes

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
1. Build the application: `npm run build`
2. Start the server: `npm run start`
3. Ensure ChromaDB is accessible from your server

## Troubleshooting

### Common Issues

1. **PDF Processing Fails**:
   - Check if PDF files exist in `pdfs/` directory
   - Verify Google API key is set correctly
   - Ensure sufficient API quota

2. **ChromaDB Connection Issues**:
   - Verify ChromaDB is running on specified host/port
   - Check firewall settings for ChromaDB port

3. **Memory Issues**:
   - Reduce batch size in vector database operations
   - Process fewer PDFs at once

### Support

For issues and questions:
1. Check the logs in your console/server
2. Verify all environment variables are set
3. Ensure all dependencies are installed correctly

## License

This project is developed for Punjab Government services.

## Author

Developed by Abhijeet (Intern) - September 2025