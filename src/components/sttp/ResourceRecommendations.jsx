import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';

export default function ResourceRecommendations() {
  const resources = [
    {
      topic: 'CPU Scheduling',
      resource: 'Advanced OS Scheduling Algorithms',
      reason: 'Critical concept with 35% confidence score',
      priority: 'Critical',
      type: 'Video Course',
    },
    {
      topic: 'Memory Management',
      resource: 'Virtual Memory Deep Dive',
      reason: 'Foundation for paging and segmentation',
      priority: 'Critical',
      type: 'Interactive Tutorial',
    },
    {
      topic: 'Paging',
      resource: 'Paging Algorithms & Practice',
      reason: 'Required for memory management mastery',
      priority: 'High',
      type: 'Practice Problems',
    },
    {
      topic: 'File Systems',
      resource: 'File System Architecture Guide',
      reason: 'Support weak area concepts',
      priority: 'High',
      type: 'Documentation',
    },
    {
      topic: 'Process Sync',
      resource: 'Concurrency Control Patterns',
      reason: 'Build on existing knowledge',
      priority: 'Medium',
      type: 'Video Course',
    },
    {
      topic: 'Deadlock',
      resource: 'Deadlock Prevention Techniques',
      reason: 'Strengthen understanding',
      priority: 'Medium',
      type: 'Interactive Tutorial',
    },
  ];

  const priorityConfig = {
    Critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    High: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    Medium: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="relative min-h-screen bg-black pt-20 pb-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Smart{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              Resource Recommendations
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl">
            Curated learning resources tailored to your specific weak areas and learning style.
          </p>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {resources.map((rec, index) => {
            const priorityStyle = priorityConfig[rec.priority];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 8 }}
                className="group relative bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center">
                  {/* Topic & Resource */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Topic</p>
                    <h3 className="text-lg font-bold text-white">{rec.topic}</h3>
                    <p className="text-sm text-gray-500">{rec.resource}</p>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Recommendation Reason</p>
                    <p className="text-sm text-gray-300">{rec.reason}</p>
                  </div>

                  {/* Priority & Type */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Details</p>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}
                      >
                        {rec.priority}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {rec.type}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-orange-600/50 hover:shadow-orange-600/80 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      Open <FiExternalLink size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 mb-12 bg-gradient-to-r from-orange-600/10 to-transparent border border-orange-500/30 rounded-3xl p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Get Personalized Learning Path
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Our AI generates custom learning sequences based on your weak areas, learning pace, and
            available time. Start your personalized journey today.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 107, 0, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/50 hover:shadow-orange-600/80 transition-all duration-300 inline-flex items-center gap-2"
          >
            Create Custom Plan <FiArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
