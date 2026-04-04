import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFileText, FiImage, FiFile, FiCheckCircle,
  FiArrowRight, FiArrowLeft, FiBookOpen, FiX, FiEdit3
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';
import { extractTextWithGemini } from '../../services/geminiVisionService';
import { extractTextFromPDF, renderPDFToImage } from '../../services/pdfService';
import { extractTextFromPPTX } from '../../services/pptxService';
import { runGeminiAnalysis } from '../../services/geminiAnalysisService';
import { saveCourseAnalysis } from '../../services/firebaseService';


/* ─────────────────────────────────────────────────────────── */
/* Step indicator                                              */
/* ─────────────────────────────────────────────────────────── */
function StepIndicator({ current }) {
  const steps = [
    { id: 1, label: 'Course Name' },
    { id: 2, label: 'Upload Files' },
    { id: 3, label: 'Verify Text' },
  ];
  return (
    <div className="flex items-center gap-0 mb-8 w-full max-w-sm mx-auto">
      {steps.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                done   ? 'bg-green-500 text-white' :
                active ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30' :
                         'bg-white/5 border border-white/10 text-gray-500'
              }`}>
                {done ? <FiCheckCircle size={14} /> : s.id}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                active ? 'text-orange-400' : done ? 'text-green-400' : 'text-gray-600'
              }`}>{s.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mb-5 transition-all duration-500 ${done ? 'bg-green-500/50' : 'bg-white/8'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* File drop zone                                             */
/* ─────────────────────────────────────────────────────────── */
function FileZone({ icon: Icon, label, sublabel, accept, files, onAdd, onRemove, color = 'orange' }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    onAdd(Array.from(e.dataTransfer.files));
  };

  const getFileIcon = (name) => {
    if (name.endsWith('.csv')) return <FiFileText className="text-blue-400" size={18} />;
    if (['.png', '.jpg', '.jpeg'].some(x => name.endsWith(x))) return <FiImage className="text-green-400" size={18} />;
    if (name.endsWith('.pdf')) return <FiFile className="text-red-400" size={18} />;
    if (name.endsWith('.pptx')) return <FiFile className="text-purple-400" size={18} />;
    return <FiFile className="text-gray-400" size={18} />;
  };

  const borderColor = color === 'orange' ? 'border-orange-500/40' : color === 'blue' ? 'border-blue-500/40' : 'border-purple-500/40';
  const bgColor    = color === 'orange' ? 'bg-orange-500/5'       : color === 'blue' ? 'bg-blue-500/5'       : 'bg-purple-500/5';
  const textColor  = color === 'orange' ? 'text-orange-400'       : color === 'blue' ? 'text-blue-400'       : 'text-purple-400';
  const dragBorder = color === 'orange' ? 'border-orange-400 bg-orange-500/10' : color === 'blue' ? 'border-blue-400 bg-blue-500/10' : 'border-purple-400 bg-purple-500/10';

  return (
    <div className="space-y-2">
      <div
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => ref.current?.click()}
        className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer ${drag ? dragBorder : `border-dashed border-white/10 hover:${borderColor} hover:${bgColor}`}`}
      >
        <div className="py-6 px-5 flex flex-col items-center gap-2 text-center">
          <div className={`p-3 rounded-xl ${bgColor} transition-colors`}>
            <Icon className={`${textColor} transition-colors`} size={22} />
          </div>
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-gray-500 text-xs">{sublabel}</p>
          <p className={`text-xs font-bold ${textColor}`}>Drag & drop or click to browse</p>
        </div>
        <input ref={ref} type="file" multiple accept={accept}
          onChange={(e) => { onAdd(Array.from(e.target.files)); e.target.value = ''; }} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(f.name)}
                <p className="text-gray-200 text-xs font-medium truncate max-w-[180px]">{f.name}</p>
                <span className="text-gray-600 text-[10px] shrink-0">{(f.size/1024/1024).toFixed(1)}MB</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="p-1 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-all">
                <FiX size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main component                                             */
/* ─────────────────────────────────────────────────────────── */
export default function UploadPanel() {
  const [step, setStep] = useState(1); // 1=name, 2=files, 3=verify

  // Step 1 — course name
  const [courseName, setCourseName] = useState('');
  const [nameError, setNameError] = useState('');

  // Step 2 — files
  const [portionFiles, setPortionFiles] = useState([]);
  const [questionFiles, setQuestionFiles] = useState([]);
  const [answerFiles, setAnswerFiles]   = useState([]);

  // Extracted text states
  const [extractedSyllabus, setExtractedSyllabus] = useState('');
  const [extractedQuestion, setExtractedQuestion] = useState('');
  const [extractedAnswer, setExtractedAnswer]   = useState('');
  const [ocrErrors, setOcrErrors] = useState([]);

  // Processing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsg, setLoadingMsg]   = useState('');

  const navigate = useNavigate();

  /* ── Text extraction helper (Gemini Vision for all image/PDF types) ── */
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const extractText = async (file) => {
    setLoadingMsg(`Reading: ${file.name}…`);

    // ── Plain text / CSV ──────────────────────────────────────
    if (
      file.name.endsWith('.csv') ||
      file.name.endsWith('.txt') ||
      file.type === 'text/plain' ||
      file.type === 'text/csv'
    ) {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = (e) => res(e.target.result || '');
        reader.onerror = () => rej(new Error(`Could not read text file: ${file.name}`));
        reader.readAsText(file);
      });
    }

    // ── Image → Gemini Vision OCR ─────────────────────────────
    if (file.type.startsWith('image/')) {
      setLoadingMsg(`Gemini OCR: scanning image ${file.name}…`);
      return await extractTextWithGemini(geminiKey, file, file.type, setLoadingMsg);
    }

    // ── PDF → ALWAYS use Gemini (handles digital, scanned, handwritten) ───
    // We skip the pdfjs fast-path entirely because:
    //   • pdfjs on scanned PDFs returns garbled/empty text
    //   • pdfjs on digitally-typed PDFs also works in Gemini, with no loss
    //   • Gemini reads the real visual content — including handwriting
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      setLoadingMsg(`Gemini OCR: reading PDF ${file.name}…`);
      return await extractTextWithGemini(geminiKey, file, 'application/pdf', setLoadingMsg);
    }

    // ── PPTX / PPT → XML parser, fall back to Gemini ──────────
    if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
      try {
        const r = await extractTextFromPPTX(file);
        const text = r.extractedText?.trim();
        if (text && text.length > 20) return text;
        throw new Error('PPTX parser returned empty text');
      } catch (_) {
        // PPTX parser failed — Gemini can't read PPTX binary directly,
        // so surface the error so the user can paste manually
        throw new Error(
          `Could not read "${file.name}" — export it as PDF first and re-upload.`
        );
      }
    }

    // ── Unsupported file type ─────────────────────────────────
    throw new Error(
      `Unsupported file type: "${file.name}". Supported: PDF, JPG/PNG, PPTX, CSV/TXT.`
    );
  };

  /* ── Step 1 → 2 ── */
  const handleNameNext = () => {
    if (!courseName.trim()) { setNameError('Please enter a course name.'); return; }
    setNameError('');
    setStep(2);
  };

  /* ── Step 2 → 3: Extract Text ── */
  const handleExtractText = async () => {
    // "Type Raw Text Instead" path — skip to Step 3 blank
    if (portionFiles.length === 0 && answerFiles.length === 0) {
      setExtractedSyllabus('');
      setExtractedQuestion('');
      setExtractedAnswer('');
      setStep(3);
      return;
    }

    setIsAnalyzing(true);
    setOcrErrors([]);

    const errors = [];

    const safeExtract = async (file, label) => {
      try {
        return await extractText(file);
      } catch (err) {
        console.error(`OCR failed [${label}]:`, err);
        errors.push(`${label} — ${err.message}`);
        return '';
      }
    };

    try {
      // 1. Extract syllabus text
      let syllabusText = '';
      for (const f of portionFiles) syllabusText += ' ' + await safeExtract(f, `Syllabus: ${f.name}`);

      // 2. Extract question paper text
      let questionText = '';
      for (const f of questionFiles) questionText += ' ' + await safeExtract(f, `Question: ${f.name}`);

      // 3. Extract answer sheet text
      let answerText = '';
      for (const f of answerFiles) answerText += ' ' + await safeExtract(f, `Answer: ${f.name}`);

      // Fallback: if syllabus extraction returned nothing, use filename
      if (!syllabusText.trim() && portionFiles.length > 0) {
        syllabusText = portionFiles.map(f => f.name.replace(/\.[^.]+$/, '')).join(', ');
      }

      setExtractedSyllabus(syllabusText.trim());
      setExtractedQuestion(questionText.trim());
      setExtractedAnswer(answerText.trim());
      setOcrErrors(errors);

      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Extraction failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Step 3 → Analyse via Gemini API (browser-direct) ── */
  const handleFinalAnalyze = async () => {
    if (!extractedSyllabus.trim()) {
      alert('Please provide syllabus/portion text.'); return;
    }
    if (!extractedAnswer.trim()) {
      alert('Please provide the student answer sheet text.'); return;
    }
    setIsAnalyzing(true);

    try {
      // Run full analysis directly via Gemini API — no server needed
      const result = await runGeminiAnalysis({
        syllabusText: extractedSyllabus,
        questionText: extractedQuestion,
        answerText:   extractedAnswer,
        onProgress:   (msg) => setLoadingMsg(msg),
      });

      // Save to Firebase
      setLoadingMsg('Saving to your account…');
      try {
        const courseId = await saveCourseAnalysis(courseName.trim(), result);
        navigate(`/analysis?course=${courseId}`);
      } catch (saveErr) {
        // "Document already exists" means it was already saved in a previous run —
        // extract the course ID from the Firestore error path and navigate there.
        const existingId = saveErr.message?.match(/courses\/([A-Za-z0-9]+)/)?.[1];
        if (existingId) {
          navigate(`/analysis?course=${existingId}`);
        } else {
          throw saveErr; // unknown save error — surface it
        }
      }

    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + err.message);
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };


  /* ─────────────────────────────────────────────────── */
  /* RENDER                                              */
  /* ─────────────────────────────────────────────────── */
  return (
    <section className="w-full relative min-h-screen pt-20 pb-16 px-4 sm:px-6 flex flex-col justify-center"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,110,0,0.12), transparent 70%)' }}>

      <LoadingOverlay isVisible={isAnalyzing} message={loadingMsg} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-1/4 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Course Name ── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }}>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <FiEdit3 size={12} /> Step 1 of 2
                </div>
                <h1 className="text-3xl font-black text-white mb-2">
                  What course are you<br />
                  <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">uploading?</span>
                </h1>
                <p className="text-gray-400 text-sm">Enter the course or subject name. This will be used to label your analysis card.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => { setCourseName(e.target.value); setNameError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
                    placeholder="e.g. DBMS, Computer Networks, OS..."
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 font-medium text-base focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                  />
                  {nameError && (
                    <p className="text-red-400 text-xs mt-2 ml-1">{nameError}</p>
                  )}
                </div>


                <motion.button
                  onClick={handleNameNext}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,107,0,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  Continue <FiArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Upload Files ── */}
          {step === 2 && !isAnalyzing && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>

              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
                <FiArrowLeft size={14} /> Back
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                  <FiUploadCloud size={12} /> Step 2 of 2
                </div>
                <h1 className="text-3xl font-black text-white mb-1">
                  Upload files for{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                    {courseName}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm">Upload subject portions, answer sheet, and optionally the answer key.</p>
              </div>

              <div className="space-y-5">
                {/* Portions */}
                <FileZone
                  icon={FiBookOpen} label="Subject Portions / Syllabus" color="orange"
                  sublabel="PDF, PPTX, PPT, Images, CSV — any format"
                  accept=".pdf,.png,.jpg,.jpeg,.pptx,.ppt,.csv,.txt"
                  files={portionFiles}
                  onAdd={(f) => setPortionFiles(p => [...p, ...f])}
                  onRemove={(i) => setPortionFiles(p => p.filter((_, idx) => idx !== i))}
                />

                {/* Question paper */}
                <FileZone
                  icon={FiFileText} label="Question Paper *" color="blue"
                  sublabel="PDF, Image, PPTX, CSV — scanned or digital"
                  accept=".pdf,.png,.jpg,.jpeg,.pptx,.ppt,.csv"
                  files={questionFiles}
                  onAdd={(f) => setQuestionFiles(p => [...p, ...f])}
                  onRemove={(i) => setQuestionFiles(p => p.filter((_, idx) => idx !== i))}
                />

                {/* Answer sheet */}
                <FileZone
                  icon={FiFileText} label="Answer Sheet *" color="purple"
                  sublabel="Student answers — PDF, Image, PPTX, CSV"
                  accept=".pdf,.png,.jpg,.jpeg,.pptx,.ppt,.csv"
                  files={answerFiles}
                  onAdd={(f) => setAnswerFiles(p => [...p, ...f])}
                  onRemove={(i) => setAnswerFiles(p => p.filter((_, idx) => idx !== i))}
                />

                <div className="flex gap-4 w-full">
                  <motion.button
                    onClick={() => { setPortionFiles([]); setQuestionFiles([]); setAnswerFiles([]); handleExtractText(); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 bg-white/5 text-gray-300 font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm"
                  >
                    Type Raw Text Instead
                  </motion.button>
                  <motion.button
                    onClick={handleExtractText}
                    disabled={portionFiles.length === 0 || questionFiles.length === 0 || answerFiles.length === 0}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,107,0,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-[2] py-4 px-6 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      portionFiles.length === 0 || questionFiles.length === 0 || answerFiles.length === 0 ? 'bg-gray-500/50' : 'bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-500/20'
                    }`}
                  >
                    Extract Text <FiArrowRight size={18} />
                  </motion.button>
                </div>

                {(portionFiles.length === 0 || questionFiles.length === 0 || answerFiles.length === 0) && (
                  <p className="text-center text-gray-600 text-xs">
                    * Subject portions, question paper, and answer sheet are required to auto-extract.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Review Text ── */}
          {step === 3 && !isAnalyzing && (
            <motion.div key="step3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              className="w-full"
            >
              <button onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
                <FiArrowLeft size={14} /> Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                  <FiCheckCircle size={12} /> Step 3 of 3
                </div>
                <h1 className="text-3xl font-black text-white mb-1">
                  Verify & <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">Edit OCR</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  If the PDF scanner missed something (like messy handwriting), you can fix it below before the ML evaluates it.
                </p>
              </div>

              {ocrErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">⚠ OCR failed — paste text manually below</p>
                      {ocrErrors.map((e, i) => (
                        <p key={i} className="text-red-300/80 text-xs font-mono break-all mt-0.5 whitespace-pre-wrap">{e}</p>
                      ))}
                    </div>
                    <button onClick={() => setOcrErrors([])} className="text-red-500 hover:text-red-300 shrink-0 text-lg leading-none">✕</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Syllabus */}
                <div>
                  <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Subject Syllabus Text</label>
                  <textarea
                    value={extractedSyllabus}
                    onChange={(e) => setExtractedSyllabus(e.target.value)}
                    placeholder="Paste or type the syllabus concepts here..."
                    className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.04] border border-orange-500/30 text-white placeholder-gray-600 font-medium focus:outline-none focus:border-orange-500/80 transition-all text-sm"
                  />
                </div>

                {/* Question Paper */}
                <div>
                  <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Question Paper Text</label>
                  <textarea
                    value={extractedQuestion}
                    onChange={(e) => setExtractedQuestion(e.target.value)}
                    placeholder="Question paper will auto-fill here. If empty, paste the questions manually..."
                    className="w-full h-28 px-4 py-3 rounded-xl bg-white/[0.04] border border-blue-500/30 text-white placeholder-gray-600 font-medium focus:outline-none focus:border-blue-500/80 transition-all text-sm"
                  />
                </div>

                {/* Answer Sheet */}
                <div>
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                    Student Answer Text
                    {!extractedAnswer.trim() && answerFiles.length > 0 && (
                      <span className="ml-2 text-red-400 normal-case font-semibold">⚠ OCR returned empty — paste manually below</span>
                    )}
                  </label>
                  <textarea
                    value={extractedAnswer}
                    onChange={(e) => setExtractedAnswer(e.target.value)}
                    placeholder="Student answers will auto-fill here. If empty, paste the answers manually..."
                    className={`w-full h-40 px-4 py-3 rounded-xl bg-white/[0.04] border text-white placeholder-gray-600 font-medium focus:outline-none transition-all text-sm ${
                      !extractedAnswer.trim() && answerFiles.length > 0
                        ? 'border-red-500/50 focus:border-red-400/80'
                        : 'border-purple-500/30 focus:border-purple-500/80'
                    }`}
                  />
                </div>


                <motion.button
                  onClick={handleFinalAnalyze}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,107,0,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  Confirm & Analyze <FiArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
