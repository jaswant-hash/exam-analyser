import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

export default function HeroSection() {
  const stats = [
    { number: '20+', label: 'Concepts Tracked' },
    { number: '200+', label: 'Smart Resources' },
    { number: '500+', label: 'Plans Generated' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section
      id="home"
      className="home-bg relative min-h-screen pt-36 sm:pt-40 lg:pt-44 pb-20 px-4 overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8 max-w-xl">
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-orange-500 font-semibold text-lg tracking-wide uppercase"
              >
                AI-Powered Analysis
              </motion.p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                AI-Powered Exam{' '}
                <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                  Performance
                </span>{' '}
                Analyzer
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 leading-relaxed max-w-lg"
            >
              Identify concept-level weaknesses, get smart recommendations, and build personalized
              revision plans instantly with AI-powered analysis.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 107, 0, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/50 hover:shadow-orange-600/80 transition-all duration-300"
              >
                Start Analyzing <FiArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-gray-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-400 transition-all duration-300"
              >
                <FiPlay size={20} /> Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 pt-4 text-gray-400 text-sm"
            >
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-300 border-2 border-black"
                  ></div>
                ))}
              </div>
              <span>Trusted by 1000+ students</span>
            </motion.div>
          </div>

          {/* Right Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {/* Premium Stats Card */}
            <motion.div
              whileHover={{ y: -10 }}
              className="sm:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent rounded-3xl"></div>
              <div className="relative space-y-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                  Performance Overview
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-3xl font-bold text-orange-500">{stat.number}</p>
                      <p className="text-xs text-gray-400 mt-2">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature Cards */}
            {[
              { icon: '📊', title: 'Real-time Analysis', color: 'from-blue-500/20' },
              { icon: '🎯', title: 'Smart Insights', color: 'from-green-500/20' },
              { icon: '📈', title: 'Growth Tracking', color: 'from-purple-500/20' },
              { icon: '🚀', title: 'AI Powered', color: 'from-orange-500/20' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${feature.color} to-transparent border border-gray-700/50 backdrop-blur-md rounded-2xl p-6 text-center hover:border-orange-500/50 transition-all duration-300`}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <p className="text-white font-semibold text-sm">{feature.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
