/**
 * mlService.js
 * ─────────────────────────────────────────────────────────
 * Bridges the React frontend with the Python Flask ML service
 * running at http://localhost:5050.
 *
 * Engine: Gemini 2.5 Flash (via Flask proxy)
 * Fallback: none — if the service is offline, analysis is blocked.
 */

const ML_URL     = 'http://localhost:5050';
const TIMEOUT_MS = 120_000; // 2 min — Gemini is fast (~5s) but give wiggle room

/* ── Health check ───────────────────────────────────────── */
export async function isMLServiceOnline() {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(`${ML_URL}/health`, { signal: ctrl.signal });
    return r.ok;
  } catch {
    return false;
  }
}

/* ── Main analyse call ──────────────────────────────────── */
export async function runMLAnalysis({ syllabusText, questionText = '', answerText, onProgress }) {
  onProgress?.('Connecting to Gemini analysis service…');

  const online = await isMLServiceOnline();
  if (!online) {
    throw new Error('ML_OFFLINE');
  }

  onProgress?.('Sending documents to Gemini 2.5 Flash…');

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${ML_URL}/analyse`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ syllabusText, questionText, answerText }),
      signal:  ctrl.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`ML service error ${resp.status}: ${err}`);
    }

    onProgress?.('Processing Gemini results…');
    const result = await resp.json();

    if (result.error) throw new Error(result.error);
    return result;

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Analysis timed out (120 s).');
    throw e;
  }
}
