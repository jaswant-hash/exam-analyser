import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiImage, FiFile, FiCheckCircle, FiArrowRight, FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';
import { extractTextFromImage } from '../../services/ocrService';
import { extractTextFromPDF } from '../../services/pdfService';
import { parseCSV, calculateOverallMetrics } from '../../services/csvParserService';
import { evaluateAnswer } from '../../services/ragEvaluationService';
import { indexDocument } from '../../services/vectorService';
import { generateRecommendations } from '../../services/recommendationService';
import { generateRevisionPlan } from '../../services/llmService';
import { saveTestAttempt } from '../../services/firebaseService';

export default function UploadPanel() {
  const [step, setStep] = useState('upload-syllabus'); // 'upload-syllabus' | 'upload-sheet'
  
  // Syllabus state
  const [syllabusFiles, setSyllabusFiles] = useState([]);
  const [textbookChunksCount, setTextbookChunksCount] = useState(0);
  
  // Sheet state
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  
  // Analyzing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const fileInputRef = useRef(null);
  const syllabusInputRef = useRef(null);
  const navigate = useNavigate();

  // ── File upload helpers ──
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleSyllabusDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setSyllabusFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleSheetDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.csv')) return <FiFileText className="text-blue-400 text-2xl" />;
    if (['.png', '.jpg', '.jpeg'].some((ext) => fileName.endsWith(ext)))
      return <FiImage className="text-green-400 text-2xl" />;
    if (fileName.endsWith('.pdf')) return <FiFile className="text-red-400 text-2xl" />;
    return <FiFile className="text-gray-400 text-2xl" />;
  };

  // ── Step 1: Process Syllabus (Vector Indexing) ──
  const handleProcessSyllabus = async () => {
    if (syllabusFiles.length === 0) return;
    setIsAnalyzing(true);
    
    try {
      setLoadingMessage('Extracting text from textbook/syllabus...');
      let combinedText = '';
      
      for (const file of syllabusFiles) {
        if (file.type === 'application/pdf') {
          const result = await extractTextFromPDF(file);
          combinedText += ' ' + result.extractedText;
        } else if (file.type.startsWith('image/')) {
          const result = await extractTextFromImage(file);
          combinedText += ' ' + result.rawText;
        }
      }
      
      setLoadingMessage('Converting textbook into mathematical Brain Vectors...');
      
      const totalIndexed = await indexDocument(combinedText, (current, total) => {
         setLoadingMessage(`Storing Embeddings (Chunk ${current} of ${total})...`);
      });
      
      if (totalIndexed === 0) {
        alert("We couldn't detect enough text to index. Please upload a clearer file.");
        setIsAnalyzing(false);
        return;
      }
      
      setTextbookChunksCount(totalIndexed);
      setIsAnalyzing(false);
      setStep('upload-sheet');
      
    } catch(err) {
      console.error(err);
      alert('Failed to process. Make sure Ollama is running. Error: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  // ── Step 2: Validate Answer Sheet Contextually (RAG) ──
  const handleAnalyzeSheet = async () => {
    if (files.length === 0 || textbookChunksCount === 0) return;
    setIsAnalyzing(true);

    try {
      let combinedText = '';
      let csvData = null;
      let overallMetrics = null;

      for (const file of files) {
        setLoadingMessage(`Extracting text from ${file.name}...`);

        if (file.name.endsWith('.csv')) {
          csvData = await parseCSV(file);
          overallMetrics = calculateOverallMetrics(csvData);
        } else if (file.type.startsWith('image/')) {
          const ocrResult = await extractTextFromImage(file);
          combinedText += ' ' + ocrResult.rawText;
        } else if (file.type === 'application/pdf') {
          const pdfResult = await extractTextFromPDF(file);
          combinedText += ' ' + pdfResult.extractedText;
        }
      }

      setLoadingMessage('Searching textbook to evaluate student answers...');
      let analysis = { weakTopics: [], missingConcepts: [], overallFeedback: '' };

      if (combinedText) {
        // Feed the student's answer to the RAG Semantic Grader
        analysis = await evaluateAnswer(combinedText);
      }

      setLoadingMessage('Generating tailored recommendations...');
      const recommendations = generateRecommendations(analysis.weakTopics || []);

      setLoadingMessage('Creating AI-powered study plan...');
      // Safe fallback if student didn't miss anything (perfect score)
      const topicsToPlan = analysis.weakTopics.length > 0 
         ? analysis.weakTopics 
         : [{ topic: 'Advanced Applications', weaknessLevel: 'Low' }];
         
      const revisionPlan = await generateRevisionPlan(topicsToPlan, recommendations);

      setLoadingMessage('Saving your results...');
      const testData = {
        fileType: files[0].name.split('.').pop(),
        rawData: { text: combinedText, csv: csvData },
        selectedTopics: analysis.weakTopics.map(t => t.topic),
        overallScore: analysis.score || overallMetrics?.overallPercentage || 0,
        totalMarksObtained: overallMetrics?.totalMarksObtained || 0,
        totalMarksAvailable: overallMetrics?.maxMarks || 0,
        weakConcepts: analysis.weakTopics || [],
        missingConcepts: analysis.missingConcepts || [],
        overallFeedback: analysis.overallFeedback || '',
        recommendations: recommendations || [],
        revisionPlan: revisionPlan || [],
      };

      const docId = await saveTestAttempt('Demo Student', 'student@example.com', testData);

      setLoadingMessage('Done! Redirecting to dashboard...');
      setTimeout(() => {
        setIsAnalyzing(false);
        navigate(`/analysis?id=${docId}`);
      }, 1000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      alert('Analysis failed: ' + error.message);
    }
  };

  // ────────────────────────────────────────────
  // UI STEP 1: Syllabus Upload
  // ────────────────────────────────────────────
  const renderSyllabusUpload = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center">1</div>
          <span className="text-white font-semibold text-sm">Upload Portions</span>
        </div>
        <div className="flex-1 h-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 font-bold text-sm flex items-center justify-center">2</div>
          <span className="text-gray-400 font-semibold text-sm">Upload Sheet</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-white mb-2">
          Upload Your{' '}
          <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
            Exam Syllabus
          </span>
        </h1>
        <p className="text-gray-400 text-sm">Supply the course portions (PDF/Images) so the AI learns what to look for.</p>
      </div>

      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleSyllabusDrop}
        className={`rounded-3xl border-2 transition-all duration-300 mb-6 ${
          dragActive ? 'border-orange-400 shadow-2xl shadow-orange-500/30 bg-orange-950/30' : 'border-gray-700/60 bg-gray-900/40 hover:border-orange-500/40'
        }`}
      >
        <div className="py-10 px-6 flex flex-col items-center gap-4">
          <FiBookOpen className="text-6xl text-orange-400 drop-shadow-xl" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">Drag & drop your syllabus</p>
            <p className="text-gray-400 text-sm mt-1">or <span onClick={() => syllabusInputRef.current?.click()} className="text-orange-400 font-semibold cursor-pointer hover:underline">click to browse</span></p>
          </div>
        </div>
        <input ref={syllabusInputRef} type="file" multiple accept=".pdf,.png,.jpg" onChange={(e) => setSyllabusFiles((prev) => [...prev, ...Array.from(e.target.files)])} className="hidden" />
      </motion.div>

      {syllabusFiles.length > 0 && (
        <div className="space-y-3 mb-6">
          {syllabusFiles.map((file, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-900/60 border border-gray-700/60 p-3 rounded-xl">
              <div className="flex gap-3 items-center">
                {getFileIcon(file.name)}
                <div><p className="text-white text-sm truncate w-40">{file.name}</p></div>
              </div>
              <button onClick={() => removeSyllabusFile(index)} className="text-red-400 text-xs hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}

      <motion.button
        onClick={handleProcessSyllabus}
        disabled={syllabusFiles.length === 0 || isAnalyzing}
        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-40 disabled:scale-100"
      >
        Process Syllabus <FiArrowRight />
      </motion.button>
    </motion.div>
  );

  // ────────────────────────────────────────────
  // UI STEP 2: Answer Sheet Upload
  // ────────────────────────────────────────────
  const renderSheetUpload = () => {
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm flex items-center justify-center"><FiCheckCircle /></div>
            <span className="text-green-400 font-semibold text-sm">Indexed</span>
          </div>
          <div className="flex-1 h-px bg-orange-500/60" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center">2</div>
            <span className="text-white font-semibold text-sm">Upload Sheet</span>
          </div>
        </div>

        <button onClick={() => setStep('upload-syllabus')} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-5">
          <FiArrowLeft /> Resubmit Portions
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white mb-2">
            Upload Your{' '}
            <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Answer Sheet
            </span>
          </h1>
          <p className="text-green-400 font-bold text-sm bg-green-900/20 py-1 px-3 rounded-full inline-block border border-green-500/30 mb-2 mt-2">
            Textbook converted into {textbookChunksCount} mathematical vectors!
          </p>
          <p className="text-gray-400 text-xs mt-2">Supports CSV, Images (PNG/JPG), and PDF files</p>
        </div>

        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleSheetDrop}
          className={`rounded-3xl border-2 transition-all duration-300 mb-6 ${
            dragActive ? 'border-orange-400 shadow-2xl shadow-orange-500/30 bg-orange-950/30' : 'border-gray-700/60 bg-gray-900/40 hover:border-orange-500/40'
          }`}
        >
          <div className="py-10 px-6 flex flex-col items-center gap-4">
            <FiUploadCloud className="text-6xl text-orange-400 drop-shadow-xl" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">Drag & drop your answer sheet</p>
              <p className="text-gray-400 text-sm mt-1">or <span onClick={() => fileInputRef.current?.click()} className="text-orange-400 font-semibold cursor-pointer hover:underline">click to browse</span></p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" multiple accept=".csv,.png,.jpg,.jpeg,.pdf" onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)])} className="hidden" />
        </motion.div>

        {files.length > 0 && (
          <div className="space-y-3 mb-6">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-900/60 border border-gray-700/60 p-3 rounded-xl">
                <div className="flex gap-3 items-center">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-white text-sm truncate w-40">{file.name}</p>
                    <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-red-400 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}

        <motion.button
          onClick={handleAnalyzeSheet}
          disabled={files.length === 0 || isAnalyzing}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center justify-center disabled:opacity-40 disabled:scale-100"
        >
          {isAnalyzing ? 'Analyzing...' : `Analyze Answer Sheet`}
        </motion.button>
      </motion.div>
    );
  };

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <section id="upload" className="w-full relative min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,110,0,0.15), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(139,92,246,0.10), transparent 70%), transparent' }}>
      <LoadingOverlay isVisible={isAnalyzing} message={loadingMessage} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 'upload-syllabus' ? renderSyllabusUpload() : renderSheetUpload()}
        </AnimatePresence>
      </div>
    </section>
  );
}
