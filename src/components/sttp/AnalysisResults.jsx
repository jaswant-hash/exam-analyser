import { motion } from 'framer-motion';
import { FiAlertTriangle, FiBookOpen, FiAward, FiTarget, FiInfo } from 'react-icons/fi';

export default function AnalysisResults({ report, testData }) {
  if (!report || !testData) return null;

  // Support both field name conventions (Firebase uses overallScore / weakConcepts)
  const overallPercentage = testData.overallPercentage ?? testData.overallScore ?? 0;
  const totalMarksObtained = testData.totalMarksObtained ?? 0;
  const totalMarksAvailable = testData.totalMarksAvailable ?? 0;

  const weakTopics = report.weakTopics ?? report.weakConcepts ?? [];
  const missingConcepts = report.missingConcepts ?? [];
  const recommendations = report.recommendations ?? [];

  return (
    <section className="relative px-4 pb-12 pt-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Performance Header Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Score Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors duration-500"></div>
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-2 relative z-10">Overall Score</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                {overallPercentage?.toFixed(1) || 0}%
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2 relative z-10">
              {totalMarksObtained} / {totalMarksAvailable} marks
            </p>
          </div>

          {/* Weakness Count Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-500"></div>
            <FiAlertTriangle className="text-red-400 text-3xl mb-3 relative z-10" />
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1 relative z-10">Weak Topics</p>
            <div className="text-4xl font-black text-white relative z-10">{weakTopics?.length || 0}</div>
          </div>

          {/* Missing Concepts Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <FiTarget className="text-blue-400 text-3xl mb-3 relative z-10" />
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1 relative z-10">Concept Gaps</p>
            <div className="text-4xl font-black text-white relative z-10">{missingConcepts?.length || 0}</div>
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Weak Topics List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <FiAlertTriangle className="text-red-400 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Critical Weaknesses</h2>
            </div>
            
            {weakTopics && weakTopics.length > 0 ? (
              <div className="space-y-4">
                {weakTopics.map((topic, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-gray-700/50 hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-200">{topic.topic}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                        topic.weaknessLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        topic.weaknessLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {topic.weaknessLevel} Gap
                      </span>
                    </div>
                    {topic.percentage !== undefined && (
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-3 mb-1">
                          <div className="bg-gradient-to-r from-red-500 to-orange-400 h-2 rounded-full" style={{ width: `${topic.percentage}%` }}></div>
                        </div>
                    )}
                    {topic.percentage !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">Score: {topic.percentage}%</p>
                     )}
                     {topic.coverage !== undefined && (
                         <div className="w-full bg-gray-800 rounded-full h-2 mt-3 mb-1">
                         <div className="bg-gradient-to-r from-red-500 to-orange-400 h-2 rounded-full" style={{ width: `${topic.coverage}%` }}></div>
                       </div>
                     )}
                     {topic.coverage !== undefined && (
                         <p className="text-xs text-gray-500 mt-1">Mastery Coverage: {topic.coverage}%</p>
                     )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Great job! No critical weak topics detected.</p>
            )}
          </motion.div>

          {/* Missing Concepts Cloud */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FiInfo className="text-blue-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Concepts to Review</h2>
              </div>
              
              <div className="flex-1 bg-black/30 rounded-2xl p-6 border border-gray-800">
                {missingConcepts && missingConcepts.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {missingConcepts.map((concept, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/50 text-gray-300 rounded-xl text-sm font-medium transition-all cursor-default"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No significant conceptual gaps found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiBookOpen className="text-green-400 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recommended Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-black/40 border border-gray-700/50 rounded-2xl p-5 hover:border-green-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-200">{rec.topic}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                      rec.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      rec.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{rec.explanation}</p>
                  
                  {rec.resources && rec.resources.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Suggested Resources</h4>
                      {rec.resources.slice(0, 2).map((res, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-700 bg-gray-800/40 text-sm">
                          <div>
                            <p className="text-gray-300 font-medium truncate max-w-[200px] sm:max-w-xs">{res.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-blue-400 uppercase tracking-wider">{res.type}</span>
                              <span className="text-gray-600 text-[10px]">•</span>
                              <span className="text-[10px] text-gray-500">{res.duration || res.readTime || `${res.problems} problems`}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
