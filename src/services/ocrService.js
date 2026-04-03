/**
 * OCR Service
 * Extracts text from images using Tesseract.js loaded from CDN
 * Supports PNG, JPG, JPEG formats
 */

// Dynamically load Tesseract.js from CDN to avoid Vite bundler issues
const TESSERACT_CDN = 'https://unpkg.com/tesseract.js@4/dist/tesseract.min.js';

let tesseractLoaded = false;

const loadTesseract = () => {
  return new Promise((resolve, reject) => {
    if (tesseractLoaded && window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }
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
    script.onerror = () => reject(new Error('Failed to load Tesseract.js from CDN'));
    document.head.appendChild(script);
  });
};

/**
 * Extract text from image file using OCR
 * @param {File} file - Image file (PNG, JPG, JPEG)
 * @returns {Promise<Object>} Extracted text and metadata
 */
export const extractTextFromImage = async (file) => {
  try {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Supported types: PNG, JPG, JPEG`
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Load Tesseract dynamically
    const TesseractLib = await loadTesseract();

    // Create file URL for Tesseract
    const fileURL = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      TesseractLib.recognize(fileURL, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      })
        .then((result) => {
          try {
            const rawText = result.data.text || '';
            const confidence = result.data.confidence || 0;
            const concepts = extractConceptsFromText(rawText);
            URL.revokeObjectURL(fileURL);
            resolve({
              rawText: rawText.trim(),
              confidence: confidence,
              extractedConcepts: concepts,
              language: 'eng',
              fileSize: file.size,
              fileName: file.name,
            });
          } catch (error) {
            URL.revokeObjectURL(fileURL);
            reject(new Error(`Text extraction failed: ${error.message}`));
          }
        })
        .catch((error) => {
          URL.revokeObjectURL(fileURL);
          reject(new Error(`Tesseract OCR error: ${error.message}`));
        });
    });
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Extract concepts from OCR text
 * Uses predefined keyword patterns to identify topics
 * @param {string} text - OCR extracted text
 * @returns {Array} Array of detected concepts
 */
const extractConceptsFromText = (text) => {
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
      ],
      'Memory Management': [
        'memory allocation',
        'fragmentation',
        'swapping',
        'segmentation',
        'virtual memory',
        'cache',
        'memory hierarchy',
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
      ],
      'Process Management': [
        'process state',
        'context switch',
        'pcb',
        'process synchronization',
        'semaphore',
        'mutex',
        'critical section',
      ],
      'I/O Management': [
        'interrupt',
        'dma',
        'buffering',
        'spooling',
        'io controller',
        'io request',
      ],
    };

    const lowerText = text.toLowerCase();
    const detectedConcepts = [];
    const conceptSet = new Set();

    // Check for concept keywords
    for (const [topic, keywords] of Object.entries(conceptKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          conceptSet.add(topic);
          if (!detectedConcepts.find((c) => c.concept === topic)) {
            detectedConcepts.push({
              concept: topic,
              keywords: [keyword],
            });
          } else {
            const existing = detectedConcepts.find((c) => c.concept === topic);
            if (!existing.keywords.includes(keyword)) {
              existing.keywords.push(keyword);
            }
          }
        }
      }
    }

    return detectedConcepts;
  } catch (error) {
    console.error('Error extracting concepts:', error);
    return [];
  }
};

/**
 * Batch process multiple images
 * @param {File[]} files - Array of image files
 * @returns {Promise<Array>} Array of extraction results
 */
export const extractTextFromMultipleImages = async (files) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid or empty file array');
    }

    const results = [];

    for (const file of files) {
      try {
        const result = await extractTextFromImage(file);
        results.push({
          success: true,
          fileName: file.name,
          data: result,
        });
      } catch (error) {
        results.push({
          success: false,
          fileName: file.name,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(
      `Batch image processing failed: ${error.message}`
    );
  }
};

/**
 * Validate image quality (simple check based on size and format)
 * @param {File} file - Image file
 * @returns {Object} Validation result
 */
export const validateImageQuality = (file) => {
  try {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const isValidType = validTypes.includes(file.type);
    const minSize = 100 * 1024; // 100KB
    const maxSize = 10 * 1024 * 1024; // 10MB
    const isValidSize = file.size >= minSize && file.size <= maxSize;

    return {
      isValid: isValidType && isValidSize,
      errors: [
        !isValidType ? `Invalid type: ${file.type}` : '',
        !isValidSize && file.size < minSize ? 'Image too small' : '',
        !isValidSize && file.size > maxSize ? 'Image too large' : '',
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
  extractTextFromImage,
  extractTextFromMultipleImages,
  validateImageQuality,
};
