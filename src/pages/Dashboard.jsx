import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiChevronRight, FiCalendar, FiAlertTriangle,
  FiTrendingUp, FiTarget, FiCheckCircle, FiActivity
} from 'react-icons/fi';
import { fetchUserCourses } from '../services/firebaseService';

/* ── Animated zigzag wave design (no images, pure CSS/SVG) ── */
function AnimatedWave() {
  return (
    <div className="relative w-full h-32 overflow-hidden" aria-hidden="true">
      {/* Flowing sine wave lines */}
      <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0" />
            <stop offset="30%" stopColor="#ff6b00" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Wave layer 1 — orange */}
        <motion.path
          d="M0,60 C80,20 160,100 240,60 C320,20 400,100 480,60 C560,20 640,100 720,60 C760,40 780,50 800,60"
          fill="none" stroke="url(#waveGrad1)" strokeWidth="2"
          animate={{ d: [
            "M0,60 C80,20 160,100 240,60 C320,20 400,100 480,60 C560,20 640,100 720,60 C760,40 780,50 800,60",
            "M0,60 C80,100 160,20 240,60 C320,100 400,20 480,60 C560,100 640,20 720,60 C760,80 780,70 800,60",
            "M0,60 C80,20 160,100 240,60 C320,20 400,100 480,60 C560,20 640,100 720,60 C760,40 780,50 800,60",
          ]}}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Wave layer 2 — purple (offset) */}
        <motion.path
          d="M0,75 C100,40 200,90 300,55 C400,20 500,85 600,50 C700,15 750,65 800,45"
          fill="none" stroke="url(#waveGrad2)" strokeWidth="1.5"
          animate={{ d: [
            "M0,75 C100,40 200,90 300,55 C400,20 500,85 600,50 C700,15 750,65 800,45",
            "M0,45 C100,80 200,30 300,75 C400,100 500,35 600,70 C700,95 750,45 800,65",
            "M0,75 C100,40 200,90 300,55 C400,20 500,85 600,50 C700,15 750,65 800,45",
          ]}}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />

        {/* Wave layer 3 — blue */}
        <motion.path
          d="M0,45 C120,80 200,30 320,65 C440,100 520,30 640,55 C720,70 760,50 800,60"
          fill="none" stroke="url(#waveGrad3)" strokeWidth="1"
          animate={{ d: [
            "M0,45 C120,80 200,30 320,65 C440,100 520,30 640,55 C720,70 760,50 800,60",
            "M0,65 C120,30 200,80 320,45 C440,20 520,80 640,45 C720,30 760,70 800,50",
            "M0,45 C120,80 200,30 320,65 C440,100 520,30 640,55 C720,70 760,50 800,60",
          ]}}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />

        {/* Floating dots on the wave */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            r="3" fill={['#ff6b00','#f59e0b','#a855f7','#3b82f6','#22c55e'][i]}
            cx={160 * i}
            cy={60}
            animate={{
              cx: [160 * i, 160 * i + 160, 160 * i],
              cy: [60, 30 + (i % 2) * 50, 60],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────── */
function EmptyState({ onUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden"
    >
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-8 pt-12 pb-6 text-center">
        <p className="text-xs font-bold text-orange-400/70 uppercase tracking-widest mb-4">ExamAI Ready</p>
        <h3 className="text-3xl font-black text-white mb-3">No courses yet</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Upload your subject portions and answer sheet — AI will detect your learning gaps and build a personalised revision plan.
        </p>
        <motion.button
          onClick={onUpload}
          whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,107,0,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/25"
        >
          <FiUpload size={18} /> Upload First Course
        </motion.button>
      </div>

      {/* Animated wave visual */}
      <AnimatedWave />
    </motion.div>
  );
}

/* ── Dashboard Course Card ───────────────────────────── */
function DashboardCourseCard({ course, onClick, isActive }) {
  const score    = course.score || 0;
  const weakCount = course.weakTopics?.length || 0;
  const initial  = course.courseName?.charAt(0).toUpperCase() || '?';
  const uploadDate = course.uploadedAt?.toDate
    ? course.uploadedAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Recent';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`cursor-pointer relative rounded-3xl border transition-all duration-300 p-5 overflow-hidden ${
        isActive
          ? 'border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-amber-900/10'
          : 'border-white/10 bg-white/[0.03] hover:border-orange-500/25'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-orange-500/20">
            {initial}
          </div>
          <div>
            <h3 className="text-base font-black text-white">{course.courseName}</h3>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              <FiCalendar size={10} /> {uploadDate}
            </p>
          </div>
        </div>
        <FiChevronRight className={`text-gray-600 mt-0.5 transition-transform ${isActive ? 'rotate-90 text-orange-400' : ''}`} size={16} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-center">
          <p className="text-xl font-black text-white">{score.toFixed(0)}%</p>
          <p className="text-gray-600 text-[10px]">Score</p>
        </div>
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-center">
          <p className="text-xl font-black text-red-400">{weakCount}</p>
          <p className="text-gray-600 text-[10px]">Weak Areas</p>
        </div>
      </div>

      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            score >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
            score >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
            'bg-gradient-to-r from-red-500 to-orange-400'
          }`}
        />
      </div>
    </motion.div>
  );
}

/* ── Concept Gap Graph ───────────────────────────────── */
function ConceptGapGraph({ course }) {
  const topics = course.weakTopics || [];
  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No concept gaps detected — great performance! 🎉
      </div>
    );
  }

  const riskMap = { Critical: 0, High: 30, Medium: 60, Low: 80 };
  const colorMap = {
    Critical: { bar: 'from-red-500 to-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
    High:     { bar: 'from-orange-500 to-amber-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
    Medium:   { bar: 'from-yellow-500 to-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
    Low:      { bar: 'from-blue-500 to-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  };

  // SVG line chart data — mastery score over sessions (single session for now)
  const svgW = 600, svgH = 200;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;
  const maxTopics = Math.min(topics.length, 8);
  const visibleTopics = topics.slice(0, maxTopics);

  const barW = chartW / maxTopics;
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* SVG chart */}
      <div className="relative rounded-2xl bg-black/30 border border-white/6 p-4 overflow-hidden">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FiActivity size={12} className="text-orange-400" />
          Conceptual Gap Analysis — {course.courseName}
        </p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: '180px' }}>
          <defs>
            {visibleTopics.map((_, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={['#ef4444','#f97316','#eab308','#3b82f6'][i % 4]} stopOpacity="0.9" />
                <stop offset="100%" stopColor={['#ef4444','#f97316','#eab308','#3b82f6'][i % 4]} stopOpacity="0.3" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {gridLines.map((g) => {
            const y = padding.top + chartH - (g / 100) * chartH;
            return (
              <g key={g}>
                <line x1={padding.left} y1={y} x2={svgW - padding.right} y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeDasharray="4,4" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10"
                  fill="rgba(156,163,175,0.6)">{100 - g}%</text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={svgH - padding.bottom}
            stroke="rgba(255,255,255,0.08)" />
          <line x1={padding.left} y1={svgH - padding.bottom} x2={svgW - padding.right} y2={svgH - padding.bottom}
            stroke="rgba(255,255,255,0.08)" />

          {/* Bars — gap level (inverted: higher gap = taller red bar) */}
          {visibleTopics.map((t, i) => {
            const gapPct = 100 - (riskMap[t.weaknessLevel] || 50);
            const barH = (gapPct / 100) * chartH;
            const x = padding.left + i * barW + barW * 0.2;
            const w = barW * 0.6;
            const y = padding.top + chartH - barH;
            const label = t.topic.length > 10 ? t.topic.slice(0, 9) + '…' : t.topic;

            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={barH} rx="4"
                  fill={`url(#barGrad${i})`} opacity="0.85" />
                <text x={x + w / 2} y={svgH - padding.bottom + 14} textAnchor="middle" fontSize="9"
                  fill="rgba(156,163,175,0.8)">{label}</text>
                <text x={x + w / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="bold"
                  fill="white">{gapPct}%</text>
              </g>
            );
          })}
        </svg>
        <p className="text-center text-gray-600 text-xs mt-1">Gap intensity per weak concept (higher = larger gap)</p>
      </div>

      {/* Horizontal concept bars */}
      <div className="space-y-3">
        {topics.map((t, i) => {
          const colors = colorMap[t.weaknessLevel] || colorMap.Medium;
          const mastery = t.coverage ?? (riskMap[t.weaknessLevel] ?? 50);
          const gap = 100 - mastery;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4"
            >
              <div className="w-36 shrink-0">
                <p className="text-xs text-gray-300 font-semibold truncate">{t.topic}</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gap}%` }}
                  transition={{ duration: 0.9, delay: i * 0.06 + 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                />
              </div>
              <div className="w-14 shrink-0 flex items-center justify-end gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${colors.badge}`}>
                  {t.weaknessLevel}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Risk Areas ──────────────────────────────────────── */
function RiskAreas({ course }) {
  const topics = course.weakTopics || [];
  const groups = {
    'High Risk':    topics.filter(t => t.weaknessLevel === 'Critical' || t.weaknessLevel === 'High'),
    'Medium Risk':  topics.filter(t => t.weaknessLevel === 'Medium'),
    'To Master':    topics.filter(t => t.weaknessLevel === 'Low'),
    'Mastered':     [],
  };
  const configs = {
    'High Risk':   { icon: FiAlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
    'Medium Risk': { icon: FiTarget,        color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    'To Master':   { icon: FiTrendingUp,    color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20',  dot: 'bg-blue-400' },
    'Mastered':    { icon: FiCheckCircle,   color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {Object.entries(groups).map(([label, items]) => {
        const cfg = configs[label];
        const IconComp = cfg.icon;
        return (
          <div key={label} className={`rounded-2xl border p-4 ${cfg.bg}`}>
            <div className={`flex items-center gap-2 mb-3 ${cfg.color}`}>
              <IconComp size={15} />
              <p className="text-sm font-black">{label}</p>
              <span className="ml-auto text-xs font-bold opacity-70">{items.length}</span>
            </div>
            {items.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {items.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-gray-300 text-[11px] font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {t.topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-xs italic">
                {label === 'Mastered' ? 'Keep working — mastered topics will appear here.' : 'None detected'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserCourses()
      .then((list) => {
        setCourses(list);
        if (list.length > 0) setActiveCourse(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Your Learning{' '}
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            Progress
          </span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Tracking your improvement across concepts and see your growth journey in real time.
        </p>
      </motion.div>

      {/* ── Empty State ── */}
      {courses.length === 0 && (
        <EmptyState onUpload={() => navigate('/upload')} />
      )}

      {/* ── Courses Loaded ── */}
      {courses.length > 0 && (
        <div className="space-y-8">

          {/* Course cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Courses</p>
              <motion.button
                onClick={() => navigate('/upload')}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 text-xs text-orange-400 font-bold hover:text-orange-300 transition-colors"
              >
                <FiUpload size={12} /> Add Course
              </motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <DashboardCourseCard
                  key={c.id}
                  course={c}
                  isActive={activeCourse?.id === c.id}
                  onClick={() => setActiveCourse(c)}
                />
              ))}
            </div>
          </div>

          {/* Active course details */}
          <AnimatePresence mode="wait">
            {activeCourse && (
              <motion.div
                key={activeCourse.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Concept gap graph */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-orange-500/15 rounded-xl">
                      <FiTrendingUp className="text-orange-400" size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Conceptual Gap Analysis</h2>
                      <p className="text-gray-500 text-xs">{activeCourse.courseName} — concept-level weaknesses</p>
                    </div>
                  </div>
                  <ConceptGapGraph course={activeCourse} />
                </div>

                {/* Risk areas */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-red-500/15 rounded-xl">
                      <FiAlertTriangle className="text-red-400" size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Risk Areas</h2>
                      <p className="text-gray-500 text-xs">Categorised concept weaknesses</p>
                    </div>
                  </div>
                  <RiskAreas course={activeCourse} />
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
