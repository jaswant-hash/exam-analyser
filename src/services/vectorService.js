import { generateEmbedding } from './llmService';

// Store embeddings in memory for the session
let vectorStore = [];

/**
 * Calculates cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Split text into semantic chunks for vectorization
 * Improved to respect sentence boundaries and prevent "cut-off" context.
 * @param {string} text - Raw text
 * @returns {Array<string>} Chunks of text
 */
const chunkText = (text, maxLength = 800) => {
  if (!text) return [];
  
  const chunks = [];
  // Split by common sentence terminators followed by space/newline
  const segments = text.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=\n)\s*(?=\n)/);
  
  let currentChunk = "";
  
  for (const segment of segments) {
    const cleanSegment = segment.trim();
    if (!cleanSegment) continue;

    // If adding this segment exceeds limit, push current and start new
    if ((currentChunk + " " + cleanSegment).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = cleanSegment;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + cleanSegment : cleanSegment;
    }

    // If a single segment is still too long (rare but possible), force split it
    if (currentChunk.length > maxLength) {
      let i = 0;
      while (i < currentChunk.length) {
        chunks.push(currentChunk.substring(i, i + maxLength));
        i += maxLength;
      }
      currentChunk = "";
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

/**
 * Index a document into the local vector store
 * @param {string} documentText - The full textbook/syllabus text
 * @param {Function} onProgress - Progress callback
 */
export const indexDocument = async (documentText, onProgress) => {
  // Clear previous store
  vectorStore = [];
  
  if (!documentText) return 0;

  const chunks = chunkText(documentText, 1000); // 1000 chars per chunk
  let processed = 0;

  // We process chunks sequentially to avoid overwhelming the local API, 
  // but embeddings are fast so this is relatively quick.
  const batchSize = 5;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    // Process batch in parallel
    const promises = batch.map(async (text, idx) => {
      // Allow the error to propagate up instead of swallowing it locally
      const vector = await generateEmbedding(text);
      if (vector) {
        vectorStore.push({
          id: i + idx,
          text,
          vector
        });
      }
    });

    try {
      await Promise.all(promises);
    } catch (err) {
      // If the API throws (e.g. connection refused), abort indexing entirely.
      throw new Error(`Vector Embeddings failed: ${err.message}`);
    }
    
    processed += batch.length;
    
    if (onProgress) {
      onProgress(processed, chunks.length);
    }
  }

  return vectorStore.length;
};

/**
 * Search the vector store for most relevant chunks
 * @param {string} query - Query string
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} Array of top matching texts
 */
export const searchStore = async (query, topK = 5) => {
  if (vectorStore.length === 0) {
    throw new Error('Vector store is empty. Index a document first.');
  }

  const queryVector = await generateEmbedding(query);
  
  const results = vectorStore.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector)
  }));

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
};

/**
 * Clear the current vector store
 */
export const clearStore = () => {
  vectorStore = [];
};

export default {
  indexDocument,
  searchStore,
  clearStore
};
