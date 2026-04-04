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
 * Render a PDF page to a high-quality image for OCR
 * @param {Object} pdf - PDF document object
 * @param {number} pageNum - Page number to render
 * @returns {Promise<string>} Data URL of the page image
 */
export const renderPDFToImage = (pdf, pageNum) => {
  return pdf.getPage(pageNum).then((page) => {
    // Scale 3x for best OCR accuracy on handwritten/printed text
    const viewport = page.getViewport({ scale: 3.0 });

    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width  = viewport.width;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    return page.render({ canvasContext: context, viewport }).promise.then(() => {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    });
  });
};

/**
 * Extract text from PDF file (Legacy text extraction)
 */
export const extractTextFromPDF = async (file) => {
  try {
    const pdfjs = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return {
      fileName: file.name,
      pageCount: pdf.numPages,
      extractedText: fullText.trim(),
      isDigital: fullText.trim().length > 50 // Threshold for "scanned" check
    };
  } catch (error) {
    throw new Error(`PDF Load Error: ${error.message}`);
  }
};

export default {
  extractTextFromPDF,
  renderPDFToImage,
};
