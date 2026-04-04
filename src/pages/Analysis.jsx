import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiChevronRight, FiCalendar, FiTarget, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import RevisionPlan from '../components/sttp/RevisionPlan';
import AnalysisResults from '../components/sttp/AnalysisResults';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import { fetchUserCourses, fetchCourseById } from '../services/firebaseService';

/* ── Course Card ──────────────────────────────────── */
function CourseCard({ course, isActive, onClick }) {
  const weakCount = course.weakTopics?.length || 0;
  const score     = course.score || 0;
  const grade     = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Fair' : 'Needs Work';
  const gradeColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-blue-400' : score >= 25 ? 'text-amber-400' : 'text-red-400';
  const initial   = course.courseName?.charAt(0).toUpperCase() || '?';

  const uploadDate = course.uploadedAt?.toDate
    ? course.uploadedAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(255,107,0,0.15)' }}
      onClick={onClick}
      className={`cursor-pointer relative rounded-3xl border transition-all duration-300 overflow-hidden p-6 ${
        isActive
          ? 'border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-amber-900/10'
          : 'border-white/10 bg-white/[0.03] hover:border-orange-500/30 hover:bg-white/[0.05]'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/25 shrink-0">
              {initial}
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">{course.courseName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-xs">
                <FiCalendar size={11} />
                {uploadDate}
              </div>
            </div>
          </div>
          <FiChevronRight className={`text-gray-600 transition-transform duration-300 mt-1 ${isActive ? 'rotate-90 text-orange-400' : ''}`} size={18} />
        </div>

        {/* Score */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Overall Score</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{score.toFixed(0)}%</span>
              <span className={`text-sm font-bold ${gradeColor}`}>{grade}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Weak Areas</p>
            <div className="flex items-center gap-1.5 justify-end">
              <FiAlertTriangle className="text-red-400" size={14} />
              <span className="text-2xl font-black text-white">{weakCount}</span>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full ${
              score >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
              score >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
              score >= 25 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-red-500 to-rose-400'
            }`}
          />
        </div>

        {/* Weak topic chips */}
        {course.weakTopics?.slice(0, 3).map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-1.5 mb-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-gray-400 text-[11px] font-medium">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {t.topic}
          </span>
        ))}
        {(course.weakTopics?.length || 0) > 3 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-gray-500 text-[11px]">
            +{course.weakTopics.length - 3} more
          </span>
        )}

        <div className={`mt-4 text-center w-full py-2 rounded-xl text-xs font-bold transition-all ${
          isActive
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            : 'bg-white/3 text-gray-600 border border-white/8 group-hover:text-orange-400'
        }`}>
          {isActive ? 'Viewing Analysis ↓' : 'Click to view analysis →'}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function Analysis() {
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get('course');
  const navigate = useNavigate();

  const [courses, setCourses]         = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(courseIdFromUrl || null);
  const [activeCourse, setActiveCourse]     = useState(null);
  const [loadingList, setLoadingList]       = useState(true);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [error, setError]                   = useState(null);

  /* Load all courses on mount */
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingList(true);
        const list = await fetchUserCourses();
        setCourses(list);
        // Auto-select from URL param or latest
        const toSelect = courseIdFromUrl || list[0]?.id || null;
        if (toSelect) setActiveCourseId(toSelect);
      } catch (e) {
        setError('Failed to load courses: ' + e.message);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, []);

  /* Load course detail whenever active changes */
  useEffect(() => {
    if (!activeCourseId) return;
    const load = async () => {
      setLoadingDetail(true);
      try {
        const data = await fetchCourseById(activeCourseId);
        setActiveCourse(data);
      } catch (e) {
        setError('Failed to load course details.');
      } finally {
        setLoadingDetail(false);
      }
    };
    load();
  }, [activeCourseId]);

  const handleCardClick = (id) => {
    setActiveCourseId(prev => (prev === id ? null : id));
    setActiveCourse(null);
  };

  /* ── Loading state ── */
  if (loadingList) {
    return <LoadingOverlay isVisible={true} message="Loading your courses..." />;
  }

  /* ── No courses yet ── */
  if (courses.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="text-7xl mb-6">📊</div>
          <h2 className="text-3xl font-black text-white mb-3">No Analyses Yet</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Upload your subject portions and answer sheet to get a personalized AI analysis with weak topic detection and revision plan.
          </p>
          <motion.button
            onClick={() => navigate('/upload')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,107,0,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black rounded-2xl shadow-xl"
          >
            <FiUpload size={18} /> Upload Your First Course
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Analysis</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Your <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} analysed • Click a card to view details</p>
        </div>
        <motion.button
          onClick={() => navigate('/upload')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-orange-500/20 shrink-0"
        >
          <FiUpload size={15} /> Upload New Course
        </motion.button>
      </motion.div>

      {/* ── Course Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            isActive={activeCourseId === c.id}
            onClick={() => handleCardClick(c.id)}
          />
        ))}
      </div>

      {/* ── Expanded Analysis Detail ── */}
      <AnimatePresence>
        {activeCourseId && (
          <motion.div
            key={activeCourseId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {loadingDetail ? (
              <div className="flex items-center justify-center py-16">
                <motion.div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                <span className="ml-3 text-gray-400 text-sm">Loading analysis...</span>
              </div>
            ) : activeCourse ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden">
                {/* Detail header */}
                <div className="px-6 py-5 border-b border-white/8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-lg">
                    {activeCourse.courseName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{activeCourse.courseName}</h2>
                    <p className="text-gray-500 text-xs">Full analysis details</p>
                  </div>
                </div>

                <AnalysisResults report={activeCourse} testData={activeCourse} />
                <RevisionPlan planData={activeCourse.revisionPlan} />
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 text-center text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
}
