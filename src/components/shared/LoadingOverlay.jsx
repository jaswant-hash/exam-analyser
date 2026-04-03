import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

export default function LoadingOverlay({ message = "Processing...", isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center bg-gray-900/90 border border-orange-500/30 p-8 rounded-3xl shadow-2xl shadow-orange-500/20"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <FiLoader className="text-6xl text-orange-400 relative z-10" />
          </motion.div>
        </div>
        
        <h3 className="text-xl font-bold tracking-wider text-white mb-2">Analyzing Data</h3>
        
        <motion.p 
          key={message}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-orange-300/80 font-medium text-center max-w-xs"
        >
          {message}
        </motion.p>
        
        {/* Progress bar animation */}
        <div className="w-full h-1 bg-gray-800 rounded-full mt-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
