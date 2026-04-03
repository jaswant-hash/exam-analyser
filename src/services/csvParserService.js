/**
 * CSV Parser Service
 * Handles CSV file parsing and analysis using PapaParse
 * Calculates topic scores and identifies weak topics
 */

import Papa from 'papaparse';

/**
 * Parse CSV file
 * Expected format: Question, Topic, Marks, Total
 * @param {File} file - CSV file to parse
 * @returns {Promise<Object>} Parsed CSV data
 */
export const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('CSV parsing error: ' + results.errors[0].message));
            return;
          }

          try {
            const parsedData = normalizeCSVData(results.data);
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parse failed: ${error.message}`));
        },
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
    } catch (error) {
      reject(new Error(`CSV parsing error: ${error.message}`));
    }
  });
};

/**
 * Normalize and validate CSV data
 * @param {Array} data - Raw CSV data
 * @returns {Object} Normalized data
 */
const normalizeCSVData = (data) => {
  try {
    const rows = [];

    data.forEach((row, index) => {
      // Skip header row and empty rows
      if (!row.Question || !row.Topic) return;

      const marks = parseFloat(row.Marks) || 0;
      const total = parseFloat(row.Total) || 1;

      rows.push({
        question: row.Question?.trim(),
        topic: row.Topic?.trim(),
        marks: marks,
        total: total,
        percentage: (marks / total) * 100,
      });
    });

    if (rows.length === 0) {
      throw new Error('No valid data found in CSV');
    }

    return {
      rawData: rows,
      totalQuestions: rows.length,
      totalMarks: rows.reduce((sum, row) => sum + row.marks, 0),
      maxMarks: rows.reduce((sum, row) => sum + row.total, 0),
    };
  } catch (error) {
    throw new Error(`Data normalization failed: ${error.message}`);
  }
};

/**
 * Calculate topic-wise scores from parsed CSV data
 * @param {Object} parsedData - Data from parseCSV
 * @returns {Array} Topic scores array
 */
export const calculateTopicScores = (parsedData) => {
  try {
    if (!parsedData || !parsedData.rawData || parsedData.rawData.length === 0) {
      throw new Error('Invalid parsed data provided');
    }

    const topicMap = {};

    // Aggregate scores by topic
    parsedData.rawData.forEach((row) => {
      const topic = row.topic;

      if (!topicMap[topic]) {
        topicMap[topic] = {
          topic,
          marksObtained: 0,
          totalMarks: 0,
          questionsAttempted: 0,
          percentage: 0,
        };
      }

      topicMap[topic].marksObtained += row.marks;
      topicMap[topic].totalMarks += row.total;
      topicMap[topic].questionsAttempted += 1;
    });

    // Calculate percentages
    const topicScores = Object.values(topicMap).map((topic) => ({
      ...topic,
      percentage:
        topic.totalMarks > 0
          ? (topic.marksObtained / topic.totalMarks) * 100
          : 0,
    }));

    return topicScores.sort((a, b) => a.percentage - b.percentage);
  } catch (error) {
    throw new Error(`Topic score calculation failed: ${error.message}`);
  }
};

/**
 * Find weak topics based on threshold (< 50%)
 * @param {Object} parsedData - Data from parseCSV
 * @param {number} threshold - Weakness threshold (default: 50)
 * @returns {Array} Array of weak topics with details
 */
export const findWeakTopics = (parsedData, threshold = 50) => {
  try {
    const topicScores = calculateTopicScores(parsedData);

    const weakTopics = topicScores
      .filter((topic) => topic.percentage < threshold)
      .map((topic) => {
        let weaknessLevel = 'Low';
        if (topic.percentage < 25) {
          weaknessLevel = 'Critical';
        } else if (topic.percentage < 40) {
          weaknessLevel = 'High';
        } else if (topic.percentage < threshold) {
          weaknessLevel = 'Medium';
        }

        return {
          topic: topic.topic,
          percentage: Math.round(topic.percentage * 10) / 10,
          weaknessLevel,
          marksObtained: topic.marksObtained,
          totalMarks: topic.totalMarks,
          questionsAttempted: topic.questionsAttempted,
        };
      });

    return weakTopics;
  } catch (error) {
    throw new Error(`Weak topic detection failed: ${error.message}`);
  }
};

/**
 * Calculate overall performance metrics
 * @param {Object} parsedData - Data from parseCSV
 * @returns {Object} Overall metrics
 */
export const calculateOverallMetrics = (parsedData) => {
  try {
    if (!parsedData || parsedData.totalMarks === undefined) {
      throw new Error('Invalid parsed data');
    }

    const overallPercentage =
      parsedData.maxMarks > 0
        ? (parsedData.totalMarks / parsedData.maxMarks) * 100
        : 0;

    const topicScores = calculateTopicScores(parsedData);
    const weakTopics = findWeakTopics(parsedData);

    return {
      totalQuestions: parsedData.totalQuestions,
      totalMarksObtained: parsedData.totalMarks,
      totalMarksAvailable: parsedData.maxMarks,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
      topicScores,
      weakTopics,
      performanceGrade: getPerformanceGrade(overallPercentage),
    };
  } catch (error) {
    throw new Error(`Overall metrics calculation failed: ${error.message}`);
  }
};

/**
 * Get performance grade based on percentage
 * @param {number} percentage - Overall percentage
 * @returns {string} Grade
 */
const getPerformanceGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
};

export default {
  parseCSV,
  calculateTopicScores,
  findWeakTopics,
  calculateOverallMetrics,
};
