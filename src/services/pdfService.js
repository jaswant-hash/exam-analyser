/**
 * PDF Service
 * Extracts text from PDF files using pdf.js loaded from CDN
 * Supports multi-page PDFs
 */

// Dynamically load pdfjs from CDN to avoid Vite bundler issues
const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

let pdfjsLib = null;

const loadPDFJS = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, return it
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      resolve(window.pdfjsLib);
      return;
    }
    // Load script from CDN
    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load pdfjs from CDN'));
    document.head.appendChild(script);
  });
};

/**
 * Extract text from PDF file
 * @param {File} file - PDF file to process
 * @returns {Promise<Object>} Extracted text and metadata
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error(
        `Invalid file type: ${file.type}. Expected: application/pdf`
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('PDF file exceeds 50MB limit');
    }

    // Load pdfjs dynamically
    const pdfjs = await loadPDFJS();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const pageCount = pdf.numPages;

    if (pageCount === 0) {
      throw new Error('PDF has no pages');
    }

    // Extract text from all pages
    let fullText = '';
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => item.str)
          .join(' ');

        pageTexts.push({
          pageNumber: pageNum,
          text: pageText.trim(),
        });

        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        pageTexts.push({
          pageNumber: pageNum,
          text: '',
          error: pageError.message,
        });
      }
    }

    // Extract concepts from full text
    const concepts = extractConceptsFromPDFText(fullText);

    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pageCount,
      extractedText: fullText.trim(),
      pageTexts: pageTexts,
      extractedConcepts: concepts,
      totalCharacters: fullText.length,
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extract concepts from PDF text
 * Uses predefined keyword patterns
 * @param {string} text - Extracted PDF text
 * @returns {Array} Array of detected concepts
 */
const extractConceptsFromPDFText = (text) => {
  try {
    const conceptKeywords = {
      'CPU Scheduling': [
        'fcfs',
        'round robin',
        'time quantum',
        'scheduling algorithm',
        'preemptive',
        'non-preemptive',
        'burst time',
        'waiting time',
        'turnaround time',
      ],
      Paging: [
        'page fault',
        'frame',
        'offset',
        'page table',
        'virtual address',
        'physical address',
        'page replacement',
        'tlb',
        'translation',
      ],
      Deadlock: [
        'mutual exclusion',
        'hold and wait',
        'circular wait',
        'no preemption',
        'deadlock detection',
        'deadlock prevention',
        'bankers algorithm',
        'wait-for graph',
        'resource allocation',
      ],
      'Memory Management': [
        'memory allocation',
        'fragmentation',
        'swapping',
        'segmentation',
        'virtual memory',
        'cache',
        'memory hierarchy',
        'resident set',
      ],
      'File System': [
        'inode',
        'directory',
        'file allocation',
        'free space management',
        'fat',
        'ext4',
        'acl',
        'permission',
        'file descriptor',
      ],
      'Process Management': [
        'process state',
        'context switch',
        'pcb',
        'process synchronization',
        'semaphore',
        'mutex',
        'critical section',
        'orphan process',
      ],
      'I/O Management': [
        'interrupt',
        'dma',
        'buffering',
        'spooling',
        'io controller',
        'io request',
        'polling',
      ],
      'Filesystem Hierarchy': [
        'filesystem',
        'mount point',
        'root directory',
        'partition',
        'block size',
      ],
      Synchronization: [
        'race condition',
        'thread',
        'lock',
        'atomic operation',
        'monitor',
        'condition variable',
      ],
    };

    const lowerText = text.toLowerCase();
    const detectedConcepts = [];
    const conceptSet = new Set();

    for (const [topic, keywords] of Object.entries(conceptKeywords)) {
      const foundKeywords = [];

      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
          conceptSet.add(topic);
        }
      }

      if (foundKeywords.length > 0) {
        detectedConcepts.push({
          concept: topic,
          keywordCount: foundKeywords.length,
          foundKeywords: foundKeywords,
        });
      }
    }

    // Sort by keyword count (most relevant first)
    return detectedConcepts.sort((a, b) => b.keywordCount - a.keywordCount);
  } catch (error) {
    console.error('Error extracting concepts from PDF:', error);
    return [];
  }
};

/**
 * Extract specific page range from PDF
 * @param {File} file - PDF file
 * @param {number} startPage - Start page number (1-indexed)
 * @param {number} endPage - End page number (1-indexed)
 * @returns {Promise<Object>} Extracted text from page range
 */
export const extractTextFromPageRange = async (file, startPage, endPage) => {
  try {
    if (startPage < 1 || endPage < startPage) {
      throw new Error('Invalid page range');
    }

    const pdfjs = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const pageCount = pdf.numPages;

    if (endPage > pageCount) {
      throw new Error(
        `End page ${endPage} exceeds total pages ${pageCount}`
      );
    }

    let rangeText = '';
    const pageTexts = [];

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');

      pageTexts.push({
        pageNumber: pageNum,
        text: pageText.trim(),
      });

      rangeText += pageText + '\n';
    }

    return {
      fileName: file.name,
      startPage,
      endPage,
      extractedPages: endPage - startPage + 1,
      extractedText: rangeText.trim(),
      pageTexts: pageTexts,
    };
  } catch (error) {
    throw new Error(`Page range extraction failed: ${error.message}`);
  }
};

/**
 * Get PDF metadata (page count, file info)
 * @param {File} file - PDF file
 * @returns {Promise<Object>} PDF metadata
 */
export const getPDFMetadata = async (file) => {
  try {
    if (file.type !== 'application/pdf') {
      throw new Error('Invalid file type');
    }

    const pdfjs = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;

    const metadata = await pdf.getMetadata().catch(() => ({}));

    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdf.numPages,
      metadata: metadata,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Metadata extraction failed: ${error.message}`);
  }
};

/**
 * Validate PDF file
 * @param {File} file - PDF file to validate
 * @returns {Object} Validation result
 */
export const validatePDF = (file) => {
  try {
    const isValidType = file.type === 'application/pdf';
    const maxSize = 50 * 1024 * 1024; // 50MB
    const minSize = 1 * 1024; // 1KB
    const isValidSize = file.size >= minSize && file.size <= maxSize;

    return {
      isValid: isValidType && isValidSize,
      errors: [
        !isValidType ? `Invalid type: ${file.type}` : '',
        !isValidSize && file.size < minSize ? 'PDF too small' : '',
        !isValidSize && file.size > maxSize ? 'PDF too large' : '',
      ].filter(Boolean),
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
    };
  }
};

export default {
  extractTextFromPDF,
  extractTextFromPageRange,
  getPDFMetadata,
  validatePDF,
};
