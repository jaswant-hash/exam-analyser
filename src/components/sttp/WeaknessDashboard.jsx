import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';
export default function WeaknessDashboard() {
  const weaknesses = [
    { concept: 'CPU Scheduling', score: 35, risk: 'High', color: 'from-red-600' },
    { concept: 'Memory Management', score: 42, risk: 'High', color: 'from-red-500' },
    { concept: 'Paging', score: 48, risk: 'Medium', color: 'from-yellow-600' },
    { concept: 'File Systems', score: 55, risk: 'Medium', color: 'from-yellow-500' },
    { concept: 'Process Synchronization', score: 62, risk: 'Low', color: 'from-green-600' },
    { concept: 'Deadlock', score: 78, risk: 'Low', color: 'from-green-500' },
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'text-red-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="relative min-h-screen pt-20 pb-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <FiTrendingUp className="text-orange-500" /> Concept Improvements
          </h3>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {weaknesses.map((weak, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(255, 107, 0, 0.2)' }}
              className="group relative bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
            >
              {/* Glow Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${weak.color} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{weak.concept}</h3>
                    <p className={`text-sm font-semibold ${getRiskColor(weak.risk)}`}>
                      {weak.risk} Risk
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${weak.color} to-transparent flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-lg">{weak.score}%</span>
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${weak.score}%` }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.8 }}
                      className={`h-full bg-gradient-to-r ${weak.color} to-transparent`}
                    ></motion.div>
                  </div>
                  <p className="text-xs text-gray-400">Confidence Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Accuracy</p>
                    <p className="text-white font-semibold">{weak.score}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Gap</p>
                    <p className="text-white font-semibold">{100 - weak.score}%</p>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 font-semibold rounded-lg transition-all duration-300 border border-orange-500/30 hover:border-orange-500/60"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: 'High Risk Areas', value: '2', color: 'text-red-400' },
            { label: 'Medium Risk Areas', value: '2', color: 'text-yellow-400' },
            { label: 'Areas to Master', value: '2', color: 'text-green-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-6 text-center hover:border-orange-500/30 transition-all duration-300"
            >
              <p className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
