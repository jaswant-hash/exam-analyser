import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiExternalLink } from 'react-icons/fi';

export default function RevisionPlan({ planData = [] }) {
  if (!planData || planData.length === 0) return null;

  // Map incoming LLM structure to UI expected format
  const formattedPlan = planData.map((dayItem, index) => {
    // LLM might return an array of tasks or a single string task
    let mainTask = '';
    if (dayItem.tasks && Array.isArray(dayItem.tasks)) {
      mainTask = dayItem.tasks[0]?.task || 'Review concepts';
    } else {
      mainTask = dayItem.task || 'Review concepts';
    }

    return {
      day: `Day ${dayItem.day || index + 1}`,
      topic: mainTask,
      duration: dayItem.estimatedHours ? `${dayItem.estimatedHours} hours` : '2 hours',
      concepts: dayItem.topics || ['Fundamentals', 'Practice'],
      status: index === 0 ? 'in-progress' : 'upcoming',
      // Optional resource mapping if available
      resource: dayItem.resource || null
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'from-green-600 to-green-900', text: 'text-green-400', icon: '✓' };
      case 'in-progress':
        return { bg: 'from-orange-600 to-orange-950', text: 'text-orange-400', icon: '●' };
      case 'upcoming':
        return { bg: 'from-gray-700 to-gray-900', text: 'text-gray-400', icon: '○' };
      default:
        return { bg: 'from-gray-700 to-gray-900', text: 'text-gray-400', icon: '○' };
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
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative min-h-screen pt-20 pb-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Personalized{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              Revision Plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl">
            AI-generated 6-day revision schedule tailored to your exam date and weak areas.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Vertical Line Container */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-white/10 rounded-full overflow-hidden">
            {/* Background Line (Grey) */}
            <div className="absolute inset-0 bg-gray-800/30"></div>

            {/* Completed Line (Green) */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(formattedPlan.filter(p => p.status === 'completed').length / formattedPlan.length) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-500/0 via-green-500 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            />

            {/* In-Progress Segment (Orange) */}
            <motion.div
              initial={{ height: 0, top: `${(formattedPlan.filter(p => p.status === 'completed').length / formattedPlan.length) * 100}%` }}
              whileInView={{ 
                height: formattedPlan.some(p => p.status === 'in-progress') ? `${(1 / formattedPlan.length) * 100}%` : 0 
              }}
              transition={{ duration: 1, ease: "easeInOut", delay: 2 }}
              className="absolute left-0 w-full bg-gradient-to-b from-orange-500 via-orange-400 to-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.6)] animate-pulse"
            />
          </div>

          <div className="space-y-8">
            {formattedPlan.map((plan, index) => {
              const statusColor = getStatusColor(plan.status);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
                    {/* Left */}
                    <div className="flex justify-end pr-4">
                      {isEven && (
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="group bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-transparent rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <div className="relative z-10 space-y-3">
                            <p className="text-sm text-gray-400 font-semibold">{plan.day}</p>
                            <h3 className="text-lg font-bold text-white">{plan.topic}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <FiClock size={16} />
                              {plan.duration}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {plan.concepts.map((concept, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold border border-orange-500/30"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                            <ResourceCard resource={plan.resource} />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Center Node */}
                    <div className="flex justify-center relative z-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${statusColor.bg} flex items-center justify-center border-2 border-white shadow-lg shadow-orange-600/50 relative z-20`}
                      >
                        <span className={`text-2xl font-bold text-white`}>{statusColor.icon}</span>
                      </motion.div>
                    </div>

                    {/* Right */}
                    <div className="flex justify-start pl-4">
                      {!isEven && (
                        <motion.div
                          whileHover={{ x: -10 }}
                          className="group bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-transparent rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <div className="relative z-10 space-y-3">
                            <p className="text-sm text-gray-400 font-semibold">{plan.day}</p>
                            <h3 className="text-lg font-bold text-white">{plan.topic}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <FiClock size={16} />
                              {plan.duration}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {plan.concepts.map((concept, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold border border-orange-500/30"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                            <ResourceCard resource={plan.resource} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${statusColor.bg} flex items-center justify-center border-2 border-white flex-shrink-0 shadow-lg shadow-orange-600/50`}
                      >
                        <span className="text-lg font-bold text-white">{statusColor.icon}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="group flex-1 bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-2xl p-4 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-transparent rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="relative z-10 space-y-2">
                          <p className="text-sm text-gray-400 font-semibold">{plan.day}</p>
                          <h3 className="text-base font-bold text-white">{plan.topic}</h3>
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <FiClock size={14} />
                            {plan.duration}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-2">
                            {plan.concepts.map((concept, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs border border-orange-500/30"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                          <ResourceCard resource={plan.resource} />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 mb-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 107, 0, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/50 hover:shadow-orange-600/80 transition-all duration-300"
          >
            Download Plan as PDF
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

function ResourceCard({ resource }) {
  if (!resource) return null;
  return (
    <div className="mt-4 p-3 bg-black/40 border border-gray-700/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Recommended Resource</p>
        <h4 className="text-sm font-bold text-gray-200">{resource.title}</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${resource.prioClass}`}>{resource.priority}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">{resource.type}</span>
        </div>
      </div>
      <button className="sm:w-auto w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-600/20 flex gap-2 items-center justify-center hover:scale-105 transition-transform">
        Open <FiExternalLink size={14} />
      </button>
    </div>
  );
}
