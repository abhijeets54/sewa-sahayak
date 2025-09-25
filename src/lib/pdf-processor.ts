import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { DocumentChunk } from '@/types';

export class PDFProcessor {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`Error extracting text from ${filePath}:`, error);
      throw new Error(`Failed to extract text from PDF: ${path.basename(filePath)}`);
    }
  }

  chunkText(text: string, documentName: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const cleanText = text.replace(/\s+/g, ' ').trim();

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleanText.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, cleanText.length);
      let chunkText = cleanText.slice(startIndex, endIndex);

      // Try to break at word boundaries
      if (endIndex < cleanText.length) {
        const lastSpaceIndex = chunkText.lastIndexOf(' ');
        if (lastSpaceIndex > 0 && lastSpaceIndex > chunkText.length * 0.8) {
          chunkText = chunkText.slice(0, lastSpaceIndex);
        }
      }

      if (chunkText.trim().length > 0) {
        chunks.push({
          id: `${documentName}_chunk_${chunkIndex}`,
          content: chunkText.trim(),
          metadata: {
            document: documentName,
            page: Math.floor(chunkIndex / 2) + 1, // Rough page estimation
            chunkIndex,
          },
        });
        chunkIndex++;
      }

      // Calculate next start index with overlap
      const actualEndIndex = startIndex + chunkText.length;
      startIndex = Math.max(actualEndIndex - this.chunkOverlap, startIndex + 1);

      if (startIndex >= cleanText.length) break;
    }

    return chunks;
  }

  async processPDFDirectory(directoryPath: string): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];

    try {
      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

      console.log(`Found ${pdfFiles.length} PDF files to process`);

      for (const file of pdfFiles) {
        const filePath = path.join(directoryPath, file);
        const documentName = path.basename(file, '.pdf');

        try {
          console.log(`Processing: ${file}`);
          const text = await this.extractTextFromPDF(filePath);
          const chunks = this.chunkText(text, documentName);
          allChunks.push(...chunks);
          console.log(`Created ${chunks.length} chunks from ${file}`);
        } catch (error) {
          console.error(`Failed to process ${file}:`, error);
          // Continue processing other files
        }
      }

      console.log(`Total chunks created: ${allChunks.length}`);
      return allChunks;
    } catch (error) {
      console.error('Error processing PDF directory:', error);
      throw error;
    }
  }
}