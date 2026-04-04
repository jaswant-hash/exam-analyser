/**
 * geminiVisionService.js
 * ─────────────────────────────────────────────────────────────
 * Universal document OCR using Gemini 2.0 Flash.
 *
 * Supported natively by Gemini:
 *   - Images:   image/jpeg, image/png, image/webp, image/gif
 *   - PDFs:     application/pdf  ← sent as-is, no page rendering needed
 *
 * Strategy:
 *   1. Files < 4 MB  → inline base64 (fast, no upload needed)
 *   2. Files ≥ 4 MB  → Gemini Files API (upload then reference)
 *   3. Fallback through model list if one fails
 *   4. ALWAYS throw (never swallow) — caller decides what to show
 */

const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta';
const UPLOAD_BASE  = 'https://generativelanguage.googleapis.com/upload/v1beta';

const MODELS = [
  'gemini-1.5-flash',      // stable and widely available
  'gemini-2.0-flash',      // newer version
  'gemini-2.5-flash',      // latest and most reliable
];

// ── Inline threshold: 4 MB ─────────────────────────────────────
const INLINE_LIMIT_BYTES = 4 * 1024 * 1024;

// ── OCR prompt ────────────────────────────────────────────────
const OCR_PROMPT = `You are a world-class document and handwriting OCR system.
Extract ALL text from this document — including handwritten answers, printed questions,
SQL queries, definitions, short answers, and any diagrams with labels.
RULES:
- Do NOT summarize or paraphrase.
- Do NOT answer the questions — just read and copy the text.
- Transcribe line by line exactly as written.
- If a word is unclear, make your best guess and continue.
- Include all visible text, even partial sentences.`;

// ── Helpers ───────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror  = () => reject(new Error(`FileReader failed on: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error(`FileReader (binary) failed on: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

// ── Upload large file via Gemini Files API ────────────────────
async function uploadFileToGemini(apiKey, file, mimeType, onProgress) {
  onProgress?.(`Uploading ${file.name} to Gemini Files API…`);

  // 1. Initiate resumable upload
  const initResp = await fetch(
    `${UPLOAD_BASE}/files?uploadType=resumable&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': file.size,
        'X-Goog-Upload-Header-Content-Type': mimeType,
      },
      body: JSON.stringify({ file: { displayName: file.name } }),
    }
  );

  if (!initResp.ok) {
    const err = await initResp.text();
    throw new Error(`Files API init failed: ${initResp.status} — ${err.slice(0, 300)}`);
  }

  const uploadUrl = initResp.headers.get('X-Goog-Upload-URL');
  if (!uploadUrl) throw new Error('Files API did not return an upload URL.');

  // 2. Upload binary data
  onProgress?.(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)…`);
  const buffer = await fileToArrayBuffer(file);

  const uploadResp = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': file.size,
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: buffer,
  });

  if (!uploadResp.ok) {
    const err = await uploadResp.text();
    throw new Error(`Files API upload failed: ${uploadResp.status} — ${err.slice(0, 300)}`);
  }

  const fileData = await uploadResp.json();
  const fileUri  = fileData?.file?.uri;
  if (!fileUri) throw new Error('Files API did not return a file URI.');

  onProgress?.(`Upload complete. Running OCR…`);
  return fileUri;
}

// ── Single model call (inline base64) ─────────────────────────
async function callModelInline(apiKey, model, base64, mimeType) {
  const url  = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [
        { text: OCR_PROMPT },
        { inline_data: { mime_type: mimeType, data: base64 } },
      ],
    }],
    generationConfig: {
      temperature:     0.1,
      maxOutputTokens: 8192,
    },
  };

  const resp = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`[${model}] HTTP ${resp.status}: ${err.slice(0, 300)}`);
  }

  const data = await resp.json();
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
    throw new Error(`[${model}] Content blocked (${finishReason}).`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`[${model}] Gemini returned empty text.`);
  return text;
}

// ── Single model call (Files API URI) ────────────────────────
async function callModelWithUri(apiKey, model, fileUri, mimeType) {
  const url  = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [
        { text: OCR_PROMPT },
        { file_data: { mime_type: mimeType, file_uri: fileUri } },
      ],
    }],
    generationConfig: {
      temperature:     0.1,
      maxOutputTokens: 8192,
    },
  };

  const resp = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`[${model}] HTTP ${resp.status}: ${err.slice(0, 300)}`);
  }

  const data = await resp.json();
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
    throw new Error(`[${model}] Content blocked (${finishReason}).`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`[${model}] Gemini returned empty text.`);
  return text;
}

// ── Main export ───────────────────────────────────────────────
/**
 * extractTextWithGemini
 *
 * Sends any file (image or PDF) to Gemini and returns the extracted text.
 * Uses Files API for large files (≥ 4 MB), inline base64 for small ones.
 * Tries all models in sequence. THROWS on total failure.
 *
 * @param {string}    apiKey     - VITE_GEMINI_API_KEY
 * @param {Blob|File} file       - The image or PDF file
 * @param {string}    mimeType   - 'image/png' | 'image/jpeg' | 'application/pdf' | etc.
 * @param {Function}  onProgress - Optional status callback (msg: string) => void
 * @returns {Promise<string>}  Extracted text
 */
export async function extractTextWithGemini(apiKey, file, mimeType, onProgress) {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY missing — add it to your .env file.');
  }

  const effectiveMime = mimeType || file.type || 'application/octet-stream';
  const useLargePath  = file.size >= INLINE_LIMIT_BYTES;

  let lastError = null;

  // ── Large file path: upload once, try all models ───────────
  if (useLargePath) {
    let fileUri;
    try {
      fileUri = await uploadFileToGemini(apiKey, file, effectiveMime, onProgress);
    } catch (uploadErr) {
      // Upload failed — fall through to inline (will likely also fail for huge files, but we try)
      console.warn('⚠️ Files API upload failed, trying inline base64:', uploadErr.message);
    }

    if (fileUri) {
      for (const model of MODELS) {
        try {
          onProgress?.(`OCR via Files API [${model}]…`);
          const text = await callModelWithUri(apiKey, model, fileUri, effectiveMime);
          console.log(`✅ OCR success (Files API) [${model}] — ${text.length} chars`);
          return text;
        } catch (err) {
          console.warn(`⚠️ OCR (Files API) [${model}] failed:`, err.message);
          lastError = err;
        }
      }
    }
  }

  // ── Small file path (or Files API fallback): inline base64 ─
  onProgress?.(`Reading ${file.name || 'file'} as base64…`);
  let base64;
  try {
    base64 = await fileToBase64(file);
  } catch (readErr) {
    throw new Error(`Cannot read file "${file.name}": ${readErr.message}`);
  }

  for (const model of MODELS) {
    try {
      onProgress?.(`Gemini OCR [${model}]…`);
      const text = await callModelInline(apiKey, model, base64, effectiveMime);
      console.log(`✅ OCR success (inline) [${model}] — ${text.length} chars`);
      return text;
    } catch (err) {
      console.warn(`⚠️ OCR (inline) [${model}] failed:`, err.message);
      lastError = err;
    }
  }

  // All models failed
  throw new Error(
    `Gemini OCR failed for "${file.name || 'file'}".\n` +
    `Error: ${lastError?.message || 'Unknown'}\n` +
    `Tip: Paste the text manually in the box below.`
  );
}
