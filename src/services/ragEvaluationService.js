import { searchStore } from './vectorService';
import { callOllamaAPI } from './llmService';

/**
 * Evaluate an answer contextually against the indexed textbook
 * "Quick & Efficient" version: Reduces API calls while maintaining context coverage.
 * @param {string} studentAnswerText - The extracted text from the student's test sheet
 * @returns {Promise<Object>} The graded response including weak concepts
 */
export const evaluateAnswer = async (studentAnswerText) => {
  if (!studentAnswerText || studentAnswerText.trim().length < 10) {
    throw new Error('No substantial answer text provided to evaluate.');
  }

  // 1. Precise Chunking for tinyllama (Optimized for 2k-4k context)
  // Smaller overlapping windows ensure the retrieval is focused on specific segments.
  const queryWindowSize = 800; 
  const queries = [];
  for (let i = 0; i < studentAnswerText.length && queries.length < 5; i += queryWindowSize * 0.6) {
    queries.push(studentAnswerText.substring(i, i + queryWindowSize));
  }

  console.log(`Analyzing answer with ${queries.length} efficient semantic windows...`);

  // 2. Perform parallel retrieval
  const retrievalPromises = queries.map(q => searchStore(q.substring(0, 800), 3));
  const resultsBySegment = await Promise.all(retrievalPromises);

  // 3. Flatten and deduplicate retrieved chunks
  const uniqueChunks = new Map();
  resultsBySegment.flat().forEach(match => {
    if (!uniqueChunks.has(match.text)) {
      uniqueChunks.set(match.text, match);
    }
  });

  // Limit to top 8 most relevant unique reference chunks for better tinyllama coverage
  const topUniqueChunks = Array.from(uniqueChunks.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (topUniqueChunks.length === 0) {
    throw new Error('No relevant textbook content was found to compare against.');
  }

  const textbookContext = topUniqueChunks
    .map((chunk, idx) => `[Ref ${idx + 1}]: ${chunk.text}`)
    .join('\n\n---\n\n');

  // 4. Concise Grading Prompt for Speed
  const prompt = `Task: Compare Student Answer to Textbook Reference. Focus on technical gaps.

<Textbook Reference>
${textbookContext}
</Textbook Reference>

<Student Answer>
${studentAnswerText}
</Student Answer>

Grade strictly by Textbook. List missing concepts.
CRITICAL RULES:
1. DO NOT use generic placeholders like "Topic 1", "Topic 2" or "Concept 1".
2. Use EXACT technical terminology found in the Textbook Reference (e.g. "Page Replacement Algorithm", "Process Control Block").
3. If no gaps are found, return an empty array for weakTopics.

Return JSON ONLY:
{
  "scoreOutOf100": (number),
  "overallFeedback": "short text",
  "weakTopics": [{"topic": "Exact Technical Term", "weaknessLevel": "High"}]
}`;

  try {
    const response = await callOllamaAPI(prompt, 'json');
    
    // Clean JSON wrapper if model hallucinations occur
    const cleanJson = response.includes('{') ? response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1) : response;
    const evalData = JSON.parse(cleanJson);

    return {
      weakTopics: evalData.weakTopics || [],
      missingConcepts: (evalData.weakTopics || []).map(t => t.topic),
      overallFeedback: evalData.overallFeedback || 'Analysis complete.',
      score: evalData.scoreOutOf100 || 0,
    };
  } catch (error) {
    console.error('Efficient RAG Error:', error);
    throw new Error('Comparison failed: ' + error.message);
  }
};

export default {
  evaluateAnswer
};
