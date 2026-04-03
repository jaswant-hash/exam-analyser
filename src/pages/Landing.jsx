import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, BarChart3, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[128px] -z-10 mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-amber/10 rounded-full blur-[128px] -z-10 mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-orange/30 bg-brand-orange/10 text-brand-amber text-sm font-medium mb-8">
          <BrainCircuit className="w-4 h-4" />
          <span>Next-Gen Study Analytics</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          AI-Powered <br />
          <span className="glow-text">Exam Performance</span> <br />
          Analyzer
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Identify weak concepts, track progress, and get AI-generated study plans. 
          Upload your past exams and let our intelligent engine find your knowledge gaps.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/upload" className="glow-button px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center text-lg">
            Start Analyzing <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/dashboard" className="glass-panel px-8 py-4 hover:bg-white/10 transition-colors w-full sm:w-auto justify-center flex font-medium text-lg text-white">
            View Demo Dashboard
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto w-full px-4"
      >
        <FeatureCard 
          icon={<BrainCircuit className="w-6 h-6 text-brand-orange" />}
          title="Gap Detection"
          desc="AI models pinpoint exactly which sub-topics you are struggling with."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-6 h-6 text-brand-orange" />}
          title="Performance Tracking"
          desc="Visualize your improvement over time with beautiful, interactive charts."
        />
        <FeatureCard 
          icon={<Target className="w-6 h-6 text-brand-orange" />}
          title="Actionable Plans"
          desc="Receive custom revision plans to maximize your study efficiency."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
