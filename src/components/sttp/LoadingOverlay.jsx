import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay({ isVisible, message }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm"
        >
          {/* Animated Spinner Rings */}
          <div className="relative w-24 h-24 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-4 border-orange-500 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-transparent"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-2 rounded-full border-t-4 border-purple-500 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-transparent"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-4 rounded-full border-t-4 border-yellow-400 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-transparent"
            />
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Processing Output
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-orange-300 font-medium animate-pulse"
          >
            {message || "Analyzing documents..."}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
