import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiArrowRight, FiZap, FiTarget, FiTrendingUp, FiCpu } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Animated Counter ─────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

/* ── Floating Orb ─────────────────────────────────── */
function FloatingOrb({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ── Tiny Particle ────────────────────────────────── */
function Particle({ x, y, delay }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400/40"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

/* ── Scan Line ────────────────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none"
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ── Feature Pill ─────────────────────────────────── */
function FeaturePill({ icon: Icon, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 backdrop-blur-sm"
    >
      <Icon size={12} className="text-orange-400" />
      {label}
    </motion.div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100, delay: i * 0.3
  }));

  const stats = [
    { number: '20', suffix: '+', label: 'Concepts Tracked', icon: FiTarget, color: 'from-orange-500 to-amber-400' },
    { number: '98', suffix: '%', label: 'Accuracy Rate', icon: FiZap, color: 'from-purple-500 to-pink-400' },
    { number: '500', suffix: '+', label: 'Plans Generated', icon: FiTrendingUp, color: 'from-blue-500 to-cyan-400' },
  ];

  const pipeline = [
    { step: '01', label: 'Upload Syllabus', sub: 'PDF / PPTX / Image', color: 'border-orange-500/50 text-orange-400' },
    { step: '02', label: 'Upload Answer Sheet', sub: 'AI extracts & reads', color: 'border-purple-500/50 text-purple-400' },
    { step: '03', label: 'AI Grades & Finds Gaps', sub: 'RAG via Ollama', color: 'border-blue-500/50 text-blue-400' },
    { step: '04', label: 'Get Revision Plan', sub: 'YouTube + resources', color: 'border-green-500/50 text-green-400' },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 pb-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #09090b 0%, #0f0f13 50%, #0a0a0e 100%)' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,107,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated orbs */}
      <FloatingOrb className="w-[600px] h-[400px] bg-orange-600/10 -top-32 -right-32" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-purple-600/8 top-1/2 -left-40" delay={2} />
      <FloatingOrb className="w-[300px] h-[300px] bg-blue-600/6 bottom-0 right-1/4" delay={4} />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ScanLine />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT ─────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-orange-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-orange-400 font-semibold text-sm tracking-wide">AI-Powered Exam Intelligence</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Know Your{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                    Weak Spots
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                  />
                </span>
                {' '}Before the Exam Does
              </h1>
            </motion.div>

            {/* Sub */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-xl text-gray-400 leading-relaxed max-w-lg"
            >
              Upload your syllabus + answer sheet. Our AI matches your answers against your textbook using{' '}
              <span className="text-orange-400 font-semibold">RAG + Ollama</span>, pinpoints exact concept gaps,
              and builds a clickable revision plan.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="flex flex-wrap gap-2"
            >
              <FeaturePill icon={FiCpu} label="Local Ollama AI" delay={0.8} />
              <FeaturePill icon={FiTarget} label="RAG Grading" delay={0.9} />
              <FeaturePill icon={FiZap} label="YouTube Resources" delay={1.0} />
              <FeaturePill icon={FiTrendingUp} label="3-Day Plan" delay={1.1} />
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                onClick={() => navigate('/upload')}
                whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(255,107,0,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/40 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                <FiZap size={20} />
                Analyze My Exam
                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,107,0,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 border-2 border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:text-orange-400 transition-all duration-300 backdrop-blur-sm"
              >
                View Dashboard
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
              className="flex items-center gap-3 text-gray-500 text-sm"
            >
              <div className="flex -space-x-2">
                {['#ff6b00', '#9333ea', '#3b82f6', '#22c55e'].map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black" style={{ background: color }} />
                ))}
              </div>
              <span>Trusted by <strong className="text-gray-300">1,000+</strong> students</span>
              <span className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)} <span className="text-gray-500">4.9/5</span>
              </span>
            </motion.div>
          </motion.div>

          {/* ── RIGHT ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Stats cards row */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="relative group rounded-2xl p-5 bg-white/4 border border-white/8 backdrop-blur-xl overflow-hidden text-center"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <stat.icon className="mb-2 mx-auto text-orange-400 opacity-60" size={18} />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                    className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                  </motion.p>
                  <p className="text-gray-500 text-[11px] mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Pipeline card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative rounded-3xl p-6 border border-white/10 backdrop-blur-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.06), rgba(0,0,0,0.5))' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent rounded-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">How It Works</p>
                </div>
                <div className="space-y-3">
                  {pipeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.12 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border ${item.color.split(' ')[0]} bg-white/3 hover:bg-white/5 transition-all`}
                    >
                      <span className={`font-black text-xs ${item.color.split(' ')[1]} w-6 shrink-0`}>{item.step}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{item.label}</p>
                        <p className="text-gray-500 text-xs">{item.sub}</p>
                      </div>
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-between px-4 py-3 rounded-2xl border border-green-500/20 bg-green-500/5"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-green-400 text-sm font-semibold">Ollama AI Ready</span>
              </div>
              <span className="text-gray-500 text-xs">localhost:11434 • tinyllama</span>
            </motion.div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .animate-gradient { animation: gradient 3s ease infinite; }
      `}</style>
    </section>
  );
}
