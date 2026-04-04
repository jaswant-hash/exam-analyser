/**
 * geminiAnalysisService.js
 * ─────────────────────────────────────────────────────────────
 * Pure Gemini API analysis pipeline — no Flask server needed.
 *
 * Takes extracted text from:
 *   - syllabusText  (subject portions / course content)
 *   - questionText  (question paper)
 *   - answerText    (student answer sheet)
 *
 * Calls Gemini 2.5 Flash directly from the browser and returns
 * the exact same payload shape that was previously returned by
 * the Python Flask service.
 */

const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

const MAX_INPUT_CHARS  = 24_000;  // per slot — keeps well within context window
const MAX_OUTPUT_TOKENS = 8192;

// ── Helpers ───────────────────────────────────────────────────

function truncate(text, limit = MAX_INPUT_CHARS) {
  return text.length > limit ? text.slice(0, limit) : text;
}

function clean(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function scoreToLevel(s) {
  if (s >= 80) return 'Strong';
  if (s >= 60) return 'Moderate';
  if (s >= 40) return 'Weak';
  return 'Gap';
}

function buildResources(topic) {
  const q  = encodeURIComponent(topic);
  const q2 = topic.replace(/ /g, '+');
  return [
    {
      title: `${topic} — Full Tutorial`,
      url:   `https://www.youtube.com/results?search_query=${q2}+tutorial`,
      type:  'video',
    },
    {
      title: `${topic} — GeeksForGeeks`,
      url:   `https://www.geeksforgeeks.org/search/?q=${q}`,
      type:  'article',
    },
    {
      title: `${topic} — W3Schools / TutorialsPoint`,
      url:   `https://www.google.com/search?q=${q2}+tutorial+site:w3schools.com+OR+site:tutorialspoint.com`,
      type:  'article',
    },
  ];
}

function buildRevisionPlan(gaps) {
  const hoursMap  = { Critical: 3, High: 2, Low: 1 };
  const severity  = { Critical: 0, High: 1, Low: 2 };

  const sorted = [...gaps].sort(
    (a, b) => (severity[a.weaknessLevel] ?? 3) - (severity[b.weaknessLevel] ?? 3)
  );

  const days = [];
  let bucket = [], bucketH = 0;

  for (const r of sorted) {
    const h = hoursMap[r.weaknessLevel] ?? 1;
    if (bucketH + h > 4 && bucket.length > 0) {
      days.push([bucket, bucketH]);
      bucket = []; bucketH = 0;
    }
    bucket.push(r);
    bucketH += h;
  }
  if (bucket.length > 0) days.push([bucket, bucketH]);

  return days.map(([tpcs, th], i) => ({
    day:            i + 1,
    topic:          tpcs.map(t => t.topic).join(' + '),
    topics:         tpcs.map(t => t.topic),
    estimatedHours: parseFloat(th.toFixed(1)),
    tasks: (
      tpcs.flatMap(t => t.missingConcepts.map(c => `Focus on: ${c}`)).slice(0, 3).length > 0
        ? tpcs.flatMap(t => t.missingConcepts.map(c => `Focus on: ${c}`)).slice(0, 3)
        : tpcs.map(t => `Review ${t.topic}`)
    ),
    concepts:  [...new Set(tpcs.flatMap(t => t.missingConcepts))],
    resources: tpcs[0].resources,
    resource:  tpcs[0].resources[0],
  }));
}

// ── Core Gemini call ──────────────────────────────────────────

async function callGemini(apiKey, prompt) {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature:     0.1,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      responseMimeType: 'application/json',
    },
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url  = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const data = await resp.json();
      let   text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      // Bulletproof JSON extraction
      const start = text.indexOf('{');
      const end   = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);

      return JSON.parse(text);
    } catch (e) {
      console.warn(`Gemini [${model}] failed:`, e.message);
      lastError = e;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

// ── Build the analysis prompt ─────────────────────────────────

function buildPrompt(syllabus, questions, answers) {
  return `You are a strict university professor and AI grading engine.
Analyse the three documents below and evaluate the student's conceptual understanding.

--- 1. SYLLABUS / COURSE PORTION ---
${syllabus}

--- 2. QUESTION PAPER ---
${questions}

--- 3. STUDENT ANSWER SHEET ---
${answers}

INSTRUCTIONS:
1. Extract every question from the question paper.
2. Map each question to its exact topic in the syllabus.
3. Read the student's answer for that question in the answer sheet.
4. Score their conceptual understanding 0–100 (semantic understanding, not grammar or spelling).
   Bands: 80–100 Strong | 60–79 Moderate | 40–59 Weak | 0–39 Gap
5. List the specific missing or incorrect concepts as short strings.
6. Write 1–2 sentence actionable feedback explaining exactly what the student got wrong or missed.

Return ONE valid JSON object — NO markdown, NO code fences, RAW JSON only:
{
  "topicResults": [
    {
      "topic": "<Exact topic name from syllabus>",
      "question": "<Exact question text>",
      "coverage": <integer 0-100>,
      "missingConcepts": ["<concept 1>", "<concept 2>"],
      "geminiFeedback": "<1-2 sentence actionable critique>"
    }
  ]
}`;
}

// ── Main export ───────────────────────────────────────────────

/**
 * runGeminiAnalysis
 * Performs the complete exam grading analysis using Gemini API directly.
 *
 * @param {Object} params
 * @param {string} params.syllabusText  - Course content / syllabus
 * @param {string} params.questionText  - Question paper text
 * @param {string} params.answerText    - Student's answer sheet text
 * @param {Function} [params.onProgress] - Optional progress callback (string)
 * @returns {Promise<Object>} Full analysis payload (same shape as Flask response)
 */
export async function runGeminiAnalysis({ syllabusText, questionText = '', answerText, onProgress }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is missing from your .env file.');
  }
  if (!syllabusText?.trim()) {
    throw new Error('Syllabus text is required.');
  }
  if (!answerText?.trim()) {
    throw new Error('Answer sheet text is required.');
  }

  // Prepare inputs
  const syllabus  = truncate(clean(syllabusText));
  const questions = truncate(clean(questionText || 'General Concepts Check'));
  const answers   = truncate(clean(answerText));

  onProgress?.('Sending documents to Gemini 1.5 Flash…');

  // Ask Gemini to grade
  const raw = await callGemini(apiKey, buildPrompt(syllabus, questions, answers));

  onProgress?.('Processing results…');

  // Normalise each topic result
  const results = (raw.topicResults ?? []).map(r => {
    const score     = Math.max(0, Math.min(100, parseInt(r.coverage ?? 0, 10)));
    const isGap     = score < 60;
    const weakness  = score < 40 ? 'Critical' : score < 60 ? 'High' : 'Low';
    const resources = buildResources(r.topic ?? 'Unknown');

    return {
      topic:          r.topic          ?? 'Unknown',
      question:       r.question       ?? 'N/A',
      coverage:       score,
      geminiFeedback: r.geminiFeedback ?? '',
      missingConcepts: Array.isArray(r.missingConcepts) && r.missingConcepts.length > 0
        ? r.missingConcepts
        : (isGap ? [r.topic ?? 'Unknown'] : []),
      level:         scoreToLevel(score),
      isGap,
      weaknessLevel: isGap ? weakness : 'Low',
      resources,
    };
  });

  if (results.length === 0) {
    throw new Error('Gemini returned 0 topic results — check that your documents have readable text.');
  }

  const gaps    = results.filter(r => r.isGap);
  const covered = results.filter(r => !r.isGap);
  const avgCov  = Math.round(results.reduce((s, r) => s + r.coverage, 0) / results.length);

  onProgress?.('Building your revision plan…');

  const plan = buildRevisionPlan(gaps);

  return {
    score:          avgCov,
    totalTopics:    results.length,
    gapCount:       gaps.length,
    coveredCount:   covered.length,
    topicResults:   results,

    weakTopics: gaps.map(r => ({
      topic:           r.topic,
      weaknessLevel:   r.weaknessLevel,
      coverage:        r.coverage,
      missingConcepts: r.missingConcepts,
      resources:       r.resources,
      geminiFeedback:  r.geminiFeedback,
    })),

    coveredTopics: covered.map(r => ({ topic: r.topic, coverage: r.coverage })),

    missingConcepts: gaps.flatMap(r => r.missingConcepts),

    recommendations: gaps.slice(0, 5).map(r => ({
      topic:       r.topic,
      priority:    r.weaknessLevel === 'Critical' || r.weaknessLevel === 'High' ? 'High' : 'Medium',
      explanation: r.geminiFeedback,
      resources:   r.resources,
    })),

    revisionPlan: plan,

    overallFeedback:
      `Gemini 1.5 Flash Analysis — ${results.length} questions graded. ` +
      `Overall semantic understanding: ${avgCov}%.`,
  };
}
