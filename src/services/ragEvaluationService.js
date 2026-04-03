import { searchStore } from './vectorService';
import { callOllamaAPI } from './llmService';

/**
 * Evaluate an answer contextually against the indexed textbook
 * @param {string} studentAnswerText - The extracted text from the student's test sheet
 * @returns {Promise<Object>} The graded response including weak concepts
 */
export const evaluateAnswer = async (studentAnswerText) => {
  if (!studentAnswerText) {
    throw new Error('No answer text provided to evaluate.');
  }

  // 1. Retrieve the top 5 most relevant paragraphs from the textbook
  // We grab the first 800 chars of the answer to form the search query
  const query = studentAnswerText.substring(0, 800);
  const relevantChunks = await searchStore(query, 5);

  if (!relevantChunks || relevantChunks.length === 0) {
    throw new Error('Could not find any relevant information in the uploaded textbook.');
  }

  // 2. Combine the retrieved textbook paragraphs into a Context block
  const textbookContext = relevantChunks
    .map((chunk, idx) => `Textbook Excerpt ${idx + 1}:\n${chunk.text}`)
    .join('\n\n---\n\n');

  // 3. Prompt the LLM to act as a Semantic Grader
  const prompt = `You are a strict academic grader. Your job is to grade the Student's Answer EXCLUSIVELY based on the Textbook Context provided.
If the student's answer is missing details that are present in the textbook, or if they are incorrect, list the missing educational concepts.

<Textbook Context>
${textbookContext}
</Textbook Context>

<Student's Answer>
${studentAnswerText}
</Student's Answer>

Return your evaluation as a STRICT JSON object with no markdown formatting or conversational filler.
Format:
{
  "scoreOutOf100": 85,
  "overallFeedback": "The student understood X but failed to detail Y as stated in the textbook.",
  "weakTopics": [
    { "topic": "Name of missing/weak concept 1", "weaknessLevel": "High" },
    { "topic": "Name of missing/weak concept 2", "weaknessLevel": "Medium" }
  ]
}`;

  try {
    // 4. Send to LLM enforcement strict JSON format
    const response = await callOllamaAPI(prompt, 'json');
    console.log("RAG LLM Response:", response);
    
    const evalData = JSON.parse(response);

    // Provide default fallbacks if LLM misses a field
    return {
      weakTopics: evalData.weakTopics || [],
      missingConcepts: (evalData.weakTopics || []).map(t => t.topic),
      overallFeedback: evalData.overallFeedback || 'Evaluation complete.',
      score: evalData.scoreOutOf100 || 0,
    };
  } catch (error) {
    console.error('RAG Evaluation Error:', error);
    throw new Error('The AI failed to semantic grade the paper. ' + error.message);
  }
};

export default {
  evaluateAnswer
};
