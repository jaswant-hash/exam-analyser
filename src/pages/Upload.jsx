import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileType2, FileImage, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsUploading(true);
    
    // Simulate upload and analysis processing
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/analysis'), 500);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Test Data</h1>
        <p className="text-gray-400">Drag and drop your exam results in CSV, image, or PDF formats.</p>
      </div>

      <div className="glass-panel p-1">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[22px] transition-all duration-300 flex flex-col items-center justify-center p-16 min-h-[400px]
            ${isDragging 
              ? 'border-brand-orange bg-brand-orange/5' 
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
            ${file && !isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
          `}
        >
          {/* File Input Overlay */}
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            onChange={handleFileChange}
            accept=".csv, .pdf, image/*"
            disabled={isUploading}
          />

          {!file ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,107,0,0.1)]">
                <UploadCloud className="w-10 h-10 text-brand-amber" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Drop your file here</h3>
              <p className="text-gray-400 text-sm mb-8">or click to browse from your computer</p>
              
              <div className="flex gap-4">
                <FormatBadge icon={FileType2} text="CSV File" />
                <FormatBadge icon={FileText} text="PDF Report" />
                <FormatBadge icon={FileImage} text="Image" />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full max-w-md pointer-events-none"
            >
              {!isUploading ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1 truncate w-full text-center">{file.name}</h3>
                  <p className="text-gray-400 text-sm mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-6" />
                  <h3 className="text-lg font-medium text-white mb-4">Analyzing Data Engine...</h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-orange to-brand-amber transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-brand-amber mt-2 font-mono text-sm">{progress}%</p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {file && !isUploading && (
        <div className="mt-8 flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAnalyze}
            className="glow-button px-10 py-4 text-lg w-full max-w-md"
          >
            Start Magic AI Analysis
          </motion.button>
        </div>
      )}
    </div>
  );
}

function FormatBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
      <Icon className="w-4 h-4 text-gray-400" />
      {text}
    </div>
  );
}
