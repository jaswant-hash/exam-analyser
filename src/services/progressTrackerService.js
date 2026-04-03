/**
 * Progress Tracker Service
 * Tracks student performance across multiple test attempts
 * Calculates improvements and identifies trends
 */

/**
 * Compare multiple test attempts to identify progress
 * @param {Array} testAttempts - Array of test attempt objects
 * @returns {Object} Comparison analysis with progress metrics
 */
export const compareAttempts = (testAttempts) => {
  try {
    if (!Array.isArray(testAttempts) || testAttempts.length < 2) {
      throw new Error(
        'Need at least 2 test attempts for comparison'
      );
    }

    // Sort by date
    const sortedAttempts = [...testAttempts].sort(
      (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt)
    );

    const comparison = {
      totalAttempts: sortedAttempts.length,
      attempts: sortedAttempts.map((attempt, index) => ({
        attemptNumber: index + 1,
        date: attempt.uploadedAt,
        overallScore: attempt.overallScore || 0,
        weakTopics: attempt.weakConcepts || [],
      })),
      topicProgress: analyzeTopicProgression(sortedAttempts),
      overallTrend: calculateOverallTrend(sortedAttempts),
    };

    return comparison;
  } catch (error) {
    throw new Error(`Attempt comparison failed: ${error.message}`);
  }
};

/**
 * Analyze topic-by-topic progression
 * @param {Array} attempts - Sorted attempts array
 * @returns {Object} Topic progression data
 */
const analyzeTopicProgression = (attempts) => {
  const topicMap = {};

  attempts.forEach((attempt) => {
    // Extract topic scores from attempt
    const topicScores = attempt.scores || {};

    for (const [topic, score] of Object.entries(topicScores)) {
      if (!topicMap[topic]) {
        topicMap[topic] = [];
      }

      topicMap[topic].push({
        score: score,
        percentage: score * 100, // Assuming score is normalized 0-1
      });
    }
  });

  // Calculate progression for each topic
  const topicProgression = {};

  for (const [topic, scores] of Object.entries(topicMap)) {
    if (scores.length >= 2) {
      const firstScore = scores[0].percentage;
      const lastScore = scores[scores.length - 1].percentage;
      const improvement = lastScore - firstScore;

      topicProgression[topic] = {
        scores: scores,
        firstAttempt: firstScore,
        lastAttempt: lastScore,
        improvement: Math.round(improvement * 10) / 10,
        status: getImprovementStatus(improvement),
        trend: calculateTrendDirection(scores),
      };
    }
  }

  return topicProgression;
};

/**
 * Calculate overall trend across all attempts
 * @param {Array} attempts - Sorted attempts
 * @returns {Object} Trend analysis
 */
const calculateOverallTrend = (attempts) => {
  const scores = attempts.map((a) => a.overallScore || 0);

  if (scores.length < 2) {
    return { message: 'Insufficient data for trend analysis' };
  }

  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const improvement = lastScore - firstScore;

  return {
    firstAttemptScore: firstScore,
    lastAttemptScore: lastScore,
    totalImprovement: Math.round(improvement * 10) / 10,
    improvementPercentage: firstScore > 0
      ? Math.round((improvement / firstScore) * 100)
      : 0,
    status: getImprovementStatus(improvement),
    trend: calculateTrendDirection(scores.map((s) => ({ percentage: s }))),
    consistencyScore: calculateConsistency(scores),
  };
};

/**
 * Calculate improvement status
 * @param {number} improvement - Improvement value
 * @returns {string} Status
 */
const getImprovementStatus = (improvement) => {
  if (improvement > 10) return 'Excellent Progress';
  if (improvement > 5) return 'Good Progress';
  if (improvement > 0) return 'Slight Improvement';
  if (improvement === 0) return 'Stable';
  if (improvement > -5) return 'Slight Decline';
  return 'Needs Attention';
};

/**
 * Calculate trend direction from scores
 * @param {Array} scores - Array of score objects
 * @returns {string} Trend direction
 */
const calculateTrendDirection = (scores) => {
  if (scores.length < 2) return 'insufficient_data';

  const percentages = scores.map((s) => s.percentage);
  const slope = (percentages[percentages.length - 1] - percentages[0]) /
    (percentages.length - 1);

  if (slope > 2) return 'upward';
  if (slope < -2) return 'downward';
  return 'stable';
};

/**
 * Calculate consistency score (low variance = high consistency)
 * @param {Array} scores - Array of scores
 * @returns {number} Consistency score (0-100)
 */
const calculateConsistency = (scores) => {
  if (scores.length < 2) return 0;

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sq, n) => sq + (n - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower std dev = higher consistency
  // Normalize to 0-100 scale
  const consistency = Math.max(0, 100 - stdDev * 10);
  return Math.round(consistency);
};

/**
 * Calculate improvement percentage
 * @param {number} previousScore - Previous score
 * @param {number} currentScore - Current score
 * @returns {string} Formatted improvement percentage
 */
export const calculateImprovement = (previousScore, currentScore) => {
  try {
    if (previousScore === undefined || currentScore === undefined) {
      throw new Error('Invalid scores provided');
    }

    if (previousScore === 0) {
      return '+100%'; // Starting from 0
    }

    const improvement = currentScore - previousScore;
    const percentageImprovement = (improvement / previousScore) * 100;

    const sign = percentageImprovement >= 0 ? '+' : '';
    return `${sign}${Math.round(percentageImprovement * 10) / 10}%`;
  } catch (error) {
    throw new Error(`Improvement calculation failed: ${error.message}`);
  }
};

/**
 * Generate progress report for a student
 * @param {Array} attempts - All test attempts
 * @param {Array} revisionPlans - Associated revision plans
 * @returns {Object} Comprehensive progress report
 */
export const generateProgressReport = (attempts, revisionPlans = []) => {
  try {
    if (!Array.isArray(attempts) || attempts.length === 0) {
      throw new Error('Invalid attempts array');
    }

    const comparison = compareAttempts(
      attempts.length > 1 ? attempts : [attempts[0], attempts[0]]
    );

    const report = {
      studentId: attempts[0]?.studentEmail || 'unknown',
      reportGeneratedAt: new Date().toISOString(),
      totalAttempts: attempts.length,
      performanceSummary: {
        averageScore:
          Math.round(
            (attempts.reduce((sum, a) => sum + (a.overallScore || 0), 0) /
              attempts.length) *
              10
          ) / 10,
        highestScore: Math.max(...attempts.map((a) => a.overallScore || 0)),
        lowestScore: Math.min(...attempts.map((a) => a.overallScore || 0)),
      },
      progressMetrics: comparison,
      revisionPlansCompleted: revisionPlans.filter((p) => p.status === 'completed')
        .length,
      areasOfImprovement: identifyImprovementAreas(comparison),
      areasNeedingFocus: identifyWeakAreas(comparison),
      recommendations: generateProgressRecommendations(comparison),
    };

    return report;
  } catch (error) {
    throw new Error(`Progress report generation failed: ${error.message}`);
  }
};

/**
 * Identify areas where student has improved
 * @param {Object} comparison - Comparison analysis
 * @returns {Array} Areas of improvement
 */
const identifyImprovementAreas = (comparison) => {
  const improvements = [];

  const topicProgress = comparison.topicProgress || {};

  for (const [topic, progress] of Object.entries(topicProgress)) {
    if (progress.improvement > 5) {
      improvements.push({
        topic,
        improvement: progress.improvement,
        status: progress.status,
      });
    }
  }

  return improvements.sort((a, b) => b.improvement - a.improvement);
};

/**
 * Identify areas that still need focus
 * @param {Object} comparison - Comparison analysis
 * @returns {Array} Weak areas
 */
const identifyWeakAreas = (comparison) => {
  const weakAreas = [];

  const topicProgress = comparison.topicProgress || {};

  for (const [topic, progress] of Object.entries(topicProgress)) {
    if (progress.lastAttempt < 50) {
      weakAreas.push({
        topic,
        score: progress.lastAttempt,
        improvement: progress.improvement,
      });
    }
  }

  return weakAreas.sort((a, b) => a.score - b.score);
};

/**
 * Generate recommendations based on progress
 * @param {Object} comparison - Comparison analysis
 * @returns {Array} Recommendations
 */
const generateProgressRecommendations = (comparison) => {
  const recommendations = [];
  const trend = comparison.overallTrend || {};

  if (trend.status === 'Excellent Progress') {
    recommendations.push({
      priority: 'Medium',
      message: 'Excellent progress! Continue current study approach.',
    });
  } else if (trend.status === 'Good Progress') {
    recommendations.push({
      priority: 'Low',
      message: 'Good progress! Minor adjustments may help further improvement.',
    });
  } else if (trend.status === 'Stable') {
    recommendations.push({
      priority: 'Medium',
      message: 'Performance is stable. Try new study strategies or resources.',
    });
  } else if (trend.status === 'Needs Attention') {
    recommendations.push({
      priority: 'High',
      message:
        'Performance is declining. Review weak areas and adjust study plan.',
    });
  }

  const topicProgress = comparison.topicProgress || {};
  const criticalAreas = Object.entries(topicProgress)
    .filter(([_, p]) => p.lastAttempt < 40)
    .map(([t]) => t);

  if (criticalAreas.length > 0) {
    recommendations.push({
      priority: 'High',
      message: `Critical areas needing immediate focus: ${criticalAreas.join(', ')}`,
    });
  }

  return recommendations;
};

/**
 * Predict performance based on trends
 * @param {Array} attempts - Test attempts
 * @returns {Object} Performance prediction
 */
export const predictFuturePerformance = (attempts) => {
  try {
    if (!Array.isArray(attempts) || attempts.length < 2) {
      throw new Error('Insufficient attempts for prediction');
    }

    const scores = attempts
      .sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt))
      .map((a) => a.overallScore || 0);

    // Simple linear regression for trend
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const xMean = x.reduce((a, b) => a + b) / n;
    const yMean = scores.reduce((a, b) => a + b) / n;

    const slope =
      x.reduce((sum, xi, i) => sum + (xi - xMean) * (scores[i] - yMean), 0) /
      x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);

    const intercept = yMean - slope * xMean;

    // Predict next 2 scores
    const predictions = [];
    for (let i = n; i < n + 2; i++) {
      const predictedScore = Math.min(100, Math.max(0, slope * i + intercept));
      predictions.push({
        attemptNumber: i + 1,
        predictedScore: Math.round(predictedScore * 10) / 10,
        confidence:
          predictions.length === 0 ? 'High' : 'Medium',
      });
    }

    return {
      trend: slope > 0 ? 'Improving' : slope < 0 ? 'Declining' : 'Stable',
      predictions,
      baselineScore: scores[0],
      currentScore: scores[n - 1],
    };
  } catch (error) {
    console.error('Performance prediction failed:', error);
    return {
      trend: 'insufficient_data',
      predictions: [],
      error: error.message,
    };
  }
};

/**
 * Get milestone achievements
 * @param {Array} attempts - Test attempts
 * @returns {Array} Achievements unlocked
 */
export const getMilestoneAchievements = (attempts) => {
  try {
    const achievements = [];
    const scores = attempts.map((a) => a.overallScore || 0);

    // Check milestones
    if (scores.some((s) => s >= 90)) {
      achievements.push({
        milestone: 'Expert Level',
        description: 'Scored 90% or above',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (scores.every((s) => s >= 70)) {
      achievements.push({
        milestone: 'Consistent Performer',
        description: 'All attempts scored 70% or above',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (attempts.length >= 5) {
      achievements.push({
        milestone: 'Dedicated Learner',
        description: 'Completed 5 or more test attempts',
        unlockedAt: new Date().toISOString(),
      });
    }

    const trend = calculateOverallTrend(attempts);
    if (trend.improvement > 20) {
      achievements.push({
        milestone: 'Rapid Improver',
        description: 'Improved by more than 20 points',
        unlockedAt: new Date().toISOString(),
      });
    }

    return achievements;
  } catch (error) {
    console.error('Milestone achievement error:', error);
    return [];
  }
};

export default {
  compareAttempts,
  calculateImprovement,
  generateProgressReport,
  predictFuturePerformance,
  getMilestoneAchievements,
};
