import { motion } from 'framer-motion';
import { AlertTriangle, BookMarked, Calendar, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Analysis() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              Analysis Complete
            </span>
            <span className="text-gray-400 text-sm">March 24, 2024</span>
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Physics Mock Test #4</h1>
        </div>
        
        <div className="flex z-10 gap-3">
          <button className="glass-panel px-4 py-2 flex items-center gap-2 text-sm hover:bg-white/10">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <Link to="/dashboard" className="glow-button px-6 py-2 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Weaknesses & Topics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-brand-orange" />
              <h2 className="text-lg font-semibold text-white">Identified Weaknesses</h2>
            </div>
            
            <div className="space-y-4">
              <TopicBar name="Electromagnetism" score={45} status="critical" />
              <TopicBar name="Thermodynamics" score={62} status="warning" />
              <TopicBar name="Wave Optics" score={71} status="good" />
              <TopicBar name="Mechanics" score={88} status="excellent" />
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Detailed Explanation</h2>
            <div className="prose prose-invert max-w-none text-gray-300">
              <p>
                Based on your recent test, the AI engine detected a persistent gap in <span className="text-brand-orange font-medium">Electromagnetism</span>, 
                specifically incorrectly applying Faraday's Law in complex circuit scenarios. 
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                  <span>You lost 12 marks on questions involving induced EMF.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                  <span>Time taken per thermodynamics question was 40% higher than average.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Study Plan */}
        <div className="space-y-6">
          <div className="glass-panel p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex items-center gap-2 mb-6">
              <BookMarked className="w-5 h-5 text-brand-amber" />
              <h2 className="text-lg font-semibold text-white">AI Study Plan</h2>
            </div>

            <div className="space-y-5">
              <PlanStep 
                day="Day 1-2" 
                title="Revisit Faraday's Law" 
                desc="Watch suggested video lectures on induced EMF." 
              />
              <PlanStep 
                day="Day 3" 
                title="Practice Problems" 
                desc="Solve 20 mock questions specifically heavily focused on Electromagnetism." 
              />
              <PlanStep 
                day="Day 4" 
                title="Thermodynamics Review" 
                desc="Focus on Carnot engines and efficiency formulas to improve speed." 
              />
            </div>
            
            <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 border border-brand-orange/30 rounded-lg text-brand-amber hover:bg-brand-orange/10 transition-colors text-sm font-medium">
              <Calendar className="w-4 h-4" /> Add to Calendar
            </button>
          </div>
          
          <div className="glass-panel p-6 bg-gradient-to-br from-white/5 to-brand-orange/5 border-brand-orange/20">
             <h3 className="text-sm font-medium text-white mb-2">Ready to improve?</h3>
             <p className="text-xs text-gray-400 mb-4">Generate practice test from identified weak spots.</p>
             <button className="glow-button w-full py-2 text-sm">Generate Custom Test</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TopicBar({ name, score, status }) {
  const getColors = () => {
    switch (status) {
      case 'critical': return 'from-red-500 to-brand-orange';
      case 'warning': return 'from-brand-orange to-brand-amber';
      case 'good': return 'from-emerald-400 to-emerald-500';
      case 'excellent': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-200">{name}</span>
        <span className="text-xs font-mono text-gray-400">{score}%</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getColors()}`}
        />
      </div>
    </div>
  );
}

function PlanStep({ day, title, desc }) {
  return (
    <div className="relative pl-4 border-l border-white/10">
      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
      <span className="text-xs font-medium text-brand-amber mb-1 block">{day}</span>
      <h4 className="text-sm font-medium text-white mb-0.5">{title}</h4>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  );
}
