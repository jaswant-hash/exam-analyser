import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiClock, FiExternalLink, FiBookOpen, FiPlay, FiTarget, FiDownload } from 'react-icons/fi';
import { useState } from 'react';

/* ── Resource Card ───────────────────────────────── */
function ResourceCard({ resource }) {
  if (!resource) return null;

  const isYoutube = resource.url?.includes('youtube');
  const Icon = isYoutube ? FiPlay : FiBookOpen;
  const gradient = isYoutube
    ? 'from-red-500/15 to-rose-500/5 border-red-500/20 hover:border-red-400/40'
    : 'from-blue-500/15 to-sky-500/5 border-blue-500/20 hover:border-blue-400/40';
  const iconColor = isYoutube ? 'text-red-400 bg-red-500/15' : 'text-blue-400 bg-blue-500/15';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`mt-4 flex items-center gap-4 p-3.5 rounded-2xl border bg-gradient-to-br ${gradient} transition-all duration-300 group`}
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Recommended Resource</p>
        <p className="text-sm font-semibold text-gray-200 truncate">{resource.title}</p>
        <div className="flex gap-2 mt-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${resource.prioClass || 'text-orange-400 border-orange-500/30 bg-orange-500/15'}`}>
            {resource.priority}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/8 font-medium">
            {resource.type}
          </span>
        </div>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:scale-105 transition-all duration-200"
      >
        Open <FiExternalLink size={12} />
      </a>
    </motion.div>
  );
}

/* ── Day Card ─────────────────────────────────────── */
function DayCard({ plan, index, isActive, onClick }) {
  const statusConfig = {
    'completed': {
      dot: 'bg-green-500',
      glow: 'shadow-green-500/30',
      ring: 'border-green-500',
      label: '✓',
      bg: 'from-green-900/30 to-green-950/10 border-green-500/20',
      tagBg: 'bg-green-500/15 text-green-400 border-green-500/25',
    },
    'in-progress': {
      dot: 'bg-orange-500',
      glow: 'shadow-orange-500/40',
      ring: 'border-orange-500',
      label: '●',
      bg: 'from-orange-900/20 to-amber-950/10 border-orange-500/25',
      tagBg: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    },
    'upcoming': {
      dot: 'bg-gray-600',
      glow: '',
      ring: 'border-gray-600',
      label: '○',
      bg: 'from-gray-800/20 to-gray-900/10 border-gray-700/30',
      tagBg: 'bg-gray-700/30 text-gray-400 border-gray-600/30',
    },
  };
  const cfg = statusConfig[plan.status] || statusConfig.upcoming;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      onClick={onClick}
      className={`cursor-pointer relative rounded-3xl border bg-gradient-to-br ${cfg.bg} p-6 hover:scale-[1.01] transition-all duration-300 group overflow-hidden ${isActive ? 'ring-1 ring-orange-500/30' : ''}`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
              className={`w-10 h-10 rounded-2xl border-2 ${cfg.ring} flex items-center justify-center font-black text-white text-sm shadow-lg ${cfg.glow}`}
            >
              <span>{cfg.label}</span>
            </motion.div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Day {plan.day || index + 1}</p>
              <motion.div
                className={`mt-0.5 w-full h-0.5 rounded ${cfg.dot}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs bg-white/5 border border-white/8 rounded-full px-3 py-1">
            <FiClock size={12} />
            {plan.duration}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-3 leading-snug">{plan.topic}</h3>

        {/* Concept tags */}
        {plan.concepts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {plan.concepts.map((c, i) => (
              <span key={i} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.tagBg}`}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Expand — Tasks */}
        <AnimatePresence>
          {isActive && plan.allTasks?.length > 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="mb-4 space-y-1.5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">All Tasks</p>
                {plan.allTasks.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resource cards — primary + extras */}
        <ResourceCard resource={plan.resource} />
        <AnimatePresence>
          {isActive && plan.resources?.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2">Also Useful</p>
              <div className="flex flex-col gap-2">
                {plan.resources.filter(r => r.url !== plan.resource?.url).map((r, ri) => (
                  <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-orange-500/25 transition-all text-sm text-gray-300 hover:text-white group">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase">{r.type}</span>
                    <span className="flex-1 truncate">{r.title}</span>
                    <FiExternalLink size={12} className="text-gray-600 group-hover:text-orange-400 shrink-0" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function RevisionPlan({ planData = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!planData || planData.length === 0) return null;

  /* normalise each day item */
  const formattedPlan = planData.map((dayItem, index) => {
    const allTasks = Array.isArray(dayItem.tasks)
      ? dayItem.tasks.map(t => (typeof t === 'object' ? t.task : t))
      : [dayItem.task || 'Review concepts'];

    const mainTask = allTasks[0] || 'Review concepts';

    return {
      day: dayItem.day || index + 1,
      topic: dayItem.topic || mainTask,
      duration: dayItem.estimatedHours ? `${dayItem.estimatedHours}h` : '2h',
      concepts: dayItem.concepts || dayItem.topics || ['Core Review'],
      status: index === 0 ? 'in-progress' : 'upcoming',
      resource: dayItem.resource || null,
      resources: dayItem.resources || [],
      allTasks,
    };
  });

  const completedCount = formattedPlan.filter(p => p.status === 'completed').length;
  const totalHours = formattedPlan.reduce((sum, p) => sum + parseInt(p.duration), 0);

  return (
    <section className="relative min-h-screen pt-16 pb-24 px-4">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">

        {/* ── HEADER ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-500" animate={{ scale: [1,1.5,1] }} transition={{ duration:1.5, repeat: Infinity }} />
                AI Generated
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                Your{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Revision Plan
                </span>
              </h2>
              <p className="mt-3 text-gray-400 text-lg max-w-xl">
                AI-crafted {formattedPlan.length}-day schedule tailored to your weak areas with curated resources.
              </p>
            </div>

            {/* Summary stats */}
            <div className="flex gap-4 shrink-0">
              {[
                { label: 'Days', value: formattedPlan.length, color: 'text-orange-400' },
                { label: 'Total Hours', value: `${totalHours}h`, color: 'text-purple-400' },
                { label: 'Topics', value: formattedPlan.length, color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="text-center px-4 py-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── PROGRESS BAND ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 p-4 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center gap-4"
        >
          <div className="flex items-center gap-2 shrink-0">
            <FiTarget className="text-orange-400" size={16} />
            <span className="text-xs text-gray-400 font-semibold">Progress</span>
          </div>
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(completedCount / formattedPlan.length) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{ boxShadow: '0 0 12px rgba(34,197,94,0.4)' }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{completedCount}/{formattedPlan.length} done</span>
        </motion.div>

        {/* ── CARDS GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedPlan.map((plan, index) => (
            <DayCard
              key={index}
              plan={plan}
              index={index}
              isActive={activeIdx === index}
              onClick={() => setActiveIdx(activeIdx === index ? -1 : index)}
            />
          ))}
        </div>

        {/* ── BOTTOM CTA ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,107,0,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/30 transition-all"
          >
            <FiDownload size={18} />
            Download Plan as PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 border-2 border-white/10 text-gray-300 font-bold rounded-2xl hover:border-orange-500/40 hover:text-orange-400 transition-all"
          >
            <FiCheckCircle size={18} />
            Mark Day 1 Complete
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
