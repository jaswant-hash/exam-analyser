/**
 * analysisEngine.js
 * ─────────────────────────────────────────────────────────────
 * Fully optimised analysis pipeline:
 *   1. Extract topics topic-wise from syllabus
 *   2. Extract answer key question/topic mapping
 *   3. Compare student answers vs syllabus topics (embedding similarity)
 *   4. 65% threshold: ≥65 = Covered, <65 = Gap
 *   5. Dynamic study plan (days based on gap volume)
 */

import { callOllamaAPI, generateEmbedding } from './llmService';

const GAP_THRESHOLD = 0.65; // 65%

/* ── Cosine Similarity ──────────────────────────────────────── */
function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag ? dot / mag : 0;
}

/* ── Robust OCR / Keyword Similarity (Fuzzy Trigrams) ───────── */
function hybridKeywordSimilarity(topicStr, answerStr) {
  // 1. Fuzzy Trigram strategy (handles OCR errors in handwritten docs)
  const getTrigrams = (str) => {
    const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const grams = new Set();
    for (let i = 0; i < s.length - 2; i++) {
      grams.add(s.substring(i, i + 3));
    }
    return grams;
  };
  
  const tGrams = getTrigrams(topicStr);
  let fuzzyScore = 0;
  if (tGrams.size > 0) {
    const aGrams = getTrigrams(answerStr);
    let intersection = 0;
    for (const g of tGrams) {
      if (aGrams.has(g)) intersection++;
    }
    fuzzyScore = intersection / tGrams.size; // Subset occurrence %
  }
  
  // 2. Exact word matching (for structured words)
  const getWords = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const tWords = getWords(topicStr);
  let exactScore = 0;
  if (tWords.length > 0) {
    const aText = answerStr.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    let exactMatch = 0;
    for (const w of tWords) {
      if (aText.includes(` ${w} `) || aText.startsWith(`${w} `) || aText.endsWith(` ${w}`)) {
        exactMatch++;
      }
    }
    exactScore = exactMatch / tWords.length;
  }
  
  // Combine both: favor the highest, slight bonus if both agree
  return Math.max(fuzzyScore, exactScore) + (exactScore * 0.15);
}

/* ── Text Chunker ────────────────────────────────────────────── */
function chunkText(text, maxLen = 600) {
  const sentences = text.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 15);
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > maxLen && cur) { chunks.push(cur.trim()); cur = s; }
    else cur += (cur ? ' ' : '') + s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}

/* ── Resource Generator ──────────────────────────────────────── */
function buildResources(topicName) {
  const q = encodeURIComponent(topicName);
  return [
    {
      title: `${topicName} — Full Tutorial`,
      url: `https://www.youtube.com/results?search_query=${q}+full+tutorial`,
      type: 'video',
    },
    {
      title: `${topicName} — GeeksForGeeks`,
      url: `https://www.geeksforgeeks.org/search/?q=${q}`,
      type: 'article',
    },
    {
      title: `${topicName} — W3Schools / TutorialsPoint`,
      url: `https://www.google.com/search?q=${q}+tutorial+site:w3schools.com+OR+site:tutorialspoint.com`,
      type: 'article',
    },
  ];
}

/* ══════════════════════════════════════════════════════════════
   STEP 1 — Extract topics from syllabus using LLM
   ══════════════════════════════════════════════════════════════ */
export const extractTopicsFromSyllabus = async (syllabusText, onProgress) => {
  onProgress?.('Parsing syllabus topics with AI...');
  const truncated = syllabusText.slice(0, 4000);

  const prompt = `You are an educational content analyzer.
Extract all distinct topics and subtopics from this syllabus or textbook content.

Content:
"""
${truncated}
"""

Return ONLY valid JSON. No explanations, no markdown.
Format:
[
  {
    "topic": "Main Topic Name",
    "subtopics": ["subtopic 1", "subtopic 2"],
    "keywords": ["keyword1", "keyword2"]
  }
]`;

  try {
    const raw = await callOllamaAPI(prompt, 'json');
    const clean = raw.includes('[')
      ? raw.substring(raw.indexOf('['), raw.lastIndexOf(']') + 1)
      : raw;
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error('empty');
  } catch {
    // Fallback: split by headings / paragraphs
    return extractTopicsFallback(syllabusText);
  }
};

function extractTopicsFallback(text) {
  // Try to find heading-like lines (ALL CAPS, numbered, or short bold lines)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const topics = [];
  let currentTopic = null;

  for (const line of lines) {
    const isHeading =
      line.length < 80 &&
      (
        /^\d+[\.\)]\s/.test(line) ||          // numbered list
        /^[A-Z][A-Z\s]{5,}$/.test(line) ||   // ALL CAPS
        /^(chapter|unit|module|topic)/i.test(line)
      );

    if (isHeading) {
      if (currentTopic) topics.push(currentTopic);
      currentTopic = {
        topic: line.replace(/^\d+[\.\)]\s+/, '').trim(),
        subtopics: [],
        keywords: [],
      };
    } else if (currentTopic && line.length > 10) {
      currentTopic.subtopics.push(line.slice(0, 60));
    }
  }
  if (currentTopic) topics.push(currentTopic);

  // Last resort: every chunks makes a topic, but try to name it concisely
  if (topics.length < 2) {
    const chunks = chunkText(text, 400);
    return chunks.slice(0, 12).map((chunk, i) => {
      // Pick first 2-3 highly significant words as a pseudo-name
      // This ensures YouTube search links remain concise and effective
      const words = chunk.split(/\s+/).filter(w => w.length > 4); 
      const name = words.slice(0, Math.min(3, words.length)).join(' '); 
      
      // Clean up punctuation explicitly
      const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      
      return {
        topic: cleanName ? cleanName : `Concept ${i + 1}`,
        subtopics: [],
        keywords: words.slice(0, 5),
        rawText: chunk,
      };
    });
  }

  return topics.slice(0, 20);
}

/* ══════════════════════════════════════════════════════════════
   STEP 2 — Extract answer key (question→answer→topic mapping)
   ══════════════════════════════════════════════════════════════ */
export const extractAnswerKey = async (answerKeyText, onProgress) => {
  if (!answerKeyText || answerKeyText.trim().length < 20) return [];
  onProgress?.('Analyzing answer key...');

  const prompt = `Extract all questions and their correct answers from this answer key.
Map each answer to the topic it belongs to.

Content:
"""
${answerKeyText.slice(0, 3000)}
"""

Return ONLY valid JSON:
[
  {"question": "question text", "answer": "expected answer text", "topic": "topic name"}
]`;

  try {
    const raw = await callOllamaAPI(prompt, 'json');
    const clean = raw.includes('[')
      ? raw.substring(raw.indexOf('['), raw.lastIndexOf(']') + 1)
      : raw;
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ══════════════════════════════════════════════════════════════
   STEP 3 — Compare student answer sheet vs syllabus topics
   Uses embedding cosine similarity with 65% threshold
   ══════════════════════════════════════════════════════════════ */
export const compareAnswerWithTopics = async (answerText, topics, answerKey, onProgress) => {
  if (!answerText || topics.length === 0) return [];

  onProgress?.('Embedding answer sheet...');

  // Embed answer chunks (max 30 chunks for better coverage)
  const answerChunks = chunkText(answerText, 600);
  const answerEmbeddings = [];
  const maxChunks = Math.min(answerChunks.length, 30);

  for (let i = 0; i < maxChunks; i++) {
    const chunk = answerChunks[i];
    onProgress?.(`Embedding answer sheet (${Math.round(((i + 1) / maxChunks) * 100)}%)...`);
    try {
      const emb = await generateEmbedding(chunk);
      if (emb && emb.length > 0) answerEmbeddings.push({ text: chunk, emb });
    } catch { /* skip failed chunks */ }
  }

  // Also embed answer key answers for extra context
  for (const ak of answerKey.slice(0, 10)) {
    if (!ak.answer) continue;
    try {
      const emb = await generateEmbedding(ak.answer);
      if (emb) answerEmbeddings.push({ text: ak.answer, emb, fromKey: true });
    } catch { /* skip */ }
  }

  const results = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    onProgress?.(`Comparing vs syllabus (${Math.round((i / topics.length) * 100)}%)...`);

    // Build topic search text
    const topicSearchText =
      [topic.topic, ...(topic.subtopics || []).slice(0, 3), ...(topic.keywords || []).slice(0, 3)]
        .join(' ');

    let topicEmb;
    try {
      topicEmb = await generateEmbedding(topicSearchText);
    } catch {
      results.push(buildGapResult(topic, 0));
      continue;
    }

    // Find best hybrid similarity across all answer chunks
    let maxSim = 0;
    for (const { text: chunkTextA, emb } of answerEmbeddings) {
      const semSim = cosineSim(topicEmb, emb);
      const keySim = hybridKeywordSimilarity(topicSearchText, chunkTextA);
      
      // Extreme High-Level Algorithm: 
      // Jaccard Trigram matching correctly aligns OCR spelling errors with topics.
      // Small LLM embeddings provide baseline semantics.
      let combinedSim = Math.max(semSim, keySim);
      
      // Synergistic boost for handwritten answers
      if (keySim > 0.25 && semSim > 0.35) combinedSim += 0.25;
      if (keySim > 0.45) combinedSim += 0.20; // Very strong OCR/Text match
      
      if (combinedSim > maxSim) maxSim = Math.min(combinedSim, 1.0);
    }

    const coveragePct = Math.min(Math.round(maxSim * 100), 100);
    const isGap = coveragePct < 65;

    // Determine weakness level
    const weaknessLevel =
      coveragePct < 25 ? 'Critical' :
      coveragePct < 45 ? 'High' :
      coveragePct < 65 ? 'Medium' : 'Low';

    // Find related answer key entries
    const relatedAK = answerKey.filter(ak =>
      ak.topic && (
        ak.topic.toLowerCase().includes(topic.topic.toLowerCase().slice(0, 5)) ||
        topic.topic.toLowerCase().includes((ak.topic || '').toLowerCase().slice(0, 5))
      )
    );

    results.push({
      topic: topic.topic,
      subtopics: topic.subtopics || [],
      keywords: topic.keywords || [],
      coverage: coveragePct,
      isGap,
      weaknessLevel: isGap ? weaknessLevel : 'Low',
      missingConcepts: isGap ? (topic.subtopics || []).slice(0, 5) : [],
      relatedAnswerKey: relatedAK,
      resources: buildResources(topic.topic),
    });
  }

  return results;
};

function buildGapResult(topic, coverage) {
  return {
    topic: topic.topic,
    subtopics: topic.subtopics || [],
    keywords: topic.keywords || [],
    coverage,
    isGap: true,
    weaknessLevel: 'Critical',
    missingConcepts: topic.subtopics || [],
    relatedAnswerKey: [],
    resources: buildResources(topic.topic),
  };
}

/* ══════════════════════════════════════════════════════════════
   STEP 4 — Dynamic Study Plan
   Days are computed from gap count + severity (not fixed 3 days)
   ══════════════════════════════════════════════════════════════ */
export const generateDynamicStudyPlan = (topicResults) => {
  const gaps = topicResults
    .filter(t => t.isGap)
    .sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return order[a.weaknessLevel] - order[b.weaknessLevel];
    });

  if (gaps.length === 0) return [];

  // Hours needed per topic based on severity
  const hoursFor = (t) =>
    t.weaknessLevel === 'Critical' ? 3 :
    t.weaknessLevel === 'High'     ? 2.5 :
    t.weaknessLevel === 'Medium'   ? 2 : 1.5;

  const MAX_HOURS_PER_DAY = 4;
  const days = [];
  let dayTopics = [], dayHours = 0;

  for (const topic of gaps) {
    const h = hoursFor(topic);
    if (dayHours + h > MAX_HOURS_PER_DAY && dayTopics.length > 0) {
      days.push({ topics: dayTopics, totalHours: dayHours });
      dayTopics = []; dayHours = 0;
    }
    dayTopics.push(topic);
    dayHours += h;
  }
  if (dayTopics.length > 0) days.push({ topics: dayTopics, totalHours: dayHours });

  return days.map((day, i) => {
    const allSubtopics = day.topics.flatMap(t => t.subtopics || []).slice(0, 4);
    const mainTopic    = day.topics[0];

    return {
      day: i + 1,
      topic: day.topics.map(t => t.topic).join(' + '),
      topics: day.topics.map(t => t.topic),
      estimatedHours: parseFloat(day.totalHours.toFixed(1)),
      tasks: day.topics.map(t =>
        `Study ${t.topic}${t.subtopics?.length ? ': ' + t.subtopics.slice(0, 2).join(', ') : ''}`
      ),
      concepts: allSubtopics,
      resource: {
        title: `Learn ${mainTopic.topic} — Video Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(mainTopic.topic + ' explained')}`,
        type: 'video',
        priority: mainTopic.weaknessLevel === 'Critical' ? 'High' : 'Medium',
      },
      resources: mainTopic.resources || buildResources(mainTopic.topic),
    };
  });
};

/* ══════════════════════════════════════════════════════════════
   MAIN ENTRY — runFullAnalysis
   ══════════════════════════════════════════════════════════════ */
export const runFullAnalysis = async ({
  syllabusText,
  answerSheetText,
  answerKeyText = '',
  onProgress,
}) => {
  // ── Step 1: Topics ─────────────────────────────────────────
  const topics = await extractTopicsFromSyllabus(syllabusText, onProgress);
  if (topics.length === 0) throw new Error('Could not extract any topics from syllabus.');

  // ── Step 2: Answer key ─────────────────────────────────────
  const answerKey = await extractAnswerKey(answerKeyText, onProgress);

  // ── Step 3: Compare answer sheet ───────────────────────────
  const topicResults = await compareAnswerWithTopics(
    answerSheetText, topics, answerKey, onProgress
  );

  // ── Step 4: Build summary ───────────────────────────────────
  const gaps    = topicResults.filter(t => t.isGap);
  const covered = topicResults.filter(t => !t.isGap);
  const avgCoverage = topicResults.length
    ? Math.round(topicResults.reduce((s, t) => s + t.coverage, 0) / topicResults.length)
    : 0;

  // ── Step 5: Dynamic study plan ──────────────────────────────
  const revisionPlan = generateDynamicStudyPlan(topicResults);

  return {
    score: avgCoverage,
    overallFeedback:
      `Analyzed ${topicResults.length} topics. ` +
      `${gaps.length} gap${gaps.length !== 1 ? 's' : ''} found (below 65% coverage). ` +
      `${covered.length} topic${covered.length !== 1 ? 's' : ''} adequately covered.`,
    weakTopics: gaps.map(t => ({
      topic:          t.topic,
      weaknessLevel:  t.weaknessLevel,
      coverage:       t.coverage,
      missingConcepts: t.missingConcepts,
      resources:      t.resources,
    })),
    coveredTopics: covered.map(t => ({ topic: t.topic, coverage: t.coverage })),
    missingConcepts: gaps.flatMap(t => t.subtopics || []).slice(0, 20),
    recommendations: gaps.slice(0, 8).map(t => ({
      topic:       t.topic,
      priority:    t.weaknessLevel === 'Critical' ? 'High' : t.weaknessLevel === 'High' ? 'High' : 'Medium',
      explanation: `${t.topic} coverage is only ${t.coverage}% — needs focused revision.`,
      resources:   t.resources,
    })),
    topicResults,
    revisionPlan,
    totalTopics:  topicResults.length,
    gapCount:     gaps.length,
    coveredCount: covered.length,
  };
};
