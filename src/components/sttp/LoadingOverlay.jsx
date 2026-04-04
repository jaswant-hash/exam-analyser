import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const AI_STEPS = [
  { icon: '📄', label: 'Reading document...' },
  { icon: '🧠', label: 'Processing with AI...' },
  { icon: '🔍', label: 'Scanning concepts...' },
  { icon: '⚡', label: 'Generating insights...' },
  { icon: '📊', label: 'Building your plan...' },
];

const TIPS = [
  'Gemini 1.5 Flash reads your syllabus, questions, and answers in one single shot.',
  'Your data goes directly to Google Gemini API — no intermediate server needed.',
  'Weak topics are identified by comparing your answers semantically against the syllabus.',
  'Your personalised revision plan is built around your exact knowledge gaps.',
  'Gemini grades conceptual understanding, not grammar or spelling.',
];

export default function LoadingOverlay({ isVisible, message }) {
  const [tipIdx, setTipIdx] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const tipTimer = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000);
    const dotTimer = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => { clearInterval(tipTimer); clearInterval(dotTimer); };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,14,0.97) 0%, rgba(5,5,8,0.99) 100%)' }}
        >
          {/* Background grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Orbiting particles */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: ['#ff6b00', '#a855f7', '#3b82f6', '#22c55e'][i],
                boxShadow: `0 0 8px ${['#ff6b00', '#a855f7', '#3b82f6', '#22c55e'][i]}`,
              }}
              animate={{
                rotate: [0, 360],
                x: [0, Math.cos(i * 90 * Math.PI / 180) * 80],
                y: [0, Math.sin(i * 90 * Math.PI / 180) * 80],
              }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">

            {/* Triple ring spinner */}
            <div className="relative w-28 h-28 mb-8">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid transparent', borderTopColor: '#ff6b00', borderRightColor: 'rgba(255,107,0,0.2)' }}
              />
              {/* Mid ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute inset-3 rounded-full"
                style={{ border: '2px solid transparent', borderTopColor: '#a855f7', borderLeftColor: 'rgba(168,85,247,0.2)' }}
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute inset-6 rounded-full"
                style={{ border: '2px solid transparent', borderTopColor: '#3b82f6', borderBottomColor: 'rgba(59,130,246,0.2)' }}
              />
              {/* Center pulse */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-[38px] rounded-full bg-orange-500"
                style={{ boxShadow: '0 0 20px rgba(255,107,0,0.7)' }}
              />
            </div>

            {/* Status badge */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest"
            >
              Processing
            </motion.div>

            {/* Dynamic message */}
            <AnimatePresence mode="wait">
              <motion.h3
                key={message}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-xl font-bold text-white mb-6 min-h-[28px]"
              >
                {message || 'Analyzing documents'}{'.'.repeat(dots)}
              </motion.h3>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-1 mb-8 overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Rotating tip */}
            <div className="w-full px-4 py-3 rounded-2xl border border-white/6 bg-white/[0.02]">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Did you know?</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-400 text-xs leading-relaxed"
                >
                  {TIPS[tipIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
