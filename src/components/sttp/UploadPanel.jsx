import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiImage, FiFile, FiCheckCircle } from 'react-icons/fi';

export default function UploadPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.csv')) return <FiFileText className="text-blue-400" />;
    if (['.png', '.jpg', '.jpeg'].some((ext) => fileName.endsWith(ext)))
      return <FiImage className="text-green-400" />;
    if (fileName.endsWith('.pdf')) return <FiFile className="text-red-400" />;
    return <FiFile className="text-gray-400" />;
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section
      id="upload"
      className="w-full relative min-h-[80vh] pt-16 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,110,0,0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(139,92,246,0.12), transparent 70%), transparent',
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* ── Centered content column ── */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">

        {/* ── Hero heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4 tracking-tight">
            <span className="text-white">Upload Your </span>
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-300 bg-clip-text text-transparent">
              Exam Data
            </span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-2">
            Unlock AI-powered insights from your exam performance.
            Upload marksheets, answer sheets, and more.
          </p>
          <p className="text-gray-500 text-sm">
            Get instant analysis, weakness detection, and personalized study plans
          </p>
        </motion.div>

        {/* ── Upload Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`w-full rounded-3xl transition-all duration-300 mb-10 ${
            dragActive
              ? 'border-2 border-orange-400 shadow-2xl shadow-orange-500/40 bg-gradient-to-br from-orange-950/40 to-black/60'
              : 'border-2 border-gray-700/60 shadow-2xl shadow-black/40 bg-gradient-to-br from-gray-900/50 via-black/60 to-black/80 hover:border-orange-500/50 hover:shadow-orange-600/20'
          }`}
        >
          <div className="block py-5 px-6">
            <div className="flex flex-col items-center justify-center gap-3">

              {/* Upload icon */}
              <motion.div
                animate={dragActive ? { scale: 1.15, rotate: 10 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full blur-xl opacity-25" />
                <FiUploadCloud className="text-5xl md:text-6xl text-orange-400 relative z-10 drop-shadow-xl" />
              </motion.div>

              {/* Text */}
              <div className="text-center space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Drag &amp; drop your files
                </h2>
                <p className="text-gray-300 text-base">
                  or{' '}
                  <span onClick={() => fileInputRef.current?.click()} className="text-orange-400 font-semibold cursor-pointer hover:underline">click to browse</span>
                </p>
                <p className="text-xs text-gray-500">
                  CSV, PNG, JPG, JPEG, PDF — exam data pipeline in one step
                </p>
              </div>

              {/* File type badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { icon: '📊', label: 'CSV Sheets', color: 'from-blue-600/30' },
                  { icon: '📸', label: 'Answer Images', color: 'from-green-600/30' },
                  { icon: '📄', label: 'PDF Files', color: 'from-red-600/30' },
                ].map((type, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${type.color} to-transparent border border-gray-700/50 text-xs font-medium text-gray-200`}
                  >
                    {type.icon} {type.label}
                  </motion.span>
                ))}
              </div>

              {/* Browse Button — inside flex column so it's never clipped */}
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,155,0,0.7)' }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 mt-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow-lg shadow-orange-600/40 transition-all duration-300 text-sm cursor-pointer"
              >
                Browse Files
              </motion.button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.png,.jpg,.jpeg,.pdf"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* ── Uploaded files list ── */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full mb-10 space-y-4"
          >
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              Uploaded Files ({files.length})
            </h3>
            <div className="space-y-3">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ x: 6 }}
                  className="flex items-center justify-between bg-gray-900/60 border border-gray-700/60 rounded-2xl p-4 hover:border-orange-500/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getFileIcon(file.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFile(index)}
                    className="px-3 py-1.5 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255,107,0,0.8)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/50 transition-all duration-300 text-base"
            >
              Analyze Now
            </motion.button>
          </motion.div>
        )}

        {/* ── AI-Powered Features ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            AI-Powered Features
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📊', title: 'CSV Analysis', desc: 'Auto-parse exam scorecards' },
              { icon: '📷', title: 'OCR Detection', desc: 'Extract handwritten answers' },
              { icon: '🧠', title: 'Weakness AI', desc: 'Spot concept gaps instantly' },
              { icon: '🎯', title: 'Study Plans', desc: 'Personalized revision paths' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-black/70 p-5 text-center hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Tests Analyzed', value: '14' },
              { label: 'Weak Concepts', value: '8' },
              { label: 'Progress', value: '63%' },
              { label: 'Recommendations', value: '27' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-gray-700/60 bg-gradient-to-br from-gray-900/60 to-black/80 p-5 text-center hover:border-orange-500/40 transition-all duration-300"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-orange-400">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
