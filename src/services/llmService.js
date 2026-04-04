/**
 * LLM Service
 * Integrates with Ollama API for generating personalized revision plans
 * Uses local LLM models (llama3, mistral) for concept explanations
 */

/**
 * Configuration for Ollama API
 */
const OLLAMA_CONFIG = {
  baseURL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'tinyllama',
  timeout: 60000,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
};

/**
 * Generate a personalized revision plan using LLM
 * @param {Array} weakTopics - Array of weak topics with details
 * @param {Array} recommendations - Array of recommendations
 * @returns {Promise<Array>} Personalized revision plan with daily tasks
 */
export const generateRevisionPlan = async (weakTopics, recommendations) => {
  try {
    if (!Array.isArray(weakTopics) || weakTopics.length === 0) {
      throw new Error('Invalid weak topics array');
    }

    let topicsText = weakTopics
      .map((t) => `${t.topic} (weakness: ${t.weaknessLevel})`)
      .join(', ');

    const prompt = `You are an expert tutor creating a personalized 3-day revision plan.

Student's weak topics: ${topicsText}

Generate a detailed 3-day revision plan.
Provide the plan as a STRICT JSON array of objects. Each object must represent a day and format exactly like this:
[
  {
    "day": 1,
    "topic": "Main focus area for the day",
    "tasks": [
      { "task": "Specific task 1" },
      { "task": "Specific task 2" }
    ],
    "estimatedHours": 3,
    "topics": ["Concept 1", "Concept 2"],
    "resource": {
      "title": "YouTube Search Query",
      "type": "YouTube Video",
      "priority": "High",
      "prioClass": "text-red-400 border-red-500/30 bg-red-500/20",
      "url": "https://www.youtube.com/results?search_query=topic+crash+course"
    }
  }
]

Make sure the required YouTube search query URL is properly formatted.
Return JSON ONLY.`;

    const response = await callOllamaAPI(prompt, 'json');

    // Clean JSON wrap if it exists
    const cleanJson = response.includes('[') ? response.substring(response.indexOf('['), response.lastIndexOf(']') + 1) : response;
    
    let revisionPlan;
    try {
      revisionPlan = JSON.parse(cleanJson);
    } catch {
      revisionPlan = generateFallbackRevisionPlan(weakTopics);
    }

    return revisionPlan;
  } catch (error) {
    console.error('LLM revision plan generation error:', error);
    return generateFallbackRevisionPlan(weakTopics);
  }
};

/**
 * Generate detailed concept explanations using LLM
 * @param {string} topic - Topic to explain
 * @param {Array} missingConcepts - Concepts the student missed
 * @returns {Promise<Object>} Detailed explanation
 */
export const generateConceptExplanation = async (topic, missingConcepts) => {
  try {
    if (!topic || !Array.isArray(missingConcepts)) {
      throw new Error('Invalid topic or missing concepts');
    }

    const conceptsList = missingConcepts.join(', ');

    const prompt = `Explain the following concepts in ${topic} in simple, clear terms suitable for a student:

Concepts to explain: ${conceptsList}

For each concept:
1. Provide a simple definition
2. Explain why it's important
3. Give a real-world or practical example
4. Connect it to other related concepts
5. Common mistakes students make

Be concise but thorough. Focus on understanding, not memorization.`;

    const response = await callOllamaAPI(prompt);

    return {
      topic,
      explanation: response,
      missingConcepts: missingConcepts,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Concept explanation generation error:', error);
    return {
      topic,
      explanation: `Unable to generate explanation. Please refer to the recommended resources for ${topic}.`,
      missingConcepts,
      error: error.message,
    };
  }
};

/**
 * Generate practice questions using LLM
 * @param {string} topic - Topic for practice questions
 * @param {number} questionCount - Number of questions to generate
 * @param {string} difficulty - Difficulty level (Easy, Medium, Hard)
 * @returns {Promise<Array>} Generated practice questions
 */
export const generatePracticeQuestions = async (
  topic,
  questionCount = 5,
  difficulty = 'Medium'
) => {
  try {
    if (!topic || questionCount < 1) {
      throw new Error('Invalid topic or question count');
    }

    const prompt = `Generate ${questionCount} ${difficulty} practice questions on ${topic}.

For each question:
1. Provide the question clearly
2. Include 4 multiple choice options (A, B, C, D)
3. Mark the correct answer
4. Provide a brief explanation of why it's correct
5. Common misconception to avoid

Format as a structured JSON response with each question as an object.`;

    const response = await callOllamaAPI(prompt);

    // Try to parse as JSON, fallback to structured format
    try {
      return JSON.parse(response);
    } catch {
      return parseQuestionsFromText(response);
    }
  } catch (error) {
    console.error('Practice questions generation error:', error);
    return [];
  }
};

/**
 * Generate study tips for a specific topic
 * @param {string} topic - Topic to generate tips for
 * @returns {Promise<Object>} Study tips and strategies
 */
export const generateStudyTips = async (topic) => {
  try {
    if (!topic) {
      throw new Error('Invalid topic');
    }

    const prompt = `You are an expert study coach. Generate effective study tips for learning ${topic}.

Provide:
1. Top 5 study techniques specific to this topic
2. Common pitfalls and how to avoid them
3. Memory aids and mnemonics
4. Practice strategies
5. Resources and tools that help
6. Expected learning timeline
7. How to connect this topic to other concepts

Be practical and actionable. Focus on proven learning strategies.`;

    const response = await callOllamaAPI(prompt);

    return {
      topic,
      tips: response,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Study tips generation error:', error);
    return {
      topic,
      tips: `Study tips for ${topic} are being prepared.`,
      error: error.message,
    };
  }
};

/**
 * Call Ollama API with error handling
 * @param {string} prompt - Prompt for the LLM
 * @param {string} format - Optional format parameter to enforce json return format
 * @returns {Promise<string>} LLM response
 */
export const callOllamaAPI = async (prompt, format = null) => {
  try {
    const requestPayload = {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      temperature: OLLAMA_CONFIG.temperature,
      top_p: OLLAMA_CONFIG.topP,
      top_k: OLLAMA_CONFIG.topK,
      stream: false,
    };

    if (format === 'json') {
      requestPayload.format = 'json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.timeout);

    const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid Ollama API response');
    }

    return data.response.trim();
  } catch (error) {
    throw new Error(`Ollama API call failed: ${error.message}`);
  }
};

/**
 * Parse LLM response into structured revision plan
 * @param {string} llmResponse - Raw LLM response
 * @returns {Array} Structured revision plan
 */
const parseRevisionPlanFromLLM = (llmResponse) => {
  try {
    const plan = [];

    // Split response into days
    const dayRegex = /day\s*(\d+)/gi;
    const matches = [...llmResponse.matchAll(dayRegex)];

    if (matches.length === 0) {
      // Fallback: split by paragraphs
      return formatRevisionPlan(llmResponse);
    }

    for (let i = 0; i < matches.length; i++) {
      const dayNum = parseInt(matches[i][1]);
      const startPos = matches[i].index + matches[i][0].length;
      const endPos =
        i < matches.length - 1 ? matches[i + 1].index : llmResponse.length;

      const dayContent = llmResponse.substring(startPos, endPos).trim();

      plan.push({
        day: dayNum,
        tasks: extractTasks(dayContent),
        reason: extractReason(dayContent),
        estimatedHours: extractDuration(dayContent),
      });
    }

    return plan.length > 0 ? plan : formatRevisionPlan(llmResponse);
  } catch (error) {
    console.error('Plan parsing error:', error);
    return formatRevisionPlan(llmResponse);
  }
};

/**
 * Extract tasks from day content
 * @param {string} content - Day content
 * @returns {Array} Tasks array
 */
const extractTasks = (content) => {
  const tasks = [];
  const lines = content.split('\n').filter((l) => l.trim());

  lines.forEach((line, index) => {
    if (
      line.includes('-') ||
      line.includes('•') ||
      line.match(/^\d+\./)
    ) {
      tasks.push({
        task: line.replace(/^[-•\d.]\s*/, '').trim(),
        order: index,
      });
    }
  });

  return tasks;
};

/**
 * Extract reason/focus area
 * @param {string} content - Content
 * @returns {string} Reason
 */
const extractReason = (content) => {
  const lines = content.split('\n');
  const focusLine = lines.find(
    (l) =>
      l.toLowerCase().includes('focus') ||
      l.toLowerCase().includes('reason') ||
      l.toLowerCase().includes('important')
  );

  return focusLine || '';
};

/**
 * Extract duration from content
 * @param {string} content - Content
 * @returns {number} Hours
 */
const extractDuration = (content) => {
  const match = content.match(/(\d+)\s*(?:hour|hr|h)/i);
  return match ? parseInt(match[1]) : 2;
};

/**
 * Format revision plan from raw text
 * @param {string} text - Raw text
 * @returns {Array} Formatted plan
 */
const formatRevisionPlan = (text) => {
  return [
    {
      day: 1,
      task: 'Review fundamentals and core concepts',
      reason: text.substring(0, 200),
      estimatedHours: 3,
    },
    {
      day: 2,
      task: 'Practice problems and solve examples',
      reason: 'Reinforcement through practice',
      estimatedHours: 3,
    },
    {
      day: 3,
      task: 'Final review and self-assessment',
      reason: 'Consolidate learning and identify remaining gaps',
      estimatedHours: 2,
    },
  ];
};

/**
 * Parse questions from unstructured text
 * @param {string} text - Raw text
 * @returns {Array} Questions array
 */
const parseQuestionsFromText = (text) => {
  const questions = [];
  const blocks = text.split(/(?=Q\d*:)/i);

  blocks.forEach((block) => {
    if (block.trim().length > 20) {
      questions.push({
        question: block.split('\n')[0].replace(/^Q\d*:/i, '').trim(),
        fullText: block.trim(),
      });
    }
  });

  return questions;
};

const generateFallbackRevisionPlan = (weakTopics) => {
  const primaryTopic = weakTopics[0]?.topic || 'Core Concepts';

  return [
    {
      day: 1,
      topic: `Review fundamental principles of ${primaryTopic}`,
      tasks: [
        { task: 'Watch recommended video lectures' },
        { task: 'Create mind map of key terms' },
      ],
      estimatedHours: 3,
      topics: [primaryTopic, 'Fundamentals'],
      resource: {
        title: `${primaryTopic} Crash Course`,
        type: 'YouTube Video',
        priority: 'High',
        prioClass: 'text-red-400 border-red-500/30 bg-red-500/20',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(primaryTopic + ' course')}`
      }
    },
    {
      day: 2,
      topic: 'Practice problems and examples',
      tasks: [
        { task: 'Solve practice problems from references' },
        { task: 'Review incorrect answers from exam' },
      ],
      estimatedHours: 3,
      topics: ['Active Recall', 'Problem Solving'],
      resource: {
        title: `${primaryTopic} Practice Exercises`,
        type: 'Web Resource',
        priority: 'Medium',
        prioClass: 'text-orange-400 border-orange-500/30 bg-orange-500/20',
        url: `https://www.google.com/search?q=${encodeURIComponent(primaryTopic + ' practice questions')}`
      }
    },
    {
      day: 3,
      topic: 'Final assessment and mock test',
      tasks: [
        { task: 'Take a mock test on weak areas' },
        { task: 'Review cheat sheets and quick notes' },
      ],
      estimatedHours: 2,
      topics: ['Assessment', 'Review'],
      resource: {
        title: `${primaryTopic} Cheat Sheet`,
        type: 'Quick Guide',
        priority: 'Medium',
        prioClass: 'text-blue-400 border-blue-500/30 bg-blue-500/20',
        url: `https://www.google.com/search?q=${encodeURIComponent(primaryTopic + ' cheat sheet pdf')}`
      }
    },
  ];
};

/**
 * Generate embedding vector using Ollama
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    const requestPayload = {
      model: OLLAMA_CONFIG.model,
      prompt: text,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.timeout || 30000);

    const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.embedding) {
      throw new Error('Invalid Embedding API response');
    }

    return data.embedding;
  } catch (error) {
    throw new Error(`Ensure Ollama is running. Error: ${error.message}`);
  }
};

/**
 * Test Ollama connection
 * @returns {Promise<boolean>} True if connected
 */
export const testOllamaConnection = async () => {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get available models from Ollama
 * @returns {Promise<Array>} Available models
 */
export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/tags`);

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching available models:', error);
    return [];
  }
};

export default {
  generateRevisionPlan,
  generateConceptExplanation,
  generatePracticeQuestions,
  generateStudyTips,
  testOllamaConnection,
  getAvailableModels,
  generateEmbedding,
};
