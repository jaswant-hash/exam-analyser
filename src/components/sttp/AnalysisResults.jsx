import { motion } from 'framer-motion';
import { FiAlertTriangle, FiBookOpen, FiTarget, FiInfo, FiExternalLink, FiAward } from 'react-icons/fi';

/* ── Score Ring ─────────────────────────────────── */
function ScoreRing({ score }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color =
    pct >= 75 ? '#22c55e' :
    pct >= 50 ? '#f59e0b' :
    pct >= 25 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="72" cy="72" r={radius}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="relative text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-black text-white"
        >
          {pct.toFixed(0)}%
        </motion.div>
        <p className="text-gray-500 text-xs font-semibold mt-0.5">SCORE</p>
      </div>
    </div>
  );
}

/* ── Concept Tag ─────────────────────────────────── */
function ConceptTag({ concept, idx }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * idx }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/[0.04] border-white/10 text-gray-300 hover:border-orange-500/30 hover:text-white cursor-default transition-all"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
      {concept}
    </motion.span>
  );
}

/* ── Resource Link inline ──────────────────────────── */
function ResourceLink({ res, idx }) {
  if (!res?.url) return null;
  const isVideo = res.url?.includes('youtube');
  return (
    <motion.a
      href={res.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * idx }}
      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-orange-500/30 hover:bg-white/[0.06] transition-all group"
    >
      <span className="text-[10px] font-bold text-gray-500 uppercase w-12 shrink-0">
        {isVideo ? '▶ Video' : '📄 Article'}
      </span>
      <span className="flex-1 text-xs text-gray-300 truncate group-hover:text-white">{res.title}</span>
      <FiExternalLink size={10} className="text-gray-600 group-hover:text-orange-400 shrink-0" />
    </motion.a>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AnalysisResults({ report, testData }) {
  if (!report && !testData) return null;
  const data = report || testData;

  const score           = data.score ?? data.overallPercentage ?? data.overallScore ?? 0;
  const weakTopics      = data.weakTopics ?? data.weakConcepts ?? [];
  const coveredTopics   = data.coveredTopics ?? [];
  const missingConcepts = data.missingConcepts ?? [];
  const recommendations = data.recommendations ?? [];
  const totalTopics     = data.totalTopics ?? (weakTopics.length + coveredTopics.length);
  const gapCount        = data.gapCount ?? weakTopics.length;

  const grade =
    score >= 75 ? { label: 'Excellent', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10' } :
    score >= 50 ? { label: 'Good',      color: 'text-blue-400',  bg: 'from-blue-500/20 to-sky-500/10'   } :
    score >= 25 ? { label: 'Fair',      color: 'text-amber-400', bg: 'from-amber-500/20 to-yellow-500/10' } :
                  { label: 'Needs Work', color: 'text-red-400',  bg: 'from-red-500/20 to-rose-500/10'   };

  return (
    <section className="relative px-4 pb-16 pt-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-orange-600/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-8">

        {/* ── HEADER BAND ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative flex flex-col sm:flex-row items-center gap-8 p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${grade.bg} backdrop-blur-xl overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,107,0,0.15), transparent 50%)' }}
          />
          <div className="relative z-10"><ScoreRing score={score} /></div>

          <div className="relative z-10 flex-1 text-center sm:text-left">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">Concept Coverage</p>
            <h2 className={`text-5xl font-black ${grade.color}`}>{grade.label}</h2>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-center">
              <p className="text-2xl font-black text-white">{totalTopics}</p>
              <p className="text-gray-500 text-xs mt-0.5">Topics</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-center">
              <p className="text-2xl font-black text-red-400">{gapCount}</p>
              <p className="text-gray-500 text-xs mt-0.5">Gaps</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-center">
              <p className="text-2xl font-black text-green-400">{coveredTopics.length}</p>
              <p className="text-gray-500 text-xs mt-0.5">Covered</p>
            </div>
          </div>
        </motion.div>

        {/* ── TOPICS TO LEARN (gaps with coverage bars + resources) ── */}
        {weakTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl p-6 border border-white/8 bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-500/15 rounded-xl">
                <FiAlertTriangle className="text-red-400 text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Topics to Learn</h2>
                <p className="text-gray-500 text-xs">{gapCount} gap{gapCount !== 1 ? 's' : ''} — below 65% coverage threshold</p>
              </div>
            </div>

            <div className="space-y-4">
              {weakTopics.map((topic, idx) => {
                const coveragePct = topic.coverage ?? 0;
                const lvl = topic.weaknessLevel || 'Medium';
                const barColor =
                  lvl === 'Critical' ? 'from-red-500 to-red-400' :
                  lvl === 'High'     ? 'from-orange-500 to-amber-400' :
                  lvl === 'Medium'   ? 'from-yellow-500 to-yellow-400' :
                                       'from-blue-500 to-blue-400';
                const badgeColor =
                  lvl === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                  lvl === 'High'     ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                  lvl === 'Medium'   ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' :
                                       'bg-blue-500/15 text-blue-400 border-blue-500/25';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="p-4 rounded-2xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{topic.topic}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${badgeColor}`}>{lvl}</span>
                      </div>
                      <span className="text-xs font-black text-white">{coveragePct}%</span>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${coveragePct}%` }}
                        transition={{ duration: 0.9, delay: idx * 0.06 + 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                      />
                    </div>

                    {topic.missingConcepts?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {topic.missingConcepts.slice(0, 4).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-400 text-[10px]">{c}</span>
                        ))}
                      </div>
                    )}

                    {topic.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {topic.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs text-gray-300 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/8 transition-all font-medium"
                          >
                            <span className="text-[10px] text-gray-500">{r.type === 'video' ? '▶' : '📄'}</span>
                            {r.type === 'video' ? 'Watch' : 'Read'}
                            <FiExternalLink size={10} className="text-gray-600" />
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── GRID: Missing Concepts + Covered Topics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {missingConcepts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-6 border border-white/8 bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-500/15 rounded-xl"><FiInfo className="text-blue-400 text-lg" /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Missing Concepts</h2>
                  <p className="text-gray-500 text-xs">{missingConcepts.length} terms not found in answers</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingConcepts.map((c, idx) => <ConceptTag key={idx} concept={c} idx={idx} />)}
              </div>
            </motion.div>
          )}

          {coveredTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-3xl p-6 border border-white/8 bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-green-500/15 rounded-xl"><FiAward className="text-green-400 text-lg" /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Covered Topics</h2>
                  <p className="text-gray-500 text-xs">{coveredTopics.length} topics with ≥65% coverage</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {coveredTopics.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 font-medium w-32 shrink-0 truncate">{t.topic}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.coverage ?? 75}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                      />
                    </div>
                    <span className="text-xs font-black text-green-400 shrink-0">{t.coverage ?? 75}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── LEARNING RESOURCES ── */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl p-6 border border-white/8 bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-500/15 rounded-xl"><FiBookOpen className="text-green-400 text-lg" /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Learning Resources</h2>
                <p className="text-gray-500 text-xs">Curated videos, articles per weak topic</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 * idx }}
                  className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-orange-500/25 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-gray-100">{rec.topic}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase border tracking-wider ${
                      rec.priority === 'High'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                    }`}>{rec.priority}</span>
                  </div>
                  {rec.explanation && <p className="text-gray-500 text-xs mb-3 leading-relaxed">{rec.explanation}</p>}
                  {rec.resources?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {rec.resources.map((r, i) => <ResourceLink key={i} res={r} idx={i} />)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
