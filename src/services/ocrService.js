/**
 * OCR Service
 * Extracts text from images or PDF canvases using Tesseract.js
 * Supports high-accuracy processing for handwritten and scanned text.
 */

// Use Tesseract.js v5 for better performance and accuracy
const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

let tesseractLoaded = false;

const loadTesseract = () => {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      tesseractLoaded = true;
      resolve(window.Tesseract);
      return;
    }
    const script = document.createElement('script');
    script.src = TESSERACT_CDN;
    script.onload = () => {
      tesseractLoaded = true;
      resolve(window.Tesseract);
    };
    script.onerror = () => reject(new Error('Failed to load Tesseract.js v5'));
    document.head.appendChild(script);
  });
};

/**
 * Extract text from an image (File, Blob, or URL)
 * @param {File|Blob|string} source - Image source
 * @param {Function} onProgress - Progress callback
 */
export const extractTextFromImage = async (source, onProgress) => {
  try {
    const TesseractLib = await loadTesseract();
    
    // Create URL if it's a file or blob
    const imageURL = (typeof source === 'string') ? source : URL.createObjectURL(source);

    // Create a worker for multi-threading/better control
    const worker = await TesseractLib.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing' && onProgress) {
          onProgress(m.progress);
        }
      },
    });

    const { data: { text, confidence } } = await worker.recognize(imageURL);
    await worker.terminate();

    if (typeof source !== 'string') {
      URL.revokeObjectURL(imageURL);
    }

    return {
      rawText: text.trim(),
      confidence: confidence,
      extractedConcepts: extractConceptsFromText(text),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`Deep Scan failed: ${error.message}`);
  }
};

/**
 * Extract concepts from OCR text with expanded keyword matching
 */
const extractConceptsFromText = (text) => {
  try {
    const conceptKeywords = {
      'CPU Scheduling': ['fcfs', 'round robin', 'sjf', 'priority', 'preemptive', 'quantum', 'burst time', 'gantt chart'],
      'Paging': ['page fault', 'tlb', 'translation', 'frame', 'offset', 'page table', 'virtual memory', 'fifo', 'lru'],
      'Deadlock': ['bankers', 'avoidance', 'prevention', 'circular wait', 'resource graph', 'starvation', 'mutual exclusion'],
      'Memory Management': ['segmentation', 'fragmentation', 'dynamic loading', 'overlay', 'compaction', 'allocation'],
      'File System': ['inode', 'ext4', 'fat', 'directory', 'mount', 'disk scheduling', 'raid', 'sector', 'cylinder'],
      'Process Management': ['pcb', 'context switch', 'fork', 'exec', 'signal', 'semaphore', 'mutex', 'thread'],
      'Networking': ['tcp', 'udp', 'ip address', 'subnet', 'router', 'gateway', 'osi model', 'handshake'],
      'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table', 'complexity'],
      'Algorithms': ['binary search', 'sorting', 'recursion', 'dynamic programming', 'greedy', 'backtracking']
    };

    const lowerText = text.toLowerCase();
    const detectedConcepts = [];

    for (const [topic, keywords] of Object.entries(conceptKeywords)) {
      const found = keywords.filter(k => lowerText.includes(k.toLowerCase()));
      if (found.length > 0) {
        detectedConcepts.push({ concept: topic, keywords: found });
      }
    }

    return detectedConcepts;
  } catch (err) {
    return [];
  }
};

export default {
  extractTextFromImage,
};
