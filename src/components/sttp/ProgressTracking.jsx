import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';

export default function ProgressTracking() {
  const tests = [
    { name: 'Test 1', score: 45, date: 'Jan 5', concepts: 6 },
    { name: 'Test 2', score: 52, date: 'Jan 12', concepts: 6 },
    { name: 'Test 3', score: 58, date: 'Jan 19', concepts: 6 },
    { name: 'Mock Exam', score: 65, date: 'Jan 26', concepts: 6 },
  ];

  const improvements = [
    { concept: 'CPU Scheduling', improvement: '+8%', color: 'from-blue-600' },
    { concept: 'Memory Paging', improvement: '+12%', color: 'from-green-600' },
    { concept: 'File Systems', improvement: '+5%', color: 'from-purple-600' },
    { concept: 'Process Sync', improvement: '+6%', color: 'from-pink-600' },
  ];

  const maxScore = 100;

  return (
    <section id="progress" className="relative min-h-screen bg-black pt-20 pb-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Learning{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              Progress
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl">
            Track your improvement across concepts and see your growth journey in real-time.
          </p>
        </motion.div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-3xl p-8 hover:border-orange-500/30 transition-all duration-300"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Test Score Progression</h3>

          {/* Chart Area */}
          <div className="space-y-6">
            {/* SVG Chart */}
            <div className="relative h-72 bg-black/50 rounded-2xl p-6 border border-gray-700/30">
              <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
                {/* Grid Lines */}
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1="40"
                    y1={40 + i * 40}
                    x2="580"
                    y2={40 + i * 40}
                    stroke="rgba(107, 114, 128, 0.1)"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Y-axis */}
                <line x1="40" y1="20" x2="40" y2="220" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="2" />

                {/* X-axis */}
                <line x1="40" y1="220" x2="580" y2="220" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="2" />

                {/* Y-axis Labels */}
                {[0, 25, 50, 75, 100].map((val, i) => (
                  <text
                    key={`y-label-${i}`}
                    x="20"
                    y={220 - i * 40 + 5}
                    textAnchor="end"
                    fontSize="12"
                    fill="rgba(209, 213, 219, 0.6)"
                  >
                    {val}
                  </text>
                ))}

                {/* Line Chart */}
                <polyline
                  points={tests
                    .map(
                      (test, i) =>
                        `${80 + i * 130},${220 - (test.score / maxScore) * 180}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gradient for Line */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff6b00" />
                    <stop offset="100%" stopColor="#ffa500" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Area Under Curve */}
                <polygon
                  points={`40,220 ${tests
                    .map(
                      (test, i) =>
                        `${80 + i * 130},${220 - (test.score / maxScore) * 180}`
                    )
                    .join(' ')} 580,220`}
                  fill="url(#areaGradient)"
                />

                {/* Data Points */}
                {tests.map((test, i) => (
                  <g key={`point-${i}`}>
                    <circle
                      cx={80 + i * 130}
                      cy={220 - (test.score / maxScore) * 180}
                      r="6"
                      fill="#ff6b00"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={80 + i * 130}
                      y="245"
                      textAnchor="middle"
                      fontSize="12"
                      fill="rgba(209, 213, 219, 0.8)"
                    >
                      {test.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Test Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tests.map((test, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-gray-900/70 to-black/70 border border-gray-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300"
                >
                  <p className="text-gray-400 text-sm mb-2">{test.date}</p>
                  <p className="text-2xl font-bold text-orange-400 mb-2">{test.score}%</p>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${test.score}%` }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
