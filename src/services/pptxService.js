/**
 * PPTX Parser Service
 * Extracts raw textual data from Microsoft PowerPoint (.pptx) archives directly in the browser via JSZip.
 */
import JSZip from 'jszip';

export const extractTextFromPPTX = async (file) => {
  try {
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    let fullText = '';
    
    // Find all slide xml files
    const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
    const slides = Object.keys(content.files).filter(fileName => slideRegex.test(fileName));
    
    // Sort slides numerically so they are read in the correct order
    slides.sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)[0]);
      const bNum = parseInt(b.match(/\d+/)[0]);
      return aNum - bNum;
    });

    for (const slide of slides) {
      const slideXml = await content.file(slide).async('text');
      // Extract text from <a:t> elements
      const matches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
      if (matches) {
        const slideText = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
        fullText += slideText + '\n\n';
      }
    }
    
    if (!fullText.trim()) {
       throw new Error('No readable text found in this PPTX presentation. Ensure it is not entirely images.');
    }

    return {
      fileName: file.name,
      slideCount: slides.length,
      extractedText: fullText.trim(),
      isDigital: true // By definition, if XML parsed properly, it's digital text
    };
  } catch (error) {
    if (error.message.includes('No readable text')) throw error;
    throw new Error(`PPTX extraction failed: ${error.message}`);
  }
};

export default {
  extractTextFromPPTX
};
